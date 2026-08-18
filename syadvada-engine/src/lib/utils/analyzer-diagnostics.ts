import type { FallbackReason } from "@/lib/ai/types";

const FALLBACK_MESSAGES: Record<FallbackReason, string> = {
  missing_key: "Heuristic fallback active: Gemini API key is not configured.",
  invalid_key_format:
    "Heuristic fallback active: Gemini API key format is invalid (expected Google AI Studio key).",
  authentication_error:
    "Heuristic fallback active: Gemini authentication failed.",
  permission_error: "Heuristic fallback active: Gemini permission denied.",
  rate_limited: "Heuristic fallback active: Gemini rate limit reached.",
  quota_exceeded: "Heuristic fallback active: Gemini quota exceeded.",
  invalid_request: "Heuristic fallback active: Gemini rejected the request.",
  model_not_found: "Heuristic fallback active: Gemini model not found.",
  model_error: "Heuristic fallback active: Gemini model error.",
  network_error: "Heuristic fallback active: Gemini network error.",
  invalid_response: "Heuristic fallback active: Gemini returned an invalid response.",
  unknown_gemini_error: "Heuristic fallback active: Gemini unavailable.",
};

/** Log an accurate client-side diagnostic when heuristic fallback was used. */
export function warnIfHeuristicFallback(meta?: {
  analyzer?: string;
  fallbackReason?: FallbackReason;
}): void {
  if (meta?.analyzer !== "heuristic") return;

  const message =
    (meta.fallbackReason && FALLBACK_MESSAGES[meta.fallbackReason]) ||
    FALLBACK_MESSAGES.unknown_gemini_error;

  console.warn(message);
}
