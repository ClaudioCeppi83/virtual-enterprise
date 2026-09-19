import JSZip from "jszip";
import { ProjectDocument } from "../firebase/schemas";

/**
 * Empaqueta y descarga en el cliente el código fuente completo del micro-SaaS
 * generado por la IA en vivo en un archivo .zip listo para usar.
 */
export async function generateProjectZip(project: ProjectDocument): Promise<Blob> {
  const zip = new JSZip();
  const safeName = project.name.toLowerCase().replace(/[^a-z0-9]/g, "-");

  // 1. README.md
  const readmeContent = `# ${project.name}
> Micro-SaaS generado de forma autónoma por Virtual Enterprise con Google Gemini 3.8 Flash.

## 🎯 Resumen Ejecutivo
- **Nicho**: ${project.marketBrief?.niche || "N/A"}
- **Público Objetivo**: ${project.marketBrief?.targetAudience || "N/A"}
- **Puntuación de Viabilidad**: ${project.marketBrief?.viabilityScore || "N/A"}/100
- **Etapa Actual**: ${project.currentStage}
- **Versión**: v0.1.${project.version}

---

## 💡 Propuesta de Valor
${project.marketBrief?.valueProposition || "Solución inteligente basada en IA."}

### Problema Identificado
${project.marketBrief?.problemStatement || "Procesos ineficientes en el sector."}

---

## 🏗️ Especificación de Producto (PRD)
${project.prdSpec?.summary || "Especificación técnica inicial."}

### Rutas de la Aplicación:
${
  project.prdSpec?.routes
    ?.map(
      (r) => `- \`${r.path}\`: ${r.description} (Componentes: ${r.components.join(", ")})`
    )
    .join("\n") || "- `/`: Dashboard principal"
}

### Criterios de Aceptación:
${
  project.prdSpec?.acceptanceCriteria
    ?.map((c) => `- [x] ${c}`)
    .join("\n") || "- [x] MVP funcional"
}

---

## 📈 Estrategia de Marketing & Copywriting
- **Titular Principal**: "${project.marketingAssets?.heroHeadline || project.name}"
- **Subtitular**: "${project.marketingAssets?.heroSubheadline || ""}"
- **Llamada a la Acción (CTA)**: "${project.marketingAssets?.ctaText || "Comenzar"}"

### Palabras Clave SEO:
${project.marketingAssets?.seoKeywords?.map((k) => `- \`${k}\``).join("\n") || "- `saas`"}
`;
  zip.file("README.md", readmeContent);

  // 2. package.json
  const packageJson = {
    name: safeName,
    version: `0.1.${project.version}`,
    private: true,
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start",
    },
    dependencies: {
      next: "14.2.4",
      react: "^18.3.1",
      "react-dom": "^18.3.1",
      "lucide-react": "^0.395.0",
    },
  };
  zip.file("package.json", JSON.stringify(packageJson, null, 2));

  // 3. src/app/page.tsx
  const headline = project.marketingAssets?.heroHeadline || `Bienvenido a ${project.name}`;
  const subheadline = project.marketingAssets?.heroSubheadline || project.marketBrief?.valueProposition || "Solución inteligente.";
  const cta = project.marketingAssets?.ctaText || "Comenzar Ahora";
  const features = project.marketingAssets?.features || [
    { title: "Automatización", description: "Flujos optimizados para tu negocio." },
    { title: "Análisis en Vivo", description: "Métricas y rendimiento instantáneo." },
  ];

  const pageContent = `import React from "react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-3xl space-y-6">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
          ${project.marketBrief?.niche || "SaaS Innovador"}
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          ${headline}
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          ${subheadline}
        </p>
        <div className="pt-4">
          <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:brightness-110 shadow-lg shadow-blue-500/25">
            ${cta}
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-left pt-12">
          ${features
            .map(
              (f) => `
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <h3 className="text-base font-bold text-white mb-1">${f.title}</h3>
            <p className="text-sm text-slate-400">${f.description}</p>
          </div>`
            )
            .join("")}
        </div>
      </div>
    </main>
  );
}
`;
  zip.file("src/app/page.tsx", pageContent);

  // 4. contracts.json
  const contracts = {
    projectId: project.id,
    name: project.name,
    version: project.version,
    generatedAt: new Date().toISOString(),
    marketBrief: project.marketBrief,
    prdSpec: project.prdSpec,
    marketingAssets: project.marketingAssets,
  };
  zip.file("contracts.json", JSON.stringify(contracts, null, 2));

  return await zip.generateAsync({ type: "blob" });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
