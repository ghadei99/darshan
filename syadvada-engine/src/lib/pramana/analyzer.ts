import OpenAI from "openai";

import { heuristicAnalyze } from "./heuristic";
import type { PramanaAnalyzeResponse, PramanaId } from "./types";

const PRAMANA_SYSTEM_PROMPT = `You are a scholar of classical Indian epistemology (pramāṇa-śāstra), versed in Nyāya, Mīmāṃsā, and Buddhist epistemology.

Analyze the given claim through the four classical pramāṇas (means of valid knowledge):

1. Pratyakṣa — direct perception through the senses (including yogic perception in some schools)
2. Anumāna — inference; knowledge of the unperceived through perceived signs (liṅga)
3. Upamāna — comparison/analogy; knowledge of the unknown through similarity to the known
4. Śabda — verbal testimony from a reliable authority (āpta-vākya)

For each pramāṇa, determine:
- detected: whether the claim invokes or relies on this means
- role: 1-2 sentences on how this pramāṇa functions in the claim
- critique: 1-2 sentences of philosophical scrutiny from classical epistemology

Also determine:
- dominant_pramana: the primary epistemic means ("pratyaksha" | "anumana" | "upamana" | "shabda")
- strength: 0-1 score for overall epistemic strength
- strength_label: "very weak" | "weak" | "moderate" | "moderately strong" | "strong" | "very strong"
- philosophical_critique: 2-4 sentences synthesizing the epistemic analysis

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
    analyzer: "openai",
  };
}

async function openaiAnalyze(claim: string): Promise<PramanaAnalyzeResponse> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const response = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: PRAMANA_SYSTEM_PROMPT },
      { role: "user", content: `Analyze this claim:\n\n${claim}` },
    ],
    temperature: 0.3,
  });

  const raw = response.choices[0].message.content || "{}";
  const data = JSON.parse(raw);
  return normalizeResponse(claim.trim(), data);
}

export async function analyzeClaim(claim: string): Promise<PramanaAnalyzeResponse> {
  const text = claim.trim();
  if (!text) throw new Error("Claim cannot be empty");

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (apiKey) {
    try {
      return await openaiAnalyze(text);
    } catch {
      // Fall through to heuristic on API errors
    }
  }

  return heuristicAnalyze(text);
}
