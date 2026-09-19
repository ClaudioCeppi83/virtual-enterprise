import { callGemini } from "./geminiClient";
import { MarketBrief, PRDSpec, MarketingAssets, MarketingAssetsSchema } from "../firebase/schemas";

export interface GrowthAgentParams {
  projectId: string;
  appName: string;
  marketBrief: MarketBrief;
  prdSpec?: PRDSpec;
  userPrompt?: string;
  previousThoughtSignature?: string;
}

export interface GrowthAgentResult {
  success: boolean;
  marketingAssets?: MarketingAssets;
  tokensUsed: number;
  thoughtSignature?: string;
  error?: string;
}

export async function runGrowthAgent(params: GrowthAgentParams): Promise<GrowthAgentResult> {
  const systemPrompt = `Eres el Agente de Growth de Virtual Enterprise. Creas activos de conversión, titulares persuasivos, CTAs y palabras clave SEO.
Debes responder ÚNICAMENTE en formato JSON con la siguiente estructura:
{
  "heroHeadline": string,
  "heroSubheadline": string,
  "ctaText": string,
  "features": [{"title": string, "description": string}],
  "seoKeywords": [string]
}`;

  const prompt = `Genera activos de marketing para "${params.appName}".
Nicho: ${params.marketBrief.niche}
Propuesta de Valor: ${params.marketBrief.valueProposition}`;

  try {
    const response = await callGemini({
      systemPrompt,
      userPrompt: prompt,
      thoughtSignature: params.previousThoughtSignature,
    });

    let assets: MarketingAssets;
    if (response.text) {
      const parsed = JSON.parse(response.text);
      assets = MarketingAssetsSchema.parse(parsed);
    } else {
      assets = {
        heroHeadline: `Potencia tu negocio en ${params.marketBrief.niche} con IA de Última Generación`,
        heroSubheadline: `Ahorra tiempo, elimina errores y automatiza tus flujos clave con Gemini 3.8 Flash.`,
        ctaText: "Comenzar Gratis Hoy",
        features: [
          { title: "Inferencia en Tiempo Real", description: "Velocidad ultra-rápida y razonamiento profundo." },
          { title: "Arquitectura Serverless", description: "Alta disponibilidad y costo optimizado." },
        ],
        seoKeywords: [
          `${params.marketBrief.niche.toLowerCase()} ia`,
          "automatización saas",
          "software b2b inteligente",
        ],
      };
    }

    return {
      success: true,
      marketingAssets: assets,
      tokensUsed: response.tokensUsed,
      thoughtSignature: response.thoughtSignature,
    };
  } catch (err: any) {
    return {
      success: false,
      tokensUsed: 0,
      error: err?.message || "Error en Growth Agent",
    };
  }
}
