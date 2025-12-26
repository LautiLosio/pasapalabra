import { Check, X, SkipForward, Trophy, ChevronDown, ChevronUp, Pause, Play, Undo2, AlertTriangle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Question } from '@/game/types';

interface ControlPanelProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  winner: string | null;
  winningReason: string | null;
  gameStarted: boolean;
  currentLetterData: Question;
  isCurrentDataValid: boolean;
  isPaused: boolean;
  prevGameState: unknown;
  playerNames: { A: string; B: string };
  onPauseToggle: () => void;
  onUndo: () => void;
  onAction: (action: 'correct' | 'incorrect' | 'pasapalabra') => void;
  onReset: () => void;
}

export const ControlPanel = ({
  isCollapsed,
  onToggleCollapse,
  winner,
  winningReason,
  gameStarted,
  currentLetterData,
  isCurrentDataValid,
  isPaused,
  prevGameState,
  playerNames,
  onPauseToggle,
  onUndo,
  onAction,
  onReset,
}: ControlPanelProps) => {
  return (
    <section
      className={`
        w-full glass z-10 flex-shrink-0 relative 
        ${isCollapsed ? 'border-t-0' : 'border-t border-border'}
      `}
    >
      {/* Toggle button */}
      <button
        onClick={onToggleCollapse}
        className="
          absolute -top-10 right-4 md:right-8 
          glass-light px-4 py-2 rounded-t-xl 
          font-semibold text-xs uppercase tracking-wider 
          flex items-center gap-2 
          text-white/60 hover:text-white
          transition-colors z-20
        "
      >
        {isCollapsed ? (
          <>
            <ChevronUp size={16} /> Mostrar Controles
          </>
        ) : (
          <>
            <ChevronDown size={16} /> Ocultar
          </>
        )}
      </button>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28, mass: 0.8 }}
            className="overflow-hidden"
          >
            <div className="max-w-6xl mx-auto px-3 py-2 md:p-4 w-full">
              <AnimatePresence mode="wait">
            {winner ? (
              // Winner state - stacks on mobile
              <motion.div
                key="winner"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 py-3 md:py-4"
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 12 }}
                    className="relative"
                  >
                    <Trophy size={40} className="text-yellow-400 md:w-14 md:h-14" />
                    <div className="absolute inset-0 blur-xl bg-yellow-400/30" />
                  </motion.div>
                  <div className="text-center md:text-left">
                    <h2 className="text-xl md:text-3xl font-[family-name:var(--font-fredoka)] font-bold text-white">
                      ¡Juego Terminado!
                    </h2>
                    <p className="text-base md:text-lg text-white/60">
                      Ganador:{' '}
                      <span className={`font-bold ${winner === playerNames.A ? 'text-blue-400' : winner === playerNames.B ? 'text-orange-400' : ''}`}>
                        {winner}
                      </span>
                    </p>
                    {winningReason && (
                      <p className="text-xs md:text-sm text-white/50 mt-1">
                        {winningReason}
                      </p>
                    )}
                  </div>
                </div>
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onReset}
                  className="
                    bg-gradient-to-r from-blue-500 to-purple-500 
                    hover:from-blue-400 hover:to-purple-400
                    text-white px-5 py-2.5 md:px-6 md:py-3 rounded-xl font-bold text-sm md:text-base
                    shadow-lg shadow-blue-500/30 transition-colors
                    flex items-center gap-2
                  "
                >
                  <Sparkles size={18} /> Nueva Partida
                </motion.button>
              </motion.div>
            ) : !gameStarted ? (
              // Not started state
              <motion.div
                key="not-started"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-center text-white/40 py-6"
              >
                <p className="text-lg">Presiona <span className="text-green-400 font-semibold">Iniciar</span> para comenzar la partida</p>
              </motion.div>
            ) : (
              // Active game state - vertical on mobile, horizontal on desktop
              <motion.div
                key="active"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4"
              >
              {/* Desktop: Left utility buttons */}
              <div className="hidden md:flex flex-col gap-1.5 flex-shrink-0 w-14">
                <button
                  onClick={onPauseToggle}
                  className={`
                    w-full h-11 flex items-center justify-center rounded-lg transition-colors duration-150 btn-press border
                    ${isPaused
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/30'
                      : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border-amber-500/30'
                    }
                  `}
                  title={isPaused ? 'Reanudar (Espacio)' : 'Pausar (Espacio)'}
                >
                  {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
                </button>
                <button
                  onClick={onUndo}
                  disabled={!prevGameState}
                  className={`
                    w-full h-11 flex items-center justify-center rounded-lg transition-colors duration-150 btn-press
                    ${prevGameState
                      ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30'
                      : 'bg-white/5 text-white/20 border border-white/10'
                    }
                  `}
                  title="Deshacer (Z)"
                >
                  <Undo2 size={18} strokeWidth={2.5} />
                </button>
              </div>

              {/* Question card - full width on mobile, flex-1 on desktop */}
              <div className="flex-1 order-1 md:order-none">
                <div className="glass-light rounded-xl px-3 py-2 md:px-4 md:py-3 min-h-[80px] md:h-[100px] flex flex-col justify-between overflow-hidden">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`
                        text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border
                        ${currentLetterData.condition?.includes('Contiene')
                          ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                          : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }
                      `}
                    >
                      {currentLetterData.condition || `Empieza por ${currentLetterData.letter}`}
                    </span>
                    {!isCurrentDataValid && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1 animate-pulse">
                        <AlertTriangle size={10} /> Error IA
                      </span>
                    )}
                  </div>
                  <p className="text-sm md:text-lg font-medium text-white leading-snug line-clamp-2 my-1">
                    {currentLetterData.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-red-400/80 uppercase tracking-wide">Respuesta:</span>
                    <span className={`text-sm md:text-base font-bold tracking-tight ${!isCurrentDataValid ? 'text-red-400 decoration-wavy underline' : 'text-white'}`}>
                      {currentLetterData.answer}
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop: Right action buttons in grid */}
              <div className="hidden md:grid grid-cols-2 gap-1.5 flex-shrink-0 w-32">
                <button
                  onClick={() => onAction('correct')}
                  className="col-span-2 h-11 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white rounded-lg shadow-lg shadow-green-500/30 transition-[background,box-shadow] duration-150 btn-press flex items-center justify-center"
                  title="Acierto (A)"
                >
                  <Check size={26} strokeWidth={3} />
                </button>
                <button
                  onClick={() => onAction('incorrect')}
                  className="h-11 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400 text-white rounded-lg shadow-lg shadow-red-500/30 transition-[background,box-shadow] duration-150 btn-press flex items-center justify-center"
                  title="Fallo (F)"
                >
                  <X size={22} strokeWidth={3} />
                </button>
                <button
                  onClick={() => onAction('pasapalabra')}
                  className="h-11 bg-white/10 hover:bg-white/15 text-white/80 hover:text-white rounded-lg border border-white/10 transition-[background,color] duration-150 btn-press flex items-center justify-center"
                  title="Pasapalabra (P)"
                >
                  <SkipForward size={22} strokeWidth={2.5} />
                </button>
              </div>

              {/* Mobile: All controls in one row */}
              <div className="flex md:hidden items-center gap-2 order-2 justify-center">
                <button
                  onClick={onPauseToggle}
                  className={`
                    flex-1 h-14 flex items-center justify-center rounded-xl transition-colors duration-150 btn-press border
                    ${isPaused
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/30'
                      : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border-amber-500/30'
                    }
                  `}
                  title={isPaused ? 'Reanudar' : 'Pausar'}
                >
                  {isPaused ? <Play size={22} fill="currentColor" /> : <Pause size={22} fill="currentColor" />}
                </button>
                <button
                  onClick={onUndo}
                  disabled={!prevGameState}
                  className={`
                    flex-1 h-14 flex items-center justify-center rounded-xl transition-colors duration-150 btn-press
                    ${prevGameState
                      ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30'
                      : 'bg-white/5 text-white/20 border border-white/10'
                    }
                  `}
                  title="Deshacer"
                >
                  <Undo2 size={18} strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => onAction('correct')}
                  className="flex-1 h-14 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white rounded-xl shadow-lg shadow-green-500/30 transition-[background,box-shadow] duration-150 btn-press flex items-center justify-center"
                  title="Acierto"
                >
                  <Check size={30} strokeWidth={3} />
                </button>
                <button
                  onClick={() => onAction('incorrect')}
                  className="flex-1 h-14 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400 text-white rounded-xl shadow-lg shadow-red-500/30 transition-[background,box-shadow] duration-150 btn-press flex items-center justify-center"
                  title="Fallo"
                >
                  <X size={26} strokeWidth={3} />
                </button>
                <button
                  onClick={() => onAction('pasapalabra')}
                  className="flex-1 h-14 bg-white/10 hover:bg-white/15 text-white/80 hover:text-white rounded-xl border border-white/10 transition-[background,color] duration-150 btn-press flex items-center justify-center"
                  title="Pasapalabra"
                >
                  <SkipForward size={26} strokeWidth={2.5} />
                </button>
              </div>
            </motion.div>
          )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
