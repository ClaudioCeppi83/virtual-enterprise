import React from "react";
import { ProjectDocument, ProjectStage } from "../../lib/firebase/schemas";

interface KanbanBoardProps {
  projects: ProjectDocument[];
  onOpenApproval: (project: ProjectDocument) => void;
}

const COLUMNS: { stage: ProjectStage; title: string; icon: string; badgeColor: string }[] = [
  { stage: "IDEATION", title: "1. Ideación", icon: "💡", badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  { stage: "PRD_REVIEW", title: "2. Revisión PRD", icon: "📋", badgeColor: "bg-sky-500/20 text-sky-300 border-sky-500/30" },
  { stage: "DEV_READY", title: "3. Growth & SEO", icon: "📈", badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
  { stage: "IN_DEV", title: "4. Ingeniería", icon: "⚙️", badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  { stage: "QA_TESTING", title: "5. QA & Verif.", icon: "🧪", badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30" },
  { stage: "LIVE", title: "6. En Producción", icon: "🚀", badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ projects, onOpenApproval }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
      {COLUMNS.map((col) => {
        const colProjects = projects.filter((p) => p.currentStage === col.stage);

        return (
          <div
            key={col.stage}
            className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 flex flex-col gap-3 min-h-[420px]"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{col.icon}</span>
                <h3 className="text-xs font-bold text-slate-200">{col.title}</h3>
              </div>
              <span className="text-[11px] font-mono font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                {colProjects.length}
              </span>
            </div>

            <div className="space-y-2.5 flex-1">
              {colProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onOpenApproval(p)}
                  className="p-3 bg-slate-800/90 hover:bg-slate-800 border border-slate-700/60 hover:border-blue-500/50 rounded-lg cursor-pointer transition-all shadow-sm group"
                >
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                      {p.name}
                    </h4>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${col.badgeColor}`}>
                      v{p.version}
                    </span>
                  </div>

                  {p.marketBrief && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1.5">
                      {p.marketBrief.valueProposition}
                    </p>
                  )}

                  <div className="mt-3 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Viabilidad: <strong className="text-sky-400">{p.marketBrief?.viabilityScore ?? "--"}/100</strong></span>
                    <span className="text-blue-400 group-hover:translate-x-0.5 transition-transform">Ver ➔</span>
                  </div>
                </div>
              ))}

              {colProjects.length === 0 && (
                <div className="h-32 flex items-center justify-center text-center p-3 border border-dashed border-slate-800 rounded-lg text-slate-600 text-[11px]">
                  Sin proyectos en esta etapa
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
