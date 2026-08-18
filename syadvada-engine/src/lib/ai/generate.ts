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
import { getAIProvider } from "@/lib/config/env";

export type { GenerateJsonParams, GenerateTextParams } from "./gemini/types";

export async function generateText(params: GenerateTextParams): Promise<string> {
  if (getAIProvider() === "openrouter") {
    return openRouterGenerateText(params);
  }
  return geminiGenerateText(params);
}

export async function generateJson<T>(params: GenerateJsonParams): Promise<T> {
  if (getAIProvider() === "openrouter") {
    return openRouterGenerateJson<T>(params);
  }
  return geminiGenerateJson<T>(params);
}
