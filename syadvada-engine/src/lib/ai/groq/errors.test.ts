import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  GroqServiceError,
  classifyGroqError,
  isRetryableGroqFailure,
} from "./errors";

describe("isRetryableGroqFailure", () => {
  it("retries rate limits", () => {
    const error = new GroqServiceError("rate_limited", "Rate limit exceeded", {
      httpStatus: 429,
      message: "Rate limit exceeded",
      reachedGroq: true,
    });
    assert.equal(isRetryableGroqFailure(error), true);
  });

  it("does not retry authentication errors", () => {
    const error = new GroqServiceError("authentication_error", "Unauthorized", {
      httpStatus: 401,
      message: "Unauthorized",
      reachedGroq: true,
    });
    assert.equal(isRetryableGroqFailure(error), false);
  });

  it("retries truncated responses", () => {
    const error = new GroqServiceError("invalid_response", "truncated", {
      finishReason: "length",
      message: "truncated",
      reachedGroq: true,
    });
    assert.equal(isRetryableGroqFailure(error), true);
  });
});

describe("classifyGroqError", () => {
  it("classifies HTTP 401 as authentication_error", () => {
    const error = new GroqServiceError("unknown_groq_error", "Unauthorized", {
      httpStatus: 401,
      message: "Unauthorized",
      reachedGroq: true,
    });
    assert.equal(classifyGroqError(error), "authentication_error");
  });
});
