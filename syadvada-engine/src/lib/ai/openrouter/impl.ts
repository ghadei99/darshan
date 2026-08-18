import {
  getOpenRouterApiKey,
  getOpenRouterModel,
} from "@/lib/config/env";

import type { GenerateJsonParams, GenerateTextParams } from "../gemini/types";
import {
  OpenRouterServiceError,
  ensureCompleteOpenRouterGeneration,
  logOpenRouterFailure,
  toOpenRouterServiceError,
} from "./errors";

const OPENROUTER_CHAT_COMPLETIONS_URL =
  "https://openrouter.ai/api/v1/chat/completions";

const OPENROUTER_REFERER = "https://darshana-suite.vercel.app/";
const OPENROUTER_TITLE = "Darshana Suite";

export type FetchLike = typeof fetch;

let fetchOverride: FetchLike | undefined;

/** Test hook — do not use in production code. */
export function setOpenRouterFetchForTests(fetchFn: FetchLike | undefined): void {
  fetchOverride = fetchFn;
}

function resolveFetch(): FetchLike {
  return fetchOverride ?? fetch;
}

interface OpenRouterChatResponse {
  choices?: Array<{
    message?: { content?: string | null };
    finish_reason?: string | null;
  }>;
  error?: {
    message?: string;
    code?: number | string;
  };
}

function logOpenRouterRequest(model: string): void {
  console.info("[ai] provider=openrouter");
  console.info(`[ai] model=${model}`);
}

function buildHeaders(apiKey: string): HeadersInit {
  return {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "HTTP-Referer": OPENROUTER_REFERER,
    "X-Title": OPENROUTER_TITLE,
  };
}

async function createChatCompletion(params: {
  systemInstruction: string;
  userPrompt: string;
  temperature?: number;
  maxOutputTokens?: number;
  jsonMode?: boolean;
}): Promise<{ text: string; finishReason?: string | null }> {
  const apiKey = getOpenRouterApiKey();
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }

  const model = getOpenRouterModel();
  logOpenRouterRequest(model);

  const body: Record<string, unknown> = {
    model,
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
    response = await resolveFetch()(OPENROUTER_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: buildHeaders(apiKey),
      body: JSON.stringify(body),
    });
  } catch (error) {
    throw toOpenRouterServiceError(error);
  }

  let payload: OpenRouterChatResponse;
  try {
    payload = (await response.json()) as OpenRouterChatResponse;
  } catch {
    throw new OpenRouterServiceError("invalid_response", "OpenRouter returned malformed JSON", {
      httpStatus: response.status,
      message: "OpenRouter returned malformed JSON",
      reachedOpenRouter: true,
    });
  }

  if (!response.ok) {
    const message =
      payload.error?.message?.trim() ||
      `OpenRouter request failed with status ${response.status}`;
    throw new OpenRouterServiceError(
      "unknown_openrouter_error",
      message,
      {
        httpStatus: response.status,
        apiCode: payload.error?.code,
        message,
        reachedOpenRouter: true,
      },
    );
  }

  const choice = payload.choices?.[0];
  const text = choice?.message?.content?.trim() ?? "";
  const finishReason = choice?.finish_reason ?? null;

  if (!text) {
    throw new OpenRouterServiceError("invalid_response", "OpenRouter returned an empty response", {
      httpStatus: response.status,
      finishReason: finishReason ?? undefined,
      message: "OpenRouter returned an empty response",
      reachedOpenRouter: true,
    });
  }

  ensureCompleteOpenRouterGeneration({
    finishReason,
    generatedTextLength: text.length,
  });

  return { text, finishReason };
}

function logClientFailure(error: OpenRouterServiceError): void {
  logOpenRouterFailure({
    category: error.reason,
    model: getOpenRouterModel(),
    details: error.details,
  });
}

export async function generateText(params: GenerateTextParams): Promise<string> {
  try {
    const { text } = await createChatCompletion({
      systemInstruction: params.systemInstruction,
      userPrompt: params.userPrompt,
      temperature: params.temperature,
      maxOutputTokens: params.maxOutputTokens,
    });
    return text;
  } catch (error) {
    if (error instanceof OpenRouterServiceError) {
      logClientFailure(error);
      throw error;
    }
    const serviceError = toOpenRouterServiceError(error);
    logClientFailure(serviceError);
    throw serviceError;
  }
}

export async function generateJson<T>(params: GenerateJsonParams): Promise<T> {
  try {
    const { text } = await createChatCompletion({
      systemInstruction: params.systemInstruction,
      userPrompt: params.userPrompt,
      temperature: params.temperature,
      jsonMode: true,
    });

    try {
      return JSON.parse(text) as T;
    } catch {
      const serviceError = toOpenRouterServiceError(
        new Error("OpenRouter returned malformed JSON for structured output"),
      );
      logClientFailure(serviceError);
      throw serviceError;
    }
  } catch (error) {
    if (error instanceof OpenRouterServiceError) {
      throw error;
    }
    const serviceError = toOpenRouterServiceError(error);
    logClientFailure(serviceError);
    throw serviceError;
  }
}
