import { z } from "zod";

export type ProjectStage =
  | "IDEATION"
  | "PRD_REVIEW"
  | "DEV_READY"
  | "IN_DEV"
  | "QA_TESTING"
  | "LIVE"
  | "PAUSED";

export const MarketBriefSchema = z.object({
  niche: z.string(),
  targetAudience: z.string(),
  problemStatement: z.string(),
  valueProposition: z.string(),
  monetizationModel: z.string(),
  competitors: z.array(z.object({ name: z.string(), weakness: z.string() })),
  viabilityScore: z.number().min(0).max(100),
});

export type MarketBrief = z.infer<typeof MarketBriefSchema>;

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

export const MarketingAssetsSchema = z.object({
  heroHeadline: z.string(),
  heroSubheadline: z.string(),
  ctaText: z.string(),
  features: z.array(z.object({ title: z.string(), description: z.string() })),
  seoKeywords: z.array(z.string()),
});

export type MarketingAssets = z.infer<typeof MarketingAssetsSchema>;

export interface ProjectDocument {
  id: string;
  name: string;
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
