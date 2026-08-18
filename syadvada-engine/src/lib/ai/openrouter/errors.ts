import type { FallbackReason } from "../types";

export class OpenRouterServiceError extends Error {
  readonly reason: FallbackReason;
  readonly details: OpenRouterErrorDetails;

  constructor(
    reason: FallbackReason,
    message: string,
    details: OpenRouterErrorDetails,
  ) {
    super(message);
    this.name = "OpenRouterServiceError";
    this.reason = reason;
    this.details = details;
  }
}

export interface OpenRouterErrorDetails {
  httpStatus?: number;
  apiCode?: number | string;
  finishReason?: string;
  message: string;
  reachedOpenRouter: boolean;
}

const SECRET_PATTERNS: RegExp[] = [
  /\bsk-or-[A-Za-z0-9_-]{10,}\b/g,
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

export function extractOpenRouterErrorDetails(
  error: unknown,
): OpenRouterErrorDetails {
  if (error instanceof OpenRouterServiceError) {
    return error.details;
  }

  const rawMessage = extractErrorPayload(error);
  return {
    message: sanitizeErrorText(rawMessage),
    reachedOpenRouter: rawMessage.includes("OpenRouter"),
  };
}

export function classifyOpenRouterError(
  error: unknown,
  details: OpenRouterErrorDetails = extractOpenRouterErrorDetails(error),
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
    raw.includes("quota") ||
    raw.includes("billing") ||
    raw.includes("insufficient credits")
  ) {
    return "quota_exceeded";
  }

  if (details.httpStatus === 404 || raw.includes("model not found")) {
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

  return "unknown_openrouter_error";
}

export interface OpenRouterGenerationMetadata {
  finishReason?: string | null;
  generatedTextLength: number;
}

/** Reject truncated OpenRouter generations so callers can fall back instead of returning partial text. */
export function ensureCompleteOpenRouterGeneration(
  meta: OpenRouterGenerationMetadata,
): void {
  if (meta.finishReason !== "length") return;

  throw new OpenRouterServiceError(
    "invalid_response",
    `OpenRouter output truncated (finishReason=length, length=${meta.generatedTextLength})`,
    {
      finishReason: meta.finishReason,
      message: `OpenRouter output truncated at ${meta.generatedTextLength} characters`,
      reachedOpenRouter: true,
    },
  );
}

export function logOpenRouterFailure(params: {
  category: FallbackReason;
  model: string;
  details: OpenRouterErrorDetails;
}): void {
  console.warn("[ai] OpenRouter request failed", {
    category: params.category,
    httpStatus: params.details.httpStatus,
    apiCode: params.details.apiCode,
    finishReason: params.details.finishReason,
    message: params.details.message,
    model: params.model,
    reachedOpenRouter: params.details.reachedOpenRouter,
  });
}

export function toOpenRouterServiceError(error: unknown): OpenRouterServiceError {
  const details = extractOpenRouterErrorDetails(error);
  const reason = classifyOpenRouterError(error, details);
  return new OpenRouterServiceError(reason, details.message, details);
}
