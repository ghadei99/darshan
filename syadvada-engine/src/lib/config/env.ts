import type { AIProvider, AnalyzerMode } from "@/lib/ai/types";

const DEFAULT_GEMINI_MODEL = "gemini-3.6-flash";
const DEFAULT_OPENROUTER_MODEL = "openai/gpt-oss-120b:free";

export const DEFAULT_GROQ_MODELS = [
  "openai/gpt-oss-120b",
  "qwen/qwen3.6-27b",
  "openai/gpt-oss-20b",
] as const;

/** Server-only. Defaults to Gemini when unset. */
export function getAIProvider(): AIProvider {
  const raw = process.env.AI_PROVIDER?.trim().toLowerCase();
  if (raw === "openrouter") return "openrouter";
  if (raw === "groq") return "groq";
  return "gemini";
}

export function getActiveAnalyzerMode(): Exclude<AnalyzerMode, "heuristic"> {
  return getAIProvider();
}

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

/** Server-only. Never expose via API or client bundle. */
export function getOpenRouterApiKey(): string | undefined {
  const raw = process.env.OPENROUTER_API_KEY?.trim();
  if (!raw) return undefined;
  return raw.replace(/^["']|["']$/g, "");
}

export function getOpenRouterModel(): string {
  const model = process.env.OPENROUTER_MODEL?.trim();
  return model || DEFAULT_OPENROUTER_MODEL;
}

/** Server-only. Never expose via API or client bundle. */
export function getGroqApiKey(): string | undefined {
  const raw = process.env.GROQ_API_KEY?.trim();
  if (!raw) return undefined;
  return raw.replace(/^["']|["']$/g, "");
}

/**
 * Ordered Groq failover list. Empty/invalid GROQ_MODELS falls back to defaults.
 * Does not fail the process when unset.
 */
export function getGroqModels(): string[] {
  const raw = process.env.GROQ_MODELS?.trim();
  if (!raw) return [...DEFAULT_GROQ_MODELS];

  const models = raw
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  return models.length > 0 ? models : [...DEFAULT_GROQ_MODELS];
}

const PLACEHOLDER_VALUES = new Set([
  "undefined",
  "null",
  "none",
  "your-api-key",
  "changeme",
  "placeholder",
  "insert-key-here",
]);

/**
 * Reject only obviously malformed values before calling Gemini.
 * Standard keys (AIza…) and authorization keys (AQ.…) are accepted;
 * real authentication is left to the Gemini SDK/API.
 */
export function isLikelyValidGeminiKey(key: string): boolean {
  const trimmed = key.trim();
  if (trimmed.length < 10) return false;

  if (PLACEHOLDER_VALUES.has(trimmed.toLowerCase())) return false;
  if (trimmed.startsWith("eyJ")) return false;
  if (/^bearer\s+/i.test(trimmed)) return false;
  if (/\s/.test(trimmed)) return false;

  return true;
}

/** Reject only obviously malformed OpenRouter keys before calling the API. */
export function isLikelyValidOpenRouterKey(key: string): boolean {
  const trimmed = key.trim();
  if (trimmed.length < 10) return false;

  if (PLACEHOLDER_VALUES.has(trimmed.toLowerCase())) return false;
  if (/^bearer\s+/i.test(trimmed)) return false;
  if (/\s/.test(trimmed)) return false;

  return true;
}

/** Reject only obviously malformed Groq keys before calling the API. */
export function isLikelyValidGroqKey(key: string): boolean {
  const trimmed = key.trim();
  if (trimmed.length < 10) return false;

  if (PLACEHOLDER_VALUES.has(trimmed.toLowerCase())) return false;
  if (/^bearer\s+/i.test(trimmed)) return false;
  if (/\s/.test(trimmed)) return false;

  return true;
}
