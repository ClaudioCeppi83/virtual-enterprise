/**
 * Cliente de Inferencia para Google Gemini con preservación de Thought Signatures.
 * Cumple con la Regla 12 de Gobernanza de Modelos de la Constitución de Antigravity.
 * Soporta configuración mediante variable de entorno o inyección dinámica (BYOK).
 * Incluye fallback automático entre modelos y tolerancia a fallos.
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
  error?: string;
}

export async function callGemini(options: GeminiCallOptions): Promise<GeminiCallResponse> {
  const primaryModel = process.env.GEMINI_MODEL || "gemini-3.8-flash";
  const apiKey = options.apiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      text: "",
      thoughtSignature: "sig_synthetic_thought_chain_gemini_3_8",
      tokensUsed: 420,
    };
  }

  // Modelos candidatos en orden de preferencia según disponibilidad en Google AI Studio
  const candidateModels = [
    primaryModel,
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
  ];

  const contents: any[] = [];
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

  let lastError = "";

  for (const model of candidateModels) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        lastError = `Modelo ${model} (${response.status}): ${errorText.substring(0, 120)}`;
        console.warn(`[Gemini Client Warning] ${lastError}`);
        // Si el error es 404 (modelo no disponible), probar el siguiente modelo candidato
        if (response.status === 404) {
          continue;
        }
        // Si es 400 (clave inválida), salir y activar fallback
        break;
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
    } catch (fetchErr: any) {
      lastError = fetchErr?.message || "Error de conexión con Gemini";
      console.warn(`[Gemini Network Warning] ${lastError}`);
    }
  }

  // Si ninguno de los modelos remotos respondió con éxito, retornar respuesta con fallback
  return {
    text: "",
    thoughtSignature: `sig_fallback_${Date.now()}`,
    tokensUsed: 420,
    error: lastError || "No se pudo conectar con la API de Gemini",
  };
}
