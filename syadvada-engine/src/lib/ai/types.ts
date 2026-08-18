/** Shared analyzer metadata returned by all domain API routes. */
export type AnalyzerMode = "gemini" | "heuristic";

export type FallbackReason =
  | "missing_key"
  | "invalid_key_format"
  | "authentication_error"
  | "permission_error"
  | "rate_limited"
  | "quota_exceeded"
  | "model_error"
  | "network_error"
  | "invalid_response"
  | "unknown_gemini_error";

export interface AnalyzerMeta {
  analyzer: AnalyzerMode;
  /** Present only when analyzer is "heuristic" — safe for client display. */
  fallbackReason?: FallbackReason;
}
