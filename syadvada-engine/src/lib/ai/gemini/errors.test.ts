import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ApiError } from "@google/genai";

import {
  classifyGeminiError,
  ensureCompleteGeneration,
  extractGeminiErrorDetails,
  GeminiServiceError,
  toGeminiServiceError,
} from "./errors";

describe("extractGeminiErrorDetails", () => {
  it("parses structured ApiError payloads", () => {
    const error = new ApiError({
      status: 400,
      message: JSON.stringify({
        error: {
          code: 400,
          status: "INVALID_ARGUMENT",
          message: "Invalid model name",
        },
      }),
    });

    const details = extractGeminiErrorDetails(error);
    assert.equal(details.httpStatus, 400);
    assert.equal(details.apiStatus, "INVALID_ARGUMENT");
    assert.equal(details.apiCode, 400);
    assert.equal(details.message, "Invalid model name");
    assert.equal(details.reachedGemini, true);
  });
});

describe("classifyGeminiError", () => {
  it("classifies authentication failures", () => {
    assert.equal(
      classifyGeminiError(new Error('{"error":{"code":401,"message":"API key not valid"}}')),
      "authentication_error",
    );
  });

  it("classifies permission failures from ApiError status", () => {
    const error = new ApiError({
      status: 403,
      message: JSON.stringify({
        error: {
          code: 403,
          status: "PERMISSION_DENIED",
          message: "Generative Language API has not been used in project",
        },
      }),
    });

    assert.equal(classifyGeminiError(error), "permission_error");
  });

  it("classifies rate limits", () => {
    assert.equal(
      classifyGeminiError(new Error("429 rate limit exceeded")),
      "rate_limited",
    );
  });

  it("classifies quota errors", () => {
    assert.equal(
      classifyGeminiError(new Error("You exceeded your current quota")),
      "quota_exceeded",
    );
  });

  it("classifies invalid request instead of model error for INVALID_ARGUMENT", () => {
    const error = new ApiError({
      status: 400,
      message: JSON.stringify({
        error: {
          code: 400,
          status: "INVALID_ARGUMENT",
          message: "Invalid model name",
        },
      }),
    });

    assert.equal(classifyGeminiError(error), "invalid_request");
  });

  it("classifies model not found for 404 model errors", () => {
    const error = new ApiError({
      status: 404,
      message: JSON.stringify({
        error: {
          code: 404,
          status: "NOT_FOUND",
          message: "models/gemini-2.5-flash is not found",
        },
      }),
    });

    assert.equal(classifyGeminiError(error), "model_not_found");
  });

  it("classifies network errors", () => {
    assert.equal(
      classifyGeminiError(new Error("fetch failed ECONNRESET")),
      "network_error",
    );
  });

  it("wraps unknown errors with structured details", () => {
    const err = toGeminiServiceError(new Error("something broke"));
    assert.equal(err.reason, "unknown_gemini_error");
    assert.equal(err.details.message, "something broke");
  });

  it("redacts API keys from error messages", () => {
    const err = toGeminiServiceError(
      new Error("Request failed for key AIzaSySuperSecretKeyValue1234567890"),
    );
    assert.match(err.details.message, /\[REDACTED\]/);
    assert.doesNotMatch(err.details.message, /AIzaSySuperSecretKeyValue1234567890/);
  });
});

describe("GeminiServiceError", () => {
  it("preserves reason and details", () => {
    const err = new GeminiServiceError("authentication_error", "API key not valid", {
      httpStatus: 401,
      apiStatus: "UNAUTHENTICATED",
      message: "API key not valid",
      reachedGemini: true,
    });
    assert.equal(err.reason, "authentication_error");
    assert.equal(err.details.httpStatus, 401);
  });
});

describe("ensureCompleteGeneration", () => {
  it("allows STOP finish reason", () => {
    assert.doesNotThrow(() =>
      ensureCompleteGeneration({
        finishReason: "STOP",
        generatedTextLength: 240,
      }),
    );
  });

  it("allows unspecified finish reason", () => {
    assert.doesNotThrow(() =>
      ensureCompleteGeneration({
        generatedTextLength: 120,
      }),
    );
  });

  it("rejects MAX_TOKENS truncated output", () => {
    assert.throws(
      () =>
        ensureCompleteGeneration({
          finishReason: "MAX_TOKENS",
          generatedTextLength: 187,
        }),
      (error: unknown) => {
        assert.ok(error instanceof GeminiServiceError);
        assert.equal(error.reason, "invalid_response");
        assert.equal(error.details.finishReason, "MAX_TOKENS");
        assert.equal(error.details.reachedGemini, true);
        return true;
      },
    );
  });

  it("tags MAX_TOKENS truncation as invalid_response for fallback", () => {
    const truncated = new GeminiServiceError(
      "invalid_response",
      "Gemini output truncated (finishReason=MAX_TOKENS, length=187)",
      {
        finishReason: "MAX_TOKENS",
        message: "Gemini output truncated at 187 characters",
        reachedGemini: true,
      },
    );

    assert.equal(truncated.reason, "invalid_response");
    assert.equal(truncated.details.finishReason, "MAX_TOKENS");
  });
});
