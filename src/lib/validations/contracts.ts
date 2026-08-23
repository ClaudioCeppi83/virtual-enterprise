import { z } from "zod";

export const MarketBriefSchema = z.object({
  niche: z.string().min(3, "El nicho debe tener al menos 3 caracteres"),
  targetAudience: z.string().min(5, "Audiencia objetivo requerida"),
  problemStatement: z.string().min(10, "Descripción del problema requerida"),
  valueProposition: z.string().min(10, "Propuesta de valor requerida"),
  monetizationModel: z.enum(["freemium", "subscription", "one_time", "usage_based"]),
  competitors: z.array(z.object({ name: z.string(), weakness: z.string() })),
  viabilityScore: z.number().min(0).max(100),
});
export type MarketBriefInput = z.infer<typeof MarketBriefSchema>;

export const PrdSpecSchema = z.object({
  appName: z.string().min(2, "Nombre de la app requerido"),
  summary: z.string().min(10, "Resumen del producto requerido"),
  routes: z.array(
    z.object({
      path: z.string(),
      description: z.string(),
      components: z.array(z.string()),
    })
  ).min(1, "Debe incluir al menos 1 ruta"),
  acceptanceCriteria: z.array(z.string()).min(1, "Al menos 1 criterio de aceptación"),
});
export type PrdSpecInput = z.infer<typeof PrdSpecSchema>;

export const FeatureAssetSchema = z.object({
  title: z.string(),
  description: z.string(),
});

export const MarketingAssetsSchema = z.object({
  heroHeadline: z.string().min(5, "Titular hero requerido"),
  heroSubheadline: z.string().min(10, "Subtitular hero requerido"),
  ctaText: z.string().min(2, "Texto de CTA requerido"),
  features: z.array(FeatureAssetSchema).min(2, "Mínimo 2 características destacadas"),
  seoKeywords: z.array(z.string()).min(2, "Al menos 2 palabras clave SEO"),
});
export type MarketingAssetsInput = z.infer<typeof MarketingAssetsSchema>;

export const ProjectSpecSchema = z.object({
  projectId: z.string(),
  appName: z.string(),
  techStack: z.object({
    framework: z.string(),
    styling: z.string(),
    database: z.string(),
    auth: z.string(),
  }),
  prd: PrdSpecSchema,
  marketing: MarketingAssetsSchema,
  status: z.enum(["DRAFT", "APPROVED", "DEV_READY", "BUILDING", "QA_PASS", "LIVE"]),
});
export type ProjectSpecInput = z.infer<typeof ProjectSpecSchema>;

export const DevTicketSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  spec: ProjectSpecSchema,
  status: z.enum(["PENDING", "IN_PROGRESS", "QA_TESTING", "COMPLETED", "FAILED"]),
  assignedAt: z.any(),
  completedAt: z.any().optional(),
  retryCount: z.number().default(0),
  logs: z.array(z.string()).default([]),
});
export type DevTicketInput = z.infer<typeof DevTicketSchema>;

export const AgentLogSchema = z.object({
  id: z.string().optional(),
  projectId: z.string(),
  agentRole: z.string(),
  action: z.string(),
  inputPayload: z.any(),
  outputPayload: z.any(),
  tokensUsed: z.number(),
  createdAt: z.any(),
});
export type AgentLogInput = z.infer<typeof AgentLogSchema>;
