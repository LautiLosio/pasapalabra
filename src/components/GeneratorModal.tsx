'use client';

import { useState } from 'react';
import { Sparkles, XCircle, Loader2 } from 'lucide-react';
import { Question } from '@/game/types';

interface GeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: { A: Question[]; B: Question[] }) => void;
}

export const GeneratorModal = ({ isOpen, onClose, onGenerate }: GeneratorModalProps) => {
  const [theme, setTheme] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIO');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!theme.trim() && !window.confirm('¿Generar sin tema específico (Aleatorio)?')) return;

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/roscos.generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          theme: theme.trim() || undefined,
          difficulty: difficulty || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.roscoA && result.roscoB) {
        if (result.roscoA.length < 26 || result.roscoB.length < 26) {
          throw new Error('El rosco generado está incompleto.');
        }
        onGenerate({ A: result.roscoA, B: result.roscoB });
        setTheme('');
        setDifficulty('MEDIO');
        onClose();
      } else {
        throw new Error('Formato de respuesta inválido');
      }
    } catch (e) {
      const error = e instanceof Error ? e.message : 'Error al generar';
      console.error(e);
      setErrorMsg(`Error al generar: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-purple-600">
            <Sparkles className="fill-purple-100" />
            <h2 className="text-xl font-bold">Generador de Roscos</h2>
          </div>
          <button
            onClick={() => !isGenerating && onClose()}
            className="text-slate-400 hover:text-slate-600"
          >
            <XCircle />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Temática (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: CULTURA GENERAL, COCINA, TECNOLOGÍA..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
              value={theme}
              onChange={e => setTheme(e.target.value)}
              disabled={isGenerating}
            />
            <p className="text-xs text-slate-400 mt-2">
              Si lo dejas vacío, se generarán preguntas de cultura general aleatorias.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nivel de Dificultad
            </label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all"
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              disabled={isGenerating}
            >
              <option value="FÁCIL">FÁCIL</option>
              <option value="MEDIO">MEDIO</option>
              <option value="EXPERTO">EXPERTO</option>
            </select>
          </div>

          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2">
              <XCircle size={16} /> {errorMsg}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-200 transition-all flex items-center justify-center gap-2 mt-4"
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" />
                Generando Preguntas con IA...
              </>
            ) : (
              'Crear Partida Nueva'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

