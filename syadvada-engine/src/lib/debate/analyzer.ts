import OpenAI from "openai";

import { JSON_VOICE_NOTE } from "../prompts/voice";
import {
  ADVAITA_OPENAI_PERSONA,
  CARVAKA_OPENAI_PERSONA,
  MADHYAMIKA_OPENAI_PERSONA,
  NYAYA_OPENAI_PERSONA,
} from "./personas";
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
  advaita: ADVAITA_OPENAI_PERSONA,
  nyaya: NYAYA_OPENAI_PERSONA,
  madhyamika: MADHYAMIKA_OPENAI_PERSONA,
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

Respond as a direct rejoinder to the challenger's LATEST statement in this vāda-kathā. Push back hard, poke holes, and end with a follow-up question. Do not break character. Never mention being an AI.${
          school === "carvaka"
            ? "\n\nIf they cite scripture, karma, soul, or rebirth: attack immediately — demand sensory proof with wit."
            : ""
        }`,
      },
      {
        role: "user",
        content: `Debate transcript so far:\n\n${formatHistory(history)}\n\nRespond as the ${meta.label} opponent to the challenger's latest statement.`,
      },
    ],
    temperature: 0.85,
    max_tokens: 450,
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
        content: `You're wrapping up a vāda-kathā like a philosophical podcaster doing the post-debate recap — lively, fair, human. Not a dry academic abstract.

Summarize a debate between the challenger and a ${meta.label} philosopher.

${JSON_VOICE_NOTE}

Respond ONLY with valid JSON:
{
  "summary": "2-3 sentences — conversational overview of how the sparring went",
  "verdict": "2-3 sentences — what's still unresolved, in plain vivid language",
  "key_points": ["point 1", "point 2", "point 3", "point 4"],
  "strengths_user": "1-2 sentences on what the challenger did well — specific, not generic",
  "strengths_opponent": "1-2 sentences on how ${meta.label} pressed their case — specific, not generic"
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
