'use client';

import { useState } from 'react';
import { Sparkles, X, Loader2, Wand2, AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Question } from '@/game/types';

interface GeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (data: Question[][]) => void;
  currentPlayerCount: number;
}

export const GeneratorModal = ({ isOpen, onClose, onGenerate, currentPlayerCount }: GeneratorModalProps) => {
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
          playerCount: currentPlayerCount,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.roscos && Array.isArray(result.roscos)) {
        if (result.roscos.length !== currentPlayerCount) {
          throw new Error(`Se esperaban ${currentPlayerCount} roscos, se recibieron ${result.roscos.length}`);
        }
        const incompleteRoscos = result.roscos.filter((rosco: Question[]) => rosco.length < 27);
        if (incompleteRoscos.length > 0) {
          throw new Error('Uno o más roscos están incompletos.');
        }
        onGenerate(result.roscos);
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
              surface-neu
            "
          >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center btn-neu">
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
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white btn-icon"
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
                bg-white/5
                text-white placeholder:text-white/30
                focus:bg-white/8 focus:ring-2 focus:ring-purple-500/50
                outline-none transition-all
              "
              style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.15), inset 0 -1px 1px rgba(255,255,255,0.05)' }}
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
                    py-3 rounded-xl text-sm font-bold
                    ${difficulty === level
                      ? level === 'FÁCIL'
                        ? 'bg-green-500/25 text-green-400 btn-neu'
                        : level === 'MEDIO'
                        ? 'bg-yellow-500/25 text-yellow-400 btn-neu'
                        : 'bg-red-500/25 text-red-400 btn-neu'
                      : 'bg-white/5 text-white/50 hover:bg-white/10 btn-ghost'
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
                className="bg-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-start gap-3"
                style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.06), inset 0 -1px 1px rgba(0,0,0,0.1)' }}
              >
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generation progress disclaimer */}
          <AnimatePresence>
            {isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="bg-white/5 rounded-xl p-5 text-center"
                style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.04), inset 0 -1px 1px rgba(0,0,0,0.08)' }}
              >
                {/* Status text */}
                <p className="text-sm text-white/90 font-semibold mb-1">
                  Generando {currentPlayerCount} {currentPlayerCount === 1 ? 'rosco' : 'roscos'}
                </p>
                {/* Animated dots representing each rosco */}
                
                <div className="flex justify-center gap-2.5 my-4">
                  {Array.from({ length: currentPlayerCount }, (_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: [0.8, 1, 0.8],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        delay: i * 0.2,
                        duration: 1.2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                      className="w-3 h-3 rounded-full bg-gradient-to-br from-purple-400 to-pink-400"
                      style={{ boxShadow: '0 0 12px rgba(168, 85, 247, 0.5)' }}
                    />
                  ))}
                </div>
                <p className="text-xs text-white/40 flex items-center justify-center gap-1.5">
                  <Clock size={12} className="text-purple-400/70" />
                  {currentPlayerCount > 1 
                    ? 'Más jugadores = más tiempo de espera'
                    : 'Creando tu rosco personalizado...'
                  }
                </p>
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
              disabled:from-purple-600/50 disabled:to-pink-600/50
              btn-primary
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
