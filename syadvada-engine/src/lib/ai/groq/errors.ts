import type { FallbackReason } from "../types";

export class GroqServiceError extends Error {
  readonly reason: FallbackReason;
  readonly details: GroqErrorDetails;

  constructor(reason: FallbackReason, message: string, details: GroqErrorDetails) {
    super(message);
    this.name = "GroqServiceError";
    this.reason = reason;
    this.details = details;
  }
}

export interface GroqRateLimitMetadata {
  retryAfter?: string;
  limitRequests?: string;
  remainingRequests?: string;
  resetRequests?: string;
  limitTokens?: string;
  remainingTokens?: string;
  resetTokens?: string;
}

export interface GroqErrorDetails {
  httpStatus?: number;
  apiCode?: number | string;
  finishReason?: string;
  message: string;
  reachedGroq: boolean;
  model?: string;
  rateLimit?: GroqRateLimitMetadata;
}

const SECRET_PATTERNS: RegExp[] = [
  /\bgsk_[A-Za-z0-9_-]{10,}\b/g,
  /(?:api[_-]?key|authorization)\s*[:=]\s*["']?[^\s"'&]+/gi,
  /bearer\s+[A-Za-z0-9._-]{10,}/gi,
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

export function extractGroqErrorDetails(error: unknown): GroqErrorDetails {
  if (error instanceof GroqServiceError) {
    return error.details;
  }

  const rawMessage = extractErrorPayload(error);
  return {
    message: sanitizeErrorText(rawMessage),
    reachedGroq: rawMessage.includes("Groq"),
  };
}

export function classifyGroqError(
  error: unknown,
  details: GroqErrorDetails = extractGroqErrorDetails(error),
): FallbackReason {
  const raw = `${details.message} ${extractErrorPayload(error)}`.toLowerCase();

  if (
    details.httpStatus === 401 ||
    raw.includes("unauthorized") ||
    raw.includes("invalid api key") ||
    raw.includes("authentication")
  ) {
    return "authentication_error";
  }

  if (
    details.httpStatus === 403 ||
    raw.includes("forbidden") ||
    raw.includes("permission denied")
  ) {
    return "permission_error";
  }

  if (
    details.httpStatus === 429 ||
    raw.includes("rate limit") ||
    raw.includes("too many requests")
  ) {
    return "rate_limited";
  }

  if (
    details.httpStatus !== 429 &&
    (raw.includes("quota") ||
      raw.includes("billing") ||
      raw.includes("insufficient credits"))
  ) {
    return "quota_exceeded";
  }

  if (
    details.httpStatus === 404 ||
    raw.includes("model not found") ||
    raw.includes("model_not_found") ||
    raw.includes("does not exist") ||
    raw.includes("model unavailable")
  ) {
    return "model_not_found";
  }

  if (details.httpStatus === 400 || raw.includes("invalid request")) {
    return "invalid_request";
  }

  if (
    raw.includes("fetch failed") ||
    raw.includes("network") ||
    raw.includes("econnreset") ||
    raw.includes("etimedout") ||
    raw.includes("timeout") ||
    (details.httpStatus !== undefined && details.httpStatus >= 500)
  ) {
    return "network_error";
  }

  if (
    raw.includes("empty response") ||
    raw.includes("truncated") ||
    raw.includes("malformed json") ||
    raw.includes("json")
  ) {
    return "invalid_response";
  }

  return "unknown_groq_error";
}

/** Retry the next Groq model. Auth/permission/quota are provider-wide — stop immediately. */
export function isRetryableGroqFailure(error: GroqServiceError): boolean {
  if (error.details.httpStatus === 429) return true;
  if (error.reason === "authentication_error") return false;
  if (error.reason === "permission_error") return false;
  if (error.reason === "quota_exceeded") return false;
  return true;
}

export function logGroqFailure(params: {
  category: FallbackReason;
  model: string;
  details: GroqErrorDetails;
}): void {
  console.warn("[ai] Groq request failed", {
    category: params.category,
    httpStatus: params.details.httpStatus,
    apiCode: params.details.apiCode,
    finishReason: params.details.finishReason,
    message: params.details.message,
    model: params.model,
    reachedGroq: params.details.reachedGroq,
    retryAfter: params.details.rateLimit?.retryAfter,
    rateLimitRemainingRequests: params.details.rateLimit?.remainingRequests,
    rateLimitResetRequests: params.details.rateLimit?.resetRequests,
    rateLimitRemainingTokens: params.details.rateLimit?.remainingTokens,
    rateLimitResetTokens: params.details.rateLimit?.resetTokens,
  });
}

export function logGroqFailover(params: {
  fromModel: string;
  toModel: string;
  reason: FallbackReason;
}): void {
  console.info("[ai] Groq failover", {
    fromModel: params.fromModel,
    toModel: params.toModel,
    reason: params.reason,
  });
}

export function logGroqSuccess(model: string): void {
  console.info("[ai] Groq request succeeded", { model });
}

export function toGroqServiceError(error: unknown, model?: string): GroqServiceError {
  if (error instanceof GroqServiceError) return error;
  const details = extractGroqErrorDetails(error);
  const reason = classifyGroqError(error, details);
  return new GroqServiceError(reason, details.message, {
    ...details,
    model: details.model ?? model,
  });
}
