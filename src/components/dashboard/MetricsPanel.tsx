import React from "react";
import { TelemetryMetrics } from "../../lib/metrics/quotaTracker";

interface MetricsPanelProps {
  metrics: TelemetryMetrics;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
      <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 shadow-sm">
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Total Proyectos</span>
        <span id="metric-total-projects" className="text-xl font-bold text-white mt-1 block">
          {metrics.totalProjects}
        </span>
      </div>

      <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 shadow-sm">
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">En Producción</span>
        <span id="metric-live-projects" className="text-xl font-bold text-emerald-400 mt-1 block">
          {metrics.liveProjects}
        </span>
      </div>

      <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 shadow-sm">
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Viabilidad Media</span>
        <span id="metric-avg-viability" className="text-xl font-bold text-sky-400 mt-1 block">
          {metrics.avgViabilityScore} / 100
        </span>
      </div>

      <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 shadow-sm">
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Tokens IA Usados</span>
        <span id="metric-tokens-used" className="text-xl font-bold text-indigo-400 mt-1 block">
          {(metrics.estimatedTokens / 1000).toFixed(1)}k
        </span>
      </div>

      <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 shadow-sm">
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Coste Est. USD</span>
        <span id="metric-cost-usd" className="text-xl font-bold text-amber-400 mt-1 block">
          ${metrics.estimatedCostUsd.toFixed(3)}
        </span>
      </div>

      <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 shadow-sm">
        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Tasa Éxito QA</span>
        <span id="metric-qa-rate" className="text-xl font-bold text-teal-400 mt-1 block">
          {metrics.qaSuccessRate}%
        </span>
      </div>
    </div>
  );
};
