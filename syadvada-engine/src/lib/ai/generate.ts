import "server-only";

import {
  generateJson as geminiGenerateJson,
  generateText as geminiGenerateText,
} from "./gemini/client";
import type { GenerateJsonParams, GenerateTextParams } from "./gemini/types";
import {
  generateJson as openRouterGenerateJson,
  generateText as openRouterGenerateText,
} from "./openrouter/impl";
import {
  generateJson as groqGenerateJson,
  generateText as groqGenerateText,
} from "./groq/impl";
import { getAIProvider } from "@/lib/config/env";

export type { GenerateJsonParams, GenerateTextParams } from "./gemini/types";

export async function generateText(params: GenerateTextParams): Promise<string> {
  const provider = getAIProvider();
  if (provider === "openrouter") {
    return openRouterGenerateText(params);
  }
  if (provider === "groq") {
    return groqGenerateText(params);
  }
  return geminiGenerateText(params);
}

export async function generateJson<T>(params: GenerateJsonParams): Promise<T> {
  const provider = getAIProvider();
  if (provider === "openrouter") {
    return openRouterGenerateJson<T>(params);
  }
  if (provider === "groq") {
    return groqGenerateJson<T>(params);
  }
  return geminiGenerateJson<T>(params);
}
