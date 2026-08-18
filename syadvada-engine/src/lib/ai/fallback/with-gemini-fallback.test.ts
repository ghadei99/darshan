import assert from "node:assert/strict";
import { describe, it, afterEach } from "node:test";

import type { AnalyzerMeta } from "../types";
import { GeminiServiceError } from "../gemini/errors";
import { OpenRouterServiceError } from "../openrouter/errors";
import { withGeminiFallback } from "./with-gemini-fallback";

const originalGeminiKey = process.env.GEMINI_API_KEY;
const originalOpenRouterKey = process.env.OPENROUTER_API_KEY;
const originalProvider = process.env.AI_PROVIDER;

type TestResult = AnalyzerMeta & { value: string };

describe("withGeminiFallback", () => {
  afterEach(() => {
    if (originalGeminiKey === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = originalGeminiKey;
    }
    if (originalOpenRouterKey === undefined) {
      delete process.env.OPENROUTER_API_KEY;
    } else {
      process.env.OPENROUTER_API_KEY = originalOpenRouterKey;
    }
    if (originalProvider === undefined) {
      delete process.env.AI_PROVIDER;
    } else {
      process.env.AI_PROVIDER = originalProvider;
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

  it("uses openrouter analyzer mode when AI_PROVIDER=openrouter succeeds", async () => {
    process.env.AI_PROVIDER = "openrouter";
    process.env.OPENROUTER_API_KEY = "sk-or-v1-test-key-abcdefghij";

    const result = await withGeminiFallback<TestResult>(
      async () => ({ analyzer: "openrouter", value: "openrouter" }),
      () => ({ analyzer: "heuristic", value: "local" }),
    );

    assert.equal(result.analyzer, "openrouter");
    assert.equal(result.value, "openrouter");
    assert.equal(result.fallbackReason, undefined);
  });

  it("falls back with missing_key when openrouter key is unset", async () => {
    process.env.AI_PROVIDER = "openrouter";
    delete process.env.OPENROUTER_API_KEY;

    const result = await withGeminiFallback<TestResult>(
      async () => ({ analyzer: "openrouter", value: "openrouter" }),
      () => ({ analyzer: "heuristic", value: "local" }),
    );

    assert.equal(result.analyzer, "heuristic");
    assert.equal(result.fallbackReason, "missing_key");
    assert.equal(result.value, "local");
  });

  it("falls back when openrouterFn throws", async () => {
    process.env.AI_PROVIDER = "openrouter";
    process.env.OPENROUTER_API_KEY = "sk-or-v1-test-key-abcdefghij";

    const result = await withGeminiFallback<TestResult>(
      async () => {
        throw new OpenRouterServiceError("rate_limited", "Rate limit exceeded", {
          httpStatus: 429,
          message: "Rate limit exceeded",
          reachedOpenRouter: true,
        });
      },
      () => ({ analyzer: "heuristic", value: "local" }),
    );

    assert.equal(result.analyzer, "heuristic");
    assert.equal(result.fallbackReason, "rate_limited");
    assert.equal(result.value, "local");
  });
});
