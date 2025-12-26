'use client';

import { Trophy, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LeaderboardEntry } from '@/game/types';
import { formatTime } from '@/game/usePasapalabraGame';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaderboard: LeaderboardEntry[];
  winner: string | null;
}

export const LeaderboardModal = ({ isOpen, onClose, leaderboard, winner }: LeaderboardModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="glass-light w-full max-w-2xl rounded-2xl md:rounded-3xl p-3 md:p-6 shadow-2xl shadow-blue-500/10 max-h-[90vh] md:max-h-[85vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center shadow-lg shadow-yellow-500/30 flex-shrink-0">
                  <Trophy size={20} className="md:w-6 md:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base md:text-xl font-[family-name:var(--font-fredoka)] font-bold text-white truncate">
                    Clasificación Final
                  </h2>
                  {winner && (
                    <p className="text-xs md:text-sm text-white/60 truncate">
                      {winner === 'Empate' ? 'Empate' : `Ganador: ${winner}`}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/15 flex items-center justify-center text-white/60 hover:text-white transition-colors flex-shrink-0 ml-2"
              >
                <X size={18} />
              </button>
            </div>

            {/* Leaderboard */}
            <div className="space-y-2">
              {leaderboard.map((entry, idx) => {
                const isFirst = entry.rank === 1 && !entry.isTie;
                const medalColors = [
                  'text-yellow-400', // Gold
                  'text-gray-300',   // Silver
                  'text-amber-600',  // Bronze
                ];
                const medalColor = medalColors[entry.rank - 1] || 'text-white/40';
                
                return (
                  <motion.div
                    key={entry.index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * idx, duration: 0.3 }}
                    className={`
                      glass-light rounded-lg px-2 md:px-4 py-2 md:py-3
                      flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4
                      ${isFirst ? 'ring-2 ring-yellow-400/50' : ''}
                    `}
                  >
                    {/* Rank and Player name row */}
                    <div className="flex items-center justify-start gap-2 md:gap-4 w-full md:w-auto">
                      {/* Rank */}
                      <div className="flex-shrink-0 w-8 md:w-10 flex items-center justify-center">
                        {entry.rank <= 3 && !entry.isTie ? (
                          <Trophy 
                            className={`w-6 h-6 md:w-7 md:h-7 ${medalColor}`} 
                            color="currentColor"
                            strokeWidth={1.5}
                          />
                        ) : (
                          <span className={`
                            text-lg md:text-xl font-bold
                            ${isFirst ? 'text-yellow-400' : 'text-white/60'}
                          `}>
                            {entry.rank}
                          </span>
                        )}
                      </div>
                      
                      {/* Player name */}
                      <div className="flex-1 min-w-0 md:min-w-0">
                        <p className={`
                          text-base md:text-lg font-semibold text-left
                          ${isFirst ? 'text-yellow-400' : 'text-white'}
                        `}>
                          {entry.name}
                          {entry.isTie && (
                            <span className="text-white/50 text-xs md:text-sm ml-1 md:ml-2">(Empate)</span>
                          )}
                        </p>
                      </div>
                    </div>
                    
                    {/* Stats - centered on mobile, left-aligned on desktop */}
                    <div className="flex items-center gap-4 md:gap-6 text-sm md:text-base w-full md:w-auto justify-center md:justify-start">
                      <div className="text-center flex-1 md:flex-none md:min-w-[70px]">
                        <div className="text-white/60 text-xs md:text-sm mb-1">Aciertos</div>
                        <div className="font-bold text-green-400 text-lg md:text-xl">{entry.score}</div>
                      </div>
                      <div className="text-center flex-1 md:flex-none md:min-w-[70px]">
                        <div className="text-white/60 text-xs md:text-sm mb-1">Errores</div>
                        <div className="font-bold text-red-400 text-lg md:text-xl">{entry.errors}</div>
                      </div>
                      <div className="text-center flex-1 md:flex-none md:min-w-[90px]">
                        <div className="text-white/60 text-xs md:text-sm mb-1">Tiempo</div>
                        <div className="font-bold text-blue-400 text-sm md:text-base">
                          {formatTime(entry.timeLeft)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

