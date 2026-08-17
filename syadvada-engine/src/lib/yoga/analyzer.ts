import OpenAI from "openai";

import { JSON_VOICE_NOTE } from "../prompts/voice";
import { heuristicAnalyze } from "./heuristic";
import type {
  KleshaId,
  PatternDetail,
  VrittiId,
  YogaAnalyzeResponse,
} from "./types";

const YOGA_SYSTEM_PROMPT = `${JSON_VOICE_NOTE}

You're reading someone's emotional journal like a wise, warm Yoga Sūtra guide — not clinical, not preachy. Think compassionate friend who's studied Patañjali.

Map their inner weather through:

**Citta-Vṛttis (mental fluctuations):** pramana, viparyaya, vikalpa, nidra, smriti
**Kleśas (root afflictions):** avidya, asmita, raga, dvesha, abhinivesha

For each: detected (bool), intensity (0-1), insight (1-2 sentences — human, specific to THEIR words)

Also:
- dominant_vritti, dominant_klesha
- vritti_summary, klesha_summary (1 sentence each — conversational)
- abhyasa.practices: 3-5 practices with name, sanskrit, description (practical, not preachy)
- abhyasa.philosophical_alignment: 2-3 sentences tying to Yoga Sūtra — vivid
- abhyasa.psychological_insight: 2-3 sentences — modern psychology meets ancient wisdom, compassionate

Respond ONLY with valid JSON matching the expected schema.`;

const VRITTI_IDS: VrittiId[] = ["pramana", "viparyaya", "vikalpa", "nidra", "smriti"];
const KLESHA_IDS: KleshaId[] = ["avidya", "asmita", "raga", "dvesha", "abhinivesha"];

function normalizeDetail(raw: Partial<PatternDetail> | undefined): PatternDetail {
  return {
    detected: Boolean(raw?.detected),
    intensity: Math.min(1, Math.max(0, Number(raw?.intensity) || 0.1)),
    insight: raw?.insight ?? "Pattern not clearly identified.",
  };
}

function normalizeResponse(
  journal: string,
  data: Partial<YogaAnalyzeResponse>,
): YogaAnalyzeResponse {
  const vrittis = {} as YogaAnalyzeResponse["vrittis"];
  for (const id of VRITTI_IDS) {
    vrittis[id] = normalizeDetail(data.vrittis?.[id]);
  }

  const kleshas = {} as YogaAnalyzeResponse["kleshas"];
  for (const id of KLESHA_IDS) {
    kleshas[id] = normalizeDetail(data.kleshas?.[id]);
  }

  const dominantVritti = VRITTI_IDS.includes(data.dominant_vritti as VrittiId)
    ? (data.dominant_vritti as VrittiId)
    : "smriti";

  const dominantKlesha = KLESHA_IDS.includes(data.dominant_klesha as KleshaId)
    ? (data.dominant_klesha as KleshaId)
    : "avidya";

  return {
    journal,
    dominant_vritti: dominantVritti,
    dominant_klesha: dominantKlesha,
    vritti_summary: data.vritti_summary ?? "Mental fluctuation pattern identified.",
    klesha_summary: data.klesha_summary ?? "Underlying affliction identified.",
    vrittis,
    kleshas,
    abhyasa: {
      practices: Array.isArray(data.abhyasa?.practices)
        ? data.abhyasa.practices.map((p) => ({
            name: p.name ?? "Practice",
            sanskrit: p.sanskrit ?? "",
            description: p.description ?? "",
          }))
        : [],
      philosophical_alignment:
        data.abhyasa?.philosophical_alignment ?? "Continue abhyāsa with patience.",
      psychological_insight:
        data.abhyasa?.psychological_insight ?? "Self-awareness is the first step.",
    },
    analyzer: "openai",
  };
}

async function openaiAnalyze(journal: string): Promise<YogaAnalyzeResponse> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const response = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: YOGA_SYSTEM_PROMPT },
      {
        role: "user",
        content: `Analyze this emotional journal entry:\n\n${journal}`,
      },
    ],
    temperature: 0.4,
  });

  const raw = response.choices[0].message.content || "{}";
  const data = JSON.parse(raw);
  return normalizeResponse(journal.trim(), data);
}

export async function analyzeJournal(
  journal: string,
): Promise<YogaAnalyzeResponse> {
  const text = journal.trim();
  if (!text) throw new Error("Journal entry cannot be empty");

  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (apiKey) {
    try {
      return await openaiAnalyze(text);
    } catch {
      // fall through
    }
  }

  return heuristicAnalyze(text);
}
