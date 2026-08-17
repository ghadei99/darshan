import { generateJson, getGeminiApiKey } from "./gemini/client";
import { heuristicAnalyze } from "./heuristic";
import { JSON_VOICE_NOTE } from "./prompts/voice";
import { parseInput } from "./syadvada/input";
import {
  AnalyzeResponse,
  PERSPECTIVE_IDS,
  PERSPECTIVE_META,
  type Perspective,
} from "./types";

const SYADVADA_SYSTEM_PROMPT = `${JSON_VOICE_NOTE}

You are the Syādvāda Engine. Your job is to run Jain Saptabhaṅgī (seven-fold conditional logic) on the user's EXACT input — a noun, phrase, idiom, or claim — not on generic philosophy.

DYNAMIC CONTEXTUALIZATION (NON-NEGOTIABLE):
- Deeply analyze the SPECIFIC text the user submitted. If they type "elephant", analyze elephant — parts vs whole, perceptual vs conceptual, cultural vs biological — NOT abstract boilerplate.
- Every "classical" and "stakeholder" field MUST explicitly name concrete features of THEIR input (properties, contexts, ambiguities, stakeholders tied to that thing/phrase/claim).
- FORBIDDEN: template filler like "from a particular standpoint", "the claim holds truth", or "stakeholders may disagree" WITHOUT tying to the user's exact words.
- Quote or paraphrase the user's input in each perspective so a reader sees the linkage.

STRICT SAPTABHAṅGĪ — answer these about the user's text:
1. syat-asti — In what specific context/aspect IS it true, real, or applicable?
2. syat-nasti — In what context/aspect is it NOT true, absent, limited, or false?
3. syat-asti-nasti — How does it simultaneously exist AND not exist depending on viewpoint? Name the viewpoints.
4. syat-avaktavya — Why does it escape complete verbal description?
5. syat-asti-avaktavya — Where is it real/present yet beyond full articulation?
6. syat-nasti-avaktavya — Where is its negation/absence felt yet hard to pin down in language?
7. syat-asti-nasti-avaktavya — How do affirmation, negation, and ineffability all apply at once?

For each perspective provide:
- classical: Jain conditional-logic take (2–4 sentences) — vivid, conversational, anchored to the user's input
- stakeholder: Modern reframing through real stakeholder lenses tied to THIS input (2–4 sentences)

Respond ONLY with valid JSON:
{
  "perspectives": [
    { "id": "syat-asti", "classical": "...", "stakeholder": "..." }
  ]
}

Include all seven ids exactly: syat-asti, syat-nasti, syat-asti-nasti, syat-avaktavya, syat-asti-avaktavya, syat-nasti-avaktavya, syat-asti-nasti-avaktavya.

Reveal multiplicity without wishy-washy relativism. Make the user feel the insight land on THEIR words.`;

function buildUserPrompt(statement: string): string {
  const analysis = parseInput(statement);
  const kindNote =
    analysis.kind === "concept"
      ? "This looks like a CONCEPT or THING — analyze its parts vs whole, perceptual vs conceptual reality, and named vs experienced being."
      : analysis.kind === "phrase"
        ? "This looks like a PHRASE or IDIOM — analyze literal vs figurative readings and what the wording conceals/reveals."
        : "This looks like a CLAIM or PROPOSITION — analyze bounded contexts where it holds, fails, and where key terms resist definition.";

  return `USER INPUT — analyze THIS exactly (every perspective must reference it):

"${statement}"

Input profile: ${kindNote}
Subject focus: "${analysis.subject}"

Before writing JSON, identify: (a) what respects/contexts make it asti, (b) where nāsti, (c) where avaktavya, (d) which real stakeholders care about "${analysis.subject}".

Apply all seven Syāt modes strictly to the text above — zero generic philosophy filler.`;
}

function normalizePerspectives(
  raw: Array<{ id?: string; classical?: string; stakeholder?: string }>,
  statement: string,
): Perspective[] {
  const byId = new Map<string, { classical?: string; stakeholder?: string }>();
  for (const item of raw) {
    if (item.id) byId.set(item.id, item);
  }

  const subject = parseInput(statement).subject;

  return PERSPECTIVE_IDS.map((id) => {
    const meta = PERSPECTIVE_META[id];
    const found = byId.get(id);
    return {
      id,
      sanskrit: meta.sanskrit,
      label: meta.label,
      classical:
        found?.classical?.trim() ||
        `[Could not generate ${meta.sanskrit} for "${subject}"]`,
      stakeholder:
        found?.stakeholder?.trim() ||
        `[Stakeholder view unavailable for ${meta.sanskrit} on "${subject}"]`,
    };
  });
}

async function geminiAnalyze(statement: string): Promise<AnalyzeResponse> {
  const data = await generateJson<{
    perspectives?: Array<{ id?: string; classical?: string; stakeholder?: string }>;
  }>({
    systemInstruction: SYADVADA_SYSTEM_PROMPT,
    userPrompt: buildUserPrompt(statement),
    temperature: 0.55,
  });

  return {
    statement: statement.trim(),
    analyzer: "gemini",
    perspectives: normalizePerspectives(data.perspectives ?? [], statement),
  };
}

export async function analyzeStatement(statement: string): Promise<AnalyzeResponse> {
  const text = statement.trim();
  if (!text) {
    throw new Error("Statement cannot be empty");
  }

  if (getGeminiApiKey()) {
    try {
      return await geminiAnalyze(text);
    } catch {
      // Fall through to heuristic on API errors
    }
  }

  return heuristicAnalyze(text);
}
