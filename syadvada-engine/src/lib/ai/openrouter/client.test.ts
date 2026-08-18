import assert from "node:assert/strict";
import { describe, it, afterEach } from "node:test";

import {
  generateJson,
  generateText,
  setOpenRouterFetchForTests,
} from "./impl";
import { OpenRouterServiceError } from "./errors";

const originalKey = process.env.OPENROUTER_API_KEY;
const originalModel = process.env.OPENROUTER_MODEL;

function jsonResponse(
  status: number,
  body: unknown,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("OpenRouter client", () => {
  afterEach(() => {
    setOpenRouterFetchForTests(undefined);
    if (originalKey === undefined) {
      delete process.env.OPENROUTER_API_KEY;
    } else {
      process.env.OPENROUTER_API_KEY = originalKey;
    }
    if (originalModel === undefined) {
      delete process.env.OPENROUTER_MODEL;
    } else {
      process.env.OPENROUTER_MODEL = originalModel;
    }
  });

  it("returns generated text on success", async () => {
    process.env.OPENROUTER_API_KEY = "sk-or-v1-test-key-abcdefghij";
    process.env.OPENROUTER_MODEL = "openai/gpt-oss-120b:free";

    setOpenRouterFetchForTests(async () =>
      jsonResponse(200, {
        choices: [
          {
            message: { content: "  Dependent origination reply.  " },
            finish_reason: "stop",
          },
        ],
      }),
    );

    const text = await generateText({
      systemInstruction: "Stay in character.",
      userPrompt: "Challenge my thesis.",
      temperature: 0.8,
      maxOutputTokens: 256,
    });

    assert.equal(text, "Dependent origination reply.");
  });

  it("throws on HTTP error", async () => {
    process.env.OPENROUTER_API_KEY = "sk-or-v1-test-key-abcdefghij";

    setOpenRouterFetchForTests(async () =>
      jsonResponse(429, {
        error: { message: "Rate limit exceeded", code: 429 },
      }),
    );

    await assert.rejects(
      () =>
        generateText({
          systemInstruction: "System",
          userPrompt: "User",
        }),
      (error: unknown) => {
        assert.ok(error instanceof OpenRouterServiceError);
        assert.equal(error.details.httpStatus, 429);
        return true;
      },
    );
  });

  it("throws on empty response content", async () => {
    process.env.OPENROUTER_API_KEY = "sk-or-v1-test-key-abcdefghij";

    setOpenRouterFetchForTests(async () =>
      jsonResponse(200, {
        choices: [{ message: { content: "   " }, finish_reason: "stop" }],
      }),
    );

    await assert.rejects(
      () =>
        generateText({
          systemInstruction: "System",
          userPrompt: "User",
        }),
      (error: unknown) => {
        assert.ok(error instanceof OpenRouterServiceError);
        assert.equal(error.reason, "invalid_response");
        return true;
      },
    );
  });

  it("throws on truncated length-limited output", async () => {
    process.env.OPENROUTER_API_KEY = "sk-or-v1-test-key-abcdefghij";

    setOpenRouterFetchForTests(async () =>
      jsonResponse(200, {
        choices: [
          {
            message: { content: "Partial philosophical answer" },
            finish_reason: "length",
          },
        ],
      }),
    );

    await assert.rejects(
      () =>
        generateText({
          systemInstruction: "System",
          userPrompt: "User",
        }),
      (error: unknown) => {
        assert.ok(error instanceof OpenRouterServiceError);
        assert.equal(error.reason, "invalid_response");
        return true;
      },
    );
  });

  it("parses JSON responses", async () => {
    process.env.OPENROUTER_API_KEY = "sk-or-v1-test-key-abcdefghij";

    setOpenRouterFetchForTests(async (_input, init) => {
      const body = JSON.parse(String(init?.body)) as {
        response_format?: { type?: string };
      };
      assert.equal(body.response_format?.type, "json_object");

      return jsonResponse(200, {
        choices: [
          {
            message: { content: '{"summary":"Done"}' },
            finish_reason: "stop",
          },
        ],
      });
    });

    const data = await generateJson<{ summary: string }>({
      systemInstruction: "Return JSON only.",
      userPrompt: "Summarize.",
    });

    assert.deepEqual(data, { summary: "Done" });
  });
});
