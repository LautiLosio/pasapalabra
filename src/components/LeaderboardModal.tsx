'use client';

import { Trophy, X, Clock, Check, XCircle, Swords } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LeaderboardEntry, getPlayerColor } from '@/game/types';
import { formatTime } from '@/game/usePasapalabraGame';

/* ─────────────────────────────────────────────────────────────────────────────
   DUEL DISPLAY - Special 1v1 layout when exactly 2 players
   ───────────────────────────────────────────────────────────────────────────── */

const DuelPlayerCard = ({ 
  entry, 
  isWinner,
  isTie,
}: { 
  entry: LeaderboardEntry;
  isWinner: boolean;
  isTie: boolean;
}) => {
  const playerGradient = getPlayerColor(entry.index);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: isWinner ? 0.2 : 0.3, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`
        relative flex flex-col items-center py-4 px-3 rounded-2xl
        ${isWinner 
          ? 'bg-gradient-to-b from-yellow-500/15 to-transparent ring-1 ring-yellow-500/25' 
          : 'bg-white/5 ring-1 ring-white/10 opacity-70'}
      `}
    >
      {/* Winner crown */}
      {isWinner && !isTie && (
        <motion.div
          initial={{ scale: 0, y: 10 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 400 }}
          className="absolute -top-1 left-1/2 -translate-x-1/2"
        >
          <span className="text-3xl drop-shadow-lg">👑</span>
        </motion.div>
      )}

      {/* Loser reaction */}
      {!isWinner && !isTie && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="absolute -top-2 -right-1"
        >
          <span className="text-xl">😢</span>
        </motion.div>
      )}

      {/* Avatar */}
      <div className={`
        w-11 h-11 rounded-full bg-gradient-to-br ${playerGradient}
        flex items-center justify-center
        ${isWinner ? 'ring-2 ring-yellow-400/40' : 'ring-1 ring-white/20'}
      `}>
        <span className="text-white font-bold text-base">
          {entry.name.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Name */}
      <p className={`font-semibold text-sm truncate max-w-[90px] mt-2 ${isWinner ? 'text-white' : 'text-white/60'}`}>
        {entry.name}
      </p>

      {/* Stats */}
      <div className="flex flex-col items-center gap-1 mt-2 text-[11px]">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-0.5 text-green-400">
            <Check className="w-3 h-3" />
            <span className="font-medium">{entry.score}</span>
          </div>
          <div className="flex items-center gap-0.5 text-red-400">
            <XCircle className="w-3 h-3" />
            <span className="font-medium">{entry.errors}</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5 text-blue-400">
          <Clock className="w-3 h-3" />
          <span className="font-medium">{formatTime(entry.timeLeft)}</span>
        </div>
      </div>

      {/* Winner badge */}
      {isWinner && !isTie && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: 'spring' }}
          className="mt-3 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 text-[9px] font-bold text-yellow-900 uppercase tracking-wide"
        >
          Victoria
        </motion.div>
      )}

      {/* Tie badge */}
      {isTie && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: 'spring' }}
          className="mt-3 px-2.5 py-0.5 rounded-full bg-white/15 text-[9px] font-bold text-white/80 uppercase tracking-wide"
        >
          Empate
        </motion.div>
      )}
    </motion.div>
  );
};

const DuelDisplay = ({ leaderboard }: { leaderboard: LeaderboardEntry[] }) => {
  const [first, second] = leaderboard;
  const isTie = first.rank === second.rank;

  return (
    <div className="py-6">
      {/* Players side by side */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <DuelPlayerCard entry={first} isWinner={first.rank === 1} isTie={isTie} />
        </div>

        {/* Crossed swords */}
        <motion.div
          initial={{ scale: 0, rotate: -90 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.35, type: 'spring', stiffness: 250, damping: 15 }}
          className="flex flex-col items-center gap-0.5 px-1"
        >
          <Swords className="w-6 h-6 text-orange-400 drop-shadow-lg" />
        </motion.div>

        <div className="flex-1">
          <DuelPlayerCard entry={second} isWinner={second.rank === 1} isTie={isTie} />
        </div>
      </div>
    </div>
  );
};

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaderboard: LeaderboardEntry[];
  winner: string | null;
}

