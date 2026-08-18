import { getGeminiApiKey, isLikelyValidGeminiKey } from "./client";

/**
 * Try Gemini first; on missing key or API failure, run the local heuristic.
 * Logs the reason server-side; callers should use warnIfHeuristicFallback on the client.
 */
export async function withGeminiFallback<T extends { analyzer: "gemini" | "heuristic" }>(
  geminiFn: () => Promise<T>,
  heuristicFn: () => T | Promise<T>,
): Promise<T> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    console.warn("API Key missing: Running local heuristic fallback.");
    return heuristicFn();
  }

  if (!isLikelyValidGeminiKey(apiKey)) {
    console.warn(
      "API Key missing: Running local heuristic fallback.",
      "GEMINI_API_KEY format looks invalid — create a key at https://aistudio.google.com/apikey (must start with AIzaSy).",
    );
    return heuristicFn();
  }

  try {
    return await geminiFn();
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    console.warn("API Key missing: Running local heuristic fallback.", detail);
    return heuristicFn();
  }
}
