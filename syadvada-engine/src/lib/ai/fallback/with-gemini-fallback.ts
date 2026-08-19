import {
  getAIProvider,
  getActiveAnalyzerMode,
  getGeminiApiKey,
  getGeminiModel,
  getGroqApiKey,
  getGroqModels,
  getOpenRouterApiKey,
  getOpenRouterModel,
  isLikelyValidGeminiKey,
  isLikelyValidGroqKey,
  isLikelyValidOpenRouterKey,
} from "@/lib/config/env";

import {
  GeminiServiceError,
  classifyGeminiError,
  extractGeminiErrorDetails,
  logGeminiFailure,
} from "../gemini/errors";
import { getLastSucceededGroqModel } from "../groq/impl";
import {
  GroqServiceError,
  classifyGroqError,
  extractGroqErrorDetails,
  logGroqFailure,
} from "../groq/errors";
import {
  OpenRouterServiceError,
  classifyOpenRouterError,
  extractOpenRouterErrorDetails,
  logOpenRouterFailure,
} from "../openrouter/errors";
import type { AnalyzerMeta, AnalyzerMode, FallbackReason } from "../types";

function logServerFallback(
  reason: FallbackReason,
  error?: unknown,
): void {
  const provider = getAIProvider();

  if (reason === "missing_key" || reason === "invalid_key_format") {
    if (provider === "openrouter") {
      logOpenRouterFailure({
        category: reason,
        model: getOpenRouterModel(),
        details: {
          message:
            reason === "missing_key"
              ? "OPENROUTER_API_KEY is not configured"
              : "OPENROUTER_API_KEY appears malformed",
          reachedOpenRouter: false,
        },
      });
      return;
    }

    if (provider === "groq") {
      logGroqFailure({
        category: reason,
        model: getGroqModels()[0] ?? "unconfigured",
        details: {
          message:
            reason === "missing_key"
              ? "GROQ_API_KEY is not configured"
              : "GROQ_API_KEY appears malformed",
          reachedGroq: false,
        },
      });
      return;
    }

    logGeminiFailure({
      category: reason,
      model: getGeminiModel(),
      details: {
        message:
          reason === "missing_key"
            ? "GEMINI_API_KEY is not configured"
            : "GEMINI_API_KEY appears malformed",
        reachedGemini: false,
      },
    });
    return;
  }

  if (provider === "openrouter") {
    const details = extractOpenRouterErrorDetails(error);
    logOpenRouterFailure({
      category: reason,
      model: getOpenRouterModel(),
      details: {
        ...details,
        reachedOpenRouter: details.reachedOpenRouter || true,
      },
    });
    return;
  }

  if (provider === "groq") {
    const details = extractGroqErrorDetails(error);
    logGroqFailure({
      category: reason,
      model: details.model ?? getGroqModels()[0] ?? "unconfigured",
      details: {
        ...details,
        reachedGroq: details.reachedGroq || true,
      },
    });
    return;
  }

  const details = extractGeminiErrorDetails(error);
  logGeminiFailure({
    category: reason,
    model: getGeminiModel(),
    details: {
      ...details,
      reachedGemini: details.reachedGemini || true,
    },
  });
}

function classifyProviderError(error: unknown): FallbackReason {
  const provider = getAIProvider();

  if (provider === "openrouter") {
    if (error instanceof OpenRouterServiceError) return error.reason;
    return classifyOpenRouterError(error);
  }

  if (provider === "groq") {
    if (error instanceof GroqServiceError) return error.reason;
    return classifyGroqError(error);
  }

  if (error instanceof GeminiServiceError) return error.reason;
  return classifyGeminiError(error);
}

function getConfiguredApiKey(): string | undefined {
  const provider = getAIProvider();
  if (provider === "openrouter") return getOpenRouterApiKey();
  if (provider === "groq") return getGroqApiKey();
  return getGeminiApiKey();
}

function isLikelyValidApiKey(key: string): boolean {
  const provider = getAIProvider();
  if (provider === "openrouter") return isLikelyValidOpenRouterKey(key);
  if (provider === "groq") return isLikelyValidGroqKey(key);
  return isLikelyValidGeminiKey(key);
}

/**
 * Try the configured AI provider first; on missing/invalid key or API failure,
 * run the local heuristic. Attaches a safe `fallbackReason` when heuristic is used.
 */
export async function withGeminiFallback<T extends AnalyzerMeta>(
  aiFn: () => Promise<T>,
  heuristicFn: () => T | Promise<T>,
): Promise<T> {
  const apiKey = getConfiguredApiKey();
  const activeMode: Exclude<AnalyzerMode, "heuristic"> = getActiveAnalyzerMode();

  if (!apiKey) {
    logServerFallback("missing_key");
    const result = await heuristicFn();
    return {
      ...result,
      analyzer: "heuristic" as AnalyzerMode,
      fallbackReason: "missing_key",
    };
  }

  if (!isLikelyValidApiKey(apiKey)) {
    logServerFallback("invalid_key_format");
    const result = await heuristicFn();
    return {
      ...result,
      analyzer: "heuristic" as AnalyzerMode,
      fallbackReason: "invalid_key_format",
    };
  }

  try {
    const result = await aiFn();
    const groqModel =
      getAIProvider() === "groq" ? getLastSucceededGroqModel() : undefined;
    return groqModel
      ? { ...result, analyzer: activeMode, model: groqModel }
      : { ...result, analyzer: activeMode };
  } catch (error) {
    const reason = classifyProviderError(error);
    logServerFallback(reason, error);
    const result = await heuristicFn();
    return {
      ...result,
      analyzer: "heuristic" as AnalyzerMode,
      fallbackReason: reason,
    };
  }
}
