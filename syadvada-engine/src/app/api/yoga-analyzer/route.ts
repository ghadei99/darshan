import { NextRequest, NextResponse } from "next/server";

import { analyzeJournal } from "@/lib/yoga/analyzer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const journal = typeof body.journal === "string" ? body.journal : "";

    if (!journal.trim()) {
      return NextResponse.json(
        { error: "Missing or empty 'journal' field" },
        { status: 400 },
      );
    }

    const result = await analyzeJournal(journal);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
