import { generateJson, getGeminiApiKey } from "../gemini/client";
import { JSON_VOICE_NOTE } from "../prompts/voice";
import { heuristicAnalyze } from "./heuristic";
import type { PramanaAnalyzeResponse, PramanaId } from "./types";

const PRAMANA_SYSTEM_PROMPT = `${JSON_VOICE_NOTE}

You're the friend who asks "okay but HOW do you know that?" — tracing a claim back to its epistemic roots through four classical pramāṇas (ways of knowing):

1. Pratyakṣa — direct perception (senses, measurement)
2. Anumāna — inference ("smoke → fire" logic)
3. Upamāna — comparison/analogy
4. Śabda — testimony (scripture, experts, tradition)

For each pramāṇa:
- detected: does this claim lean on it?
- role: how it shows up (1-2 sentences, conversational)
- critique: sharp but fair scrutiny (1-2 sentences)

Also:
- dominant_pramana: "pratyaksha" | "anumana" | "upamana" | "shabda"
- strength: 0-1
- strength_label: "very weak" | "weak" | "moderate" | "moderately strong" | "strong" | "very strong"
- philosophical_critique: 2-4 sentences — podcast energy, vivid analogies welcome

Respond ONLY with valid JSON:
{
  "dominant_pramana": "anumana",
  "strength": 0.75,
  "strength_label": "moderately strong",
  "pramanas": {
    "pratyaksha": { "detected": true, "role": "...", "critique": "..." },
    "anumana": { "detected": true, "role": "...", "critique": "..." },
    "upamana": { "detected": false, "role": "...", "critique": "..." },
    "shabda": { "detected": false, "role": "...", "critique": "..." }
  },
  "philosophical_critique": "..."
}`;

const PRAMANA_IDS: PramanaId[] = ["pratyaksha", "anumana", "upamana", "shabda"];

function normalizeResponse(
  claim: string,
  data: Partial<{
    dominant_pramana: string;
    strength: number;
    strength_label: string;
    pramanas: Record<string, { detected?: boolean; role?: string; critique?: string }>;
    philosophical_critique: string;
  }>,
): PramanaAnalyzeResponse {
  const pramanas = {
    pratyaksha: {
      detected: Boolean(data.pramanas?.pratyaksha?.detected),
      role: data.pramanas?.pratyaksha?.role ?? "[Unidentified]",
      critique: data.pramanas?.pratyaksha?.critique ?? "[Unidentified]",
    },
    anumana: {
      detected: Boolean(data.pramanas?.anumana?.detected),
      role: data.pramanas?.anumana?.role ?? "[Unidentified]",
      critique: data.pramanas?.anumana?.critique ?? "[Unidentified]",
    },
    upamana: {
      detected: Boolean(data.pramanas?.upamana?.detected),
      role: data.pramanas?.upamana?.role ?? "[Unidentified]",
      critique: data.pramanas?.upamana?.critique ?? "[Unidentified]",
    },
    shabda: {
      detected: Boolean(data.pramanas?.shabda?.detected),
      role: data.pramanas?.shabda?.role ?? "[Unidentified]",
      critique: data.pramanas?.shabda?.critique ?? "[Unidentified]",
    },
  };

  const dominant = PRAMANA_IDS.includes(data.dominant_pramana as PramanaId)
    ? (data.dominant_pramana as PramanaId)
    : "anumana";

  const strength = Math.min(1, Math.max(0, Number(data.strength) || 0.5));

  return {
    claim,
    dominant_pramana: dominant,
    strength,
    strength_label: data.strength_label ?? "moderate",
    pramanas,
    philosophical_critique:
      data.philosophical_critique ?? "Epistemic analysis unavailable.",
    analyzer: "gemini",
  };
}

async function geminiAnalyze(claim: string): Promise<PramanaAnalyzeResponse> {
  const data = await generateJson<Partial<{
    dominant_pramana: string;
    strength: number;
    strength_label: string;
    pramanas: Record<string, { detected?: boolean; role?: string; critique?: string }>;
    philosophical_critique: string;
  }>>({
    systemInstruction: PRAMANA_SYSTEM_PROMPT,
    userPrompt: `Analyze this claim:\n\n${claim}`,
    temperature: 0.3,
  });

  return normalizeResponse(claim.trim(), data);
}

export async function analyzeClaim(claim: string): Promise<PramanaAnalyzeResponse> {
  const text = claim.trim();
  if (!text) throw new Error("Claim cannot be empty");

  if (getGeminiApiKey()) {
    try {
      return await geminiAnalyze(text);
    } catch {
      // Fall through to heuristic on API errors
    }
  }

  return heuristicAnalyze(text);
}
