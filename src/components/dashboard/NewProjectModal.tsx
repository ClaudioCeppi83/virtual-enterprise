"use client";

import React, { useState } from "react";
import { Sparkles, Lightbulb } from "lucide-react";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, niche: string) => void;
  hasApiKey: boolean;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  hasApiKey,
}) => {
  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const trimmedName = name.trim();
    const trimmedNiche = niche.trim();
    if (!trimmedName || !trimmedNiche) return;

    onCreate(trimmedName, trimmedNiche);
    setName("");
    setNiche("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Nuevo Proyecto Autónomo</h3>
              <p className="text-xs text-slate-400">Ingresa cualquier idea o nicho libre para razonamiento en vivo con Gemini 3.8 Flash</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-mono leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Nombre de la Aplicación / Marca
            </label>
            <input
              type="text"
              placeholder="Ej: SnailCare AI, AgriDrone Pro, TutorFlow..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Nicho, Problema o Idea a Resolver
            </label>
            <textarea
              rows={4}
              placeholder="Describe cualquier nicho o necesidad sin restricciones (ej: 'Plataforma para que criadores de caracoles monitoreen la humedad y nutrición con alertas en tiempo real y registro de cosechas')..."
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
              required
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-400">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p>
              {hasApiKey ? (
                <span>
                  🟢 <strong>IA Real en Vivo activa</strong>: Al crear el proyecto, <strong>Gemini 3.8 Flash</strong> investigará en tiempo real competidores reales, viabilidad y redactará los entregables específicos.
                </span>
              ) : (
                <span>
                  ℹ️ Modo sin clave API: Se generará una estructura contextual simulada. Para inferencia real con Gemini en vivo, conecta tu clave en el botón superior.
                </span>
              )}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              Iniciar Fábrica de Software
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
