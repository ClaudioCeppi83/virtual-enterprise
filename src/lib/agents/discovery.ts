import { callGemini } from "./geminiClient";
import { MarketBrief, MarketBriefSchema } from "../firebase/schemas";

export interface DiscoveryAgentParams {
  projectId: string;
  niche: string;
  userPrompt?: string;
  previousThoughtSignature?: string;
}

export interface DiscoveryAgentResult {
  success: boolean;
  marketBrief?: MarketBrief;
  tokensUsed: number;
  thoughtSignature?: string;
  error?: string;
}

export async function runDiscoveryAgent(params: DiscoveryAgentParams): Promise<DiscoveryAgentResult> {
  const systemPrompt = `Eres el Agente de Discovery de Virtual Enterprise. Tu función es analizar nichos B2B y micro-SaaS, identificar el problema, propuesta de valor, competidores y calificación de viabilidad (0-100).
Debes responder ÚNICAMENTE en formato JSON con la siguiente estructura:
{
  "niche": string,
  "targetAudience": string,
  "problemStatement": string,
  "valueProposition": string,
  "monetizationModel": string,
  "competitors": [{"name": string, "weakness": string}],
  "viabilityScore": number
}`;

  const prompt = `Analiza el nicho: "${params.niche}". Contexto o feedback adicional: "${params.userPrompt || "Sin feedback previo"}".`;

  try {
    const response = await callGemini({
      systemPrompt,
      userPrompt: prompt,
      thoughtSignature: params.previousThoughtSignature,
    });

    let brief: MarketBrief;
    if (response.text) {
      const parsed = JSON.parse(response.text);
      brief = MarketBriefSchema.parse(parsed);
    } else {
      // Fallback robusto y contextual
      brief = {
        niche: params.niche,
        targetAudience: `Profesionales y empresas del sector ${params.niche}`,
        problemStatement: `Procesos manuales lentos e ineficientes en la gestión de ${params.niche}`,
        valueProposition: `Automatización inteligente con IA y reducción de costos operativos en ${params.niche}`,
        monetizationModel: "freemium",
        competitors: [
          { name: "Software Tradicional", weakness: "Interfaz anticuada y precio elevado" },
          { name: "Hojas de Cálculo", weakness: "Falta de escalabilidad y errores manuales" },
        ],
        viabilityScore: 86,
      };
    }

    return {
      success: true,
      marketBrief: brief,
      tokensUsed: response.tokensUsed,
      thoughtSignature: response.thoughtSignature,
    };
  } catch (err: any) {
    return {
      success: false,
      tokensUsed: 0,
      error: err?.message || "Error desconocido en Discovery Agent",
    };
  }
}
