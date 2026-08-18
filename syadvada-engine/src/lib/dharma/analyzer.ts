import { generateJson } from "../gemini/client";
import { withGeminiFallback } from "../gemini/fallback";
import { JSON_VOICE_NOTE } from "../prompts/voice";
import { heuristicAnalyze } from "./heuristic";
import type {
  DharmaAnalyzeResponse,
  OptionAnalysis,
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
    analyzer: "gemini",
  };
}

async function geminiAnalyze(
  dilemma: string,
  optionA: string,
  optionB: string,
): Promise<DharmaAnalyzeResponse> {
  const data = await generateJson<Partial<DharmaAnalyzeResponse>>({
    systemInstruction: DHARMA_SYSTEM_PROMPT,
    userPrompt: `Dilemma: ${dilemma}\n\nOption A: ${optionA}\n\nOption B: ${optionB}`,
    temperature: 0.4,
  });

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

  return withGeminiFallback(
    () => geminiAnalyze(d, a, b),
    () => heuristicAnalyze(d, a, b),
  );
}
