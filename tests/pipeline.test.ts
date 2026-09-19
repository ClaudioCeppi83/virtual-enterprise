import test from "node:test";
import assert from "node:assert/strict";
import { runEnterprisePipeline } from "../src/lib/pipeline/orchestrator";
import { runDiscoveryAgent } from "../src/lib/agents/discovery";
import { runProductAgent } from "../src/lib/agents/product";
import { runGrowthAgent } from "../src/lib/agents/growth";
import { runEngineeringAgent } from "../src/lib/agents/engineering";
import { runDeployAgent } from "../src/lib/agents/deploy";

test("DiscoveryAgent genera MarketBrief válido con viabilidad", async () => {
  const result = await runDiscoveryAgent({
    projectId: "test_proj_01",
    niche: "Herramientas de facturación automática para freelancers",
  });

  assert.equal(result.success, true);
  assert.ok(result.marketBrief);
  assert.ok(result.marketBrief.viabilityScore >= 0);
  assert.ok(result.marketBrief.valueProposition.length > 5);
});

test("ProductAgent genera PRDSpec y criterios de aceptación", async () => {
  const marketBrief = {
    niche: "Facturación B2B",
    targetAudience: "Freelancers",
    problemStatement: "Cobros lentos",
    valueProposition: "Cobro instantáneo",
    monetizationModel: "freemium",
    competitors: [{ name: "Excel", weakness: "Manual" }],
    viabilityScore: 85,
  };

  const result = await runProductAgent({
    projectId: "test_proj_01",
    appName: "QuickInvoice",
    marketBrief,
  });

  assert.equal(result.success, true);
  assert.ok(result.prdSpec);
  assert.ok(result.prdSpec.routes.length > 0);
  assert.ok(result.prdSpec.acceptanceCriteria.length > 0);
});

test("GrowthAgent genera titulares persuasivos y keywords SEO", async () => {
  const marketBrief = {
    niche: "SEO",
    targetAudience: "Bloggers",
    problemStatement: "Poco tráfico",
    valueProposition: "Más visitas",
    monetizationModel: "subscription",
    competitors: [],
    viabilityScore: 90,
  };

  const result = await runGrowthAgent({
    projectId: "test_proj_01",
    appName: "SEOMaster",
    marketBrief,
  });

  assert.equal(result.success, true);
  assert.ok(result.marketingAssets);
  assert.ok(result.marketingAssets.heroHeadline.length > 5);
  assert.ok(result.marketingAssets.seoKeywords.length > 0);
});

test("EngineeringAgent valida QA_PASS ante especificación completa", async () => {
  const ticket = {
    appName: "TestApp",
    prd: {
      routes: [{ path: "/", description: "Home", components: ["Hero"] }],
      acceptanceCriteria: ["Debe cargar en < 2s"],
    },
  };

  const result = await runEngineeringAgent({ ticket });
  assert.equal(result.success, true);
  assert.equal(result.qaStatus, "QA_PASS");
});

test("DeployAgent emite URL canónica de producción en web.app", async () => {
  const result = await runDeployAgent({
    projectId: "proj_demo_99",
    appName: "Invoice Bot",
  });

  assert.equal(result.success, true);
  assert.ok(result.liveUrl?.includes("invoice-bot"));
  assert.ok(result.liveUrl?.includes(".web.app"));
});

test("Tubería orquestada runEnterprisePipeline ejecuta ciclo completo de los 5 agentes", async () => {
  const response = await runEnterprisePipeline({
    projectId: "test_e2e_pipeline",
    appName: "OmniTracker SaaS",
    niche: "Seguimiento de inventarios para tiendas de barrio",
  });

  assert.equal(response.success, true);
  assert.equal(response.qaStatus, "QA_PASS");
  assert.ok(response.liveUrl.length > 0);
  assert.equal(response.stagesCompleted.length, 6);
});
