import { NextResponse } from "next/server";
import { runDeployAgent } from "@/lib/agents/deploy";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await runDeployAgent(body);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
