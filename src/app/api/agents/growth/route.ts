import { NextResponse } from "next/server";
import { runGrowthAgent } from "@/lib/agents/growth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await runGrowthAgent(body);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
