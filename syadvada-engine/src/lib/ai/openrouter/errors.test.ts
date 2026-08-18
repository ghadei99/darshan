import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  OpenRouterServiceError,
  ensureCompleteOpenRouterGeneration,
  toOpenRouterServiceError,
} from "./errors";

describe("ensureCompleteOpenRouterGeneration", () => {
  it("allows stop finish reason", () => {
    assert.doesNotThrow(() =>
      ensureCompleteOpenRouterGeneration({
        finishReason: "stop",
        generatedTextLength: 42,
      }),
    );
  });

  it("rejects length-limited truncated output", () => {
    assert.throws(
      () =>
        ensureCompleteOpenRouterGeneration({
          finishReason: "length",
          generatedTextLength: 120,
        }),
      (error: unknown) => {
        assert.ok(error instanceof OpenRouterServiceError);
        assert.equal(error.reason, "invalid_response");
        return true;
      },
    );
  });
});

describe("toOpenRouterServiceError", () => {
  it("classifies HTTP 401 as authentication_error", () => {
    const error = new OpenRouterServiceError(
      "unknown_openrouter_error",
      "Unauthorized",
      {
        httpStatus: 401,
        message: "Unauthorized",
        reachedOpenRouter: true,
      },
    );
    const classified = toOpenRouterServiceError(error);
    assert.equal(classified.reason, "authentication_error");
  });
});
