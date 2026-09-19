import test from "node:test";
import assert from "node:assert/strict";
import { generateProjectZip } from "../src/lib/export/zipGenerator";
import { ProjectDocument } from "../src/lib/firebase/schemas";
import { Timestamp } from "firebase/firestore";
import JSZip from "jszip";

test("generateProjectZip empaqueta correctamente el código fuente del micro-SaaS", async () => {
  const dummyProject: ProjectDocument = {
    id: "proj_test_123",
    name: "SnailCare AI",
    currentStage: "DEV_READY",
    version: 1,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    marketBrief: {
      niche: "Granjas de caracoles y helicicultura",
      targetAudience: "Criadores y productores de caracoles",
      problemStatement: "Falta de control climático y humedad en criaderos.",
      valueProposition: "Monitoreo inteligente con alertas automáticas de humedad y temperatura.",
      monetizationModel: "SaaS 49€/mes",
      competitors: [{ name: "Termómetros manuales", weakness: "Sin alertas remotas" }],
      viabilityScore: 91,
    },
    prdSpec: {
      appName: "SnailCare AI",
      summary: "Plataforma IoT y SaaS para criaderos de caracoles.",
      routes: [
        { path: "/", description: "Dashboard de clima", components: ["Gauges", "Alerts"] },
        { path: "/lots", description: "Gestión de lotes", components: ["LotTable"] },
      ],
      acceptanceCriteria: ["Alertas push por WhatsApp", "Registro histórico de 90 días"],
    },
    marketingAssets: {
      heroHeadline: "La Primera Plataforma de Inteligencia Climática para Helicicultura",
      heroSubheadline: "Monitorea la humedad y temperatura en tiempo real y evita pérdidas en tus lotes.",
      ctaText: "Probar 14 Días Gratis",
      features: [
        { title: "Sensores Conectados", description: "Datos en vivo sin cables." },
        { title: "Alertas Críticas", description: "Notificación instantánea ante caídas de humedad." },
      ],
      seoKeywords: ["helicicultura software", "sensores caracoles", "granja caracoles humedad"],
    },
  };

  const blob = await generateProjectZip(dummyProject);
  assert.ok(blob, "El blob generado debe existir");
  assert.ok(blob.size > 100, "El blob debe tener un tamaño superior a 100 bytes");

  // Verificar contenido interno del ZIP
  const arrayBuffer = await blob.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const files = Object.keys(zip.files);
  assert.ok(files.includes("README.md"), "Debe incluir README.md");
  assert.ok(files.includes("package.json"), "Debe incluir package.json");
  assert.ok(files.includes("src/app/page.tsx"), "Debe incluir src/app/page.tsx");
  assert.ok(files.includes("contracts.json"), "Debe incluir contracts.json");

  const readme = await zip.file("README.md")?.async("string");
  assert.match(readme || "", /SnailCare AI/);
  assert.match(readme || "", /Granjas de caracoles y helicicultura/);
  assert.match(readme || "", /Alertas push por WhatsApp/);

  const page = await zip.file("src/app/page.tsx")?.async("string");
  assert.match(page || "", /La Primera Plataforma de Inteligencia Climática para Helicicultura/);
  assert.match(page || "", /Probar 14 Días Gratis/);
});
