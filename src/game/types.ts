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
  roscoA: Question[];
  roscoB: Question[];
  activePlayer: 'A' | 'B';
  currentIndexA: number;
  currentIndexB: number;
  gameStarted: boolean;
  winner: string | null;
  timeLeftA: number;
  timeLeftB: number;
  isPaused: boolean;
}

export const INITIAL_TIME = 180; // 3 minutes in milliseconds

export const ALPHABET_ES = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ".split("");

