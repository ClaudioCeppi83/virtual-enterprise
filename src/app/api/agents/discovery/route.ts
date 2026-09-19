import { NextResponse } from "next/server";
import { runDiscoveryAgent } from "@/lib/agents/discovery";

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get("x-gemini-api-key") || undefined;
    const body = await req.json();
    const result = await runDiscoveryAgent({ ...body, apiKey });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