const PODIUM_CONFIG = {
  1: { 
    height: 'h-24',
    color: 'from-yellow-500 to-amber-500',
    glow: 'shadow-yellow-500/30',
    trophy: 'text-yellow-900/60',
    delay: 0.2,
    avatarSize: 'w-11 h-11',
    fontSize: 'text-base',
  },
  2: { 
    height: 'h-16',
    color: 'from-gray-400 to-gray-500',
    glow: 'shadow-gray-400/20',
    trophy: 'text-white/70',
    delay: 0.3,
    avatarSize: 'w-9 h-9',
    fontSize: 'text-sm',
  },
  3: { 
    height: 'h-12',
    color: 'from-amber-600 to-amber-700',
    glow: 'shadow-amber-600/20',
    trophy: 'text-amber-950/50',
    delay: 0.4,
    avatarSize: 'w-9 h-9',
    fontSize: 'text-sm',
  },
} as const;

interface PodiumSpotProps {
  entry: LeaderboardEntry | undefined;
  rank: 1 | 2 | 3;
  showCrown?: boolean;
}

const PodiumSpot = ({ entry, rank, showCrown }: PodiumSpotProps) => {
  const config = PODIUM_CONFIG[rank];
  const playerGradient = entry ? getPlayerColor(entry.index) : 'from-gray-600 to-gray-700';

  if (!entry) {
    return <div className="flex-1" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: config.delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center flex-1"
    >
      {/* Avatar */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: config.delay + 0.1, type: 'spring', stiffness: 300, damping: 20 }}
        className="relative mb-2"
      >
        <div className={`
          ${config.avatarSize} rounded-full 
          bg-gradient-to-br ${playerGradient}
          flex items-center justify-center
          ring-2 ring-white/20 shadow-lg ${config.glow}
        `}>
          <span className={`text-white font-bold ${config.fontSize}`}>
            {entry.name.charAt(0).toUpperCase()}
          </span>
        </div>
        {/* Crown for 1st place */}
        {showCrown && rank === 1 && (
          <motion.div
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: config.delay + 0.3, type: 'spring', stiffness: 400 }}
            className="absolute -top-3 left-1/2 -translate-x-1/2"
          >
            <span className="text-3xl drop-shadow-lg">👑</span>
          </motion.div>
        )}
      </motion.div>

      {/* Name */}
      <p className="text-white font-semibold text-sm truncate max-w-[90px] text-center mb-1">
        {entry.name}
      </p>

      {/* Stats */}
      <div className="flex flex-col items-center gap-0.5 mb-2">
        <div className="flex items-center gap-2 text-[10px]">
          <div className="flex items-center gap-0.5 text-green-400">
            <Check className="w-3 h-3" />
            <span className="font-medium">{entry.score}</span>
          </div>
          <div className="flex items-center gap-0.5 text-red-400">
            <XCircle className="w-3 h-3" />
            <span className="font-medium">{entry.errors}</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5 text-blue-400 text-[10px]">
          <Clock className="w-3 h-3" />
          <span className="font-medium">{formatTime(entry.timeLeft)}</span>
        </div>
      </div>

      {/* Podium block */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ delay: config.delay + 0.15, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{ originY: 1 }}
        className={`
          w-full ${config.height} rounded-t-xl
          bg-gradient-to-t ${config.color}
          flex items-center justify-center
          shadow-lg ${config.glow}
        `}
      >
        <Trophy className={`w-5 h-5 ${config.trophy} drop-shadow`} />
      </motion.div>
    </motion.div>
  );
};

