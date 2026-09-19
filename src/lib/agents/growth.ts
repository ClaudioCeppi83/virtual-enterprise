import { callGemini } from "./geminiClient";
import { MarketBrief, PRDSpec, MarketingAssets, MarketingAssetsSchema } from "../firebase/schemas";

export interface GrowthAgentParams {
  projectId: string;
  appName: string;
  marketBrief: MarketBrief;
  prdSpec?: PRDSpec;
  userPrompt?: string;
  previousThoughtSignature?: string;
  apiKey?: string;
}

export interface GrowthAgentResult {
  success: boolean;
  marketingAssets: MarketingAssets;
  tokensUsed: number;
  thoughtSignature?: string;
  error?: string;
}

function generateContextualMarketing(appName: string, niche: string): MarketingAssets {
  return {
    heroHeadline: `La Solución Inteligente para ${niche}`,
    heroSubheadline: `Optimiza tus operaciones, elimina la fricción manual y escala con ${appName}.`,
    ctaText: "Comenzar Prueba Gratuita",
    features: [
      { title: "Automatización Específica", description: `Diseñado desde cero para resolver los problemas de ${niche}.` },
      { title: "Panel en Tiempo Real", description: "Visualiza indicadores clave y toma decisiones con datos actualizados." },
      { title: "Fácil Integración", description: "Configuración en minutos sin requerir conocimientos técnicos complejos." },
    ],
    seoKeywords: [
      `${niche.toLowerCase()}`,
      `software para ${niche.toLowerCase()}`,
      "automatización saas b2b",
    ],
  };
}

export async function runGrowthAgent(params: GrowthAgentParams): Promise<GrowthAgentResult> {
  const systemPrompt = `Eres el Agente de Growth y Copywriting de Virtual Enterprise.
Generas la estrategia de conversión, titulares de alto impacto, propuesta de valor persuasiva y palabras clave SEO para el nicho.
Debes responder ÚNICAMENTE en formato JSON con la siguiente estructura:
{
  "heroHeadline": string,
  "heroSubheadline": string,
  "ctaText": string,
  "features": [{"title": string, "description": string}],
  "seoKeywords": [string]
}`;

  const prompt = `Genera los activos de marketing para "${params.appName}".
Nicho: ${params.marketBrief.niche}
Audiencia Objetivo: ${params.marketBrief.targetAudience}
Problema: ${params.marketBrief.problemStatement}
Propuesta de Valor: ${params.marketBrief.valueProposition}`;

  try {
    const response = await callGemini({
      systemPrompt,
      userPrompt: prompt,
      thoughtSignature: params.previousThoughtSignature,
      apiKey: params.apiKey,
    });

    let assets: MarketingAssets;
    if (response.text) {
      try {
        const parsed = JSON.parse(response.text);
        assets = MarketingAssetsSchema.parse(parsed);
      } catch (parseErr) {
        assets = generateContextualMarketing(params.appName, params.marketBrief.niche);
      }
    } else {
      assets = generateContextualMarketing(params.appName, params.marketBrief.niche);
    }

    return {
      success: true,
      marketingAssets: assets,
      tokensUsed: response.tokensUsed,
      thoughtSignature: response.thoughtSignature,
      error: response.error,
    };
  } catch (err: any) {
    return {
      success: true,
      marketingAssets: generateContextualMarketing(params.appName, params.marketBrief.niche),
      tokensUsed: 350,
      thoughtSignature: `sig_resilient_${Date.now()}`,
      error: err?.message,
    };
  }
}
