import "server-only";

import { GoogleGenAI } from "@google/genai";

import { getGeminiApiKey, getGeminiModel } from "@/lib/config/env";

import {
  GeminiServiceError,
  ensureCompleteGeneration,
  logGeminiFailure,
  toGeminiServiceError,
} from "./errors";
import type { GenerateJsonParams, GenerateTextParams } from "./types";

function createClient(): GoogleGenAI {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
}

function logClientFailure(error: GeminiServiceError): void {
  logGeminiFailure({
    category: error.reason,
    model: getGeminiModel(),
    details: error.details,
  });
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

    const text = response.text?.trim() ?? "";
    const finishReason = response.candidates?.[0]?.finishReason;

    ensureCompleteGeneration({
      finishReason,
      generatedTextLength: text.length,
    });

    return text;
  } catch (error) {
    if (error instanceof GeminiServiceError) {
      logClientFailure(error);
      throw error;
    }
    const serviceError = toGeminiServiceError(error);
    logClientFailure(serviceError);
    throw serviceError;
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
      const serviceError = toGeminiServiceError(
        new Error("Gemini returned malformed JSON for structured output"),
      );
      logClientFailure(serviceError);
      throw serviceError;
    }
  } catch (error) {
    if (error instanceof GeminiServiceError) {
      throw error;
    }
    const serviceError = toGeminiServiceError(error);
    logClientFailure(serviceError);
    throw serviceError;
  }
}
