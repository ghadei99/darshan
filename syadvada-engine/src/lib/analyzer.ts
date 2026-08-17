import OpenAI from "openai";

import { JSON_VOICE_NOTE } from "./prompts/voice";
import { heuristicAnalyze } from "./heuristic";
import {
  AnalyzeResponse,
  PERSPECTIVE_IDS,
  PERSPECTIVE_META,
  type Perspective,
} from "./types";

const SYADVADA_SYSTEM_PROMPT = `${JSON_VOICE_NOTE}

You're unpacking a polarizing claim through Jain Syādvāda — seven conditional viewpoints (Saptabhaṅgī). Think about it like holding a prism to a hot take: every angle reveals something true AND incomplete.

The seven modes:
1. syat-asti — In some respect, it is
2. syat-nasti — In some respect, it is not
3. syat-asti-nasti — In some respect, it is and is not
4. syat-avaktavya — In some respect, it is indescribable
5. syat-asti-avaktavya — In some respect, it is and is indescribable
6. syat-nasti-avaktavya — In some respect, it is not and is indescribable
7. syat-asti-nasti-avaktavya — In some respect, it is, is not, and is indescribable

For each perspective provide:
- classical: Jain conditional-logic take (2–4 sentences) — vivid, conversational, not textbook
- stakeholder: Modern reframing through real stakeholder lenses (employees, customers, communities, etc.) (2–4 sentences)

Respond ONLY with valid JSON:
{
  "perspectives": [
    { "id": "syat-asti", "classical": "...", "stakeholder": "..." }
  ]
}

Include all seven ids exactly: syat-asti, syat-nasti, syat-asti-nasti, syat-avaktavya, syat-asti-avaktavya, syat-nasti-avaktavya, syat-asti-nasti-avaktavya.

Reveal multiplicity without wishy-washy relativism. Make the user feel the insight land.`;

function normalizePerspectives(
  raw: Array<{ id?: string; classical?: string; stakeholder?: string }>,
  statement: string,
): Perspective[] {
  const byId = new Map<string, { classical?: string; stakeholder?: string }>();
  for (const item of raw) {
    if (item.id) byId.set(item.id, item);
  }

  return PERSPECTIVE_IDS.map((id) => {
    const meta = PERSPECTIVE_META[id];
    const found = byId.get(id);
    return {
      id,
      sanskrit: meta.sanskrit,
      label: meta.label,
      classical: found?.classical?.trim() || `[Analysis unavailable for ${meta.sanskrit}]`,
      stakeholder:
        found?.stakeholder?.trim() ||
        `[Stakeholder view unavailable for ${meta.sanskrit}]`,
    };
  });
}

async function openaiAnalyze(statement: string): Promise<AnalyzeResponse> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const response = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYADVADA_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Analyze this statement through Syādvāda:\n\n${statement}`,
      },
    ],
    temperature: 0.4,
  });

  const raw = response.choices[0].message.content || "{}";
  const data = JSON.parse(raw) as {
    perspectives?: Array<{ id?: string; classical?: string; stakeholder?: string }>;
  };

  return {
    statement: statement.trim(),
    analyzer: "openai",
    perspectives: normalizePerspectives(data.perspectives ?? [], statement),
  };
}

export async function analyzeStatement(statement: string): Promise<AnalyzeResponse> {
  const text = statement.trim();
  if (!text) {
    throw new Error("Statement cannot be empty");
  }

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
