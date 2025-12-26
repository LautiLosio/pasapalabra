'use client';

import { useState, useEffect, useCallback } from 'react';
import { Question, STATUS, INITIAL_TIME, GameState } from './types';
import { INITIAL_STATE, DEFAULT_QUESTIONS_A, DEFAULT_QUESTIONS_B } from './defaultQuestions';
import { validateItem } from './validation';
import { playSound } from './sound';

export const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const centis = Math.floor((milliseconds % 1000) / 10);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centis.toString().padStart(2, '0')}`;
};

const findNextIndex = (list: Question[], startIndex: number): number => {
  let nextIndex = (startIndex + 1) % list.length;
  let loopCount = 0;
  while (
    (list[nextIndex].status === STATUS.CORRECT || list[nextIndex].status === STATUS.INCORRECT) 
    && loopCount < list.length
  ) {
    nextIndex = (nextIndex + 1) % list.length;
    loopCount++;
  }
  if (loopCount >= list.length && (list[startIndex].status === STATUS.CORRECT || list[startIndex].status === STATUS.INCORRECT)) {
    return -1;
  }
  return nextIndex;
};

export const usePasapalabraGame = () => {
  const [sourceData, setSourceData] = useState<{ A: Question[]; B: Question[] }>({
    A: DEFAULT_QUESTIONS_A,
    B: DEFAULT_QUESTIONS_B,
  });
  const [roscoA, setRoscoA] = useState<Question[]>(INITIAL_STATE(DEFAULT_QUESTIONS_A));
  const [roscoB, setRoscoB] = useState<Question[]>(INITIAL_STATE(DEFAULT_QUESTIONS_B));
  const [activePlayer, setActivePlayer] = useState<'A' | 'B'>('A');
  const [currentIndexA, setCurrentIndexA] = useState(0);
  const [currentIndexB, setCurrentIndexB] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [timeLeftA, setTimeLeftA] = useState(INITIAL_TIME);
  const [timeLeftB, setTimeLeftB] = useState(INITIAL_TIME);
  const [isPaused, setIsPaused] = useState(true);
  const [prevGameState, setPrevGameState] = useState<GameState | null>(null);
  const [playerNames, setPlayerNames] = useState<{ A: string; B: string }>({
    A: 'Jugador A',
    B: 'Jugador B',
  });
  const [winningReason, setWinningReason] = useState<string | null>(null);

  const currentRosco = activePlayer === 'A' ? roscoA : roscoB;
  const currentIndex = activePlayer === 'A' ? currentIndexA : currentIndexB;
  const currentLetterData = currentRosco[currentIndex];
  const isCurrentDataValid = validateItem(currentLetterData);

  const checkWinner = useCallback((rosco1: Question[], rosco2: Question[]) => {
    const isFinished1 = findNextIndex(rosco1, 0) === -1;
    const isFinished2 = findNextIndex(rosco2, 0) === -1;
    if (isFinished1 && isFinished2) {
      // rosco1 is always A's rosco, rosco2 is always B's rosco
      const roscoAUpdated = rosco1;
      const roscoBUpdated = rosco2;
      
      const scoreA = roscoAUpdated.filter(r => r.status === STATUS.CORRECT).length;
      const scoreB = roscoBUpdated.filter(r => r.status === STATUS.CORRECT).length;
      if (scoreA > scoreB) {
        setWinner(playerNames.A);
        setWinningReason(`Más aciertos (${scoreA} vs ${scoreB})`);
      } else if (scoreB > scoreA) {
        setWinner(playerNames.B);
        setWinningReason(`Más aciertos (${scoreB} vs ${scoreA})`);
      } else {
        // Tiebreaker 1: player with fewer errors wins
        const errorsA = roscoAUpdated.filter(r => r.status === STATUS.INCORRECT).length;
        const errorsB = roscoBUpdated.filter(r => r.status === STATUS.INCORRECT).length;
        
        if (errorsA < errorsB) {
          setWinner(playerNames.A);
          setWinningReason(`Empate en aciertos (${scoreA}), pero menos errores (${errorsA} vs ${errorsB})`);
        } else if (errorsB < errorsA) {
          setWinner(playerNames.B);
          setWinningReason(`Empate en aciertos (${scoreB}), pero menos errores (${errorsB} vs ${errorsA})`);
        } else {
          // Tiebreaker 2: player with more remaining time wins
          if (timeLeftA > timeLeftB) {
            setWinner(playerNames.A);
            setWinningReason(`Empate en aciertos (${scoreA}) y errores (${errorsA}), pero menos tiempo usado`);
          } else if (timeLeftB > timeLeftA) {
            setWinner(playerNames.B);
            setWinningReason(`Empate en aciertos (${scoreB}) y errores (${errorsB}), pero menos tiempo usado`);
          } else {
            setWinner('Empate');
            setWinningReason(`${scoreA} aciertos, ${errorsA} errores y mismo tiempo`);
          }
        }
      }
      if (soundEnabled) playSound('win');
    }
  }, [soundEnabled, playerNames, timeLeftA, timeLeftB]);

  const handleAction = useCallback((action: 'correct' | 'incorrect' | 'pasapalabra') => {
    const activePlayerTime = activePlayer === 'A' ? timeLeftA : timeLeftB;
    if (!gameStarted || winner || activePlayerTime <= 0) return;

    // Reproducir sonido
    if (soundEnabled) {
      if (action === 'correct') playSound('correct');
      else if (action === 'incorrect') playSound('incorrect');
      else if (action === 'pasapalabra') playSound('pasapalabra');
    }

    // Guardar estado para undo
    setPrevGameState({
      roscoA: roscoA.map(item => ({ ...item })),
      roscoB: roscoB.map(item => ({ ...item })),
      activePlayer,
      currentIndexA,
      currentIndexB,
      timeLeftA,
      timeLeftB,
      winner,
      gameStarted,
      isPaused,
    });

    const newRosco = activePlayer === 'A' ? [...roscoA] : [...roscoB];
    const currentIdx = activePlayer === 'A' ? currentIndexA : currentIndexB;

    newRosco[currentIdx] = { ...newRosco[currentIdx] };

    if (action === 'correct') newRosco[currentIdx].status = STATUS.CORRECT;
    else if (action === 'incorrect') newRosco[currentIdx].status = STATUS.INCORRECT;
    else if (action === 'pasapalabra') newRosco[currentIdx].status = STATUS.SKIPPED;

    if (activePlayer === 'A') setRoscoA(newRosco);
    else setRoscoB(newRosco);

    const nextIndex = findNextIndex(newRosco, currentIdx);

    if (nextIndex === -1) {
      const nextPlayer = activePlayer === 'A' ? 'B' : 'A';
      setActivePlayer(nextPlayer);
      setIsPaused(true);
      // Pass the updated rosco for the current player and the current state for the other player
      const roscoAForCheck = activePlayer === 'A' ? newRosco : roscoA;
      const roscoBForCheck = activePlayer === 'A' ? roscoB : newRosco;
      checkWinner(roscoAForCheck, roscoBForCheck);
    } else {
      if (action === 'correct') {
        if (activePlayer === 'A') setCurrentIndexA(nextIndex);
        else setCurrentIndexB(nextIndex);
      } else {
        // Incorrecto o Pasapalabra
        const otherPlayer = activePlayer === 'A' ? 'B' : 'A';
        const otherRosco = activePlayer === 'A' ? roscoB : roscoA;
        const otherIndex = activePlayer === 'A' ? currentIndexB : currentIndexA;
        const otherPlayerTime = activePlayer === 'A' ? timeLeftB : timeLeftA;

        const nextIndexOther = findNextIndex(otherRosco, otherIndex - 1);

        // Avanzamos el índice del jugador actual
        if (activePlayer === 'A') setCurrentIndexA(nextIndex);
        else setCurrentIndexB(nextIndex);

        // Si el OTRO jugador tiene índice válido Y TIENE TIEMPO, cambiamos.
        if (nextIndexOther !== -1 && otherPlayerTime > 0) {
          setActivePlayer(otherPlayer);
          setIsPaused(true);
        } else {
          setIsPaused(true);
        }
      }
    }
  }, [gameStarted, winner, activePlayer, roscoA, roscoB, currentIndexA, currentIndexB, timeLeftA, timeLeftB, soundEnabled, checkWinner, isPaused]);

  const handleUndo = useCallback(() => {
    if (!prevGameState) return;

    setRoscoA(prevGameState.roscoA);
    setRoscoB(prevGameState.roscoB);
    setActivePlayer(prevGameState.activePlayer);
    setCurrentIndexA(prevGameState.currentIndexA);
    setCurrentIndexB(prevGameState.currentIndexB);
    setTimeLeftA(prevGameState.timeLeftA);
    setTimeLeftB(prevGameState.timeLeftB);
    setWinner(prevGameState.winner);
    setGameStarted(prevGameState.gameStarted);
    setIsPaused(true);
    setPrevGameState(null);
  }, [prevGameState]);

  const resetGame = useCallback(() => {
    setRoscoA(INITIAL_STATE(sourceData.A));
    setRoscoB(INITIAL_STATE(sourceData.B));
    setCurrentIndexA(0);
    setCurrentIndexB(0);
    setActivePlayer('A');
    setWinner(null);
    setWinningReason(null);
    setGameStarted(true);
    setIsPanelCollapsed(false);
    setTimeLeftA(INITIAL_TIME);
    setTimeLeftB(INITIAL_TIME);
    setIsPaused(true);
    setPrevGameState(null);
  }, [sourceData]);

  const updateSourceData = useCallback((newData: { A: Question[]; B: Question[] }) => {
    setSourceData(newData);
    setRoscoA(INITIAL_STATE(newData.A));
    setRoscoB(INITIAL_STATE(newData.B));
    setCurrentIndexA(0);
    setCurrentIndexB(0);
    setActivePlayer('A');
    setWinner(null);
    setWinningReason(null);
    setGameStarted(true);
    setTimeLeftA(INITIAL_TIME);
    setTimeLeftB(INITIAL_TIME);
    setIsPaused(true);
    setPrevGameState(null);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      const key = e.key.toLowerCase();

      if (key === ' ') {
        e.preventDefault();
        setIsPaused(prev => !prev);
      } else if (key === 's') {
        handleAction('correct');
      } else if (key === 'n') {
        handleAction('incorrect');
      } else if (key === 'p') {
        handleAction('pasapalabra');
      } else if (key === 'z' || key === 'backspace') {
        if (prevGameState) {
          e.preventDefault();
          handleUndo();
        }
      } else if (key === 'o') {
        e.preventDefault();
        setIsPanelCollapsed(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleAction, handleUndo, prevGameState]);

  // Handle time running out for a player
  const handleTimeOut = useCallback((timedOutPlayer: 'A' | 'B') => {
    const otherPlayer = timedOutPlayer === 'A' ? 'B' : 'A';
    const otherTime = timedOutPlayer === 'A' ? timeLeftB : timeLeftA;
    const otherRosco = timedOutPlayer === 'A' ? roscoB : roscoA;
    const otherIndex = timedOutPlayer === 'A' ? currentIndexB : currentIndexA;
    const hasQuestionsLeft = findNextIndex(otherRosco, otherIndex - 1) !== -1;

    if (otherTime > 0 && hasQuestionsLeft) {
      // Switch to other player
      setActivePlayer(otherPlayer);
      setIsPaused(true);
    } else {
      // Both players are done - determine winner
      const scoreA = roscoA.filter(r => r.status === STATUS.CORRECT).length;
      const scoreB = roscoB.filter(r => r.status === STATUS.CORRECT).length;
      
      if (scoreA > scoreB) {
        setWinner(playerNames.A);
        setWinningReason(`Más aciertos (${scoreA} vs ${scoreB})`);
      } else if (scoreB > scoreA) {
        setWinner(playerNames.B);
        setWinningReason(`Más aciertos (${scoreB} vs ${scoreA})`);
      } else {
        // Tiebreaker 1: player with fewer errors wins
        const errorsA = roscoA.filter(r => r.status === STATUS.INCORRECT).length;
        const errorsB = roscoB.filter(r => r.status === STATUS.INCORRECT).length;
        
        if (errorsA < errorsB) {
          setWinner(playerNames.A);
          setWinningReason(`Empate en aciertos (${scoreA}), pero menos errores (${errorsA} vs ${errorsB})`);
        } else if (errorsB < errorsA) {
          setWinner(playerNames.B);
          setWinningReason(`Empate en aciertos (${scoreB}), pero menos errores (${errorsB} vs ${errorsA})`);
        } else {
          // Both tied on score and errors - it's a draw
          // (time comparison is unreliable when both ran out of time)
          setWinner('Empate');
          setWinningReason(`${scoreA} aciertos y ${errorsA} errores`);
        }
      }
      if (soundEnabled) playSound('win');
    }
  }, [timeLeftA, timeLeftB, roscoA, roscoB, currentIndexA, currentIndexB, playerNames, soundEnabled]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    const isRunning = gameStarted && !winner && !isPaused && !isPanelCollapsed;

    if (isRunning) {
      interval = setInterval(() => {
        if (activePlayer === 'A') {
          setTimeLeftA(prev => {
            const newTime = Math.max(0, prev - 10);
            if (newTime === 0 && prev > 0) {
              // Time just ran out - schedule timeout handling
              setTimeout(() => handleTimeOut('A'), 0);
            }
            return newTime;
          });
        } else {
          setTimeLeftB(prev => {
            const newTime = Math.max(0, prev - 10);
            if (newTime === 0 && prev > 0) {
              // Time just ran out - schedule timeout handling
              setTimeout(() => handleTimeOut('B'), 0);
            }
            return newTime;
          });
        }
      }, 10);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStarted, winner, isPaused, isPanelCollapsed, activePlayer, handleTimeOut]);

  return {
    roscoA,
    roscoB,
    activePlayer,
    currentIndexA,
    currentIndexB,
    gameStarted,
    winner,
    winningReason,
    isPanelCollapsed,
    soundEnabled,
    timeLeftA,
    timeLeftB,
    isPaused,
    prevGameState,
    currentLetterData,
    isCurrentDataValid,
    playerNames,
    setIsPanelCollapsed,
    setSoundEnabled,
    setIsPaused,
    setPlayerNames,
    handleAction,
    handleUndo,
    resetGame,
    updateSourceData,
  };
};

