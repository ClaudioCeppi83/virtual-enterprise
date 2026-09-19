import { callGemini } from "./geminiClient";
import { MarketBrief, PRDSpec, PRDSpecSchema } from "../firebase/schemas";

export interface ProductAgentParams {
  projectId: string;
  appName: string;
  marketBrief: MarketBrief;
  userPrompt?: string;
  previousThoughtSignature?: string;
  apiKey?: string;
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
  const systemPrompt = `Eres el Agente de Producto (Product Spec Agent) de Virtual Enterprise.
Traduces el MarketBrief en un Documento de Requisitos de Producto (PRD) técnico y ejecutable.
Debes responder ÚNICAMENTE en formato JSON con la siguiente estructura:
{
  "appName": string,
  "summary": string,
  "routes": [{"path": string, "description": string, "components": [string]}],
  "acceptanceCriteria": [string]
}`;

  const prompt = `Genera la especificación PRD completa para la aplicación "${params.appName}".
Market Brief: ${JSON.stringify(params.marketBrief)}
${params.userPrompt ? `Feedback o requerimiento especial: "${params.userPrompt}"` : "Define rutas funcionales y criterios de aceptación claros para un MVP v0.1.0."}`;

  try {
    const response = await callGemini({
      systemPrompt,
      userPrompt: prompt,
      thoughtSignature: params.previousThoughtSignature,
      apiKey: params.apiKey,
    });

    let prd: PRDSpec;
    if (response.text) {
      const parsed = JSON.parse(response.text);
      prd = PRDSpecSchema.parse(parsed);
    } else {
      prd = {
        appName: params.appName,
        summary: `Plataforma SaaS para ${params.marketBrief.niche} con arquitectura modular y flujos de automatización.`,
        routes: [
          { path: "/", description: "Panel de control principal y métricas operativas", components: ["MetricCards", "ActivityFeed", "QuickActions"] },
          { path: "/workspace", description: "Área de trabajo específica para gestionar tareas de " + params.marketBrief.niche, components: ["DataGrid", "TaskEditor"] },
          { path: "/settings", description: "Configuración de integración y preferencias", components: ["ApiKeyManager", "ProfileForm"] },
        ],
        acceptanceCriteria: [
          "Tiempo de carga inicial menor a 1.2 segundos",
          "Persistencia de datos en tiempo real",
          "Diseño responsivo optimizado para desktop y móvil",
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
