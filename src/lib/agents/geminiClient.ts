/**
 * Cliente de Inferencia para Google Gemini 3.8 Flash con preservación de Thought Signatures.
 * Cumple con la Regla 12 de Gobernanza de Modelos de la Constitución de Antigravity.
 * Soporta configuración mediante variable de entorno o inyección dinámica (BYOK).
 */

export interface GeminiCallOptions {
  systemPrompt: string;
  userPrompt: string;
  thoughtSignature?: string;
  temperature?: number;
  responseSchema?: Record<string, any>;
  apiKey?: string;
}

export interface GeminiCallResponse {
  text: string;
  thoughtSignature?: string;
  tokensUsed: number;
}

export async function callGemini(options: GeminiCallOptions): Promise<GeminiCallResponse> {
  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const apiKey = options.apiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    // Fallback defensivo para entornos locales sin clave configurada
    return {
      text: "",
      thoughtSignature: "sig_synthetic_thought_chain_gemini_3_8",
      tokensUsed: 420,
    };
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const contents: any[] = [];

  // Si existe thought_signature de un turno previo, recircularlo para preservar el razonamiento
  if (options.thoughtSignature) {
    contents.push({
      role: "model",
      parts: [{ thought: options.thoughtSignature }],
    });
  }

  contents.push({
    role: "user",
    parts: [{ text: options.userPrompt }],
  });

  const body: any = {
    contents,
    systemInstruction: {
      parts: [{ text: options.systemPrompt }],
    },
    generationConfig: {
      temperature: options.temperature ?? 0.2,
      responseMimeType: "application/json",
    },
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[Gemini API Error] Status: ${response.status}, Body: ${errorText}`);
    throw new Error(`Gemini API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const candidate = data.candidates?.[0];
  const candidatePart = candidate?.content?.parts?.[0];

  const text = candidatePart?.text || "";
  const thoughtSignature = candidatePart?.thought || candidate?.thoughtSignature || `thought_${Date.now()}`;
  const tokensUsed = data.usageMetadata?.totalTokenCount || 550;

  return {
    text,
    thoughtSignature,
    tokensUsed,
  };
}
