import type { FallbackReason } from "../types";

export class GeminiServiceError extends Error {
  readonly reason: FallbackReason;

  constructor(reason: FallbackReason, message: string) {
    super(message);
    this.name = "GeminiServiceError";
    this.reason = reason;
  }
}

function extractErrorPayload(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

/** Classify @google/genai failures into safe fallback reasons (no secrets). */
export function classifyGeminiError(error: unknown): FallbackReason {
  const raw = extractErrorPayload(error).toLowerCase();

  if (
    raw.includes("unauthenticated") ||
    raw.includes("api key not valid") ||
    raw.includes("api_key_invalid") ||
    raw.includes("invalid authentication") ||
    raw.includes("401")
  ) {
    return "authentication_error";
  }

  if (
    raw.includes("permission") ||
    raw.includes("forbidden") ||
    raw.includes("403")
  ) {
    return "permission_error";
  }

  if (
    raw.includes("rate limit") ||
    raw.includes("rate_limit") ||
    raw.includes("429") ||
    raw.includes("resource_exhausted")
  ) {
    return "rate_limited";
  }

  if (
    raw.includes("quota") ||
    raw.includes("billing") ||
    raw.includes("exceeded your current quota")
  ) {
    return "quota_exceeded";
  }

  if (
    raw.includes("model") &&
    (raw.includes("not found") || raw.includes("invalid") || raw.includes("404"))
  ) {
    return "model_error";
  }

  if (
    raw.includes("fetch failed") ||
    raw.includes("network") ||
    raw.includes("econnreset") ||
    raw.includes("etimedout") ||
    raw.includes("socket")
  ) {
    return "network_error";
  }

  if (
    raw.includes("json") ||
    raw.includes("unexpected token") ||
    raw.includes("syntaxerror")
  ) {
    return "invalid_response";
  }

  return "unknown_gemini_error";
}

export function toGeminiServiceError(error: unknown): GeminiServiceError {
  const reason = classifyGeminiError(error);
  const detail = extractErrorPayload(error).slice(0, 240);
  return new GeminiServiceError(reason, detail);
}
