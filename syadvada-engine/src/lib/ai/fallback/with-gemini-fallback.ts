import { getGeminiApiKey, getGeminiModel, isLikelyValidGeminiKey } from "@/lib/config/env";

import {
  GeminiServiceError,
  classifyGeminiError,
  extractGeminiErrorDetails,
  logGeminiFailure,
} from "../gemini/errors";
import type { AnalyzerMeta, AnalyzerMode, FallbackReason } from "../types";

function logServerFallback(reason: FallbackReason, error?: unknown): void {
  if (reason === "missing_key" || reason === "invalid_key_format") {
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

/**
 * Try Gemini first; on missing/invalid key or API failure, run the local heuristic.
 * Attaches a safe `fallbackReason` when heuristic is used.
 */
export async function withGeminiFallback<T extends AnalyzerMeta>(
  geminiFn: () => Promise<T>,
  heuristicFn: () => T | Promise<T>,
): Promise<T> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    logServerFallback("missing_key");
    const result = await heuristicFn();
    return { ...result, analyzer: "heuristic" as AnalyzerMode, fallbackReason: "missing_key" };
  }

  if (!isLikelyValidGeminiKey(apiKey)) {
    logServerFallback("invalid_key_format");
    const result = await heuristicFn();
    return {
      ...result,
      analyzer: "heuristic" as AnalyzerMode,
      fallbackReason: "invalid_key_format",
    };
  }

  try {
    const result = await geminiFn();
    return { ...result, analyzer: "gemini" as AnalyzerMode };
  } catch (error) {
    const reason =
      error instanceof GeminiServiceError
        ? error.reason
        : classifyGeminiError(error);
    logServerFallback(reason, error);
    const result = await heuristicFn();
    return {
      ...result,
      analyzer: "heuristic" as AnalyzerMode,
      fallbackReason: reason,
    };
  }
}
