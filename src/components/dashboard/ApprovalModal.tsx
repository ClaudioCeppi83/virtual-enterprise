"use client";
import React, { useState } from "react";
import { ProjectDocument, ProjectStage } from "../../lib/firebase/schemas";
import { Download, CheckCircle, XCircle, FileText, ArrowRight } from "lucide-react";
import { generateProjectZip, downloadBlob } from "../../lib/export/zipGenerator";

interface ApprovalModalProps {
  project: ProjectDocument | null;
  onClose: () => void;
  onApprove: (projectId: string, nextStage: ProjectStage) => void;
  onReject: (projectId: string, feedback: string) => void;
}

const NEXT_STAGE_MAP: Record<ProjectStage, ProjectStage | null> = {
  IDEATION: "PRD_REVIEW",
  PRD_REVIEW: "DEV_READY",
  DEV_READY: "IN_DEV",
  IN_DEV: "QA_TESTING",
  QA_TESTING: "LIVE",
  LIVE: null,
  PAUSED: null,
};

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  project,
  onClose,
  onApprove,
  onReject,
}) => {
  const [feedback, setFeedback] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!project) return null;

  const nextStage = NEXT_STAGE_MAP[project.currentStage];

  const handleApprove = () => {
    if (!nextStage) return;
    onApprove(project.id, nextStage);
    onClose();
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    onReject(project.id, feedback.trim());
    setFeedback("");
    setShowRejectForm(false);
    onClose();
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      const blob = await generateProjectZip(project);
      const filename = `${project.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-source.zip`;
      downloadBlob(blob, filename);
    } catch (err) {
      console.error("Error generando ZIP:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-xl font-bold text-white tracking-tight">{project.name}</h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {project.currentStage}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Gobernanza Human-in-the-Loop (HITL) • Versión v0.1.{project.version}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl font-mono leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Market Brief */}
          {project.marketBrief && (
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <h4 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                <span>Análisis de Mercado & Viabilidad (Discovery Agent)</span>
              </h4>
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Nicho:</span>
                  <span className="font-semibold text-slate-200">{project.marketBrief.niche}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Viabilidad:</span>
                  <span className="font-semibold text-emerald-400 font-mono">
                    {project.marketBrief.viabilityScore}/100
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block">Propuesta de Valor:</span>
                  <p className="text-slate-300 mt-0.5">{project.marketBrief.valueProposition}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block">Competidores & Debilidades:</span>
                  <ul className="mt-1 space-y-1 list-disc list-inside text-slate-400">
                    {project.marketBrief.competitors?.map((c, idx) => (
                      <li key={idx}>
                        <strong className="text-slate-300">{c.name}:</strong> {c.weakness}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* PRD Spec */}
          {project.prdSpec && (
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                <span>Especificación PRD (Product Agent)</span>
              </h4>
              <p className="text-xs text-slate-300">{project.prdSpec.summary}</p>
              <div className="space-y-2 pt-1">
                <span className="text-xs font-semibold text-slate-400 block">Rutas Arquitectónicas:</span>
                <div className="space-y-1.5">
                  {project.prdSpec.routes?.map((r, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-slate-900 text-xs font-mono text-slate-300 border border-slate-800">
                      <span className="text-indigo-400 font-bold">{r.path}</span>: {r.description}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Marketing Assets */}
          {project.marketingAssets && (
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                <span>Activos de Conversión & SEO (Growth Agent)</span>
              </h4>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 block">Titular Hero:</span>
                  <p className="text-white font-semibold text-sm">"{project.marketingAssets.heroHeadline}"</p>
                </div>
                <div>
                  <span className="text-slate-500 block">Llamada a la Acción (CTA):</span>
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold">{project.marketingAssets.ctaText}</span>
                </div>
              </div>
            </div>
          )}

          {/* Formulario de Rechazo / Feedback */}
          {showRejectForm && (
            <form onSubmit={handleRejectSubmit} className="space-y-3 p-4 rounded-xl bg-red-950/30 border border-red-500/30">
              <label className="block text-xs font-semibold text-red-300">
                Retroalimentación para los Agentes (Re-evaluación):
              </label>
              <textarea
                rows={3}
                placeholder="Indica qué debe corregir o ajustar la IA (ej: 'Enfocar en clínicas pequeñas en vez de hospitales')..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-red-500/40 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-400"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg text-xs"
                >
                  Enviar Feedback a la IA
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-slate-950/50">
          <button
            onClick={handleDownloadZip}
            disabled={isDownloading}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>{isDownloading ? "Generando ZIP..." : "Descargar Código Fuente (.zip)"}</span>
          </button>

          <div className="flex items-center gap-2">
            {!showRejectForm && (
              <button
                onClick={() => setShowRejectForm(true)}
                className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Rechazar con Feedback</span>
              </button>
            )}

            {nextStage && (
              <button
                onClick={handleApprove}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Aprobar y Avanzar a {nextStage}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
