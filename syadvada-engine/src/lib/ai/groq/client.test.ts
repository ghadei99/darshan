import assert from "node:assert/strict";
import { describe, it, afterEach } from "node:test";

import { generateJson, generateText, setGroqFetchForTests } from "./impl";
import { GroqServiceError } from "./errors";

const originalKey = process.env.GROQ_API_KEY;
const originalModels = process.env.GROQ_MODELS;

function jsonResponse(
  status: number,
  body: unknown,
  headers?: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function completion(content: string, finishReason = "stop") {
  return {
    choices: [{ message: { content }, finish_reason: finishReason }],
  };
}

function restoreEnv(): void {
  setGroqFetchForTests(undefined);
  if (originalKey === undefined) {
    delete process.env.GROQ_API_KEY;
  } else {
    process.env.GROQ_API_KEY = originalKey;
  }
  if (originalModels === undefined) {
    delete process.env.GROQ_MODELS;
  } else {
    process.env.GROQ_MODELS = originalModels;
  }
}

describe("Groq client failover", () => {
  afterEach(restoreEnv);

  it("returns generated text from the first successful model", async () => {
    process.env.GROQ_API_KEY = "gsk_test_key_abcdefghij";
    process.env.GROQ_MODELS = "openai/gpt-oss-120b,llama-3.3-70b-versatile";
    const models: string[] = [];

    setGroqFetchForTests(async (_url, init) => {
      const body = JSON.parse(String(init?.body)) as { model: string };
      models.push(body.model);
      return jsonResponse(200, completion("  Groq reply.  "));
    });

    const text = await generateText({
      systemInstruction: "Stay in character.",
      userPrompt: "Challenge my thesis.",
      temperature: 0.8,
      maxOutputTokens: 256,
    });

    assert.equal(text, "Groq reply.");
    assert.deepEqual(models, ["openai/gpt-oss-120b"]);
  });

  it("fails over on HTTP 429 and preserves rate-limit headers", async () => {
    process.env.GROQ_API_KEY = "gsk_test_key_abcdefghij";
    process.env.GROQ_MODELS = "openai/gpt-oss-120b,llama-3.3-70b-versatile";
    const models: string[] = [];

    setGroqFetchForTests(async (_url, init) => {
      const body = JSON.parse(String(init?.body)) as { model: string };
      models.push(body.model);
      if (body.model === "openai/gpt-oss-120b") {
        return jsonResponse(
          429,
          { error: { message: "Rate limit exceeded", code: "rate_limited" } },
          {
            "retry-after": "2",
            "x-ratelimit-limit-requests": "30",
            "x-ratelimit-remaining-requests": "0",
            "x-ratelimit-reset-requests": "2s",
            "x-ratelimit-limit-tokens": "10000",
            "x-ratelimit-remaining-tokens": "0",
            "x-ratelimit-reset-tokens": "2s",
          },
        );
      }
      return jsonResponse(200, completion("Second model reply"));
    });

    const text = await generateText({
      systemInstruction: "System",
      userPrompt: "User",
    });

    assert.equal(text, "Second model reply");
    assert.deepEqual(models, ["openai/gpt-oss-120b", "llama-3.3-70b-versatile"]);
  });

  it("fails over on HTTP 500", async () => {
    process.env.GROQ_API_KEY = "gsk_test_key_abcdefghij";
    process.env.GROQ_MODELS = "openai/gpt-oss-120b,llama-3.3-70b-versatile";
    const models: string[] = [];

    setGroqFetchForTests(async (_url, init) => {
      const body = JSON.parse(String(init?.body)) as { model: string };
      models.push(body.model);
      if (models.length === 1) {
        return jsonResponse(500, { error: { message: "Internal error" } });
      }
      return jsonResponse(200, completion("Recovered"));
    });

    const text = await generateText({
      systemInstruction: "System",
      userPrompt: "User",
    });
    assert.equal(text, "Recovered");
    assert.equal(models.length, 2);
  });

  it("fails over on model-not-found", async () => {
    process.env.GROQ_API_KEY = "gsk_test_key_abcdefghij";
    process.env.GROQ_MODELS = "missing-model,llama-3.1-8b-instant";
    const models: string[] = [];

    setGroqFetchForTests(async (_url, init) => {
      const body = JSON.parse(String(init?.body)) as { model: string };
      models.push(body.model);
      if (body.model === "missing-model") {
        return jsonResponse(404, { error: { message: "model not found" } });
      }
      return jsonResponse(200, completion("Fallback model"));
    });

    const text = await generateText({
      systemInstruction: "System",
      userPrompt: "User",
    });
    assert.equal(text, "Fallback model");
    assert.deepEqual(models, ["missing-model", "llama-3.1-8b-instant"]);
  });

  it("fails over on truncated length-limited output", async () => {
    process.env.GROQ_API_KEY = "gsk_test_key_abcdefghij";
    process.env.GROQ_MODELS = "openai/gpt-oss-120b,llama-3.3-70b-versatile";
    const models: string[] = [];

    setGroqFetchForTests(async (_url, init) => {
      const body = JSON.parse(String(init?.body)) as { model: string };
      models.push(body.model);
      if (models.length === 1) {
        return jsonResponse(200, completion("Partial", "length"));
      }
      return jsonResponse(200, completion("Complete"));
    });

    const text = await generateText({
      systemInstruction: "System",
      userPrompt: "User",
    });
    assert.equal(text, "Complete");
    assert.equal(models.length, 2);
  });

  it("fails over on empty response content", async () => {
    process.env.GROQ_API_KEY = "gsk_test_key_abcdefghij";
    process.env.GROQ_MODELS = "openai/gpt-oss-120b,llama-3.3-70b-versatile";
    const models: string[] = [];

    setGroqFetchForTests(async (_url, init) => {
      const body = JSON.parse(String(init?.body)) as { model: string };
      models.push(body.model);
      if (models.length === 1) {
        return jsonResponse(200, completion("   "));
      }
      return jsonResponse(200, completion("Non-empty"));
    });

    const text = await generateText({
      systemInstruction: "System",
      userPrompt: "User",
    });
    assert.equal(text, "Non-empty");
    assert.equal(models.length, 2);
  });

  it("throws after all models fail", async () => {
    process.env.GROQ_API_KEY = "gsk_test_key_abcdefghij";
    process.env.GROQ_MODELS = "model-a,model-b";
    const models: string[] = [];

    setGroqFetchForTests(async (_url, init) => {
      const body = JSON.parse(String(init?.body)) as { model: string };
      models.push(body.model);
      return jsonResponse(500, { error: { message: "server error" } });
    });

    await assert.rejects(
      () =>
        generateText({
          systemInstruction: "System",
          userPrompt: "User",
        }),
      (error: unknown) => {
        assert.ok(error instanceof GroqServiceError);
        return true;
      },
    );
    assert.deepEqual(models, ["model-a", "model-b"]);
  });

  it("does not cycle models on authentication failure", async () => {
    process.env.GROQ_API_KEY = "gsk_test_key_abcdefghij";
    process.env.GROQ_MODELS = "openai/gpt-oss-120b,llama-3.3-70b-versatile";
    const models: string[] = [];

    setGroqFetchForTests(async (_url, init) => {
      const body = JSON.parse(String(init?.body)) as { model: string };
      models.push(body.model);
      return jsonResponse(401, { error: { message: "Invalid API Key" } });
    });

    await assert.rejects(
      () =>
        generateText({
          systemInstruction: "System",
          userPrompt: "User",
        }),
      (error: unknown) => {
        assert.ok(error instanceof GroqServiceError);
        assert.equal(error.reason, "authentication_error");
        return true;
      },
    );
    assert.deepEqual(models, ["openai/gpt-oss-120b"]);
  });

  it("respects configured GROQ_MODELS order", async () => {
    process.env.GROQ_API_KEY = "gsk_test_key_abcdefghij";
    process.env.GROQ_MODELS = "llama-3.1-8b-instant,openai/gpt-oss-20b";
    const models: string[] = [];

    setGroqFetchForTests(async (_url, init) => {
      const body = JSON.parse(String(init?.body)) as { model: string };
      models.push(body.model);
      return jsonResponse(429, { error: { message: "Rate limit exceeded" } });
    });

    await assert.rejects(() =>
      generateText({
        systemInstruction: "System",
        userPrompt: "User",
      }),
    );
    assert.deepEqual(models, ["llama-3.1-8b-instant", "openai/gpt-oss-20b"]);
  });

  it("works with a single configured model", async () => {
    process.env.GROQ_API_KEY = "gsk_test_key_abcdefghij";
    process.env.GROQ_MODELS = "llama-3.1-8b-instant";
    const models: string[] = [];

    setGroqFetchForTests(async (_url, init) => {
      const body = JSON.parse(String(init?.body)) as { model: string };
      models.push(body.model);
      return jsonResponse(200, completion("Solo"));
    });

    const text = await generateText({
      systemInstruction: "System",
      userPrompt: "User",
    });
    assert.equal(text, "Solo");
    assert.deepEqual(models, ["llama-3.1-8b-instant"]);
  });

  it("parses JSON responses", async () => {
    process.env.GROQ_API_KEY = "gsk_test_key_abcdefghij";
    process.env.GROQ_MODELS = "llama-3.3-70b-versatile";

    setGroqFetchForTests(async (_url, init) => {
      const body = JSON.parse(String(init?.body)) as {
        response_format?: { type?: string };
      };
      assert.equal(body.response_format?.type, "json_object");
      return jsonResponse(200, completion('{"summary":"Done"}'));
    });

    const data = await generateJson<{ summary: string }>({
      systemInstruction: "Return JSON only.",
      userPrompt: "Summarize.",
    });
    assert.deepEqual(data, { summary: "Done" });
  });

  it("fails over when structured JSON is malformed", async () => {
    process.env.GROQ_API_KEY = "gsk_test_key_abcdefghij";
    process.env.GROQ_MODELS = "model-a,model-b";
    const models: string[] = [];

    setGroqFetchForTests(async (_url, init) => {
      const body = JSON.parse(String(init?.body)) as { model: string };
      models.push(body.model);
      if (body.model === "model-a") {
        return jsonResponse(200, completion("not json"));
      }
      return jsonResponse(200, completion('{"ok":true}'));
    });

    const data = await generateJson<{ ok: boolean }>({
      systemInstruction: "Return JSON only.",
      userPrompt: "Summarize.",
    });
    assert.deepEqual(data, { ok: true });
    assert.deepEqual(models, ["model-a", "model-b"]);
  });
});
