"use client";

import React, { useState, useEffect } from "react";
import { ProjectDocument, ProjectStage } from "../../lib/firebase/schemas";
import { Header } from "./Header";
import { KanbanBoard } from "./KanbanBoard";
import { ApprovalModal } from "./ApprovalModal";
import { NewProjectModal } from "./NewProjectModal";
import { MetricsPanel } from "./MetricsPanel";
import { calculateTelemetryMetrics } from "../../lib/metrics/quotaTracker";
import { Timestamp } from "firebase/firestore";

const LOCAL_STORAGE_KEY = "virtual_enterprise_projects_v1";

const INITIAL_DEMO_PROJECTS: ProjectDocument[] = [
  {
    id: "proj_seo_001",
    name: "SEO Metadata Generator",
    currentStage: "PRD_REVIEW",
    version: 1,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    marketBrief: {
      niche: "Herramientas de Optimización SEO",
      targetAudience: "Creadores de contenido y bloggers de nicho",
      problemStatement: "Redacción manual lenta de metadescripciones y títulos SEO atractivos",
      valueProposition: "Generación instantánea de títulos, metadatos y esquemas JSON-LD optimizados",
      monetizationModel: "freemium",
      competitors: [{ name: "Yoast SEO", weakness: "Instalación pesada en WordPress" }],
      viabilityScore: 88,
    },
    prdSpec: {
      appName: "SEO Metadata Generator",
      summary: "Micro-SaaS para análisis y generación de metadatos SEO con Gemini 1.5 Flash",
      routes: [
        { path: "/", description: "Landing page y generador interactivo", components: ["Hero", "GeneratorForm"] },
        { path: "/history", description: "Historial de metadatos del usuario", components: ["MetadataHistory"] },
      ],
      acceptanceCriteria: [
        "El usuario puede ingresar una URL y recibir sugerencias SEO en < 2 segundos",
        "Exportación directa en JSON o Markdown",
      ],
    },
    marketingAssets: {
      heroHeadline: "Optimiza el SEO de tu sitio web en 10 segundos con IA",
      heroSubheadline: "Genera títulos persuasivos, metadescripciones y palabras clave sin costo inicial",
      ctaText: "Empezar Gratis",
      features: [
        { title: "Inferencia Ultra-Rápida", description: "Impulsado por Gemini 1.5 Flash" },
        { title: "Costo $0 Garantizado", description: "Operado en infraestructura serverless gratuita" },
      ],
      seoKeywords: ["seo ia", "generador metadatos", "optimizador web"],
    },
  },
  {
    id: "proj_json_002",
    name: "JSON Schema Formatter",
    currentStage: "DEV_READY",
    version: 1,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    marketBrief: {
      niche: "Utilidades para Desarrolladores",
      targetAudience: "Programadores Frontend y Backend",
      problemStatement: "Formatear y validar esquemas JSON pesados sin exponer datos en la web",
      valueProposition: "Formateador JSON 100% privado corriendo en local con validación Zod",
      monetizationModel: "one_time",
      competitors: [{ name: "JSONFormatter.org", weakness: "Publicidad invasiva" }],
      viabilityScore: 92,
    },
    prdSpec: {
      appName: "JSON Schema Formatter",
      summary: "Herramienta ligera para validar y embellecer estructuras JSON",
      routes: [{ path: "/", description: "Editor principal de JSON", components: ["JsonEditor"] }],
      acceptanceCriteria: ["Validación sintáctica instantánea"],
    },
  },
  {
    id: "proj_antigravity_003",
    name: "Antigravity Rules Builder",
    currentStage: "LIVE",
    version: 1,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    liveUrl: "https://virtual-enterprise-demo.web.app",
    marketBrief: {
      niche: "Configuraciones de Agentes IA",
      targetAudience: "Usuarios de Google Antigravity & Cursor",
      problemStatement: "Falta de plantillas estandarizadas para reglas operativas de desarrollo",
      valueProposition: "Generador de directivas `.antigravity/rules.md` validadas",
      monetizationModel: "freemium",
      competitors: [],
      viabilityScore: 95,
    },
  },
];

