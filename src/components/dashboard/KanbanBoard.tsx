"use client";
import React from "react";
import { ProjectDocument, ProjectStage } from "../../lib/firebase/schemas";
import { Download, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { generateProjectZip, downloadBlob } from "../../lib/export/zipGenerator";

interface KanbanBoardProps {
  projects: ProjectDocument[];
  onOpenApproval: (project: ProjectDocument) => void;
}

const COLUMNS: { stage: ProjectStage; title: string; subtitle: string; color: string }[] = [
  { stage: "IDEATION", title: "1. Ideación & Discovery", subtitle: "Nicho y análisis de viabilidad", color: "border-sky-500/40" },
  { stage: "PRD_REVIEW", title: "2. Especificación PRD", subtitle: "Rutas y arquitectura técnica", color: "border-indigo-500/40" },
  { stage: "DEV_READY", title: "3. Growth & Marketing", subtitle: "Copywriting, CTAs y SEO", color: "border-amber-500/40" },
  { stage: "IN_DEV", title: "4. Desarrollo & Scaffolding", subtitle: "Generación de código", color: "border-purple-500/40" },
  { stage: "QA_TESTING", title: "5. QA & Verificación", subtitle: "Tests y validación", color: "border-emerald-500/40" },
  { stage: "LIVE", title: "6. Producción", subtitle: "Publicado en la nube", color: "border-teal-500/40" },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ projects, onOpenApproval }) => {
  const handleQuickDownload = async (e: React.MouseEvent, project: ProjectDocument) => {
    e.stopPropagation();
    try {
      const blob = await generateProjectZip(project);
      const filename = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-source.zip`;
      downloadBlob(blob, filename);
    } catch (err) {
      console.error("Error descargando ZIP:", err);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const colProjects = projects.filter((p) => p.currentStage === col.stage);

        return (
          <div
            key={col.stage}
            className={`bg-slate-900/70 border-t-2 ${col.color} border-slate-800 rounded-2xl p-3 flex flex-col min-w-[240px] shadow-sm`}
          >
            <div className="pb-2 border-b border-slate-800/80 mb-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white tracking-tight">{col.title}</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  {colProjects.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 truncate">{col.subtitle}</p>
            </div>

            <div className="space-y-3 flex-1">
              {colProjects.length === 0 ? (
                <div className="h-24 rounded-xl border border-dashed border-slate-800 flex items-center justify-center text-[11px] text-slate-500 font-mono">
                  Sin proyectos
                </div>
              ) : (
                colProjects.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => onOpenApproval(p)}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-sky-500/50 hover:bg-slate-950/80 cursor-pointer transition-all shadow-sm group space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-1">
                        {p.name}
                      </h4>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 shrink-0">
                        v0.1.{p.version}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {p.marketBrief?.niche || "En proceso de análisis de mercado..."}
                    </p>

                    {p.marketBrief && (
                      <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-800/60 font-mono">
                        <span className="text-slate-400">Viabilidad:</span>
                        <span className="text-emerald-400 font-bold">
                          {p.marketBrief.viabilityScore}/100
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 gap-1">
                      <button
                        onClick={(e) => handleQuickDownload(e, p)}
                        className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[10px] text-slate-300 border border-slate-800 flex items-center gap-1 transition-colors"
                        title="Descargar código fuente (.zip)"
                      >
                        <Download className="w-3 h-3 text-sky-400" />
                        <span>ZIP</span>
                      </button>

                      <span className="text-[10px] text-sky-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        <span>Gestionar</span>
                        <span>→</span>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
