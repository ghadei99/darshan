import { NextRequest, NextResponse } from "next/server";

import { processDebate } from "@/lib/debate/analyzer";
import type { DebateAction, DebateMessage, DebateSchool } from "@/lib/debate/types";
import { DEBATE_SCHOOLS } from "@/lib/debate/types";

function parseHistory(raw: unknown): DebateMessage[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (m): m is DebateMessage =>
        typeof m === "object" &&
        m !== null &&
        (m.role === "user" || m.role === "opponent") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .map((m) => ({ role: m.role, content: m.content.trim() }));
}

function parseSchool(raw: unknown): DebateSchool | null {
  return typeof raw === "string" &&
    DEBATE_SCHOOLS.includes(raw as DebateSchool)
    ? (raw as DebateSchool)
    : null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const action: DebateAction =
      body.action === "conclude" ? "conclude" : "reply";
    const school = parseSchool(body.school);
    const history = parseHistory(body.history);
    const message =
      typeof body.message === "string" ? body.message.trim() : "";

    if (!school) {
      return NextResponse.json(
        { error: "Invalid or missing 'school' field" },
        { status: 400 },
      );
    }

    let fullHistory = history;

    if (action === "reply") {
      if (!message) {
        return NextResponse.json(
          { error: "Missing or empty 'message' field" },
          { status: 400 },
        );
      }
      fullHistory = [...history, { role: "user", content: message }];
    }

    if (fullHistory.length === 0) {
      return NextResponse.json(
        { error: "Debate history cannot be empty" },
        { status: 400 },
      );
    }

    const result = await processDebate(action, school, fullHistory);

    if (action === "reply") {
      return NextResponse.json({
        ...result,
        history: [
          ...fullHistory,
          {
            role: "opponent" as const,
            content: (result as { reply: string }).reply,
          },
        ],
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    const msg =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
