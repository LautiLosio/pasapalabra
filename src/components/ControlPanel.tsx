import { Check, X, SkipForward, Trophy, ChevronDown, ChevronUp, Pause, Play, Undo2, AlertTriangle } from 'lucide-react';
import { Question } from '@/game/types';

interface ControlPanelProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  winner: string | null;
  gameStarted: boolean;
  activePlayer: 'A' | 'B';
  currentLetterData: Question;
  isCurrentDataValid: boolean;
  isPaused: boolean;
  prevGameState: unknown;
  onPauseToggle: () => void;
  onUndo: () => void;
  onAction: (action: 'correct' | 'incorrect' | 'pasapalabra') => void;
  onReset: () => void;
}

export const ControlPanel = ({
  isCollapsed,
  onToggleCollapse,
  winner,
  gameStarted,
  activePlayer,
  currentLetterData,
  isCurrentDataValid,
  isPaused,
  prevGameState,
  onPauseToggle,
  onUndo,
  onAction,
  onReset,
}: ControlPanelProps) => {
  return (
    <section
      className={`
        w-full bg-white border-t border-slate-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-10 flex-shrink-0 relative transition-all duration-300 ease-in-out
        ${isCollapsed ? 'h-0 border-t-0' : 'h-auto'}
      `}
    >
      <button
        onClick={onToggleCollapse}
        className="absolute -top-10 right-8 bg-white text-slate-600 px-4 py-2 rounded-t-xl border-t border-x border-slate-200 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] hover:bg-slate-50 transition-colors z-20"
      >
        {isCollapsed ? (
          <>
            <ChevronUp size={16} /> Mostrar Controles
          </>
        ) : (
          <>
            <ChevronDown size={16} /> Ocultar (Modo Público)
          </>
        )}
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          isCollapsed ? 'opacity-0 invisible' : 'opacity-100 visible'
        }`}
      >
        <div className="max-w-7xl mx-auto p-4 md:p-6 w-full">
          {winner ? (
            <div className="flex items-center justify-center gap-8 animate-in slide-in-from-bottom duration-500">
              <Trophy size={48} className="text-yellow-500" />
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-slate-800">¡Juego Terminado!</h2>
                <p className="text-lg text-slate-500">
                  Ganador: <span className="text-blue-600 font-bold">{winner}</span>
                </p>
              </div>
              <button
                onClick={onReset}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition"
              >
                Nueva Partida
              </button>
            </div>
          ) : !gameStarted ? (
            <div className="text-center text-slate-400 py-4">
              <p>Presiona "Iniciar" en la barra superior para comenzar.</p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        activePlayer === 'A'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      Turno {activePlayer}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={onUndo}
                        disabled={!prevGameState}
                        className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
                          prevGameState
                            ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                            : 'bg-slate-100 text-slate-300'
                        }`}
                        title="Deshacer última acción (Z)"
                      >
                        <Undo2 size={12} strokeWidth={3} />
                      </button>
                      <button
                        onClick={onPauseToggle}
                        className={`w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
                          isPaused
                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                            : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                        }`}
                        title={isPaused ? 'Reanudar Reloj (Espacio)' : 'Pausar Reloj (Espacio)'}
                      >
                        {isPaused ? (
                          <Play size={12} fill="currentColor" />
                        ) : (
                          <Pause size={12} fill="currentColor" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center text-3xl font-bold shadow-md border-2 border-slate-200">
                    {currentLetterData.letter}
                  </div>
                </div>
              </div>

              <div className="flex-1 w-full md:w-auto relative group">
                <div className="bg-slate-50 px-6 py-3 rounded-xl border border-slate-200 flex flex-col justify-center h-full min-h-[110px]">
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        currentLetterData.condition?.includes('Contiene')
                          ? 'bg-orange-50 text-orange-600 border-orange-100'
                          : 'bg-blue-50 text-blue-600 border-blue-100'
                      }`}
                    >
                      {currentLetterData.condition || `Empieza por ${currentLetterData.letter}`}
                    </span>
                    {!isCurrentDataValid && (
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded border bg-red-100 text-red-600 border-red-200 flex items-center gap-1 animate-pulse">
                        <AlertTriangle size={10} /> Error en generación IA
                      </span>
                    )}
                  </div>
                  <p className="text-lg md:text-xl font-medium text-slate-800 leading-snug">
                    {currentLetterData.description}
                  </p>
                  <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-red-400 uppercase">Respuesta:</span>
                      <span
                        className={`text-lg font-bold tracking-tight ${
                          !isCurrentDataValid
                            ? 'text-red-500 decoration-wavy underline'
                            : 'text-slate-900'
                        }`}
                      >
                        {currentLetterData.answer}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 w-full md:w-auto flex justify-center md:justify-end">
                <div className="grid grid-cols-2 gap-2 w-full max-w-[200px] md:w-40">
                  <button
                    onClick={() => onAction('correct')}
                    className="col-span-2 h-14 bg-green-500 hover:bg-green-600 active:scale-95 text-white rounded-lg shadow-md shadow-green-100 transition-all flex items-center justify-center"
                    title="Atajo: S"
                  >
                    <Check size={32} strokeWidth={3} />
                  </button>
                  <button
                    onClick={() => onAction('incorrect')}
                    className="h-14 bg-red-500 hover:bg-red-600 active:scale-95 text-white rounded-lg shadow-md shadow-red-100 transition-all flex items-center justify-center"
                    title="Atajo: N"
                  >
                    <X size={28} strokeWidth={3} />
                  </button>
                  <button
                    onClick={() => onAction('pasapalabra')}
                    className="h-14 bg-slate-400 hover:bg-slate-500 active:scale-95 text-white rounded-lg shadow-md shadow-slate-200 transition-all flex items-center justify-center"
                    title="Atajo: P"
                  >
                    <SkipForward size={28} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

