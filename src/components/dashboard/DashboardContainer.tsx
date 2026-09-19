"use client";
import React, { useState, useEffect } from "react";
import { Header } from "./Header";
import { MetricsPanel } from "./MetricsPanel";
import { KanbanBoard } from "./KanbanBoard";
import { ApprovalModal } from "./ApprovalModal";
import { NewProjectModal } from "./NewProjectModal";
import { ApiKeyModal } from "./ApiKeyModal";
import { ProjectDocument, ProjectStage } from "../../lib/firebase/schemas";
import { calculateTelemetryMetrics } from "../../lib/metrics/quotaTracker";
import { Timestamp } from "firebase/firestore";
import { Play, Pause, RefreshCw, Key } from "lucide-react";

const LOCAL_STORAGE_KEY = "virtual_enterprise_projects_v010";
const API_KEY_STORAGE = "virtual_enterprise_gemini_api_key";

const INITIAL_DEMO_PROJECTS: ProjectDocument[] = [
  {
    id: "proj_menu_audit",
    name: "MenuAudit AI",
    currentStage: "IDEATION",
    version: 1,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    marketBrief: {
      niche: "Auditoría de escandallos y márgenes para restaurantes",
      targetAudience: "Restauradores y directores de F&B",
      problemStatement: "Descuadre del 14% en costos de materia prima por falta de trazabilidad.",
      valueProposition: "Escaneo inteligente de albaranes y recálculo automático de márgenes brutos.",
      monetizationModel: "SaaS 79€/mes por local",
      competitors: [
        { name: "Excel manual", weakness: "Lento y propenso a errores" },
        { name: "ERP Tradicional", weakness: "Costoso e inadaptado a cocina" },
      ],
      viabilityScore: 92,
    },
  },
];

