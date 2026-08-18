import { generateJson, generateText } from "../gemini/client";
import { withGeminiFallback } from "../gemini/fallback";
import { JSON_VOICE_NOTE } from "../prompts/voice";
import {
  ADVAITA_PERSONA,
  CARVAKA_PERSONA,
  MADHYAMIKA_PERSONA,
  NYAYA_PERSONA,
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
  carvaka: CARVAKA_PERSONA,
  advaita: ADVAITA_PERSONA,
  nyaya: NYAYA_PERSONA,
  madhyamika: MADHYAMIKA_PERSONA,
};

function formatHistory(history: DebateMessage[]): string {
  return history
    .map((m) => `${m.role === "user" ? "Challenger" : "Opponent"}: ${m.content}`)
    .join("\n\n");
}

async function geminiReply(
  school: DebateSchool,
  history: DebateMessage[],
): Promise<DebateReplyResponse> {
  const meta = SCHOOL_META[school];

  const reply = await generateText({
    systemInstruction: `${SCHOOL_PERSONAS[school]}

Respond as a direct rejoinder to the challenger's LATEST statement in this vāda-kathā. Push back hard, poke holes, and end with a follow-up question. Do not break character. Never mention being an AI.${
      school === "carvaka"
        ? "\n\nIf they cite scripture, karma, soul, or rebirth: attack immediately — demand sensory proof with wit."
        : ""
    }`,
    userPrompt: `Debate transcript so far:\n\n${formatHistory(history)}\n\nRespond as the ${meta.label} opponent to the challenger's latest statement.`,
    temperature: 0.85,
    maxOutputTokens: 450,
  });

  return {
    reply,
    school,
    schoolLabel: meta.label,
    analyzer: "gemini",
  };
}

async function geminiConclude(
  school: DebateSchool,
  history: DebateMessage[],
): Promise<DebateConcludeResponse> {
  const meta = SCHOOL_META[school];

  const data = await generateJson<Partial<DebateConcludeResponse>>({
    systemInstruction: `You're wrapping up a vāda-kathā like a philosophical podcaster doing the post-debate recap — lively, fair, human. Not a dry academic abstract.

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
    userPrompt: `Full debate transcript:\n\n${formatHistory(history)}`,
    temperature: 0.4,
  });

  return {
    summary: data.summary ?? "Debate summary unavailable.",
    verdict: data.verdict ?? "No verdict reached.",
    key_points: Array.isArray(data.key_points) ? data.key_points : [],
    strengths_user: data.strengths_user ?? "The challenger presented a clear thesis.",
    strengths_opponent:
      data.strengths_opponent ??
      `${meta.label} applied its school's classical arguments consistently.`,
    analyzer: "gemini",
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

  if (action === "reply") {
    return withGeminiFallback(
      () => geminiReply(school, history),
      () => heuristicReply(school, history),
    );
  }

  return withGeminiFallback(
    () => geminiConclude(school, history),
    () => heuristicConclude(school, history),
  );
}
