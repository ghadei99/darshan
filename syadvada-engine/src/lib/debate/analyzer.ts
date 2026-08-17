import OpenAI from "openai";

import { CARVAKA_OPENAI_PERSONA } from "./carvaka";
import { heuristicConclude, heuristicReply } from "./heuristic";
import type {
  DebateAction,
  DebateConcludeResponse,
  DebateMessage,
  DebateReplyResponse,
  DebateSchool,
} from "./types";
import { SCHOOL_META } from "./types";

const SCHOOL_PERSONAS: Record<DebateSchool, string> = {
  carvaka: CARVAKA_OPENAI_PERSONA,
  advaita: `You are an Advaita Vedāntin debater in the lineage of Śaṅkara. You speak with serene authority. You argue that Brahman alone is real, the world is māyā, and consciousness (cit) is the ultimate substratum — not a byproduct of matter. You employ neti neti (not this, not that), distinguish vyavahārika from pāramārthika truth, and cite Upaniṣadic insight. You refute dualism and materialism through non-dual analysis.`,
  nyaya: `You are a Nyāya philosopher trained in the Nyāya-sūtra tradition of Gautama. You are rigorous, systematic, and precise. You demand formal five-membered syllogisms, test hetu for vyāpti, identify hetvābhāsa (fallacious reasons), and accept four pramāṇas. You engage in vāda (honest debate) to establish truth. You press for logical proof (tarka) and expose gaps in your opponent's inference.`,
  madhyamika: `You are a Mādhyamika Buddhist philosopher in the tradition of Nāgārjuna. You speak with compassionate sharpness. You argue that all phenomena are śūnya (empty) of inherent existence, arise through pratītyasamutpāda (dependent origination), and that clinging to extremes causes suffering. You employ prasāṅga (reductio), the catuṣkoṭi (fourfold negation), and the Middle Way between eternalism and nihilism.`,
};

function formatHistory(history: DebateMessage[]): string {
  return history
    .map((m) => `${m.role === "user" ? "Challenger" : "Opponent"}: ${m.content}`)
    .join("\n\n");
}

async function openaiReply(
  school: DebateSchool,
  history: DebateMessage[],
): Promise<DebateReplyResponse> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const meta = SCHOOL_META[school];

  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: `${SCHOOL_PERSONAS[school]}

You are engaged in classical Indian formal debate (vāda-kathā). Respond in 3-5 sentences as a direct philosophical rejoinder to the challenger's latest argument. Stay in character. Use Sanskrit terms sparingly with brief glosses. Do not break character or mention being an AI.${
          school === "carvaka"
            ? "\n\nIf the challenger cites scripture, tradition, karma, soul, rebirth, or any unobserved entity: attack it immediately and demand sensory proof."
            : ""
        }`,
      },
      {
        role: "user",
        content: `Debate transcript so far:\n\n${formatHistory(history)}\n\nRespond as the ${meta.label} opponent to the challenger's latest statement.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 400,
  });

  const reply = response.choices[0].message.content?.trim() ?? "";
  return {
    reply,
    school,
    schoolLabel: meta.label,
    analyzer: "openai",
  };
}

async function openaiConclude(
  school: DebateSchool,
  history: DebateMessage[],
): Promise<DebateConcludeResponse> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
  const meta = SCHOOL_META[school];

  const response = await client.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a neutral scholar of classical Indian debate (vāda) summarizing a completed vāda-kathā between a challenger and a ${meta.label} philosopher.

Respond ONLY with valid JSON:
{
  "summary": "2-3 sentence overview of the debate",
  "verdict": "2-3 sentences on the central unresolved tension or outcome",
  "key_points": ["point 1", "point 2", "point 3", "point 4"],
  "strengths_user": "1-2 sentences on the challenger's argumentative strengths",
  "strengths_opponent": "1-2 sentences on the ${meta.label} school's strengths in the exchange"
}`,
      },
      {
        role: "user",
        content: `Full debate transcript:\n\n${formatHistory(history)}`,
      },
    ],
    temperature: 0.4,
  });

  const raw = response.choices[0].message.content || "{}";
  const data = JSON.parse(raw) as Partial<DebateConcludeResponse>;

  return {
    summary: data.summary ?? "Debate summary unavailable.",
    verdict: data.verdict ?? "No verdict reached.",
    key_points: Array.isArray(data.key_points) ? data.key_points : [],
    strengths_user: data.strengths_user ?? "The challenger presented a clear thesis.",
    strengths_opponent:
      data.strengths_opponent ??
      `${meta.label} applied its school's classical arguments consistently.`,
    analyzer: "openai",
  };
}

export async function processDebate(
  action: DebateAction,
  school: DebateSchool,
  history: DebateMessage[],
): Promise<DebateReplyResponse | DebateConcludeResponse> {
  if (history.length === 0) {
    throw new Error("Debate history cannot be empty");
  }

  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (action === "reply") {
    if (apiKey) {
      try {
        return await openaiReply(school, history);
      } catch {
        // fall through
      }
    }
    return heuristicReply(school, history);
  }

  if (apiKey) {
    try {
      return await openaiConclude(school, history);
    } catch {
      // fall through
    }
  }
  return heuristicConclude(school, history);
}
