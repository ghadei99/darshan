import {
  getAIProvider,
  getActiveAnalyzerMode,
  getGeminiApiKey,
  getGeminiModel,
  getOpenRouterApiKey,
  getOpenRouterModel,
  isLikelyValidGeminiKey,
  isLikelyValidOpenRouterKey,
} from "@/lib/config/env";

import {
  GeminiServiceError,
  classifyGeminiError,
  extractGeminiErrorDetails,
  logGeminiFailure,
} from "../gemini/errors";
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
    const message =
      provider === "openrouter"
        ? reason === "missing_key"
          ? "OPENROUTER_API_KEY is not configured"
          : "OPENROUTER_API_KEY appears malformed"
        : reason === "missing_key"
          ? "GEMINI_API_KEY is not configured"
          : "GEMINI_API_KEY appears malformed";

    if (provider === "openrouter") {
      logOpenRouterFailure({
        category: reason,
        model: getOpenRouterModel(),
        details: { message, reachedOpenRouter: false },
      });
    } else {
      logGeminiFailure({
        category: reason,
        model: getGeminiModel(),
        details: { message, reachedGemini: false },
      });
    }
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
  if (getAIProvider() === "openrouter") {
    if (error instanceof OpenRouterServiceError) return error.reason;
    return classifyOpenRouterError(error);
  }

  if (error instanceof GeminiServiceError) return error.reason;
  return classifyGeminiError(error);
}

function getConfiguredApiKey(): string | undefined {
  return getAIProvider() === "openrouter"
    ? getOpenRouterApiKey()
    : getGeminiApiKey();
}

function isLikelyValidApiKey(key: string): boolean {
  return getAIProvider() === "openrouter"
    ? isLikelyValidOpenRouterKey(key)
    : isLikelyValidGeminiKey(key);
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
    return { ...result, analyzer: activeMode };
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
