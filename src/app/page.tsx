'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import { useWebHaptics } from 'web-haptics/react';
import { HeaderBar } from '@/components/HeaderBar';
import { RoscoCircle } from '@/components/RoscoCircle';
import { ControlPanel } from '@/components/ControlPanel';
import { GeneratorModal } from '@/components/GeneratorModal';
import { SettingsModal } from '@/components/SettingsModal';
import { LeaderboardModal } from '@/components/LeaderboardModal';
import { NotificationProvider, useNotification } from '@/components/NotificationProvider';
import { usePasapalabraGame } from '@/game/usePasapalabraGame';

const HAPTICS_STORAGE_KEY = 'pasapalabra-haptics-enabled';
const HAPTIC_TAPS = {
  buttonBaseline: { duration: 14, intensity: 0.28 },
  illegal: { duration: 34, intensity: 0.78 },
  snap: { duration: 24, intensity: 0.58 },
  turnChange: { duration: 30, intensity: 0.62 },
  timeout: { duration: 64, intensity: 1 },
  winner: { duration: 46, intensity: 0.9 },
  tie: { duration: 34, intensity: 0.62 },
  panelToggle: { duration: 16, intensity: 0.35 },
  soundToggle: { duration: 18, intensity: 0.4 },
  openGenerator: { duration: 24, intensity: 0.55 },
  openSettings: { duration: 18, intensity: 0.36 },
  startGame: { duration: 28, intensity: 0.62 },
  pause: { duration: 18, intensity: 0.4 },
  resume: { duration: 26, intensity: 0.6 },
  undo: { duration: 28, intensity: 0.52 },
  actionCorrect: { duration: 38, intensity: 0.88 },
  actionIncorrect: { duration: 50, intensity: 1 },
  actionSkip: { duration: 22, intensity: 0.46 },
  showLeaderboard: { duration: 18, intensity: 0.35 },
  resetRequest: { duration: 24, intensity: 0.55 },
  resetImmediate: { duration: 22, intensity: 0.65 },
  resetConfirm: { duration: 56, intensity: 0.96 },
  generatorStart: { duration: 20, intensity: 0.45 },
  generatorSuccess: { duration: 34, intensity: 0.82 },
  generatorError: { duration: 46, intensity: 0.95 },
  settingsChange: { duration: 18, intensity: 0.35 },
  hapticsToggle: { duration: 20, intensity: 0.48 },
} as const;

interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmResetModal = ({ isOpen, onConfirm, onCancel }: ConfirmModalProps) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="glass-light w-full max-w-sm rounded-2xl p-5 surface-neu"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center btn-neu">
              <AlertTriangle size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-[family-name:var(--font-fredoka)] font-bold text-white">
                ¿Reiniciar partida?
              </h2>
              <p className="text-xs text-white/50">Esta acción no se puede deshacer</p>
            </div>
          </div>
          <p className="text-sm text-white/70 mb-2">
            Se perderá todo el progreso actual y volverás al estado inicial.
          </p>
          <p className="text-xs text-green-400/80 mb-5">
            Las preguntas generadas se mantendrán.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl font-semibold text-sm bg-white/10 text-white/80 hover:bg-white/15 hover:text-white btn-ghost"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-400 hover:to-rose-400 text-white btn-primary"
            >
              Reiniciar
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

