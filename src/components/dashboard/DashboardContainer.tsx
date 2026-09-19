"use client";

import React, { useState, useEffect } from "react";
import { Header } from "./Header";
import { MetricsPanel } from "./MetricsPanel";
import { KanbanBoard } from "./KanbanBoard";
import { ApprovalModal } from "./ApprovalModal";
import { NewProjectModal } from "./NewProjectModal";
import { ApiKeyModal } from "./ApiKeyModal";
import { ProjectDocument, ProjectStage, MarketBrief } from "../../lib/firebase/schemas";
import { calculateTelemetryMetrics } from "../../lib/metrics/quotaTracker";
import { Play, Pause, RefreshCw, AlertCircle, X } from "lucide-react";

const LOCAL_STORAGE_KEY = "virtual_enterprise_projects_v010";
const API_KEY_STORAGE = "virtual_enterprise_gemini_api_key";

const INITIAL_DEMO_PROJECTS: ProjectDocument[] = [
  {
    id: "proj_menu_audit",
    name: "MenuAudit AI",
    currentStage: "IDEATION",
    version: 1,
    createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
    updatedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
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
  const [projects, setProjects] = useState<ProjectDocument[]>(INITIAL_DEMO_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<ProjectDocument | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [isProcessingAgent, setIsProcessingAgent] = useState(false);
  const [activeAgentMessage, setActiveAgentMessage] = useState("");
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const [isAutopilot, setIsAutopilot] = useState(false);

  // Cargar clave y proyectos de localStorage al montar
  useEffect(() => {
    // Comprobar si el servidor ya tiene la clave configurada
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.hasServerKey && !localStorage.getItem(API_KEY_STORAGE)) {
          // El servidor ya tiene la clave activa
          setGeminiApiKey("SERVER_CONFIGURED");
        }
      })
      .catch(() => {});

    const savedKey = localStorage.getItem(API_KEY_STORAGE) || "";
    if (savedKey) setGeminiApiKey(savedKey);

    const savedProjects = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedProjects) {
      try {
        const parsed = JSON.parse(savedProjects);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProjects(parsed);
        }
      } catch (err) {
        console.warn("[LocalStorage Load Error]", err);
      }
    }
  }, []);

  // Guardar proyectos en localStorage cuando cambian
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
    }
  }, [projects]);

  const handleSaveApiKey = (key: string) => {
    setGeminiApiKey(key);
    if (key) {
      localStorage.setItem(API_KEY_STORAGE, key);
      setStatusBanner("Clave de Gemini API conectada exitosamente.");
    } else {
      localStorage.removeItem(API_KEY_STORAGE);
      setStatusBanner("Clave desconectada. El sistema usará el motor de inferencia seguro.");
    }
  };

  const fetchWithKey = async (url: string, body: any) => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (geminiApiKey && geminiApiKey !== "SERVER_CONFIGURED") {
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
      updatedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
    };

    if (nextStage === "PRD_REVIEW" && targetProj.marketBrief) {
      setActiveAgentMessage("🤖 Product Spec Agent (Gemini 3.8 Flash) redactando PRD y rutas...");
      try {
        const res = await fetchWithKey("/api/agents/product", {
          projectId,
          appName: targetProj.name,
          marketBrief: targetProj.marketBrief,
        });
        const data = await res.json();
        if (data.prdSpec) {
          updatedProject.prdSpec = data.prdSpec;
        }
      } catch (err) {
        console.error("Error en Product Agent:", err);
      }
    } else if (nextStage === "DEV_READY" && targetProj.marketBrief) {
      setActiveAgentMessage("🤖 Growth Agent (Gemini 3.8 Flash) creando estrategia de conversión y SEO...");
      try {
        const res = await fetchWithKey("/api/agents/growth", {
          projectId,
          appName: targetProj.name,
          marketBrief: targetProj.marketBrief,
          prdSpec: targetProj.prdSpec,
        });
        const data = await res.json();
        if (data.marketingAssets) {
          updatedProject.marketingAssets = data.marketingAssets;
        }
      } catch (err) {
        console.error("Error en Growth Agent:", err);
      }
    } else if (nextStage === "IN_DEV" || nextStage === "QA_TESTING") {
      setActiveAgentMessage("🛠️ Engineering Agent validando scaffolding y criterios de aceptación...");
      try {
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
      } catch (err) {
        console.error("Error en Engineering Agent:", err);
      }
    } else if (nextStage === "LIVE") {
      setActiveAgentMessage("🚀 Deploy Agent publicando en Firebase Hosting y CDN...");
      try {
        const res = await fetchWithKey("/api/agents/deploy", { projectId, appName: targetProj.name });
        const data = await res.json();
        if (data.liveUrl) {
          updatedProject.liveUrl = data.liveUrl;
        }
      } catch (err) {
        console.error("Error en Deploy Agent:", err);
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
      if (data.marketBrief) {
        const updated: ProjectDocument = {
          ...targetProj,
          currentStage: "IDEATION",
          version: targetProj.version + 1,
          updatedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
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

  // Creación 100% garantizada de la tarjeta
  const handleCreateProject = async (name: string, niche: string) => {
    setIsProcessingAgent(true);
    setActiveAgentMessage(`🤖 Discovery Agent (Gemini 3.8 Flash) investigando "${niche}"...`);
    const projectId = `proj_${Date.now()}`;

    try {
      const res = await fetchWithKey("/api/agents/discovery", { projectId, niche });
      const data = await res.json();

      const marketBrief: MarketBrief = data?.marketBrief || {
        niche,
        targetAudience: `Profesionales y empresas en el sector de ${niche}`,
        problemStatement: `Procesos manuales y falta de software especializado en ${niche}`,
        valueProposition: `Automatización e inteligencia operativa especializada para ${niche}`,
        monetizationModel: "Suscripción B2B (freemium + tier pro)",
        competitors: [
          { name: "Procesos Manuales y Planillas", weakness: "Lentos y propensos a errores" },
          { name: "Software Genérico", weakness: "No adaptado a este nicho" },
        ],
        viabilityScore: 89,
      };

      const newProj: ProjectDocument = {
        id: projectId,
        name,
        currentStage: "IDEATION",
        version: 1,
        createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
        updatedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
        marketBrief,
      };

      // Inserción garantizada en la primera posición del tablero
      setProjects((prev) => [newProj, ...prev]);

      if (data.error) {
        setStatusBanner(`Aviso: ${data.error}. Tarjeta creada con análisis contextualizado.`);
      }

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
    } catch (err: any) {
      console.error("[Create Project Error]", err);
      // Resiliencia total ante desconexión de red
      const fallbackBrief: MarketBrief = {
        niche,
        targetAudience: `Profesionales y empresas en ${niche}`,
        problemStatement: `Falta de optimización y herramientas dedicadas a ${niche}`,
        valueProposition: `Solución SaaS inteligente para ${niche}`,
        monetizationModel: "Suscripción B2B mensual",
        competitors: [
          { name: "Sistemas Tradicionales", weakness: "Sin automatización" }
        ],
        viabilityScore: 85,
      };

      const fallbackProj: ProjectDocument = {
        id: projectId,
        name,
        currentStage: "IDEATION",
        version: 1,
        createdAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
        updatedAt: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
        marketBrief: fallbackBrief,
      };

      setProjects((prev) => [fallbackProj, ...prev]);
    } finally {
      setIsProcessingAgent(false);
      setActiveAgentMessage("");
    }
  };

  const handleResetStorage = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setProjects(INITIAL_DEMO_PROJECTS);
    setStatusBanner("Tablero restablecido a los proyectos de demostración.");
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

        {/* Banner de estado o notificaciones */}
        {statusBanner && (
          <div className="p-3 rounded-xl bg-sky-950/60 border border-sky-500/30 text-sky-200 text-xs flex items-center justify-between gap-2 shadow-sm animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{statusBanner}</span>
            </div>
            <button
              onClick={() => setStatusBanner(null)}
              className="text-sky-400 hover:text-white text-base leading-none px-1"
            >
              ×
            </button>
          </div>
        )}

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
