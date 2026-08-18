import { NextRequest, NextResponse } from "next/server";

import { analyzeStatement } from "@/lib/syadvada/analyzer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const statement = typeof body.statement === "string" ? body.statement : "";

    if (!statement.trim()) {
      return NextResponse.json(
        { error: "Missing or empty 'statement' field" },
        { status: 400 },
      );
    }

    const result = await analyzeStatement(statement);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
