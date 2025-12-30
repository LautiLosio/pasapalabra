'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import { HeaderBar } from '@/components/HeaderBar';
import { RoscoCircle } from '@/components/RoscoCircle';
import { ControlPanel } from '@/components/ControlPanel';
import { GeneratorModal } from '@/components/GeneratorModal';
import { SettingsModal } from '@/components/SettingsModal';
import { LeaderboardModal } from '@/components/LeaderboardModal';
import { NotificationProvider, useNotification } from '@/components/NotificationProvider';
import { usePasapalabraGame } from '@/game/usePasapalabraGame';

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
  
  const handleIllegalAction = useCallback((message: string) => {
    showNotification(message, 'warning');
  }, [showNotification]);

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

  // Track user drag to prevent programmatic scrolling during interaction
  useEffect(() => {
    if (!emblaApi || !shouldUseCarousel) return;

    const onPointerDown = () => {
      isUserDragging.current = true;
    };

    const onPointerUp = () => {
      setTimeout(() => {
        isUserDragging.current = false;
      }, 50);
    };

    emblaApi.on('pointerDown', onPointerDown);
    emblaApi.on('pointerUp', onPointerUp);

    return () => {
      emblaApi.off('pointerDown', onPointerDown);
      emblaApi.off('pointerUp', onPointerUp);
    };
  }, [emblaApi, shouldUseCarousel]);

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


  const handleResetRequest = useCallback(() => {
    if (gameStarted) {
      setShowResetConfirm(true);
    } else {
      resetGame();
    }
  }, [gameStarted, resetGame]);

  const handleResetConfirm = useCallback(() => {
    setShowResetConfirm(false);
    resetGame();
  }, [resetGame]);

  return (
    <div className="h-screen gradient-bg font-[family-name:var(--font-nunito)] flex flex-col">
      <HeaderBar
        gameStarted={gameStarted}
        soundEnabled={soundEnabled}
        onSoundToggle={() => setSoundEnabled(!soundEnabled)}
        onGeneratorClick={() => setShowGeneratorModal(true)}
        onStart={startGame}
        onReset={handleResetRequest}
        onSettingsClick={() => setShowSettingsModal(true)}
      />

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

        <ControlPanel
          isCollapsed={isPanelCollapsed}
          onToggleCollapse={() => setIsPanelCollapsed(!isPanelCollapsed)}
          winner={winner}
          leaderboard={leaderboard}
          gameStarted={gameStarted}
          currentLetterData={currentLetterData}
          isCurrentDataValid={isCurrentDataValid}
          isPaused={isPaused}
          timerStartedThisTurn={timerStartedThisTurn}
          canUndo={canUndo}
          onPauseToggle={handlePauseToggle}
          onUndo={handleUndo}
          onAction={handleAction}
          onReset={handleResetRequest}
          onShowLeaderboard={() => setShowLeaderboardModal(true)}
          onStart={startGame}
          onGeneratorClick={() => setShowGeneratorModal(true)}
        />
      </main>

      <GeneratorModal
        isOpen={showGeneratorModal}
        onClose={() => setShowGeneratorModal(false)}
        onGenerate={updateSourceData}
        currentPlayerCount={playerNames.length}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        initialTime={initialTime}
        onTimeChange={updateInitialTime}
        playerNames={playerNames}
        onPlayerNamesChange={setPlayerNames}
        gameStarted={gameStarted}
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
