"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useImmer } from "use-immer";
import {
  Question,
  STATUS,
  INITIAL_TIME,
  GameState,
  MAX_PLAYERS,
  MIN_PLAYERS,
  LeaderboardEntry,
} from "./types";
import {
  INITIAL_STATE,
  DEFAULT_QUESTIONS_A,
  DEFAULT_QUESTIONS_B,
  getDefaultQuestionsForPlayers,
} from "./defaultQuestions";
import { validateItem } from "./validation";
import { playSound } from "./sound";

const MAX_HISTORY_SIZE = 50;

export const formatTime = (milliseconds: number): string => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const centis = Math.floor((milliseconds % 1000) / 10);
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}.${centis.toString().padStart(2, "0")}`;
};

const findNextIndex = (list: Question[], startIndex: number): number => {
  let nextIndex = (startIndex + 1) % list.length;
  let loopCount = 0;
  while (
    (list[nextIndex].status === STATUS.CORRECT ||
      list[nextIndex].status === STATUS.INCORRECT) &&
    loopCount < list.length
  ) {
    nextIndex = (nextIndex + 1) % list.length;
    loopCount++;
  }
  if (
    loopCount >= list.length &&
    (list[startIndex].status === STATUS.CORRECT ||
      list[startIndex].status === STATUS.INCORRECT)
  ) {
    return -1;
  }
  return nextIndex;
};

interface UsePasapalabraGameOptions {
  onIllegalAction?: (message: string) => void;
}

export const usePasapalabraGame = (options?: UsePasapalabraGameOptions) => {
  const { onIllegalAction } = options || {};
  const initialPlayerNames = ["Jugador 1", "Jugador 2"];
  const initialSourceData = [DEFAULT_QUESTIONS_A, DEFAULT_QUESTIONS_B];

  const [sourceData, setSourceData] = useImmer<Question[][]>(initialSourceData);
  const [roscos, setRoscos] = useImmer<Question[][]>([
    INITIAL_STATE(DEFAULT_QUESTIONS_A),
    INITIAL_STATE(DEFAULT_QUESTIONS_B),
  ]);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [currentIndices, setCurrentIndices] = useImmer<number[]>([0, 0]);
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[] | null>(
    null
  );
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [initialTime, setInitialTime] = useState(INITIAL_TIME);
  const [timeLeft, setTimeLeft] = useImmer<number[]>([
    INITIAL_TIME,
    INITIAL_TIME,
  ]);
  const [isPaused, setIsPaused] = useState(true);
  const [gameHistory, setGameHistory] = useImmer<GameState[]>([]);
  const [playerNames, setPlayerNames] = useImmer<string[]>(initialPlayerNames);
  const [winningReason, setWinningReason] = useState<string | null>(null);
  // Tracks if timer has been started at least once this turn (resets on player change)
  const [timerStartedThisTurn, setTimerStartedThisTurn] = useState(false);

  const currentRosco = roscos[activePlayerIndex] || [];
  const currentIndex = currentIndices[activePlayerIndex] || 0;
  const currentLetterData = currentRosco[currentIndex];
  const isCurrentDataValid = validateItem(currentLetterData);

  const checkWinner = useCallback(
    (currentRoscos: Question[][], currentTimeLeft: number[]) => {
      // Check if all players have finished (either completed all letters OR ran out of time)
      const allFinished = currentRoscos.every((rosco, index) => {
        const hasNoTimeLeft = currentTimeLeft[index] <= 0;
        const hasCompletedAllLetters = findNextIndex(rosco, 0) === -1;
        return hasNoTimeLeft || hasCompletedAllLetters;
      });

      if (!allFinished) return;

      // Calculate scores for all players
      const playerStats = currentRoscos.map((rosco, index) => ({
        index,
        name: playerNames[index] || `Jugador ${index + 1}`,
        score: rosco.filter((r) => r.status === STATUS.CORRECT).length,
        errors: rosco.filter((r) => r.status === STATUS.INCORRECT).length,
        timeLeft: currentTimeLeft[index] || 0,
      }));

      // Sort by score (descending), then errors (ascending), then timeLeft (descending)
      const sorted = [...playerStats].sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        if (a.errors !== b.errors) return a.errors - b.errors;
        return b.timeLeft - a.timeLeft;
      });

      // Build leaderboard with ranks and tie detection
      const leaderboardEntries: LeaderboardEntry[] = [];
      let currentRank = 1;

      for (let i = 0; i < sorted.length; i++) {
        const current = sorted[i];
        const prev = i > 0 ? sorted[i - 1] : null;

        // Check if this player is tied with the previous one
        const isTie =
          prev !== null &&
          current.score === prev.score &&
          current.errors === prev.errors &&
          current.timeLeft === prev.timeLeft;

        // If tied, use same rank as previous, otherwise increment rank
        if (!isTie && i > 0) {
          currentRank = i + 1;
        }

        leaderboardEntries.push({
          ...current,
          rank: currentRank,
          isTie,
        });
      }

      setLeaderboard(leaderboardEntries);

      // Set winner for backward compatibility (first place or tie)
      const winnerStats = sorted[0];
      const isTie =
        sorted.length > 1 &&
        sorted[0].score === sorted[1].score &&
        sorted[0].errors === sorted[1].errors &&
        sorted[0].timeLeft === sorted[1].timeLeft;

      if (isTie) {
        const tiedPlayers = sorted.filter(
          (p) =>
            p.score === winnerStats.score &&
            p.errors === winnerStats.errors &&
            p.timeLeft === winnerStats.timeLeft
        );

        if (tiedPlayers.length === currentRoscos.length) {
          setWinner("Empate");
          setWinningReason(
            `${winnerStats.score} aciertos, ${winnerStats.errors} errores y mismo tiempo`
          );
        } else {
          const names = tiedPlayers.map((p) => p.name).join(", ");
          setWinner(names);
          setWinningReason(
            `Empate entre ${names} (${winnerStats.score} aciertos, ${winnerStats.errors} errores)`
          );
        }
      } else {
        setWinner(winnerStats.name);
        setWinningReason(`Más aciertos (${winnerStats.score})`);
      }

      if (soundEnabled) playSound("win");
    },
    [soundEnabled, playerNames]
  );

  const findNextAvailablePlayer = useCallback(
    (startIndex: number): number | null => {
      const playerCount = roscos.length;
      for (let i = 1; i < playerCount; i++) {
        const nextIndex = (startIndex + i) % playerCount;
        const nextRosco = roscos[nextIndex];
        const nextPlayerIndex = currentIndices[nextIndex];
        const nextPlayerTime = timeLeft[nextIndex];

        if (
          nextPlayerTime > 0 &&
          findNextIndex(nextRosco, nextPlayerIndex - 1) !== -1
        ) {
          return nextIndex;
        }
      }
      return null;
    },
    [roscos, currentIndices, timeLeft]
  );

  const handleAction = useCallback(
    (action: "correct" | "incorrect" | "pasapalabra") => {
      const activePlayerTime = timeLeft[activePlayerIndex];
      if (!gameStarted || winner || activePlayerTime <= 0) return;

      // Block actions if timer hasn't been started this turn
      if (!timerStartedThisTurn) {
        onIllegalAction?.("Inicia el temporizador primero");
        return;
      }

      // Reproducir sonido
      if (soundEnabled) {
        if (action === "correct") playSound("correct");
        else if (action === "incorrect") playSound("incorrect");
        else if (action === "pasapalabra") playSound("pasapalabra");
      }

      const currentIdx = currentIndices[activePlayerIndex];

      // Push current state to history (antes de modificar)
      setGameHistory((draft) => {
        draft.push({
          roscos: roscos.map((rosco) => rosco.map((item) => ({ ...item }))),
          activePlayerIndex,
          currentIndices: [...currentIndices],
          timeLeft: [...timeLeft],
          winner,
          gameStarted,
          isPaused,
        });
        // Limit history size
        if (draft.length > MAX_HISTORY_SIZE) {
          draft.shift();
        }
      });

      // Calculate updated roscos BEFORE updating state (for checkWinner)
      const updatedRoscos: Question[][] = roscos.map((rosco, idx) =>
        idx === activePlayerIndex
          ? rosco.map((item, i) =>
              i === currentIdx
                ? {
                    ...item,
                    status:
                      action === "correct"
                        ? STATUS.CORRECT
                        : action === "incorrect"
                        ? STATUS.INCORRECT
                        : STATUS.SKIPPED,
                  }
                : item
            )
          : rosco
      );

      // Update roscos array using immer - much simpler!
      setRoscos((draft) => {
        if (action === "correct")
          draft[activePlayerIndex][currentIdx].status = STATUS.CORRECT;
        else if (action === "incorrect")
          draft[activePlayerIndex][currentIdx].status = STATUS.INCORRECT;
        else if (action === "pasapalabra")
          draft[activePlayerIndex][currentIdx].status = STATUS.SKIPPED;
      });

      const nextIndex = findNextIndex(
        updatedRoscos[activePlayerIndex],
        currentIdx
      );

      if (nextIndex === -1) {
        // Current player finished, find next available player
        const nextPlayer = findNextAvailablePlayer(activePlayerIndex);
        if (nextPlayer !== null) {
          setActivePlayerIndex(nextPlayer);
          setIsPaused(true);
          setTimerStartedThisTurn(false);
        } else {
          // All players finished - check winner with current timeLeft state
          checkWinner(updatedRoscos, timeLeft);
        }
      } else {
        // Update current player's index using immer
        setCurrentIndices((draft) => {
          draft[activePlayerIndex] = nextIndex;
        });

        if (action !== "correct") {
          // Incorrecto o Pasapalabra - rotate to next available player

          const nextPlayer = findNextAvailablePlayer(activePlayerIndex);
          if (nextPlayer !== null) {
            setActivePlayerIndex(nextPlayer);
            setIsPaused(true);
            setTimerStartedThisTurn(false);
          } else {
            // Check if game is finished - check winner with current timeLeft state
            checkWinner(updatedRoscos, timeLeft);
          }
        }
      }
    },
    [
      gameStarted,
      winner,
      activePlayerIndex,
      roscos,
      currentIndices,
      timeLeft,
      soundEnabled,
      checkWinner,
      isPaused,
      findNextAvailablePlayer,
      setRoscos,
      setCurrentIndices,
      setGameHistory,
      timerStartedThisTurn,
      onIllegalAction,
    ]
  );

  const handleUndo = useCallback(() => {
    if (gameHistory.length === 0) return;

    const prevState = gameHistory[gameHistory.length - 1];

    setRoscos(
      prevState.roscos.map((rosco) => rosco.map((item) => ({ ...item })))
    );
    setActivePlayerIndex(prevState.activePlayerIndex);
    setCurrentIndices(prevState.currentIndices);
    setTimeLeft(prevState.timeLeft);
    setWinner(prevState.winner);
    setGameStarted(prevState.gameStarted);
    setIsPaused(true);

    // Pop last state from history
    setGameHistory((draft) => {
      draft.pop();
    });
  }, [gameHistory, setRoscos, setCurrentIndices, setTimeLeft, setGameHistory]);

  const startGame = useCallback(() => {
    // Start the game - reset statuses and initialize game state
    const playerCount = roscos.length;

    // Reset question statuses to PENDING while keeping the words/questions intact
    setRoscos((draft) => {
      draft.forEach((rosco) => {
        rosco.forEach((item) => {
          item.status = STATUS.PENDING;
        });
      });
    });

    setCurrentIndices(new Array(playerCount).fill(0));
    setActivePlayerIndex(0);
    setWinner(null);
    setLeaderboard(null);
    setWinningReason(null);
    setGameStarted(true); // Start the game
    setIsPanelCollapsed(false);
    setTimeLeft(new Array(playerCount).fill(initialTime));
    setIsPaused(true);
    setGameHistory([]);
    setTimerStartedThisTurn(false);
  }, [
    roscos.length,
    initialTime,
    setRoscos,
    setCurrentIndices,
    setTimeLeft,
    setGameHistory,
  ]);

  const resetGame = useCallback(() => {
    // Reset game state to configuration point, but preserve the roscos words/questions
    const playerCount = roscos.length;

    // Reset question statuses to PENDING while keeping the words/questions intact
    setRoscos((draft) => {
      draft.forEach((rosco) => {
        rosco.forEach((item) => {
          item.status = STATUS.PENDING;
        });
      });
    });

    setCurrentIndices(new Array(playerCount).fill(0));
    setActivePlayerIndex(0);
    setWinner(null);
    setLeaderboard(null);
    setWinningReason(null);
    setGameStarted(false); // Reset to configuration point
    setIsPanelCollapsed(false);
    setTimeLeft(new Array(playerCount).fill(initialTime));
    setIsPaused(true);
    setGameHistory([]);
    setTimerStartedThisTurn(false);
  }, [
    roscos.length,
    initialTime,
    setRoscos,
    setCurrentIndices,
    setTimeLeft,
    setGameHistory,
  ]);

  const updateSourceData = useCallback(
    (newData: Question[][]) => {
      setSourceData(newData);
      const newRoscos = newData.map((questions) => INITIAL_STATE(questions));
      const playerCount = newRoscos.length;
      setRoscos(newRoscos);
      setCurrentIndices(new Array(playerCount).fill(0));
      setActivePlayerIndex(0);
      setWinner(null);
      setLeaderboard(null);
      setWinningReason(null);
      setGameStarted(true);
      setTimeLeft(new Array(playerCount).fill(initialTime));
      setIsPaused(true);
      setGameHistory([]);
      setTimerStartedThisTurn(false);
    },
    [
      initialTime,
      setSourceData,
      setRoscos,
      setCurrentIndices,
      setTimeLeft,
      setGameHistory,
    ]
  );

  // Custom pause toggle that tracks timer start
  const handlePauseToggle = useCallback(() => {
    setIsPaused((prev) => {
      const newPaused = !prev;
      // If unpausing (starting timer), mark that timer has been started this turn
      if (!newPaused) {
        setTimerStartedThisTurn(true);
      }
      return newPaused;
    });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === "INPUT") return;

      const key = e.key;

      // Pause/Resume: Space
      if (key === " ") {
        e.preventDefault();
        handlePauseToggle();
      }
      // Correct: Arrow Right or A
      else if (key === "ArrowRight" || key.toLowerCase() === "a") {
        e.preventDefault();
        handleAction("correct");
      }
      // Incorrect: Arrow Left or F
      else if (key === "ArrowLeft" || key.toLowerCase() === "f") {
        e.preventDefault();
        handleAction("incorrect");
      }
      // Pasapalabra: Arrow Down or P
      else if (key === "ArrowDown" || key.toLowerCase() === "p") {
        e.preventDefault();
        handleAction("pasapalabra");
      }
      // Undo: Ctrl+Z, Z, or Backspace
      else if (key === "Backspace" || key.toLowerCase() === "z") {
        if (gameHistory.length > 0) {
          e.preventDefault();
          handleUndo();
        }
      }
      // Toggle panel: Escape or I
      else if (key === "Escape" || key.toLowerCase() === "i") {
        e.preventDefault();
        setIsPanelCollapsed((prev) => !prev);
      }
      // Toggle sound: M
      else if (key.toLowerCase() === "m") {
        e.preventDefault();
        setSoundEnabled((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleAction, handleUndo, gameHistory.length, handlePauseToggle]);

  // Handle time running out for a player
  const handleTimeOut = useCallback(
    (timedOutPlayerIndex: number, currentTimeLeft: number[]) => {
      const nextPlayer = findNextAvailablePlayer(timedOutPlayerIndex);

      if (nextPlayer !== null) {
        // Switch to next available player
        setActivePlayerIndex(nextPlayer);
        setIsPaused(true);
        setTimerStartedThisTurn(false);
      } else {
        // All players are done - determine winner with current timeLeft state
        checkWinner(roscos, currentTimeLeft);
      }
    },
    [roscos, findNextAvailablePlayer, checkWinner]
  );

  // Timer effect - using requestAnimationFrame for accurate timing
  const timerRef = useRef<{
    lastTimestamp: number | null;
    previousPlayerIndex: number | null;
  }>({
    lastTimestamp: null,
    previousPlayerIndex: null,
  });

  useEffect(() => {
    let animationFrameId: number | null = null;
    const isRunning = gameStarted && !winner && !isPaused && !isPanelCollapsed;

    if (isRunning) {
      // Reset timestamp when player changes
      if (timerRef.current.previousPlayerIndex !== activePlayerIndex) {
        timerRef.current.lastTimestamp = null;
        timerRef.current.previousPlayerIndex = activePlayerIndex;
      }

      const tick = (timestamp: number) => {
        if (timerRef.current.lastTimestamp === null) {
          timerRef.current.lastTimestamp = timestamp;
        }

        const elapsed = timestamp - timerRef.current.lastTimestamp;
        timerRef.current.lastTimestamp = timestamp;

        if (elapsed > 0) {
          setTimeLeft((draft) => {
            const currentTime = draft[activePlayerIndex];
            const updatedTime = Math.max(0, currentTime - elapsed);
            draft[activePlayerIndex] = updatedTime;

            if (updatedTime === 0 && currentTime > 0) {
              // Time just ran out - create a copy of the draft before scheduling timeout
              // (draft proxy will be revoked after this callback completes)
              const timeLeftCopy = [...draft];
              setTimeout(
                () => handleTimeOut(activePlayerIndex, timeLeftCopy),
                0
              );
            }
            return draft;
          });
        }

        animationFrameId = requestAnimationFrame(tick);
      };

      animationFrameId = requestAnimationFrame(tick);
    } else {
      // Reset timestamp when paused or stopped
      timerRef.current.lastTimestamp = null;
      timerRef.current.previousPlayerIndex = null;
    }

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [
    gameStarted,
    winner,
    isPaused,
    isPanelCollapsed,
    activePlayerIndex,
    handleTimeOut,
    setTimeLeft,
  ]);

  const updateInitialTime = useCallback(
    (newTime: number) => {
      setInitialTime(newTime);
      if (!gameStarted) {
        setTimeLeft((draft) => {
          draft.fill(newTime);
          // Ensure array has correct length
          while (draft.length < playerNames.length) {
            draft.push(newTime);
          }
          draft.splice(playerNames.length);
        });
      }
    },
    [gameStarted, playerNames.length, setTimeLeft]
  );

  const handlePlayerNamesChange = useCallback(
    (newNames: string[]) => {
      if (newNames.length < MIN_PLAYERS || newNames.length > MAX_PLAYERS)
        return;
      if (gameStarted) return; // Don't allow changes during game

      const targetLength = newNames.length;
      const currentLength = roscos.length;

      setPlayerNames(newNames);

      // Sync arrays immediately when names change - using immer for cleaner code
      if (targetLength > currentLength) {
        const additionalQuestions = getDefaultQuestionsForPlayers(
          targetLength - currentLength
        );
        setRoscos((draft) => {
          draft.push(...additionalQuestions.map((q) => INITIAL_STATE(q)));
        });
        setTimeLeft((draft) => {
          draft.push(
            ...new Array(targetLength - currentLength).fill(initialTime)
          );
        });
        setCurrentIndices((draft) => {
          draft.push(...new Array(targetLength - currentLength).fill(0));
        });
        setSourceData((draft) => {
          draft.push(...additionalQuestions);
        });
      } else if (targetLength < currentLength) {
        setRoscos((draft) => {
          draft.splice(targetLength);
        });
        setTimeLeft((draft) => {
          draft.splice(targetLength);
        });
        setCurrentIndices((draft) => {
          draft.splice(targetLength);
        });
        setSourceData((draft) => {
          draft.splice(targetLength);
        });
        if (activePlayerIndex >= targetLength) {
          setActivePlayerIndex(0);
        }
      }
    },
    [
      gameStarted,
      roscos.length,
      initialTime,
      activePlayerIndex,
      setPlayerNames,
      setRoscos,
      setTimeLeft,
      setCurrentIndices,
      setSourceData,
    ]
  );

  return {
    roscos,
    activePlayerIndex,
    currentIndices,
    gameStarted,
    winner,
    leaderboard,
    winningReason,
    isPanelCollapsed,
    soundEnabled,
    timeLeft,
    isPaused,
    canUndo: gameHistory.length > 0,
    currentLetterData,
    isCurrentDataValid,
    playerNames,
    initialTime,
    timerStartedThisTurn,
    setIsPanelCollapsed,
    setSoundEnabled,
    handlePauseToggle,
    setPlayerNames: handlePlayerNamesChange,
    handleAction,
    handleUndo,
    startGame,
    resetGame,
    updateSourceData,
    updateInitialTime,
  };
};
