"use client";
import React from "react";
import { Key, Sparkles, CheckCircle2 } from "lucide-react";

interface HeaderProps {
  onNewProject: () => void;
  activeProjectsCount: number;
  hasApiKey: boolean;
  onOpenApiKeyModal: () => void;
}

/**
 * Encabezado corporativo del SaaS Virtual Enterprise.
 * Muestra el estado de la IA (Gemini 3.8 Flash), botón BYOK y creación de proyectos.
 */
export const Header: React.FC<HeaderProps> = ({
  onNewProject,
  activeProjectsCount,
  hasApiKey,
  onOpenApiKeyModal,
}) => {
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
            <h1 className="text-lg font-bold text-white tracking-tight leading-none">
              Virtual Enterprise
            </h1>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-semibold tracking-wider">
              v0.1.0 Showcase
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Fábrica Autónoma de Software • Colectivo Multi-Agente con Google Gemini 3.8 Flash
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Indicador y botón BYOK de Gemini */}
        <button
          onClick={onOpenApiKeyModal}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
            hasApiKey
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/50"
              : "bg-sky-500/10 border-sky-500/30 text-sky-300 hover:bg-sky-500/20"
          }`}
          title={hasApiKey ? "Gemini 3.8 Flash conectado. Clic para cambiar clave" : "Conectar Gemini API Key para inferencia real"}
        >
          {hasApiKey ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>🟢 Gemini 3.8 Flash Activo</span>
            </>
          ) : (
            <>
              <Key className="w-3.5 h-3.5 text-sky-400" />
              <span>🔑 Conectar Gemini API</span>
            </>
          )}
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs font-mono text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{activeProjectsCount} Proyectos</span>
        </div>

        <button
          onClick={onNewProject}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs tracking-wide shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Nuevo Proyecto Libre</span>
        </button>
      </div>
    </header>
  );
};
