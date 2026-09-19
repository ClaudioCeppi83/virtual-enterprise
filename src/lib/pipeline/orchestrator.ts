import { runDiscoveryAgent } from "../agents/discovery";
import { runProductAgent } from "../agents/product";
import { runGrowthAgent } from "../agents/growth";
import { runEngineeringAgent } from "../agents/engineering";
import { runDeployAgent } from "../agents/deploy";

export interface PipelineRunRequest {
  projectId: string;
  appName: string;
  niche: string;
  userPrompt?: string;
}

export interface PipelineRunResponse {
  success: boolean;
  projectId: string;
  appName: string;
  stagesCompleted: string[];
  totalTokensUsed: number;
  liveUrl: string;
  qaStatus: string;
  error?: string;
}

export async function runEnterprisePipeline(
  request: PipelineRunRequest
): Promise<PipelineRunResponse> {
  const { projectId, appName, niche, userPrompt } = request;
  const stagesCompleted: string[] = [];
  let totalTokensUsed = 0;

  try {
    const discoveryResult = await runDiscoveryAgent({ projectId, niche, userPrompt });
    if (!discoveryResult.success || !discoveryResult.marketBrief) {
      throw new Error(`Fallo en Discovery Agent: ${discoveryResult.error}`);
    }
    stagesCompleted.push("IDEATION");
    totalTokensUsed += discoveryResult.tokensUsed;

    const productResult = await runProductAgent({
      projectId,
      appName,
      marketBrief: discoveryResult.marketBrief,
      userPrompt,
      previousThoughtSignature: discoveryResult.thoughtSignature,
    });
    if (!productResult.success || !productResult.projectSpecTicket) {
      throw new Error(`Fallo en Product Spec Agent: ${productResult.error}`);
    }
    stagesCompleted.push("PRD_REVIEW");
    stagesCompleted.push("DEV_READY");
    totalTokensUsed += productResult.tokensUsed;

    const growthResult = await runGrowthAgent({
      projectId,
      appName,
      marketBrief: discoveryResult.marketBrief,
      prdSpec: productResult.prdSpec,
      userPrompt,
      previousThoughtSignature: productResult.thoughtSignature,
    });
    if (!growthResult.success || !growthResult.marketingAssets) {
      throw new Error(`Fallo en Growth Agent: ${growthResult.error}`);
    }
    totalTokensUsed += growthResult.tokensUsed;

    const updatedTicket = {
      ...productResult.projectSpecTicket,
      marketing: growthResult.marketingAssets,
    };

    const engineeringResult = await runEngineeringAgent({
      ticket: updatedTicket,
      previousThoughtSignature: growthResult.thoughtSignature,
    });
    if (!engineeringResult.success || engineeringResult.qaStatus !== "QA_PASS") {
      throw new Error(`Fallo en Engineering QA: ${engineeringResult.qaOutput}`);
    }
    stagesCompleted.push("IN_DEV");
    stagesCompleted.push("QA_TESTING");

    const deployResult = await runDeployAgent({
      projectId,
      appName,
      previousThoughtSignature: engineeringResult.thoughtSignature,
    });
    if (!deployResult.success || !deployResult.liveUrl) {
      throw new Error(`Fallo en Deploy Agent: ${deployResult.error}`);
    }
    stagesCompleted.push("LIVE");

    return {
      success: true,
      projectId,
      appName,
      stagesCompleted,
      totalTokensUsed,
      liveUrl: deployResult.liveUrl,
      qaStatus: engineeringResult.qaStatus,
    };
  } catch (error: any) {
    return {
      success: false,
      projectId,
      appName,
      stagesCompleted,
      totalTokensUsed,
      liveUrl: "",
      qaStatus: "QA_FAIL",
      error: error?.message || "Internal Pipeline Failure",
    };
  }
}