export const DashboardContainer: React.FC = () => {
  const [projects, setProjects] = useState<ProjectDocument[]>(INITIAL_DEMO_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<ProjectDocument | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isProcessingAgent, setIsProcessingAgent] = useState(false);
  const [activeAgentMessage, setActiveAgentMessage] = useState<string>("");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProjects(parsed);
        }
      }
    } catch (e) {
      console.warn("[Persistencia] Fallo al leer estado guardado:", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (isHydrated) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
      } catch (e) {
        console.warn("[Persistencia] Fallo al guardar en localStorage:", e);
      }
    }
  }, [projects, isHydrated]);

  const liveCount = projects.filter((p) => p.currentStage === "LIVE").length;
  const metrics = calculateTelemetryMetrics(projects.length, liveCount, 1100);

  const handleApprove = async (projectId: string, nextStage: ProjectStage) => {
    const targetProj = projects.find((p) => p.id === projectId);
    if (!targetProj) return;

    setIsProcessingAgent(true);
    setSelectedProject(null);

    try {
      let updatedProject: ProjectDocument = {
        ...targetProj,
        currentStage: nextStage,
        version: targetProj.version + 1,
        updatedAt: Timestamp.now(),
      };

      if (nextStage === "PRD_REVIEW" && targetProj.marketBrief) {
        setActiveAgentMessage("🤖 Product Spec Agent redactando PRD y especificación técnica...");
        const res = await fetch("/api/agents/product", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            appName: targetProj.name,
            marketBrief: targetProj.marketBrief,
          }),
        });

        const data = await res.json();
        if (data.success && data.prdSpec) {
          updatedProject.prdSpec = data.prdSpec;
        }
      } else if (nextStage === "DEV_READY" && targetProj.marketBrief) {
        setActiveAgentMessage("🤖 Growth Agent generando activos de copywriting y SEO...");
        const res = await fetch("/api/agents/growth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            appName: targetProj.name,
            marketBrief: targetProj.marketBrief,
            prdSpec: targetProj.prdSpec,
          }),
        });

        const data = await res.json();
        if (data.success && data.marketingAssets) {
          updatedProject.marketingAssets = data.marketingAssets;
        }
      } else if (nextStage === "IN_DEV" || nextStage === "QA_TESTING") {
        setActiveAgentMessage("🛠️ Antigravity Dev realizando scaffolding y verificación de QA...");
        if (targetProj.marketBrief && targetProj.prdSpec && targetProj.marketingAssets) {
          const specTicket = {
            projectId,
            appName: targetProj.name,
            techStack: {
              framework: "Next.js 14",
              styling: "Tailwind CSS",
              database: "Firebase Firestore",
              auth: "Firebase Auth",
            },
            prd: targetProj.prdSpec,
            marketing: targetProj.marketingAssets,
            status: "DEV_READY" as const,
          };

          const res = await fetch("/api/agents/engineering", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ticket: specTicket }),
          });

          const data = await res.json();
          if (data.success) {
            updatedProject.currentStage = "QA_TESTING";
          }
        }
      } else if (nextStage === "LIVE") {
        setActiveAgentMessage("🚀 Deploy Agent publicando en Firebase Hosting y CDN Global...");
        const res = await fetch("/api/agents/deploy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ projectId, appName: targetProj.name }),
        });

        const data = await res.json();
        if (data.success && data.liveUrl) {
          updatedProject.liveUrl = data.liveUrl;
        }
      }

      setProjects((prev) => prev.map((p) => (p.id === projectId ? updatedProject : p)));
    } catch (err: any) {
      console.error(`[HITL Approve Agent Error] Proyecto ${projectId}:`, err);
    } finally {
      setIsProcessingAgent(false);
      setActiveAgentMessage("");
    }
  };

  const handleReject = async (projectId: string, feedback: string) => {
    const targetProj = projects.find((p) => p.id === projectId);
    if (!targetProj) return;

    setIsProcessingAgent(true);
    setActiveAgentMessage(`🤖 Discovery Agent re-evaluando mercado con feedback: "${feedback.substring(0, 25)}..."`);
    setSelectedProject(null);

    try {
      const res = await fetch("/api/agents/discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          niche: targetProj.marketBrief?.niche || targetProj.name,
          userPrompt: `Re-evaluar el producto según la retroalimentación ejecutiva del fundador: "${feedback}". Ajustar nicho, problema y propuesta de valor.`,
        }),
      });

      const data = await res.json();

      if (data.success && data.marketBrief) {
        const updatedProject: ProjectDocument = {
          ...targetProj,
          currentStage: "IDEATION",
          version: targetProj.version + 1,
          updatedAt: Timestamp.now(),
          marketBrief: data.marketBrief,
        };

        setProjects((prev) => prev.map((p) => (p.id === projectId ? updatedProject : p)));
      }
    } catch (err: any) {
      console.error(`[HITL Reject Feedback Agent Error] Proyecto ${projectId}:`, err);
    } finally {
      setIsProcessingAgent(false);
      setActiveAgentMessage("");
    }
  };

  const handleCreateProject = async (name: string, niche: string) => {
    setIsProcessingAgent(true);
    setActiveAgentMessage(`🤖 Discovery Agent investigando nicho: "${niche}"...`);
    const projectId = `proj_${Date.now()}`;

    try {
      const res = await fetch("/api/agents/discovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, niche }),
      });

      const data = await res.json();

      if (data.success && data.marketBrief) {
        const newProj: ProjectDocument = {
          id: projectId,
          name,
          currentStage: "IDEATION",
          version: 1,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          marketBrief: data.marketBrief,
        };

        setProjects((prev) => [newProj, ...prev]);
      }
    } catch (err) {
      console.error("[DiscoveryAgent UI Trigger Failed]", err);
    } finally {
      setIsProcessingAgent(false);
      setActiveAgentMessage("");
    }
  };

  const handleResetStorage = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setProjects(INITIAL_DEMO_PROJECTS);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      <Header
        onNewProject={() => setIsNewProjectModalOpen(true)}
        activeProjectsCount={projects.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <MetricsPanel metrics={metrics} />

        <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/40 via-indigo-950/30 to-slate-900 border border-sky-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-sky-300">Tablero de Mando Corporativo (Human-in-the-Loop)</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Agentes en vivo conectados a Gemini API vía API Routes. Tus acciones invocan directamente a la IA y re-escriben entregables.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetStorage}
              className="text-[11px] text-slate-400 hover:text-slate-200 underline font-mono"
            >
              [Restablecer Demos]
            </button>
            {isProcessingAgent && (
              <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold animate-pulse flex items-center gap-2">
                <span>{activeAgentMessage || "🤖 Agente de IA ejecutando tareas..."}</span>
              </div>
            )}
          </div>
        </div>

        <KanbanBoard
          projects={projects}
          onOpenApproval={(project) => setSelectedProject(project)}
        />
      </main>

      <ApprovalModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
};
