import "server-only";

import { GoogleGenAI } from "@google/genai";

import { getGeminiApiKey, getGeminiModel } from "@/lib/config/env";

import { GeminiServiceError, toGeminiServiceError } from "./errors";
import type { GenerateJsonParams, GenerateTextParams } from "./types";

function createClient(): GoogleGenAI {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
}

export async function generateText(params: GenerateTextParams): Promise<string> {
  const ai = createClient();
  try {
    const response = await ai.models.generateContent({
      model: getGeminiModel(),
      contents: params.userPrompt,
      config: {
        systemInstruction: params.systemInstruction,
        temperature: params.temperature,
        maxOutputTokens: params.maxOutputTokens,
      },
    });
    return response.text?.trim() ?? "";
  } catch (error) {
    throw toGeminiServiceError(error);
  }
}

export async function generateJson<T>(params: GenerateJsonParams): Promise<T> {
  const ai = createClient();
  try {
    const response = await ai.models.generateContent({
      model: getGeminiModel(),
      contents: params.userPrompt,
      config: {
        systemInstruction: params.systemInstruction,
        temperature: params.temperature,
        responseMimeType: "application/json",
      },
    });

    const raw = response.text?.trim() || "{}";
    try {
      return JSON.parse(raw) as T;
    } catch {
      throw toGeminiServiceError(
        new Error("Gemini returned malformed JSON for structured output"),
      );
    }
  } catch (error) {
    if (error instanceof GeminiServiceError) {
      throw error;
    }
    throw toGeminiServiceError(error);
  }
}
