import { NextResponse } from "next/server";
import { callGemini } from "@/lib/agents/geminiClient";

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get("x-gemini-api-key") || undefined;
    if (!apiKey || !apiKey.trim()) {
      return NextResponse.json({
        success: false,
        error: "No se proporcionó ninguna API key en la solicitud.",
      }, { status: 400 });
    }

    const result = await callGemini({
      systemPrompt: "Eres el validador de conectividad de Google Gemini. Responde OK.",
      userPrompt: "Verificar conexion activa con la API.",
      apiKey: apiKey.trim(),
    });

    if (result.error && !result.text) {
      return NextResponse.json({
        success: false,
        error: result.error,
      });
    }

    return NextResponse.json({
      success: true,
      tokensUsed: result.tokensUsed,
      message: "Conexion exitosa con la API de Google Gemini!",
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err?.message || "Error al conectar con la API de Gemini",
    }, { status: 500 });
  }
}
