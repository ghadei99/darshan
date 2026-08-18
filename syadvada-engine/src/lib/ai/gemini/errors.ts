import { ApiError } from "@google/genai";

import type { FallbackReason } from "../types";

export class GeminiServiceError extends Error {
  readonly reason: FallbackReason;
  readonly details: GeminiErrorDetails;

  constructor(reason: FallbackReason, message: string, details: GeminiErrorDetails) {
    super(message);
    this.name = "GeminiServiceError";
    this.reason = reason;
    this.details = details;
  }
}

export interface GeminiErrorDetails {
  httpStatus?: number;
  apiStatus?: string;
  apiCode?: number | string;
  message: string;
  reachedGemini: boolean;
}

const SECRET_PATTERNS: RegExp[] = [
  /\bAIza[A-Za-z0-9_-]{20,}\b/g,
  /\bAQ\.[A-Za-z0-9._-]{20,}\b/g,
  /(?:api[_-]?key|x-goog-api-key)\s*[:=]\s*["']?[^\s"'&]+/gi,
  /[?&]key=[^&\s]+/gi,
];

function sanitizeErrorText(text: string): string {
  let sanitized = text;
  for (const pattern of SECRET_PATTERNS) {
    sanitized = sanitized.replace(pattern, "[REDACTED]");
  }
  return sanitized.slice(0, 240);
}

function extractErrorPayload(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function parseErrorBody(message: string): {
  apiStatus?: string;
  apiCode?: number | string;
  apiMessage?: string;
} {
  try {
    const parsed = JSON.parse(message) as {
      error?: {
        status?: string;
        code?: number | string;
        message?: string;
      };
      status?: string;
      code?: number | string;
      message?: string;
    };

    const err = parsed.error ?? parsed;
    return {
      apiStatus: typeof err.status === "string" ? err.status : undefined,
      apiCode: err.code,
      apiMessage: typeof err.message === "string" ? err.message : undefined,
    };
  } catch {
    return {};
  }
}

/** Extract structured, sanitized Gemini error details from SDK failures. */
export function extractGeminiErrorDetails(error: unknown): GeminiErrorDetails {
  const rawMessage = extractErrorPayload(error);
  const reachedGemini = error instanceof ApiError || looksLikeGeminiApiPayload(rawMessage);

  if (error instanceof ApiError) {
    const parsed = parseErrorBody(error.message);
    const message = sanitizeErrorText(parsed.apiMessage ?? rawMessage);

    return {
      httpStatus: error.status,
      apiStatus: parsed.apiStatus,
      apiCode: parsed.apiCode,
      message,
      reachedGemini: true,
    };
  }

  const parsed = parseErrorBody(rawMessage);
  const message = sanitizeErrorText(parsed.apiMessage ?? rawMessage);

  return {
    apiStatus: parsed.apiStatus,
    apiCode: parsed.apiCode,
    message,
    reachedGemini,
  };
}

function looksLikeGeminiApiPayload(message: string): boolean {
  return message.trim().startsWith("{") && message.includes('"error"');
}

function isModelNotFound(details: GeminiErrorDetails, raw: string): boolean {
  if (details.httpStatus === 404) return true;

  const apiStatus = details.apiStatus?.toUpperCase();
  if (apiStatus === "NOT_FOUND" && /models?\//i.test(raw)) return true;

  return (
    /models?\/[^\s"']+\s+(is\s+)?not\s+found/i.test(raw) ||
    /model\s+['"][^'"]+['"]\s+(is\s+)?not\s+found/i.test(raw)
  );
}

function isQuotaExceeded(raw: string, apiStatus?: string): boolean {
  const status = apiStatus?.toUpperCase();
  return (
    status === "RESOURCE_EXHAUSTED" &&
    (raw.includes("quota") || raw.includes("billing"))
  ) || (
    raw.includes("quota") ||
    raw.includes("billing") ||
    raw.includes("exceeded your current quota")
  );
}

function isRateLimited(raw: string, apiStatus?: string, httpStatus?: number): boolean {
  const status = apiStatus?.toUpperCase();
  return (
    httpStatus === 429 ||
    status === "RESOURCE_EXHAUSTED" ||
    raw.includes("rate limit") ||
    raw.includes("rate_limit") ||
    raw.includes("too many requests")
  );
}

/** Classify @google/genai failures into safe fallback reasons (no secrets). */
export function classifyGeminiError(
  error: unknown,
  details: GeminiErrorDetails = extractGeminiErrorDetails(error),
): FallbackReason {
  const raw = `${details.message} ${extractErrorPayload(error)}`.toLowerCase();
  const apiStatus = details.apiStatus?.toUpperCase();

  if (
    details.httpStatus === 401 ||
    apiStatus === "UNAUTHENTICATED" ||
    raw.includes("unauthenticated") ||
    raw.includes("api key not valid") ||
    raw.includes("api_key_invalid") ||
    raw.includes("invalid authentication")
  ) {
    return "authentication_error";
  }

  if (
    details.httpStatus === 403 ||
    apiStatus === "PERMISSION_DENIED" ||
    raw.includes("permission_denied") ||
    raw.includes("permission denied") ||
    raw.includes("forbidden")
  ) {
    return "permission_error";
  }

  if (isRateLimited(raw, details.apiStatus, details.httpStatus) && !isQuotaExceeded(raw, details.apiStatus)) {
    return "rate_limited";
  }

  if (isQuotaExceeded(raw, details.apiStatus)) {
    return "quota_exceeded";
  }

  if (isModelNotFound(details, raw)) {
    return "model_not_found";
  }

  if (
    details.httpStatus === 400 ||
    apiStatus === "INVALID_ARGUMENT" ||
    apiStatus === "FAILED_PRECONDITION"
  ) {
    return "invalid_request";
  }

  if (
    raw.includes("fetch failed") ||
    raw.includes("network") ||
    raw.includes("econnreset") ||
    raw.includes("etimedout") ||
    raw.includes("socket") ||
    (details.httpStatus !== undefined && details.httpStatus >= 500)
  ) {
    return "network_error";
  }

  if (
    raw.includes("json") ||
    raw.includes("unexpected token") ||
    raw.includes("syntaxerror") ||
    raw.includes("malformed json")
  ) {
    return "invalid_response";
  }

  if (raw.includes("model") && (raw.includes("unavailable") || raw.includes("overloaded"))) {
    return "model_error";
  }

  return "unknown_gemini_error";
}

export function logGeminiFailure(params: {
  category: FallbackReason;
  model: string;
  details: GeminiErrorDetails;
}): void {
  console.warn("[darshana] Gemini request failed", {
    category: params.category,
    httpStatus: params.details.httpStatus,
    apiStatus: params.details.apiStatus,
    apiCode: params.details.apiCode,
    message: params.details.message,
    model: params.model,
    reachedGemini: params.details.reachedGemini,
  });
}

export function toGeminiServiceError(error: unknown): GeminiServiceError {
  const details = extractGeminiErrorDetails(error);
  const reason = classifyGeminiError(error, details);
  return new GeminiServiceError(reason, details.message, details);
}
