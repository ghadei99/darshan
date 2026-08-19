import assert from "node:assert/strict";
import { describe, it, afterEach } from "node:test";

import { DEFAULT_GROQ_MODELS, getAIProvider, getGroqModels } from "@/lib/config/env";

const originalProvider = process.env.AI_PROVIDER;
const originalGroqModels = process.env.GROQ_MODELS;

describe("AI provider selection", () => {
  afterEach(() => {
    if (originalProvider === undefined) {
      delete process.env.AI_PROVIDER;
    } else {
      process.env.AI_PROVIDER = originalProvider;
    }
    if (originalGroqModels === undefined) {
      delete process.env.GROQ_MODELS;
    } else {
      process.env.GROQ_MODELS = originalGroqModels;
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

  it("selects groq when AI_PROVIDER=groq", () => {
    process.env.AI_PROVIDER = "groq";
    assert.equal(getAIProvider(), "groq");
  });

  it("uses the default Groq failover order when GROQ_MODELS is unset", () => {
    delete process.env.GROQ_MODELS;
    assert.deepEqual(getGroqModels(), [...DEFAULT_GROQ_MODELS]);
  });

  it("parses GROQ_MODELS as an ordered list", () => {
    process.env.GROQ_MODELS = "llama-3.1-8b-instant, openai/gpt-oss-20b";
    assert.deepEqual(getGroqModels(), [
      "llama-3.1-8b-instant",
      "openai/gpt-oss-20b",
    ]);
  });
});
