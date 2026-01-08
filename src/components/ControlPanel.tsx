import { Check, X, SkipForward, Trophy, ChevronDown, ChevronUp, Pause, Play, Undo2, AlertTriangle, Sparkles, List } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Question, LeaderboardEntry } from '@/game/types';

interface ControlPanelProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  winner: string | null;
  leaderboard: LeaderboardEntry[] | null;
  gameStarted: boolean;
  currentLetterData: Question;
  isCurrentDataValid: boolean;
  isPaused: boolean;
  timerStartedThisTurn: boolean;
  canUndo: boolean;
  onPauseToggle: () => void;
  onUndo: () => void;
  onAction: (action: 'correct' | 'incorrect' | 'pasapalabra') => void;
  onReset: () => void;
  onShowLeaderboard: () => void;
  onStart: () => void;
  onGeneratorClick: () => void;
}

export const ControlPanel = ({
  isCollapsed,
  onToggleCollapse,
  winner,
  leaderboard,
  gameStarted,
  currentLetterData,
  isCurrentDataValid,
  isPaused,
  timerStartedThisTurn,
  canUndo,
  onPauseToggle,
  onUndo,
  onAction,
  onReset,
  onShowLeaderboard,
  onStart,
  onGeneratorClick,
}: ControlPanelProps) => {
  // Actions are disabled until timer has been started this turn
  const actionsDisabled = !timerStartedThisTurn;
  return (
    <section
      className="w-full glass z-10 flex-shrink-0 relative"
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
          btn-ghost z-20
        "
        title={isCollapsed ? 'Mostrar Respuestas (I)' : 'Ocultar Respuestas (I)'}
      >
        {isCollapsed ? (
          <>
            <ChevronUp size={16} /> Mostrar Respuestas
          </>
        ) : (
          <>
            <ChevronDown size={16} /> Ocultar Respuestas
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
            {leaderboard && leaderboard.length > 0 ? (
              // Winner state - compact display with button to see full leaderboard
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
                    {winner && (
                      <p className="text-base md:text-lg text-white/60">
                        {winner === 'Empate' ? (
                          <span className="font-bold text-yellow-400">Empate</span>
                        ) : (
                          <>
                            Ganador:{' '}
                            <span className="font-bold text-yellow-400">
                              {winner}
                            </span>
                          </>
                        )}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={onShowLeaderboard}
                    className="
                      bg-white/10 hover:bg-white/15
                      text-white px-4 py-2.5 md:px-5 md:py-3 rounded-xl font-semibold text-sm md:text-base
                      btn-ghost flex items-center gap-2
                    "
                  >
                    <List size={18} /> Ver Clasificación
                  </motion.button>
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
                      text-white px-4 py-2.5 md:px-5 md:py-3 rounded-xl font-bold text-sm md:text-base
                      btn-primary flex items-center gap-2
                    "
                  >
                    <Sparkles size={18} /> Nueva Partida
                  </motion.button>
                </div>
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
                <p className="text-lg flex items-center justify-center gap-2 flex-wrap">
                  Presiona{' '}
                  <button
                    onClick={onStart}
                    className="
                      flex items-center gap-2 
                      bg-gradient-to-r from-green-500 to-emerald-500 
                      hover:from-green-400 hover:to-emerald-400
                      px-4 py-2.5 rounded-xl font-bold text-white text-sm md:text-base
                      btn-primary
                    "
                  >
                    <Play size={18} fill="currentColor" /> 
                    <span className="hidden sm:inline">Iniciar</span>
                  </button>{' '}
                  para comenzar la partida o{' '}
                  <button
                    onClick={onGeneratorClick}
                    className="
                      flex items-center gap-2 
                      bg-gradient-to-r from-purple-600 to-pink-600 
                      hover:from-purple-500 hover:to-pink-500
                      px-4 py-2.5 rounded-xl text-sm md:text-base font-bold text-white
                      btn-primary
                    "
                  >
                    <Sparkles size={18} className="text-yellow-200" />
                    <span className="inline">Genera preguntas</span>
                  </button>{' '}
                  antes de jugar
                </p>
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
                    w-full h-11 flex items-center justify-center rounded-lg btn-tinted
                    ${isPaused
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                    }
                  `}
                  title={isPaused ? 'Reanudar (Espacio)' : 'Pausar (Espacio)'}
                >
                  {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
                </button>
                <button
                  onClick={onUndo}
                  disabled={!canUndo}
                  className={`
                    w-full h-11 flex items-center justify-center rounded-lg btn-ghost
                    ${canUndo
                      ? 'bg-white/12 text-white/70 hover:bg-white/18 hover:text-white'
                      : 'bg-white/5 text-white/20'
                    }
                  `}
                  title="Deshacer (Z)"
                >
                  <Undo2 size={18} strokeWidth={2.5} />
                </button>
              </div>

              {/* Question card - full width on mobile, flex-1 on desktop */}
              <div className="flex-1 order-1 md:order-none">
                <div className="glass-light rounded-xl px-3 py-2 md:px-4 md:py-3 min-h-[80px] md:h-[125px] flex flex-col overflow-hidden">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={`
                        text-[10px] font-bold uppercase px-2 py-0.5 rounded-md
                        ${currentLetterData.condition?.includes('Contiene')
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-blue-500/20 text-blue-400'
                        }
                      `}
                      style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.08), inset 0 -1px 1px rgba(0,0,0,0.1)' }}
                    >
                      {currentLetterData.condition || `Empieza por ${currentLetterData.letter}`}
                    </span>
                    {!isCurrentDataValid && (
                      <span 
                        className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 flex items-center gap-1 animate-pulse"
                        style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.08), inset 0 -1px 1px rgba(0,0,0,0.1)' }}
                      >
                        <AlertTriangle size={10} /> Error IA
                      </span>
                    )}
                  </div>
                  <div className="flex-1 flex items-center justify-center min-h-[2.5em] md:min-h-[3em]">
                    <p className="text-sm md:text-lg font-medium text-white leading-relaxed break-words text-wrap w-full">
                      {currentLetterData.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-red-400/80 uppercase tracking-wide">Respuesta:</span>
                    <span className={`text-sm md:text-base font-bold tracking-tight ${!isCurrentDataValid ? 'text-red-400 decoration-wavy underline' : 'text-white'}`}>
                      {currentLetterData.answer}
                    </span>
                  </div>
                </div>
              </div>

              {/* Desktop: Right action buttons in grid */}
              <div className={`hidden md:grid grid-cols-2 gap-1.5 flex-shrink-0 w-32 transition-opacity duration-200 ${actionsDisabled ? 'opacity-40 pointer-events-none' : ''}`}>
                <button
                  onClick={() => onAction('correct')}
                  disabled={actionsDisabled}
                  className="col-span-2 h-11 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white rounded-lg btn-primary flex items-center justify-center"
                  title={actionsDisabled ? 'Inicia el temporizador primero' : 'Acierto (→)'}
                >
                  <Check size={26} strokeWidth={3} />
                </button>
                <button
                  onClick={() => onAction('incorrect')}
                  disabled={actionsDisabled}
                  className="h-11 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400 text-white rounded-lg btn-primary flex items-center justify-center"
                  title={actionsDisabled ? 'Inicia el temporizador primero' : 'Fallo (←)'}
                >
                  <X size={22} strokeWidth={3} />
                </button>
                <button
                  onClick={() => onAction('pasapalabra')}
                  disabled={actionsDisabled}
                  className="h-11 bg-white/10 hover:bg-white/15 text-white/80 hover:text-white rounded-lg btn-ghost flex items-center justify-center"
                  title={actionsDisabled ? 'Inicia el temporizador primero' : 'Pasapalabra (↓)'}
                >
                  <SkipForward size={22} strokeWidth={2.5} />
                </button>
              </div>

              {/* Mobile: All controls in one row */}
              <div className="flex md:hidden items-center gap-2 order-2 justify-center">
                <button
                  onClick={onPauseToggle}
                  className={`
                    flex-1 h-14 flex items-center justify-center rounded-xl btn-tinted
                    ${isPaused
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                    }
                  `}
                  title={isPaused ? 'Reanudar' : 'Pausar'}
                >
                  {isPaused ? <Play size={22} fill="currentColor" /> : <Pause size={22} fill="currentColor" />}
                </button>
                <button
                  onClick={onUndo}
                  disabled={!canUndo}
                  className={`
                    flex-1 h-14 flex items-center justify-center rounded-xl btn-ghost
                    ${canUndo
                      ? 'bg-white/12 text-white/70 hover:bg-white/18 hover:text-white'
                      : 'bg-white/5 text-white/20'
                    }
                  `}
                  title="Deshacer"
                >
                  <Undo2 size={18} strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => onAction('correct')}
                  disabled={actionsDisabled}
                  className={`flex-1 h-14 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white rounded-xl btn-primary flex items-center justify-center ${actionsDisabled ? 'opacity-40' : ''}`}
                  title={actionsDisabled ? 'Inicia el temporizador primero' : 'Acierto'}
                >
                  <Check size={30} strokeWidth={3} />
                </button>
                <button
                  onClick={() => onAction('incorrect')}
                  disabled={actionsDisabled}
                  className={`flex-1 h-14 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400 text-white rounded-xl btn-primary flex items-center justify-center ${actionsDisabled ? 'opacity-40' : ''}`}
                  title={actionsDisabled ? 'Inicia el temporizador primero' : 'Fallo'}
                >
                  <X size={26} strokeWidth={3} />
                </button>
                <button
                  onClick={() => onAction('pasapalabra')}
                  disabled={actionsDisabled}
                  className={`flex-1 h-14 bg-white/10 hover:bg-white/15 text-white/80 hover:text-white rounded-xl btn-ghost flex items-center justify-center ${actionsDisabled ? 'opacity-40' : ''}`}
                  title={actionsDisabled ? 'Inicia el temporizador primero' : 'Pasapalabra'}
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
