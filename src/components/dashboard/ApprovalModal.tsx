import React, { useState } from "react";
import { ProjectDocument, ProjectStage } from "../../lib/firebase/schemas";

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

  if (!project) return null;

  const nextStage = NEXT_STAGE_MAP[project.currentStage];

  const handleConfirmReject = () => {
    if (!feedback.trim()) return;
    onReject(project.id, feedback.trim());
    setFeedback("");
    setShowRejectForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start border-b border-slate-800 pb-3">
          <div>
            <span className="text-[11px] font-mono text-blue-400 block uppercase">
              Revisión Human-in-the-Loop • Etapa: {project.currentStage}
            </span>
            <h3 className="text-xl font-bold text-white mt-0.5">{project.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Detalles del Entregable de la Etapa */}
        <div className="space-y-4 text-xs">
          {project.marketBrief && (
            <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-2">
              <h4 className="font-bold text-sky-300 flex items-center gap-1.5">
                <span>💡</span> Market Brief (Discovery Agent)
              </h4>
              <p><strong>Nicho:</strong> {project.marketBrief.niche}</p>
              <p><strong>Problema:</strong> {project.marketBrief.problemStatement}</p>
              <p><strong>Propuesta de Valor:</strong> {project.marketBrief.valueProposition}</p>
              <p><strong>Viabilidad:</strong> {project.marketBrief.viabilityScore}/100</p>
            </div>
          )}

          {project.prdSpec && (
            <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-2">
              <h4 className="font-bold text-sky-300 flex items-center gap-1.5">
                <span>📋</span> Especificación PRD (Product Agent)
              </h4>
              <p><strong>Resumen:</strong> {project.prdSpec.summary}</p>
              <div>
                <strong>Criterios de Aceptación:</strong>
                <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-300">
                  {project.prdSpec.acceptanceCriteria.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {project.marketingAssets && (
            <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700/60 space-y-2">
              <h4 className="font-bold text-sky-300 flex items-center gap-1.5">
                <span>📈</span> Estrategia Growth (Growth Agent)
              </h4>
              <p><strong>Titular:</strong> {project.marketingAssets.heroHeadline}</p>
              <p><strong>CTA:</strong> {project.marketingAssets.ctaText}</p>
            </div>
          )}

          {project.liveUrl && (
            <div className="p-3.5 bg-emerald-950/40 rounded-xl border border-emerald-500/30 text-emerald-300">
              <p className="font-bold">🚀 Micro-SaaS en Producción:</p>
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                className="underline break-all font-mono text-xs mt-1 block"
              >
                {project.liveUrl}
              </a>
            </div>
          )}
        </div>

        {/* Acciones HITL */}
        <div className="pt-3 border-t border-slate-800 flex flex-col gap-3">
          {!showRejectForm ? (
            <div className="flex justify-between items-center gap-3">
              <button
                type="button"
                onClick={() => setShowRejectForm(true)}
                className="px-4 py-2 bg-rose-900/40 hover:bg-rose-900/60 border border-rose-700 text-rose-300 font-medium rounded-lg text-xs transition-colors"
              >
                Rechazar con Feedback
              </button>

              {nextStage ? (
                <button
                  id="approve-next-stage-btn"
                  type="button"
                  onClick={() => onApprove(project.id, nextStage)}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg text-xs transition-all shadow-md flex items-center gap-2"
                >
                  <span>✓</span> Aprobar y Avanzar a {nextStage}
                </button>
              ) : (
                <span className="text-xs text-emerald-400 font-bold">Proyecto Completado y Publicado</span>
              )}
            </div>
          ) : (
            <div className="space-y-3 bg-rose-950/30 p-3 rounded-xl border border-rose-800/40">
              <label className="text-xs font-semibold text-rose-300 block">
                Instrucciones de re-evaluación para el colectivo de agentes:
              </label>
              <textarea
                id="reject-feedback-input"
                rows={3}
                placeholder="Ej. Enfocar la propuesta en creadores de video en lugar de bloggers..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectForm(false)}
                  className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  id="confirm-reject-btn"
                  type="button"
                  onClick={handleConfirmReject}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-xs transition-colors"
                >
                  Enviar al Agente Discovery
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
