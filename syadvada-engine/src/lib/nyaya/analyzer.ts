import OpenAI from "openai";

import { heuristicAnalyze } from "./heuristic";
import type { NyayaAnalyzeResponse, NyayaSteps } from "./types";

const NYAYA_SYSTEM_PROMPT = `You are a scholar of classical Indian Nyāya epistemology.
Analyze the given argument through the five-membered syllogism (pañcāvayava):

1. Pratijñā (thesis) — the proposition to be proved
2. Hetu (reason) — the logical ground connecting subject and predicate
3. Udāharaṇa (example) — a known instance illustrating the invariable concomitance (vyāpti)
4. Upanaya (application) — applying the example to the subject under discussion
5. Nigamana (conclusion) — the reaffirmed thesis

Also detect logical fallacies (hetvābhāsa / informal fallacies) such as:
sadhyasama (the unproved), asiddha (the unestablished), anaikāntika (inconclusive reason),
vyabhicāra (deviating), kālātīta (mistimed), ad hominem, straw man, false dichotomy,
hasty generalization, circular reasoning, appeal to authority, slippery slope, etc.

Respond ONLY with valid JSON matching this schema:
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

Extract or reconstruct each step from the argument. If a step is implicit, state what is implied.
Be precise and scholarly but accessible. Use Sanskrit terms only in fallacy names where appropriate.`;

async function openaiAnalyze(argument: string): Promise<NyayaAnalyzeResponse> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const response = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: NYAYA_SYSTEM_PROMPT },
      { role: "user", content: `Analyze this argument:\n\n${argument}` },
    ],
    temperature: 0.3,
  });

  const raw = response.choices[0].message.content || "{}";
  const data = JSON.parse(raw) as {
    validity?: string;
    steps?: Partial<NyayaSteps>;
    fallacies?: string[];
  };

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
    analyzer: "openai",
  };
}

export async function analyzeArgument(
  argument: string,
): Promise<NyayaAnalyzeResponse> {
  const text = argument.trim();
  if (!text) throw new Error("Argument cannot be empty");

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
