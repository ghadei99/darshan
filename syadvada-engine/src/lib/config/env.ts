const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

/** Server-only. Never expose via API or client bundle. */
export function getGeminiApiKey(): string | undefined {
  const raw = process.env.GEMINI_API_KEY?.trim();
  if (!raw) return undefined;
  return raw.replace(/^["']|["']$/g, "");
}

export function getGeminiModel(): string {
  const model = process.env.GEMINI_MODEL?.trim();
  return model || DEFAULT_GEMINI_MODEL;
}

/** Google AI Studio keys start with AIza — OAuth tokens (AQ.*) and JWTs are rejected. */
export function isLikelyValidGeminiKey(key: string): boolean {
  return key.startsWith("AIza");
}
