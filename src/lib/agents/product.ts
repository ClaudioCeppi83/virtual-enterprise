import { callGemini } from "./geminiClient";
import { MarketBrief, PRDSpec, PRDSpecSchema } from "../firebase/schemas";

export interface ProductAgentParams {
  projectId: string;
  appName: string;
  marketBrief: MarketBrief;
  userPrompt?: string;
  previousThoughtSignature?: string;
}

export interface ProductAgentResult {
  success: boolean;
  prdSpec?: PRDSpec;
  projectSpecTicket?: any;
  tokensUsed: number;
  thoughtSignature?: string;
  error?: string;
}

export async function runProductAgent(params: ProductAgentParams): Promise<ProductAgentResult> {
  const systemPrompt = `Eres el Agente de Producto (Product Spec Agent) de Virtual Enterprise. Traduces el MarketBrief en un PRD funcional con rutas y criterios de aceptación.
Debes responder ÚNICAMENTE en formato JSON con la siguiente estructura:
{
  "appName": string,
  "summary": string,
  "routes": [{"path": string, "description": string, "components": [string]}],
  "acceptanceCriteria": [string]
}`;

  const prompt = `Genera la especificación PRD para "${params.appName}".
Market Brief: ${JSON.stringify(params.marketBrief)}
Feedback adicional: "${params.userPrompt || "Ninguno"}".`;

  try {
    const response = await callGemini({
      systemPrompt,
      userPrompt: prompt,
      thoughtSignature: params.previousThoughtSignature,
    });

    let prd: PRDSpec;
    if (response.text) {
      const parsed = JSON.parse(response.text);
      prd = PRDSpecSchema.parse(parsed);
    } else {
      prd = {
        appName: params.appName,
        summary: `Micro-SaaS para ${params.marketBrief.niche} optimizado con Gemini 3.8 Flash y arquitectura serverless.`,
        routes: [
          { path: "/", description: "Dashboard interactivo y herramientas clave", components: ["Hero", "MainTool", "Stats"] },
          { path: "/settings", description: "Configuración de usuario y API keys", components: ["SettingsForm"] },
        ],
        acceptanceCriteria: [
          "Tiempo de respuesta de inferencia menor a 2 segundos",
          "Compatibilidad 100% offline-first con sincronización automática",
          "Interfaz adaptativa a dispositivos móviles y escritorio",
        ],
      };
    }

    const ticket = {
      projectId: params.projectId,
      appName: params.appName,
      prd,
      status: "DEV_READY",
      createdAt: new Date().toISOString(),
    };

    return {
      success: true,
      prdSpec: prd,
      projectSpecTicket: ticket,
      tokensUsed: response.tokensUsed,
      thoughtSignature: response.thoughtSignature,
    };
  } catch (err: any) {
    return {
      success: false,
      tokensUsed: 0,
      error: err?.message || "Error en Product Agent",
    };
  }
}
