import { NextRequest, NextResponse } from "next/server";

import { analyzeClaim } from "@/lib/pramana/analyzer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const claim = typeof body.claim === "string" ? body.claim : "";

    if (!claim.trim()) {
      return NextResponse.json(
        { error: "Missing or empty 'claim' field" },
        { status: 400 },
      );
    }

    const result = await analyzeClaim(claim);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
