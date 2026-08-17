import OpenAI from "openai";

import { JSON_VOICE_NOTE } from "../prompts/voice";
import { heuristicAnalyze } from "./heuristic";
import type {
  DharmaAnalyzeResponse,
  OptionAnalysis,
  PurusharthaId,
  PurusharthaImpact,
} from "./types";

const DHARMA_SYSTEM_PROMPT = `${JSON_VOICE_NOTE}

You're helping someone think through a real-life dilemma — not preaching, not judging. Like a wise friend who knows the four Puruṣārthas (life goals): Dharma (duty), Artha (security/success), Kāma (fulfillment), Mokṣa (freedom/liberation).

For each of two options, score each puruṣārtha:
- short_term: 0-1
- long_term: 0-1  
- analysis: 1-2 sentences — conversational, honest about trade-offs

Also:
- dominant_tension: e.g. "Dharma vs Artha"
- synthesis: 3-4 sentences — "Here's the twist..." energy, Gītā wisdom welcome but not stuffy
- recommendation: 2-3 sentences — wise, non-prescriptive, human

Respond ONLY with valid JSON:
{
  "dominant_tension": "Dharma vs Artha",
  "matrix": {
    "option_a": {
      "dharma": { "short_term": 0.4, "long_term": 0.5, "analysis": "..." },
      "artha": { "short_term": 0.8, "long_term": 0.7, "analysis": "..." },
      "kama": { "short_term": 0.3, "long_term": 0.4, "analysis": "..." },
      "moksha": { "short_term": 0.2, "long_term": 0.3, "analysis": "..." }
    },
    "option_b": { ... same structure ... }
  },
  "synthesis": "...",
  "recommendation": "..."
}`;

const PURUSHARTHA_IDS: PurusharthaId[] = ["dharma", "artha", "kama", "moksha"];

function normalizeImpact(raw: Partial<PurusharthaImpact> | undefined): PurusharthaImpact {
  return {
    short_term: Math.min(1, Math.max(0, Number(raw?.short_term) || 0.5)),
    long_term: Math.min(1, Math.max(0, Number(raw?.long_term) || 0.5)),
    analysis: raw?.analysis ?? "Impact analysis unavailable.",
  };
}

function normalizeOption(raw: Partial<OptionAnalysis> | undefined): OptionAnalysis {
  return {
    dharma: normalizeImpact(raw?.dharma),
    artha: normalizeImpact(raw?.artha),
    kama: normalizeImpact(raw?.kama),
    moksha: normalizeImpact(raw?.moksha),
  };
}

function normalizeResponse(
  dilemma: string,
  optionA: string,
  optionB: string,
  data: Partial<DharmaAnalyzeResponse>,
): DharmaAnalyzeResponse {
  return {
    dilemma,
    option_a: optionA,
    option_b: optionB,
    matrix: {
      option_a: normalizeOption(data.matrix?.option_a),
      option_b: normalizeOption(data.matrix?.option_b),
    },
    dominant_tension: data.dominant_tension ?? "Dharma vs Artha",
    synthesis: data.synthesis ?? "Both paths carry merit and cost.",
    recommendation: data.recommendation ?? "Deliberate with full awareness of trade-offs.",
    analyzer: "openai",
  };
}

async function openaiAnalyze(
  dilemma: string,
  optionA: string,
  optionB: string,
): Promise<DharmaAnalyzeResponse> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const response = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: DHARMA_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Dilemma: ${dilemma}\n\nOption A: ${optionA}\n\nOption B: ${optionB}`,
      },
    ],
    temperature: 0.4,
  });

  const raw = response.choices[0].message.content || "{}";
  const data = JSON.parse(raw);
  return normalizeResponse(dilemma.trim(), optionA.trim(), optionB.trim(), data);
}

export async function analyzeDilemma(
  dilemma: string,
  optionA: string,
  optionB: string,
): Promise<DharmaAnalyzeResponse> {
  const d = dilemma.trim();
  const a = optionA.trim();
  const b = optionB.trim();

  if (!d) throw new Error("Dilemma cannot be empty");
  if (!a || !b) throw new Error("Both options are required");

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (apiKey) {
    try {
      return await openaiAnalyze(d, a, b);
    } catch {
      // fall through
    }
  }

  return heuristicAnalyze(d, a, b);
}
