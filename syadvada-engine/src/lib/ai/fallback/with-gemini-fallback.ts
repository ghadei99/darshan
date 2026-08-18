import { getGeminiApiKey, isLikelyValidGeminiKey } from "@/lib/config/env";

import { GeminiServiceError, classifyGeminiError } from "../gemini/errors";
import type { AnalyzerMeta, AnalyzerMode, FallbackReason } from "../types";

function logServerFallback(reason: FallbackReason, detail?: string): void {
  const prefix = `[darshana] Heuristic fallback (${reason})`;
  if (detail) {
    console.warn(prefix, detail.slice(0, 240));
  } else {
    console.warn(prefix);
  }
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
    logServerFallback(
      "invalid_key_format",
      "Key must be from https://aistudio.google.com/apikey (starts with AIzaSy)",
    );
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
    const detail = error instanceof Error ? error.message : String(error);
    logServerFallback(reason, detail);
    const result = await heuristicFn();
    return {
      ...result,
      analyzer: "heuristic" as AnalyzerMode,
      fallbackReason: reason,
    };
  }
}