const PodiumHero = ({ 
  podium, 
  firstWinnerIndex 
}: { 
  podium: LeaderboardEntry[];
  firstWinnerIndex: number | undefined;
}) => {
  // Get entries by rank (handling ties - take first of each rank)
  const first = podium.find(e => e.rank === 1);
  const second = podium.find(e => e.rank === 2);
  const third = podium.find(e => e.rank === 3);

  return (
    <div className="flex items-end justify-center gap-2 px-2 pt-6 pb-4">
      {/* 2nd place - left */}
      <PodiumSpot entry={second} rank={2} />
      
      {/* 1st place - center (elevated) */}
      <PodiumSpot 
        entry={first} 
        rank={1} 
        showCrown={first?.index === firstWinnerIndex}
      />
      
      {/* 3rd place - right */}
      <PodiumSpot entry={third} rank={3} />
    </div>
  );
};

const LeaderboardRow = ({ 
  entry, 
  delay,
}: { 
  entry: LeaderboardEntry; 
  delay: number;
}) => {
  const playerGradient = getPlayerColor(entry.index);
  
  return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.3 }}
        className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/8 transition-colors"
        style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.04), inset 0 -1px 1px rgba(0,0,0,0.06)' }}
      >
      {/* Rank */}
      <span className="w-6 text-center text-white/50 font-medium text-sm">
        {entry.rank}
      </span>

      {/* Avatar */}
      <div className={`
        w-8 h-8 rounded-full bg-gradient-to-br ${playerGradient}
        flex items-center justify-center flex-shrink-0
      `}>
        <span className="text-white font-semibold text-xs">
          {entry.name.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Name */}
      <span className="flex-1 text-white font-medium text-sm truncate">
        {entry.name}
        {entry.isTie && (
          <span className="text-white/40 text-xs ml-1.5">(=)</span>
        )}
      </span>

      {/* Stats */}
      <div className="flex items-center gap-2.5 text-xs">
        <div className="flex items-center gap-1 text-green-400">
          <Check className="w-3.5 h-3.5" />
          <span className="font-medium">{entry.score}</span>
        </div>
        <div className="flex items-center gap-1 text-red-400">
          <XCircle className="w-3.5 h-3.5" />
          <span className="font-medium">{entry.errors}</span>
        </div>
        <div className="flex items-center gap-1 text-blue-400 min-w-[56px] justify-end">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-medium text-[11px]">{formatTime(entry.timeLeft)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export const LeaderboardModal = ({ isOpen, onClose, leaderboard, winner }: LeaderboardModalProps) => {
  // Split into podium (ranks 1-3) and rest (rank 4+)
  const podium = leaderboard.filter(e => e.rank <= 3);
  const rest = leaderboard.filter(e => e.rank > 3);
  
  // Find first rank-1 player index to show crown only on first winner
  const firstWinnerIndex = podium.find(e => e.rank === 1)?.index;

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
            className="glass-light w-full max-w-md rounded-3xl surface-neu max-h-[85vh] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 pb-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-500 flex items-center justify-center btn-neu">
                  <Trophy size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-[family-name:var(--font-fredoka)] font-bold text-white">
                    Clasificación
                  </h2>
                  {winner && winner !== 'Empate' && (
                    <p className="text-xs text-yellow-400/80">🏆 {winner} gana!</p>
                  )}
                  {winner === 'Empate' && (
                    <p className="text-xs text-white/40">Empate</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white btn-icon"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 pb-2">
              {/* Duel Display for exactly 2 players */}
              {leaderboard.length === 2 ? (
                <DuelDisplay leaderboard={leaderboard} />
              ) : (
                /* Podium Hero Display for 3+ players */
                podium.length > 0 && (
                  <PodiumHero podium={podium} firstWinnerIndex={firstWinnerIndex} />
                )
              )}

              {/* Remaining players (rank 4+) */}
              {rest.length > 0 && (
                <div className="space-y-1.5 mt-4 pt-4 border-t border-white/10">
                  {rest.map((entry, idx) => (
                    <LeaderboardRow 
                      key={entry.index} 
                      entry={entry} 
                      delay={0.5 + idx * 0.04}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer button */}
            <div className="px-6 py-5 flex-shrink-0">
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                onClick={onClose}
                className="
                  w-full py-3.5 rounded-xl font-bold text-white
                  bg-white/12 hover:bg-white/18
                  btn-ghost
                "
              >
                Cerrar
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
