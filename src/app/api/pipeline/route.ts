import { NextResponse } from "next/server";
import { runEnterprisePipeline } from "@/lib/pipeline/orchestrator";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await runEnterprisePipeline(body);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
