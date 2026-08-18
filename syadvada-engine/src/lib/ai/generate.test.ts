import assert from "node:assert/strict";
import { describe, it, afterEach } from "node:test";

import { getAIProvider } from "@/lib/config/env";

const originalProvider = process.env.AI_PROVIDER;

describe("AI provider selection", () => {
  afterEach(() => {
    if (originalProvider === undefined) {
      delete process.env.AI_PROVIDER;
    } else {
      process.env.AI_PROVIDER = originalProvider;
    }
  });

  it("defaults to gemini when AI_PROVIDER is missing", () => {
    delete process.env.AI_PROVIDER;
    assert.equal(getAIProvider(), "gemini");
  });

  it("selects openrouter when AI_PROVIDER=openrouter", () => {
    process.env.AI_PROVIDER = "openrouter";
    assert.equal(getAIProvider(), "openrouter");
  });

  it("selects gemini when AI_PROVIDER=gemini", () => {
    process.env.AI_PROVIDER = "gemini";
    assert.equal(getAIProvider(), "gemini");
  });

  it("treats AI_PROVIDER case-insensitively", () => {
    process.env.AI_PROVIDER = "OpenRouter";
    assert.equal(getAIProvider(), "openrouter");
  });
});
