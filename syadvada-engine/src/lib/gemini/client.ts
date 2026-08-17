import { GoogleGenAI } from "@google/genai";

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

export function getGeminiApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY?.trim() || undefined;
}

function createClient(): GoogleGenAI {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
}

export async function generateText(params: {
  systemInstruction: string;
  userPrompt: string;
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<string> {
  const ai = createClient();
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: params.userPrompt,
    config: {
      systemInstruction: params.systemInstruction,
      temperature: params.temperature,
      maxOutputTokens: params.maxOutputTokens,
    },
  });

  return response.text?.trim() ?? "";
}

export async function generateJson<T>(params: {
  systemInstruction: string;
  userPrompt: string;
  temperature?: number;
}): Promise<T> {
  const ai = createClient();
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: params.userPrompt,
    config: {
      systemInstruction: params.systemInstruction,
      temperature: params.temperature,
      responseMimeType: "application/json",
    },
  });

  const raw = response.text?.trim() || "{}";
  return JSON.parse(raw) as T;
}
