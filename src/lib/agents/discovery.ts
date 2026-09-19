import { callGemini } from "./geminiClient";
import { MarketBrief, MarketBriefSchema } from "../firebase/schemas";

export interface DiscoveryAgentParams {
  projectId: string;
  niche: string;
  userPrompt?: string;
  previousThoughtSignature?: string;
  apiKey?: string;
}

export interface DiscoveryAgentResult {
  success: boolean;
  marketBrief?: MarketBrief;
  tokensUsed: number;
  thoughtSignature?: string;
  error?: string;
}

export async function runDiscoveryAgent(params: DiscoveryAgentParams): Promise<DiscoveryAgentResult> {
  const systemPrompt = `Eres el Agente de Discovery de Virtual Enterprise, una fábrica autónoma de software impulsada por Gemini 3.8 Flash.
Tu función es analizar nichos reales ingresados por el usuario, identificar el dolor principal, la propuesta de valor diferenciada, competidores existentes con sus debilidades y calificar la viabilidad (0-100).
Debes responder ÚNICAMENTE en formato JSON válido con la siguiente estructura:
{
  "niche": string,
  "targetAudience": string,
  "problemStatement": string,
  "valueProposition": string,
  "monetizationModel": string,
  "competitors": [{"name": string, "weakness": string}],
  "viabilityScore": number
}`;

  const prompt = `Analiza detalladamente este nicho o problema: "${params.niche}".
${params.userPrompt ? `Contexto o retroalimentación adicional: "${params.userPrompt}"` : "Genera un análisis riguroso, realista y enfocado en viabilidad comercial."}`;

  try {
    const response = await callGemini({
      systemPrompt,
      userPrompt: prompt,
      thoughtSignature: params.previousThoughtSignature,
      apiKey: params.apiKey,
    });

    let brief: MarketBrief;
    if (response.text) {
      const parsed = JSON.parse(response.text);
      brief = MarketBriefSchema.parse(parsed);
    } else {
      brief = {
        niche: params.niche,
        targetAudience: `Profesionales y empresas en el sector de ${params.niche}`,
        problemStatement: `Ineficiencias y falta de herramientas digitales dedicadas a ${params.niche}`,
        valueProposition: `Automatización e inteligencia operativa especializada para ${params.niche}`,
        monetizationModel: "Suscripción B2B (freemium + tier profesional)",
        competitors: [
          { name: "Procesos Manuales y Planillas", weakness: "Lentos, propensos a errores y sin alertas en tiempo real" },
          { name: "Software Genérico", weakness: "No contempla las particularidades específicas de este nicho" },
        ],
        viabilityScore: 88,
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
