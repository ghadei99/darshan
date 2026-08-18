import assert from "node:assert/strict";
import { describe, it, afterEach } from "node:test";

import type { AnalyzerMeta } from "../types";
import { GeminiServiceError } from "../gemini/errors";
import { withGeminiFallback } from "./with-gemini-fallback";

const originalKey = process.env.GEMINI_API_KEY;

type TestResult = AnalyzerMeta & { value: string };

describe("withGeminiFallback", () => {
  afterEach(() => {
    if (originalKey === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = originalKey;
    }
  });

  it("falls back with missing_key when env is unset", async () => {
    delete process.env.GEMINI_API_KEY;
    const result = await withGeminiFallback<TestResult>(
      async () => ({ analyzer: "gemini", value: "gemini" }),
      () => ({ analyzer: "heuristic", value: "local" }),
    );
    assert.equal(result.analyzer, "heuristic");
    assert.equal(result.fallbackReason, "missing_key");
    assert.equal(result.value, "local");
  });

  it("falls back with invalid_key_format for obviously malformed keys", async () => {
    process.env.GEMINI_API_KEY = "undefined";
    const result = await withGeminiFallback<TestResult>(
      async () => ({ analyzer: "gemini", value: "gemini" }),
      () => ({ analyzer: "heuristic", value: "local" }),
    );
    assert.equal(result.analyzer, "heuristic");
    assert.equal(result.fallbackReason, "invalid_key_format");
  });

  it("accepts authorization-style AQ. keys and calls geminiFn", async () => {
    process.env.GEMINI_API_KEY = "AQ.Ab8FakeAuthorizationKeyForUnitTest";
    const result = await withGeminiFallback<TestResult>(
      async () => ({ analyzer: "gemini", value: "gemini" }),
      () => ({ analyzer: "heuristic", value: "local" }),
    );
    assert.equal(result.analyzer, "gemini");
    assert.equal(result.value, "gemini");
    assert.equal(result.fallbackReason, undefined);
  });

  it("returns gemini result when geminiFn succeeds", async () => {
    process.env.GEMINI_API_KEY = "AIzaSyFakeKeyForUnitTestOnly";
    const result = await withGeminiFallback<TestResult>(
      async () => ({ analyzer: "gemini", value: "gemini" }),
      () => ({ analyzer: "heuristic", value: "local" }),
    );
    assert.equal(result.analyzer, "gemini");
    assert.equal(result.value, "gemini");
    assert.equal(result.fallbackReason, undefined);
  });

  it("falls back when geminiFn throws", async () => {
    process.env.GEMINI_API_KEY = "AIzaSyFakeKeyForUnitTestOnly";
    const result = await withGeminiFallback<TestResult>(
      async () => {
        throw new Error("401 API key not valid");
      },
      () => ({ analyzer: "heuristic", value: "local" }),
    );
    assert.equal(result.analyzer, "heuristic");
    assert.equal(result.fallbackReason, "authentication_error");
  });

  it("falls back when geminiFn throws MAX_TOKENS truncation", async () => {
    process.env.GEMINI_API_KEY = "AIzaSyFakeKeyForUnitTestOnly";
    const truncated = new GeminiServiceError(
      "invalid_response",
      "Gemini output truncated (finishReason=MAX_TOKENS, length=187)",
      {
        finishReason: "MAX_TOKENS",
        message: "Gemini output truncated at 187 characters",
        reachedGemini: true,
      },
    );

    const result = await withGeminiFallback<TestResult>(
      async () => {
        throw truncated;
      },
      () => ({ analyzer: "heuristic", value: "local" }),
    );
    assert.equal(result.analyzer, "heuristic");
    assert.equal(result.fallbackReason, "invalid_response");
    assert.equal(result.value, "local");
  });
});
