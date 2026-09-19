import { NextResponse } from "next/server";
import { runEngineeringAgent } from "@/lib/agents/engineering";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await runEngineeringAgent(body);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
