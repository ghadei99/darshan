import { NextRequest, NextResponse } from "next/server";

import { analyzeDilemma } from "@/lib/dharma/analyzer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const dilemma = typeof body.dilemma === "string" ? body.dilemma : "";
    const optionA =
      typeof body.option_a === "string"
        ? body.option_a
        : typeof body.optionA === "string"
          ? body.optionA
          : "";
    const optionB =
      typeof body.option_b === "string"
        ? body.option_b
        : typeof body.optionB === "string"
          ? body.optionB
          : "";

    if (!dilemma.trim()) {
      return NextResponse.json(
        { error: "Missing or empty 'dilemma' field" },
        { status: 400 },
      );
    }

    if (!optionA.trim() || !optionB.trim()) {
      return NextResponse.json(
        { error: "Both 'option_a' and 'option_b' are required" },
        { status: 400 },
      );
    }

    const result = await analyzeDilemma(dilemma, optionA, optionB);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
