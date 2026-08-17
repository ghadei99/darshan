import OpenAI from "openai";

import { heuristicAnalyze } from "./heuristic";
import type {
  KleshaId,
  PatternDetail,
  VrittiId,
  YogaAnalyzeResponse,
} from "./types";

const YOGA_SYSTEM_PROMPT = `You are a scholar of Patañjali's Yoga Sūtras, versed in classical Sāṅkhya-Yoga psychology.

Analyze the user's emotional journaling text through:

**Citta-Vṛttis (five mental fluctuations, YS I.6–11):**
1. pramana — correct knowledge
2. viparyaya — misconception
3. vikalpa — imagination/verbal fancy
4. nidra — sleep/dullness
5. smriti — memory

**Kleśas (five afflictions, YS II.3–9):**
1. avidya — ignorance
2. asmita — egoism
3. raga — attachment
4. dvesha — aversion
5. abhinivesha — clinging to life/fear

For each vṛtti and kleśa, provide:
- detected: boolean
- intensity: 0-1 score
- insight: 1-2 sentences of philosophical/psychological insight

Also provide:
- dominant_vritti and dominant_klesha
- vritti_summary and klesha_summary (1 sentence each)
- abhyasa.practices: array of 3-5 traditional practices with name, sanskrit, description
- abhyasa.philosophical_alignment: 2-3 sentences connecting to Yoga Sūtra teachings
- abhyasa.psychological_insight: 2-3 sentences of compassionate modern psychological framing

Respond ONLY with valid JSON matching this schema.`;

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
