import { getGroqApiKey, getGroqModels } from "@/lib/config/env";

import type { GenerateJsonParams, GenerateTextParams } from "../gemini/types";
import {
  GroqServiceError,
  classifyGroqError,
  isRetryableGroqFailure,
  logGroqFailure,
  logGroqFailover,
  logGroqSuccess,
  toGroqServiceError,
  type GroqRateLimitMetadata,
} from "./errors";

const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";

export type FetchLike = typeof fetch;

let fetchOverride: FetchLike | undefined;
let lastSucceededGroqModel: string | undefined;

/** Test hook — do not use in production code. */
export function setGroqFetchForTests(fetchFn: FetchLike | undefined): void {
  fetchOverride = fetchFn;
}

export function getLastSucceededGroqModel(): string | undefined {
  return lastSucceededGroqModel;
}

function resolveFetch(): FetchLike {
  return fetchOverride ?? fetch;
}

interface GroqChatResponse {
  choices?: Array<{
    message?: { content?: string | null };
    finish_reason?: string | null;
  }>;
  error?: {
    message?: string;
    code?: number | string;
    type?: string;
  };
}

function readRateLimitMetadata(response: Response): GroqRateLimitMetadata | undefined {
  const retryAfter = response.headers.get("retry-after") ?? undefined;
  const limitRequests = response.headers.get("x-ratelimit-limit-requests") ?? undefined;
  const remainingRequests =
    response.headers.get("x-ratelimit-remaining-requests") ?? undefined;
  const resetRequests = response.headers.get("x-ratelimit-reset-requests") ?? undefined;
  const limitTokens = response.headers.get("x-ratelimit-limit-tokens") ?? undefined;
  const remainingTokens = response.headers.get("x-ratelimit-remaining-tokens") ?? undefined;
  const resetTokens = response.headers.get("x-ratelimit-reset-tokens") ?? undefined;

  if (
    !retryAfter &&
    !limitRequests &&
    !remainingRequests &&
    !resetRequests &&
    !limitTokens &&
    !remainingTokens &&
    !resetTokens
  ) {
    return undefined;
  }

  return {
    retryAfter,
    limitRequests,
    remainingRequests,
    resetRequests,
    limitTokens,
    remainingTokens,
    resetTokens,
  };
}

function buildHeaders(apiKey: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
}

async function createChatCompletion(params: {
  model: string;
  systemInstruction: string;
  userPrompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  jsonMode?: boolean;
}): Promise<{ text: string; finishReason?: string | null }> {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new GroqServiceError("missing_key", "GROQ_API_KEY is not set", {
      message: "GROQ_API_KEY is not set",
      reachedGroq: false,
      model: params.model,
    });
  }

  const body: Record<string, unknown> = {
    model: params.model,
    messages: [
      { role: "system", content: params.systemInstruction },
      { role: "user", content: params.userPrompt },
    ],
    temperature: params.temperature,
  };

  if (params.maxOutputTokens !== undefined) {
    body.max_tokens = params.maxOutputTokens;
  }

  if (params.jsonMode) {
    body.response_format = { type: "json_object" };
  }

  let response: Response;
  try {
    response = await resolveFetch()(GROQ_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: buildHeaders(apiKey),
      body: JSON.stringify(body),
    });
  } catch (error) {
    throw toGroqServiceError(error, params.model);
  }

  const rateLimit = readRateLimitMetadata(response);

  let payload: GroqChatResponse;
  try {
    payload = (await response.json()) as GroqChatResponse;
  } catch {
    throw new GroqServiceError("invalid_response", "Groq returned malformed JSON", {
      httpStatus: response.status,
      message: "Groq returned malformed JSON",
      reachedGroq: true,
      model: params.model,
      rateLimit,
    });
  }

  if (!response.ok) {
    const message =
      payload.error?.message?.trim() ||
      `Groq request failed with status ${response.status}`;
    const details = {
      httpStatus: response.status,
      apiCode: payload.error?.code,
      message,
      reachedGroq: true,
      model: params.model,
      rateLimit,
    };
    const reason = classifyGroqError(
      new GroqServiceError("unknown_groq_error", message, details),
      details,
    );
    throw new GroqServiceError(reason, message, details);
  }

  const choice = payload.choices?.[0];
  const text = choice?.message?.content?.trim() ?? "";
  const finishReason = choice?.finish_reason ?? null;

  if (!text) {
    throw new GroqServiceError("invalid_response", "Groq returned an empty response", {
      httpStatus: response.status,
      finishReason: finishReason ?? undefined,
      message: "Groq returned an empty response",
      reachedGroq: true,
      model: params.model,
      rateLimit,
    });
  }

  if (finishReason === "length") {
    throw new GroqServiceError(
      "invalid_response",
      `Groq output truncated (finishReason=length, length=${text.length})`,
      {
        finishReason,
        message: `Groq output truncated at ${text.length} characters`,
        reachedGroq: true,
        model: params.model,
        rateLimit,
      },
    );
  }

  return { text, finishReason };
}

async function generateWithFailover(params: {
  systemInstruction: string;
  userPrompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  jsonMode?: boolean;
}): Promise<string> {
  const models = getGroqModels();
  let lastError: GroqServiceError | undefined;

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      const { text } = await createChatCompletion({ ...params, model });

      if (params.jsonMode) {
        try {
          JSON.parse(text);
        } catch {
          throw new GroqServiceError(
            "invalid_response",
            "Groq returned malformed JSON for structured output",
            {
              message: "Groq returned malformed JSON for structured output",
              reachedGroq: true,
              model,
            },
          );
        }
      }

      lastSucceededGroqModel = model;
      logGroqSuccess(model);
      return text;
    } catch (error) {
      const serviceError = toGroqServiceError(error, model);
      lastError = serviceError;
      logGroqFailure({
        category: serviceError.reason,
        model,
        details: serviceError.details,
      });

      if (!isRetryableGroqFailure(serviceError)) {
        throw serviceError;
      }

      const nextModel = models[i + 1];
      if (nextModel) {
        logGroqFailover({
          fromModel: model,
          toModel: nextModel,
          reason: serviceError.reason,
        });
      }
    }
  }

  throw (
    lastError ??
    new GroqServiceError("unknown_groq_error", "All Groq models failed", {
      message: "All Groq models failed",
      reachedGroq: true,
    })
  );
}

export async function generateText(params: GenerateTextParams): Promise<string> {
  return generateWithFailover({
    systemInstruction: params.systemInstruction,
    userPrompt: params.userPrompt,
    temperature: params.temperature,
    maxOutputTokens: params.maxOutputTokens,
  });
}

export async function generateJson<T>(params: GenerateJsonParams): Promise<T> {
  const text = await generateWithFailover({
    systemInstruction: params.systemInstruction,
    userPrompt: params.userPrompt,
    temperature: params.temperature,
    jsonMode: true,
  });

  return JSON.parse(text) as T;
}
