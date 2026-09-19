import { z } from "zod";

/**
 * Etapas del ciclo de vida operativo de un micro-SaaS en Virtual Enterprise.
 * Cada etapa representa el dominio de responsabilidad de un departamento de IA.
 */
export type ProjectStage =
  | "IDEATION"     // Discovery Agent: Detección y validación de nicho
  | "PRD_REVIEW"   // Product Agent: Especificación funcional y PRD
  | "DEV_READY"    // Growth Agent: Estrategia de marketing y SEO
  | "IN_DEV"       // Engineering Agent: Blueprint y scaffolding técnico
  | "QA_TESTING"   // Engineering Agent: Validación y certificación de calidad
  | "LIVE"         // Deploy Agent: Publicación y URL canónica de hosting
  | "PAUSED";      // Estado pausado por el usuario o en espera de feedback

/**
 * Esquema Zod de validación para el entregable del Discovery Agent.
 * Exige viabilidad numérica (0-100) para permitir decisiones algorítmicas de avance.
 */
export const MarketBriefSchema = z.object({
  niche: z.string().min(2, "El nicho debe tener al menos 2 caracteres"),
  targetAudience: z.string(),
  problemStatement: z.string(),
  valueProposition: z.string(),
  monetizationModel: z.string(),
  competitors: z.array(z.object({ name: z.string(), weakness: z.string() })),
  viabilityScore: z.number().min(0).max(100),
});

export type MarketBrief = z.infer<typeof MarketBriefSchema>;

/**
 * Esquema Zod para la especificación PRD generada por el Product Agent.
 * Estructura las rutas esperadas y los criterios de aceptación para el equipo de ingeniería.
 */
export const PRDSpecSchema = z.object({
  appName: z.string(),
  summary: z.string(),
  routes: z.array(
    z.object({
      path: z.string(),
      description: z.string(),
      components: z.array(z.string()),
    })
  ),
  acceptanceCriteria: z.array(z.string()),
});

export type PRDSpec = z.infer<typeof PRDSpecSchema>;

/**
 * Esquema Zod para los activos de conversión diseñados por el Growth Agent.
 */
export const MarketingAssetsSchema = z.object({
  heroHeadline: z.string(),
  heroSubheadline: z.string(),
  ctaText: z.string(),
  features: z.array(z.object({ title: z.string(), description: z.string() })),
  seoKeywords: z.array(z.string()),
});

export type MarketingAssets = z.infer<typeof MarketingAssetsSchema>;

/**
 * Estructura del documento de proyecto almacenado en Firestore o en memoria/localStorage.
 */
export interface ProjectDocument {
  readonly id: string;
  readonly name: string;
  currentStage: ProjectStage;
  version: number;
  createdAt: any;
  updatedAt: any;
  marketBrief?: MarketBrief;
  prdSpec?: PRDSpec;
  marketingAssets?: MarketingAssets;
  liveUrl?: string;
  error?: string;
}
