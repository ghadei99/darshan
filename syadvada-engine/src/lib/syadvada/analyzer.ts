import { generateJson } from "@/lib/ai/gemini/client";
import { withGeminiFallback } from "@/lib/ai/fallback/with-gemini-fallback";

import { heuristicAnalyze } from "./heuristic";
import { parseInput } from "./input";
import { SYADVADA_SYSTEM_PROMPT } from "./prompts";
import {
  AnalyzeResponse,
  PERSPECTIVE_IDS,
  PERSPECTIVE_META,
  type Perspective,
} from "./types";

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

  return withGeminiFallback(
    () => geminiAnalyze(text),
    () => heuristicAnalyze(text),
  );
}
