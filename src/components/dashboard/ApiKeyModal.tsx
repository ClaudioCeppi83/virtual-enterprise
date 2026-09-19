"use client";
import React, { useState, useEffect } from "react";
import { Key, CheckCircle, ShieldAlert, ExternalLink, Trash2 } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveKey: (key: string) => void;
  currentKey: string;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSaveKey,
  currentKey,
}) => {
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    setApiKey(currentKey || "");
  }, [currentKey, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKey(apiKey.trim());
    onClose();
  };

  const handleRemove = () => {
    onSaveKey("");
    setApiKey("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Conexión en Vivo: Google Gemini API</h3>
              <p className="text-xs text-slate-400">Bring Your Own Key (BYOK) — Inferencia Real con Gemini 3.8 Flash</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-mono leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Gemini API Key
            </label>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-sky-500 transition-colors"
            />
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-sky-300 font-semibold">
              <CheckCircle className="w-4 h-4 text-sky-400 shrink-0" />
              <span>Privacidad & Seguridad Garantizadas</span>
            </div>
            <p>
              Tu clave se almacena <strong>únicamente en el almacenamiento local (localStorage)</strong> de tu navegador. Nunca se registra en bases de datos ni se comparte con terceros.
            </p>
            <div className="pt-1 flex items-center gap-1.5 text-slate-500">
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span>Si no se proporciona, el sistema usará un motor de fallback sintético seguro.</span>
            </div>
          </div>

          <div className="pt-1 flex items-center justify-between text-xs">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:underline flex items-center gap-1"
            >
              <span>Obtener API Key en Google AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {currentKey && (
              <button
                type="button"
                onClick={handleRemove}
                className="text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                <span>Desconectar Clave</span>
              </button>
            )}
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
              className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold rounded-xl text-sm shadow-md shadow-sky-500/20 transition-all"
            >
              Guardar y Activar IA Real
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
