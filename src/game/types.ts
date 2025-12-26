export const STATUS = {
  PENDING: 'pending',
  CORRECT: 'correct',
  INCORRECT: 'incorrect',
  SKIPPED: 'skipped',
} as const;

export type Status = typeof STATUS[keyof typeof STATUS];

export interface Question {
  letter: string;
  answer: string;
  description: string;
  condition: string;
  status?: Status;
}

export interface GameState {
  roscos: Question[][];
  activePlayerIndex: number;
  currentIndices: number[];
  gameStarted: boolean;
  winner: string | null;
  timeLeft: number[];
  isPaused: boolean;
}

export interface PlayerStats {
  index: number;
  name: string;
  score: number;
  errors: number;
  timeLeft: number;
}

export interface LeaderboardEntry extends PlayerStats {
  rank: number;
  isTie: boolean;
}

export const INITIAL_TIME = 180000; // 3 minutes in milliseconds

export const ALPHABET_ES = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");

export const MAX_PLAYERS = 10;
export const MIN_PLAYERS = 2;

// Color palette for up to 10 players
const PLAYER_COLORS = [
  'from-blue-500 via-blue-400 to-cyan-400',      // Player 0
  'from-orange-500 via-orange-400 to-amber-400', // Player 1
  'from-purple-500 via-purple-400 to-pink-400',  // Player 2
  'from-green-500 via-green-400 to-emerald-400', // Player 3
  'from-red-500 via-red-400 to-rose-400',        // Player 4
  'from-yellow-500 via-yellow-400 to-amber-400', // Player 5
  'from-indigo-500 via-indigo-400 to-blue-400',  // Player 6
  'from-teal-500 via-teal-400 to-cyan-400',      // Player 7
  'from-pink-500 via-pink-400 to-rose-400',      // Player 8
  'from-cyan-500 via-cyan-400 to-blue-400',      // Player 9
] as const;

export const getPlayerColor = (playerIndex: number): string => {
  return PLAYER_COLORS[playerIndex % PLAYER_COLORS.length];
};

