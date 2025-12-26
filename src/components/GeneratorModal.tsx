'use client';

import { useState } from 'react';
import { Sparkles, X, Loader2, Wand2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
      setErrorMsg(`Error: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="
              glass-light w-full max-w-md rounded-3xl p-6 
              shadow-2xl shadow-purple-500/10
            "
          >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Wand2 size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-[family-name:var(--font-fredoka)] font-bold text-white">
                Generador IA
              </h2>
              <p className="text-xs text-white/40">Crea nuevos roscos con inteligencia artificial</p>
            </div>
          </div>
          <button
            onClick={() => !isGenerating && onClose()}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5">
          {/* Theme input */}
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">
              Temática <span className="text-white/40 font-normal">(Opcional)</span>
            </label>
            <input
              type="text"
              placeholder="Ej: Cine, Deportes, Historia de España..."
              className="
                w-full px-4 py-3.5 rounded-xl 
                bg-white/5 border border-white/10
                text-white placeholder:text-white/30
                focus:border-purple-500/50 focus:bg-white/10
                outline-none transition-all
              "
              value={theme}
              onChange={e => setTheme(e.target.value)}
              disabled={isGenerating}
            />
            <p className="text-xs text-white/30 mt-2">
              Si lo dejas vacío, se generarán preguntas de cultura general.
            </p>
          </div>

          {/* Difficulty select */}
          <div>
            <label className="block text-sm font-semibold text-white/80 mb-2">
              Nivel de Dificultad
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['FÁCIL', 'MEDIO', 'EXPERTO'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  disabled={isGenerating}
                  className={`
                    py-3 rounded-xl text-sm font-bold transition-[background,color,border-color] duration-150 btn-press
                    ${difficulty === level
                      ? level === 'FÁCIL'
                        ? 'bg-green-500/20 text-green-400 border-2 border-green-500/50'
                        : level === 'MEDIO'
                        ? 'bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500/50'
                        : 'bg-red-500/20 text-red-400 border-2 border-red-500/50'
                      : 'bg-white/5 text-white/50 border-2 border-transparent hover:bg-white/10'
                    }
                  `}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Error message */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="bg-red-500/20 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm flex items-start gap-3"
              >
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="
              w-full py-4 rounded-xl font-bold text-white
              bg-gradient-to-r from-purple-600 to-pink-600 
              hover:from-purple-500 hover:to-pink-500
              disabled:from-purple-600/50 disabled:to-pink-600/50 disabled:cursor-not-allowed
              shadow-lg shadow-purple-500/30
              transition-[background,box-shadow] duration-150 btn-press
              flex items-center justify-center gap-2
            "
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Generando preguntas...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Crear Partida Nueva
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
};