export const DashboardContainer: React.FC = () => {
  const [projects, setProjects] = useState<ProjectDocument[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectDocument | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [isProcessingAgent, setIsProcessingAgent] = useState(false);
  const [activeAgentMessage, setActiveAgentMessage] = useState("");
  const [isAutopilot, setIsAutopilot] = useState(false);

  // Cargar clave y proyectos de localStorage
  useEffect(() => {
    const savedKey = localStorage.getItem(API_KEY_STORAGE) || "";
    setGeminiApiKey(savedKey);

    const savedProjects = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedProjects) {
      try {
        setProjects(JSON.parse(savedProjects));
      } catch {
        setProjects(INITIAL_DEMO_PROJECTS);
      }
    } else {
      setProjects(INITIAL_DEMO_PROJECTS);
    }
  }, []);

  // Guardar proyectos en localStorage
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
    }
  }, [projects]);

  const handleSaveApiKey = (key: string) => {
    setGeminiApiKey(key);
    if (key) {
      localStorage.setItem(API_KEY_STORAGE, key);
    } else {
      localStorage.removeItem(API_KEY_STORAGE);
    }
  };

  // Helper para hacer fetch con el header x-gemini-api-key
  const fetchWithKey = async (url: string, body: any) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (geminiApiKey) {
      headers["x-gemini-api-key"] = geminiApiKey;
    }
    return fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
  };

  const executeStageTransition = async (projectId: string, nextStage: ProjectStage): Promise<ProjectDocument | null> => {
    const targetProj = projects.find((p) => p.id === projectId);
    if (!targetProj) return null;

    let updatedProject: ProjectDocument = {
      ...targetProj,
      currentStage: nextStage,
      version: targetProj.version + 1,
      updatedAt: Timestamp.now(),
    };

    if (nextStage === "PRD_REVIEW" && targetProj.marketBrief) {
      setActiveAgentMessage("🤖 Product Spec Agent (Gemini 3.8 Flash) redactando PRD y rutas...");
      const res = await fetchWithKey("/api/agents/product", {
        projectId,
        appName: targetProj.name,
        marketBrief: targetProj.marketBrief,
      });
      const data = await res.json();
      if (data.success && data.prdSpec) {
        updatedProject.prdSpec = data.prdSpec;
      }
    } else if (nextStage === "DEV_READY" && targetProj.marketBrief) {
      setActiveAgentMessage("🤖 Growth Agent (Gemini 3.8 Flash) creando estrategia de conversión y SEO...");
      const res = await fetchWithKey("/api/agents/growth", {
        projectId,
        appName: targetProj.name,
        marketBrief: targetProj.marketBrief,
        prdSpec: targetProj.prdSpec,
      });
      const data = await res.json();
      if (data.success && data.marketingAssets) {
        updatedProject.marketingAssets = data.marketingAssets;
      }
    } else if (nextStage === "IN_DEV" || nextStage === "QA_TESTING") {
      setActiveAgentMessage("🛠️ Engineering Agent validando scaffolding y criterios de aceptación...");
      const specTicket = {
        projectId,
        appName: targetProj.name,
        techStack: { framework: "Next.js 14", styling: "Tailwind CSS", database: "Firebase Firestore" },
        prd: targetProj.prdSpec,
        marketing: targetProj.marketingAssets,
        status: "DEV_READY" as const,
      };
      const res = await fetchWithKey("/api/agents/engineering", { ticket: specTicket });
      const data = await res.json();
      if (data.success) {
        updatedProject.currentStage = "QA_TESTING";
      }
    } else if (nextStage === "LIVE") {
      setActiveAgentMessage("🚀 Deploy Agent publicando en Firebase Hosting y CDN...");
      const res = await fetchWithKey("/api/agents/deploy", { projectId, appName: targetProj.name });
      const data = await res.json();
      if (data.success && data.liveUrl) {
        updatedProject.liveUrl = data.liveUrl;
      }
    }

    setProjects((prev) => prev.map((p) => (p.id === projectId ? updatedProject : p)));
    return updatedProject;
  };

  const handleApprove = async (projectId: string, nextStage: ProjectStage) => {
    setIsProcessingAgent(true);
    try {
      await executeStageTransition(projectId, nextStage);
    } catch (err) {
      console.error(`[Approve Error] Proyecto ${projectId}:`, err);
    } finally {
      setIsProcessingAgent(false);
      setActiveAgentMessage("");
    }
  };

  const handleReject = async (projectId: string, feedback: string) => {
    const targetProj = projects.find((p) => p.id === projectId);
    if (!targetProj) return;

    setIsProcessingAgent(true);
    setActiveAgentMessage(`🤖 Discovery Agent re-evaluando nicho con feedback: "${feedback.substring(0, 30)}..."`);
    setSelectedProject(null);

    try {
      const res = await fetchWithKey("/api/agents/discovery", {
        projectId,
        niche: targetProj.marketBrief?.niche || targetProj.name,
        userPrompt: `Re-evaluar el producto según el feedback: "${feedback}". Ajustar nicho, problema y propuesta de valor.`,
      });
      const data = await res.json();
      if (data.success && data.marketBrief) {
        const updated: ProjectDocument = {
          ...targetProj,
          currentStage: "IDEATION",
          version: targetProj.version + 1,
          updatedAt: Timestamp.now(),
          marketBrief: data.marketBrief,
        };
        setProjects((prev) => prev.map((p) => (p.id === projectId ? updated : p)));
      }
    } catch (err) {
      console.error(`[Reject Error] Proyecto ${projectId}:`, err);
    } finally {
      setIsProcessingAgent(false);
      setActiveAgentMessage("");
    }
  };

  const handleCreateProject = async (name: string, niche: string) => {
    setIsProcessingAgent(true);
    setActiveAgentMessage(`🤖 Discovery Agent (Gemini 3.8 Flash) investigando "${niche}"...`);
    const projectId = `proj_${Date.now()}`;

    try {
      const res = await fetchWithKey("/api/agents/discovery", { projectId, niche });
      const data = await res.json();

      if (data.success && data.marketBrief) {
        let newProj: ProjectDocument = {
          id: projectId,
          name,
          currentStage: "IDEATION",
          version: 1,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          marketBrief: data.marketBrief,
        };

        setProjects((prev) => [newProj, ...prev]);

        // Si está en modo autopiloto, avanzar secuencialmente
        if (isAutopilot) {
          setTimeout(async () => {
            const p1 = await executeStageTransition(projectId, "PRD_REVIEW");
            if (p1 && isAutopilot) {
              setTimeout(async () => {
                const p2 = await executeStageTransition(projectId, "DEV_READY");
                if (p2 && isAutopilot) {
                  setTimeout(async () => {
                    await executeStageTransition(projectId, "QA_TESTING");
                  }, 1200);
                }
              }, 1200);
            }
          }, 1200);
        }
      }
    } catch (err) {
      console.error("[Create Project Error]", err);
    } finally {
      setIsProcessingAgent(false);
      setActiveAgentMessage("");
    }
  };

  const handleResetStorage = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setProjects(INITIAL_DEMO_PROJECTS);
  };

  const metrics = calculateTelemetryMetrics(projects);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100">
      <Header
        onNewProject={() => setIsNewProjectModalOpen(true)}
        activeProjectsCount={projects.length}
        hasApiKey={Boolean(geminiApiKey)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <MetricsPanel metrics={metrics} />

        {/* Control Bar: Autopiloto vs HITL & Estado de IA */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/40 via-indigo-950/30 to-slate-900 border border-sky-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-sky-300">Tablero de Mando Multi-Agente</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {isAutopilot ? "Modo Autopiloto ⚡" : "Modo Junta Directiva (HITL) 🛡️"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Ingresa cualquier nicho libre. Gemini 3.8 Flash razona y genera especificaciones y código descargable en tiempo real.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Toggle Autopiloto / HITL */}
            <button
              onClick={() => setIsAutopilot(!isAutopilot)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isAutopilot
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                  : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {isAutopilot ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pausar Autopiloto</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-sky-400" />
                  <span>Activar Autopiloto</span>
                </>
              )}
            </button>

            <button
              onClick={handleResetStorage}
              className="text-[11px] text-slate-400 hover:text-slate-200 underline font-mono"
            >
              [Restablecer]
            </button>
          </div>
        </div>

        {/* Indicador de proceso activo */}
        {isProcessingAgent && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold animate-pulse flex items-center gap-2.5 shadow-md">
            <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
            <span>{activeAgentMessage || "🤖 Gemini 3.8 Flash razonando y procesando entregables..."}</span>
          </div>
        )}

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
        hasApiKey={Boolean(geminiApiKey)}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSaveKey={handleSaveApiKey}
        currentKey={geminiApiKey}
      />
    </div>
  );
};
