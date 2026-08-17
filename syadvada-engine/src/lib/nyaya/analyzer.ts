import { generateJson, generateText, getGeminiApiKey } from "../gemini/client";
import { JSON_VOICE_NOTE } from "../prompts/voice";
import { heuristicAnalyze } from "./heuristic";
import type { NyayaAnalyzeResponse, NyayaSteps } from "./types";

const NYAYA_SYSTEM_PROMPT = `${JSON_VOICE_NOTE}

You're dissecting an argument Nyāya-style — like a philosophical detective walking through a five-step syllogism. Make it click for a smart friend, not a dissertation committee.

Map the argument to pañcāvayava (five members):
1. Pratijñā (thesis) — what's being claimed
2. Hetu (reason) — the logical bridge
3. Udāharaṇa (example) — "like when you see smoke and know fire"
4. Upanaya (application) — plugging the example into this case
5. Nigamana (conclusion) — the payoff

Also flag fallacies (hetvābhāsa): hasty generalization, false dichotomy, ad hominem, circular reasoning, appeal to authority, straw man, slippery slope, etc. Name them in plain English with a punchy one-liner each.

Respond ONLY with valid JSON:
{
  "validity": "valid" | "partially valid" | "invalid",
  "steps": {
    "pratijna": "...",
    "hetu": "...",
    "udaharana": "...",
    "upanaya": "...",
    "nigamana": "..."
  },
  "fallacies": ["...", ...]
}

Extract or reconstruct each step. If implicit, say what you'd infer — conversationally.`;

async function geminiAnalyze(argument: string): Promise<NyayaAnalyzeResponse> {
  const data = await generateJson<{
    validity?: string;
    steps?: Partial<NyayaSteps>;
    fallacies?: string[];
  }>({
    systemInstruction: NYAYA_SYSTEM_PROMPT,
    userPrompt: `Analyze this argument:\n\n${argument}`,
    temperature: 0.3,
  });

  const stepsData = data.steps ?? {};
  return {
    validity: String(data.validity ?? "partially valid"),
    steps: {
      pratijna: stepsData.pratijna ?? "[Unidentified]",
      hetu: stepsData.hetu ?? "[Unidentified]",
      udaharana: stepsData.udaharana ?? "[Unidentified]",
      upanaya: stepsData.upanaya ?? "[Unidentified]",
      nigamana: stepsData.nigamana ?? "[Unidentified]",
    },
    fallacies: data.fallacies ?? [],
    analyzer: "gemini",
  };
}

export async function analyzeArgument(
  argument: string,
): Promise<NyayaAnalyzeResponse> {
  const text = argument.trim();
  if (!text) throw new Error("Argument cannot be empty");

  if (getGeminiApiKey()) {
    try {
      return await geminiAnalyze(text);
    } catch {
      // Fall through to heuristic on API errors
    }
  }

  return heuristicAnalyze(text);
}
