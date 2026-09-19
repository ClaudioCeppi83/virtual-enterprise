import { NextResponse } from "next/server";

export async function GET() {
  const hasServerKey = Boolean(process.env.GEMINI_API_KEY);
  const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";
  return NextResponse.json({
    hasServerKey,
    model,
  });
}
