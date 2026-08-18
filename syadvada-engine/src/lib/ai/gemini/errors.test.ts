import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { classifyGeminiError, GeminiServiceError } from "./errors";

describe("classifyGeminiError", () => {
  it("classifies authentication failures", () => {
    assert.equal(
      classifyGeminiError(new Error('{"error":{"code":401,"message":"API key not valid"}}')),
      "authentication_error",
    );
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

  it("classifies network errors", () => {
    assert.equal(
      classifyGeminiError(new Error("fetch failed ECONNRESET")),
      "network_error",
    );
  });

  it("wraps unknown errors", () => {
    const err = new GeminiServiceError("unknown_gemini_error", "something broke");
    assert.equal(err.reason, "unknown_gemini_error");
  });
});
