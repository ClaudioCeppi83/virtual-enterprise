import React from "react";

interface HeaderProps {
  onNewProject: () => void;
  activeProjectsCount: number;
}

/**
 * Encabezado corporativo del SaaS Virtual Enterprise.
 * Muestra el estado del sistema, el contador de proyectos activos y el badge
 * transparente del modo sandbox interactivo (v0.1.0 MVP).
 */
export const Header: React.FC<HeaderProps> = ({ onNewProject, activeProjectsCount }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-md">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-inner"
          aria-hidden="true"
        >
          🏢
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-white tracking-tight leading-tight">
              Virtual Enterprise
            </h1>
            <span
              className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-mono font-semibold border border-blue-500/30"
              title="Versión actual: v0.1.0 MVP"
            >
              v0.1.0 MVP
            </span>
            <span
              className="text-[10px] bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded-full font-mono font-medium border border-amber-500/30 hidden sm:inline-block"
              title="Simulación interactiva en sandbox. El pipeline multi-agente opera en memoria y localStorage."
            >
              🧪 Sandbox Interactivo
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Fábrica de Micro-SaaS Autónoma • Gemini 3.8 Flash Multi-Agente
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div
          className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/50"
          aria-label={`${activeProjectsCount} proyectos activos en el tablero`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true"></span>
          <span>{activeProjectsCount} Proyectos Activos</span>
        </div>
        <button
          id="create-project-btn"
          onClick={onNewProject}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs sm:text-sm rounded-lg shadow-sm transition-all flex items-center gap-2"
          aria-label="Lanzar un nuevo proyecto de micro-SaaS"
        >
          <span aria-hidden="true">➕</span> Nuevo Micro-SaaS
        </button>
      </div>
    </header>
  );
};
