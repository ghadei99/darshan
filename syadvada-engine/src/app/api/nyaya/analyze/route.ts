import { NextRequest, NextResponse } from "next/server";

import { analyzeArgument } from "@/lib/nyaya/analyzer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const argument = typeof body.argument === "string" ? body.argument : "";

    if (!argument.trim()) {
      return NextResponse.json(
        { error: "Missing or empty 'argument' field" },
        { status: 400 },
      );
    }

    const result = await analyzeArgument(argument);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
