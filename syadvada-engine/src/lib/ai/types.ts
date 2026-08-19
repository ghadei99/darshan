/** Shared analyzer metadata returned by all domain API routes. */
export type AnalyzerMode = "gemini" | "openrouter" | "groq" | "heuristic";

export type AIProvider = "gemini" | "openrouter" | "groq";

export type FallbackReason =
  | "missing_key"
  | "invalid_key_format"
  | "authentication_error"
  | "permission_error"
  | "rate_limited"
  | "quota_exceeded"
  | "invalid_request"
  | "model_not_found"
  | "model_error"
  | "network_error"
  | "invalid_response"
  | "unknown_gemini_error"
  | "unknown_openrouter_error"
  | "unknown_groq_error";

export interface AnalyzerMeta {
  analyzer: AnalyzerMode;
  /** Present only when analyzer is "heuristic" — safe for client display. */
  fallbackReason?: FallbackReason;
  /** Successful Groq model id when analyzer is "groq"; omitted otherwise. */
  model?: string;
}