function GameContent() {
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const { showNotification } = useNotification();
  const { trigger: triggerHaptic, isSupported: isHapticsSupported } = useWebHaptics();
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const lastCarouselInteractionAt = useRef(0);
  const lastSnapIndex = useRef<number | null>(null);
  const lastTimerPulseSecond = useRef<number | null>(null);
  const previousActivePlayerRef = useRef<number | null>(null);
  const previousTimeLeftRef = useRef<number[]>([]);
  const winnerHapticKeyRef = useRef<string | null>(null);
  const lastSemanticHapticAt = useRef(0);
  const appShellRef = useRef<HTMLDivElement>(null);
  const headerContainerRef = useRef<HTMLDivElement>(null);
  const panelContainerRef = useRef<HTMLDivElement>(null);
  const layoutSyncRafRef = useRef<number | null>(null);
  const lastViewportHeightRef = useRef(0);
  const lastRoscoLimitRef = useRef(0);

  useEffect(() => {
    const stored = window.localStorage.getItem(HAPTICS_STORAGE_KEY);
    if (stored === null) return;
    setHapticsEnabled(stored !== 'false');
  }, []);

  useEffect(() => {
    window.localStorage.setItem(HAPTICS_STORAGE_KEY, String(hapticsEnabled));
  }, [hapticsEnabled]);

  const fireHaptic = useCallback((duration: number, intensity: number) => {
    if (!isHapticsSupported || !hapticsEnabled) return;
    void triggerHaptic(duration, { intensity });
  }, [hapticsEnabled, isHapticsSupported, triggerHaptic]);

  const fireSupportedHaptic = useCallback((duration: number, intensity: number) => {
    if (!isHapticsSupported) return;
    void triggerHaptic(duration, { intensity });
  }, [isHapticsSupported, triggerHaptic]);

  const fireSemanticTap = useCallback((tap: { duration: number; intensity: number }) => {
    lastSemanticHapticAt.current = Date.now();
    fireHaptic(tap.duration, tap.intensity);
  }, [fireHaptic]);

  const handleIllegalAction = useCallback((message: string) => {
    fireSemanticTap(HAPTIC_TAPS.illegal);
    showNotification(message, 'warning');
  }, [fireSemanticTap, showNotification]);

  const {
    roscos,
    activePlayerIndex,
    currentIndices,
    gameStarted,
    winner,
    leaderboard,
    isPanelCollapsed,
    soundEnabled,
    timeLeft,
    isPaused,
    canUndo,
    currentLetterData,
    isCurrentDataValid,
    playerNames,
    initialTime,
    timerStartedThisTurn,
    setIsPanelCollapsed,
    setSoundEnabled,
    handlePauseToggle,
    setPlayerNames,
    handleAction,
    handleUndo,
    startGame,
    resetGame,
    updateSourceData,
    updateInitialTime,
  } = usePasapalabraGame({ onIllegalAction: handleIllegalAction });

  // Embla carousel for all cases with 2+ players
  const shouldUseCarousel = roscos.length >= 2;
  const emblaContainerRef = useRef<HTMLDivElement>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel(
    shouldUseCarousel
      ? {
          align: 'center',
          containScroll: 'trimSnaps', // Remove empty slides from snap points to prevent interference
          slidesToScroll: 1,
          skipSnaps: false,
          dragFree: false,
          duration: 15,
          startIndex: 1, // Start at first rosco (skip empty slide at index 0)
          dragThreshold: 5, // Lower threshold for more responsive swipes (default: 10)
          watchDrag: true, // Watch for drag events
          watchResize: true, // Watch for resize events
        }
      : undefined,
    shouldUseCarousel
      ? [
          WheelGesturesPlugin({
            forceWheelAxis: 'x',
          }),
        ]
      : []
  );

  const isUserDragging = useRef(false);

  const syncViewportVars = useCallback(() => {
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const appHeight = Math.max(320, Math.round(viewportHeight));

    if (lastViewportHeightRef.current === appHeight) return;
    lastViewportHeightRef.current = appHeight;

    const rootStyle = document.documentElement.style;
    rootStyle.setProperty('--app-height', `${appHeight}px`);
    rootStyle.setProperty('--app-vh', `${(appHeight / 100).toFixed(4)}px`);
  }, []);

  const syncRoscoSizeLimit = useCallback(() => {
    const shellHeight = appShellRef.current?.clientHeight ?? 0;
    if (shellHeight <= 0) return;

    const headerHeight = headerContainerRef.current?.offsetHeight ?? 0;
    const panelHeight = panelContainerRef.current?.offsetHeight ?? 0;
    const middleHeight = shellHeight - headerHeight - panelHeight;
    const ringLimit = Math.max(220, Math.floor(middleHeight - 120));

    if (lastRoscoLimitRef.current === ringLimit) return;
    lastRoscoLimitRef.current = ringLimit;
    document.documentElement.style.setProperty('--rosco-size-limit', `${ringLimit}px`);
  }, []);

  const scheduleLayoutSync = useCallback(() => {
    if (layoutSyncRafRef.current !== null) return;
    layoutSyncRafRef.current = window.requestAnimationFrame(() => {
      layoutSyncRafRef.current = null;
      syncViewportVars();
      syncRoscoSizeLimit();
    });
  }, [syncRoscoSizeLimit, syncViewportVars]);

  useEffect(() => {
    scheduleLayoutSync();

    const handleViewportChange = () => {
      scheduleLayoutSync();
    };

    window.addEventListener('resize', handleViewportChange, { passive: true });
    window.addEventListener('orientationchange', handleViewportChange, { passive: true });

    const viewport = window.visualViewport;
    viewport?.addEventListener('resize', handleViewportChange, { passive: true });
    viewport?.addEventListener('scroll', handleViewportChange, { passive: true });

    return () => {
      window.removeEventListener('resize', handleViewportChange);
      window.removeEventListener('orientationchange', handleViewportChange);
      viewport?.removeEventListener('resize', handleViewportChange);
      viewport?.removeEventListener('scroll', handleViewportChange);
    };
  }, [scheduleLayoutSync]);

  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => {
      scheduleLayoutSync();
    });

    const nodes = [appShellRef.current, headerContainerRef.current, panelContainerRef.current];
    nodes.forEach((node) => {
      if (node) observer.observe(node);
    });
    scheduleLayoutSync();

    return () => {
      observer.disconnect();
    };
  }, [scheduleLayoutSync]);

  useEffect(() => {
    return () => {
      if (layoutSyncRafRef.current === null) return;
      window.cancelAnimationFrame(layoutSyncRafRef.current);
      layoutSyncRafRef.current = null;
    };
  }, []);

  // Generic haptic feedback for all button presses in the app
  useEffect(() => {
    if (!isHapticsSupported) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest('button')) return;
      const pressedAt = Date.now();

      // Delay baseline tap slightly so semantic click haptics can override it
      window.setTimeout(() => {
        if (lastSemanticHapticAt.current >= pressedAt) return;
        fireHaptic(HAPTIC_TAPS.buttonBaseline.duration, HAPTIC_TAPS.buttonBaseline.intensity);
      }, 120);
    };

    document.addEventListener('pointerdown', handlePointerDown, { capture: true, passive: true });

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [isHapticsSupported, fireHaptic]);

  // Track user drag to prevent programmatic scrolling during interaction
  useEffect(() => {
    if (!emblaApi || !shouldUseCarousel) return;

    const onPointerDown = () => {
      isUserDragging.current = true;
      lastCarouselInteractionAt.current = Date.now();
    };

    const onPointerUp = () => {
      setTimeout(() => {
        isUserDragging.current = false;
      }, 50);
    };

    const onWheel = () => {
      lastCarouselInteractionAt.current = Date.now();
    };

    emblaApi.on('pointerDown', onPointerDown);
    emblaApi.on('pointerUp', onPointerUp);
    emblaContainerRef.current?.addEventListener('wheel', onWheel, { passive: true });

    return () => {
      emblaApi.off('pointerDown', onPointerDown);
      emblaApi.off('pointerUp', onPointerUp);
      emblaContainerRef.current?.removeEventListener('wheel', onWheel);
    };
  }, [emblaApi, shouldUseCarousel]);

  // Haptic feedback when a rosco snaps to center after user scroll interaction
  useEffect(() => {
    if (!emblaApi || !shouldUseCarousel) return;

    lastSnapIndex.current = emblaApi.selectedScrollSnap();

    const onSettle = () => {
      const currentSnap = emblaApi.selectedScrollSnap();
      const previousSnap = lastSnapIndex.current;
      lastSnapIndex.current = currentSnap;

      if (previousSnap === null || previousSnap === currentSnap) return;

      // Only fire on user-driven scroll (drag/wheel), not automatic turn scrolling
      if (Date.now() - lastCarouselInteractionAt.current > 700) return;
      fireHaptic(HAPTIC_TAPS.snap.duration, HAPTIC_TAPS.snap.intensity);
    };

    emblaApi.on('settle', onSettle);
    emblaApi.on('reInit', onSettle);

    return () => {
      emblaApi.off('settle', onSettle);
      emblaApi.off('reInit', onSettle);
    };
  }, [emblaApi, shouldUseCarousel, fireHaptic]);

  // Last 10 seconds: increasing haptic urgency until timer reaches 0
  useEffect(() => {
    const activeTime = timeLeft[activePlayerIndex] ?? 0;
    const isRunning = gameStarted && !winner && !isPaused && !isPanelCollapsed;

    if (!isRunning) {
      lastTimerPulseSecond.current = null;
      return;
    }

    if (activeTime <= 0) return;

    const secondBucket = Math.ceil(activeTime / 1000);

    if (secondBucket > 10) {
      lastTimerPulseSecond.current = null;
      return;
    }

    if (lastTimerPulseSecond.current === secondBucket) return;
    lastTimerPulseSecond.current = secondBucket;

    // 10 -> soft, 1 -> strongest
    const progress = (11 - secondBucket) / 10;
    const intensity = 0.35 + progress * 0.65;
    const duration = Math.round(20 + progress * 60);

    fireHaptic(duration, Math.min(1, intensity));
  }, [
    timeLeft,
    activePlayerIndex,
    gameStarted,
    winner,
    isPaused,
    isPanelCollapsed,
    fireHaptic,
  ]);

  // Turn handoff feedback between players
  useEffect(() => {
    const previousPlayer = previousActivePlayerRef.current;
    if (gameStarted && !winner && previousPlayer !== null && previousPlayer !== activePlayerIndex) {
      fireHaptic(HAPTIC_TAPS.turnChange.duration, HAPTIC_TAPS.turnChange.intensity);
    }
    previousActivePlayerRef.current = activePlayerIndex;
  }, [activePlayerIndex, gameStarted, winner, fireHaptic]);

  // Strong timeout feedback when any player's clock reaches zero
  useEffect(() => {
    if (previousTimeLeftRef.current.length === 0) {
      previousTimeLeftRef.current = [...timeLeft];
      return;
    }

    timeLeft.forEach((current, index) => {
      const previous = previousTimeLeftRef.current[index] ?? current;
      if (previous > 0 && current <= 0) {
        fireHaptic(HAPTIC_TAPS.timeout.duration, HAPTIC_TAPS.timeout.intensity);
      }
    });

    previousTimeLeftRef.current = [...timeLeft];
  }, [timeLeft, fireHaptic]);

  // End-game feedback: victory or tie
  useEffect(() => {
    if (!winner || !leaderboard || leaderboard.length === 0) {
      winnerHapticKeyRef.current = null;
      return;
    }

    const key = `${winner}:${leaderboard.map((entry) => `${entry.name}-${entry.rank}-${entry.score}-${entry.errors}-${entry.timeLeft}`).join('|')}`;
    if (winnerHapticKeyRef.current === key) return;
    winnerHapticKeyRef.current = key;

    const isTie = winner === 'Empate' || leaderboard.filter((entry) => entry.rank === 1).length > 1;
    if (isTie) {
      fireHaptic(HAPTIC_TAPS.tie.duration, HAPTIC_TAPS.tie.intensity);
      return;
    }
    fireHaptic(HAPTIC_TAPS.winner.duration, HAPTIC_TAPS.winner.intensity);
  }, [winner, leaderboard, fireHaptic]);

  // Scroll to active player when it changes
  // With trimSnaps, empty slides are removed from snap points
  // scrollTo should use slide indices, but with trimSnaps it might use snap indices
  // Testing: if offset by 1, try using activePlayerIndex directly as snap index
  useEffect(() => {
    if (!emblaApi || !shouldUseCarousel || isUserDragging.current) return;
    
    let timeoutId: NodeJS.Timeout;
    
    // Wait for DOM updates and ensure carousel layout is ready for proper centering
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (isUserDragging.current) return;
        
        timeoutId = setTimeout(() => {
          if (isUserDragging.current) return;
          
          // With trimSnaps, scrollTo might interpret index as snap index
          // Since snap 0 = slide 1 (first rosco), snap 1 = slide 2 (second rosco)
          // And activePlayerIndex 0 = first player = should be at slide 1
          // So we use activePlayerIndex directly (which matches snap index with trimSnaps)
          emblaApi.scrollTo(activePlayerIndex, false);
        }, 100);
      });
    });
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [emblaApi, activePlayerIndex, shouldUseCarousel]);

  // Scroll to winner's rosco when game ends
  useEffect(() => {
    if (!emblaApi || !shouldUseCarousel || !winner || !leaderboard) return;
    
    // Find the winner's index from the leaderboard (first entry with rank 1)
    const winnerEntry = leaderboard.find(entry => entry.rank === 1);
    if (!winnerEntry) return;
    
    let timeoutId: NodeJS.Timeout;
    
    // Wait for DOM updates and ensure carousel layout is ready
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        timeoutId = setTimeout(() => {
          // Scroll to winner's rosco
          emblaApi.scrollTo(winnerEntry.index, false);
        }, 100);
      });
    });
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [emblaApi, shouldUseCarousel, winner, leaderboard]);


  const handlePanelToggle = useCallback(() => {
    fireSemanticTap(HAPTIC_TAPS.panelToggle);
    setIsPanelCollapsed((previous) => !previous);
  }, [fireSemanticTap, setIsPanelCollapsed]);

  const handleSoundToggle = useCallback(() => {
    fireSemanticTap(HAPTIC_TAPS.soundToggle);
    setSoundEnabled((previous) => !previous);
  }, [fireSemanticTap, setSoundEnabled]);

  const handleOpenGenerator = useCallback(() => {
    fireSemanticTap(HAPTIC_TAPS.openGenerator);
    setShowGeneratorModal(true);
  }, [fireSemanticTap]);

  const handleOpenSettings = useCallback(() => {
    fireSemanticTap(HAPTIC_TAPS.openSettings);
    setShowSettingsModal(true);
  }, [fireSemanticTap]);

  const handleStartWithHaptics = useCallback(() => {
    fireSemanticTap(HAPTIC_TAPS.startGame);
    startGame();
  }, [fireSemanticTap, startGame]);

  const handlePauseToggleWithHaptics = useCallback(() => {
    fireSemanticTap(isPaused ? HAPTIC_TAPS.resume : HAPTIC_TAPS.pause);
    handlePauseToggle();
  }, [fireSemanticTap, isPaused, handlePauseToggle]);

  const handleUndoWithHaptics = useCallback(() => {
    if (!canUndo) return;
    fireSemanticTap(HAPTIC_TAPS.undo);
    handleUndo();
  }, [canUndo, fireSemanticTap, handleUndo]);

  const handleActionWithHaptics = useCallback((action: 'correct' | 'incorrect' | 'pasapalabra') => {
    const canExecuteAction = gameStarted && !winner && (timeLeft[activePlayerIndex] ?? 0) > 0 && timerStartedThisTurn;

    if (canExecuteAction) {
      if (action === 'correct') fireSemanticTap(HAPTIC_TAPS.actionCorrect);
      else if (action === 'incorrect') fireSemanticTap(HAPTIC_TAPS.actionIncorrect);
      else fireSemanticTap(HAPTIC_TAPS.actionSkip);
    }

    handleAction(action);
  }, [activePlayerIndex, fireSemanticTap, gameStarted, handleAction, timeLeft, timerStartedThisTurn, winner]);

  const handleShowLeaderboard = useCallback(() => {
    fireSemanticTap(HAPTIC_TAPS.showLeaderboard);
    setShowLeaderboardModal(true);
  }, [fireSemanticTap]);

  const handleResetRequest = useCallback(() => {
    if (gameStarted) {
      fireSemanticTap(HAPTIC_TAPS.resetRequest);
      setShowResetConfirm(true);
      return;
    }

    fireSemanticTap(HAPTIC_TAPS.resetImmediate);
    resetGame();
  }, [fireSemanticTap, gameStarted, resetGame]);

  const handleResetConfirm = useCallback(() => {
    fireSemanticTap(HAPTIC_TAPS.resetConfirm);
    setShowResetConfirm(false);
    resetGame();
  }, [fireSemanticTap, resetGame]);

  const handleGeneratorStart = useCallback(() => {
    fireSemanticTap(HAPTIC_TAPS.generatorStart);
  }, [fireSemanticTap]);

  const handleGeneratorSuccess = useCallback(() => {
    fireSemanticTap(HAPTIC_TAPS.generatorSuccess);
  }, [fireSemanticTap]);

  const handleGeneratorError = useCallback(() => {
    fireSemanticTap(HAPTIC_TAPS.generatorError);
  }, [fireSemanticTap]);

  const handleSettingsTimeChange = useCallback((newTime: number) => {
    fireSemanticTap(HAPTIC_TAPS.settingsChange);
    updateInitialTime(newTime);
  }, [fireSemanticTap, updateInitialTime]);

  const handleSettingsPlayerNamesChange = useCallback((newNames: string[]) => {
    fireSemanticTap(HAPTIC_TAPS.settingsChange);
    setPlayerNames(newNames);
  }, [fireSemanticTap, setPlayerNames]);

  const handleHapticsEnabledChange = useCallback((enabled: boolean) => {
    if (enabled === hapticsEnabled) return;

    if (enabled) {
      setHapticsEnabled(true);
      fireSupportedHaptic(HAPTIC_TAPS.hapticsToggle.duration, HAPTIC_TAPS.hapticsToggle.intensity);
      return;
    }

    fireSemanticTap(HAPTIC_TAPS.hapticsToggle);
    setHapticsEnabled(false);
  }, [fireSemanticTap, fireSupportedHaptic, hapticsEnabled]);

  return (
    <div ref={appShellRef} className="app-shell gradient-bg font-[family-name:var(--font-nunito)] flex flex-col">
      <div ref={headerContainerRef} className="shrink-0">
        <HeaderBar
          gameStarted={gameStarted}
          soundEnabled={soundEnabled}
          onSoundToggle={handleSoundToggle}
          onGeneratorClick={handleOpenGenerator}
          onStart={handleStartWithHaptics}
          onReset={handleResetRequest}
          onSettingsClick={handleOpenSettings}
        />
      </div>

      <main className="flex-1 flex flex-col relative min-h-0">
        {/* Rosco container - always use carousel for 2+ players */}
        <section className="flex-1 relative min-h-0 overflow-hidden">
          {shouldUseCarousel ? (
            // Carousel mode: all cases with 2+ players
            <div className="embla h-full" ref={(node) => {
              emblaContainerRef.current = node;
              if (typeof emblaRef === 'function') {
                emblaRef(node);
              }
            }}>
              <div className="embla__container h-full flex items-center" style={{ gap: 'var(--rosco-spacing)' }}>
                {/* Empty slide at start to allow first rosco to center */}
                <div 
                  className="embla__slide flex-shrink-0"
                  style={{
                    width: 'calc((100vw - var(--rosco-size) - var(--rosco-spacing) * 2)/2)',
                  }}
                />
                {roscos.map((rosco, index) => (
                  <div 
                    key={index} 
                    className="embla__slide flex-shrink-0 flex items-center justify-center"
                    style={{
                      width: 'var(--rosco-size)',
                    }}
                  >
                    <RoscoCircle
                      data={rosco}
                      active={activePlayerIndex === index}
                      activeIndex={currentIndices[index]}
                      playerId={index}
                      isPublicMode={isPanelCollapsed || !gameStarted}
                      time={timeLeft[index]}
                      playerName={playerNames[index]}
                      onPlayerNameChange={(name) => {
                        const newNames = [...playerNames];
                        newNames[index] = name;
                        setPlayerNames(newNames);
                      }}
                      hasWinner={!!winner}
                      gameStarted={gameStarted}
                    />
                  </div>
                ))}
                {/* Empty slide at end to allow last rosco to center */}
                <div 
                  className="embla__slide flex-shrink-0"
                  style={{
                    width: 'calc(50vw - var(--rosco-size) / 2)',
                  }}
                />
              </div>
            </div>
          ) : (
            // Single player: no carousel needed
            <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
              {roscos.map((rosco, index) => (
                <RoscoCircle
                  key={index}
                  data={rosco}
                  active={activePlayerIndex === index}
                  activeIndex={currentIndices[index]}
                  playerId={index}
                  isPublicMode={isPanelCollapsed || !gameStarted}
                  time={timeLeft[index]}
                  playerName={playerNames[index]}
                  onPlayerNameChange={(name) => {
                    const newNames = [...playerNames];
                    newNames[index] = name;
                    setPlayerNames(newNames);
                  }}
                  hasWinner={!!winner}
                  gameStarted={gameStarted}
                />
              ))}
            </div>
          )}
        </section>

        <div ref={panelContainerRef} className="shrink-0">
          <ControlPanel
            isCollapsed={isPanelCollapsed}
            onToggleCollapse={handlePanelToggle}
            winner={winner}
            leaderboard={leaderboard}
            gameStarted={gameStarted}
            currentLetterData={currentLetterData}
            isCurrentDataValid={isCurrentDataValid}
            isPaused={isPaused}
            timerStartedThisTurn={timerStartedThisTurn}
            canUndo={canUndo}
            onPauseToggle={handlePauseToggleWithHaptics}
            onUndo={handleUndoWithHaptics}
            onAction={handleActionWithHaptics}
            onReset={handleResetRequest}
            onShowLeaderboard={handleShowLeaderboard}
            onStart={handleStartWithHaptics}
            onGeneratorClick={handleOpenGenerator}
          />
        </div>
      </main>

      <GeneratorModal
        isOpen={showGeneratorModal}
        onClose={() => setShowGeneratorModal(false)}
        onGenerate={updateSourceData}
        currentPlayerCount={playerNames.length}
        onGenerateStart={handleGeneratorStart}
        onGenerateSuccess={handleGeneratorSuccess}
        onGenerateError={handleGeneratorError}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        initialTime={initialTime}
        onTimeChange={handleSettingsTimeChange}
        playerNames={playerNames}
        onPlayerNamesChange={handleSettingsPlayerNamesChange}
        gameStarted={gameStarted}
        hapticsEnabled={hapticsEnabled}
        onHapticsEnabledChange={handleHapticsEnabledChange}
      />

      {leaderboard && leaderboard.length > 0 && (
        <LeaderboardModal
          isOpen={showLeaderboardModal}
          onClose={() => setShowLeaderboardModal(false)}
          leaderboard={leaderboard}
          winner={winner}
        />
      )}

      <ConfirmResetModal
        isOpen={showResetConfirm}
        onConfirm={handleResetConfirm}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
}

export default function Home() {
  return (
    <NotificationProvider>
      <GameContent />
    </NotificationProvider>
  );
}
