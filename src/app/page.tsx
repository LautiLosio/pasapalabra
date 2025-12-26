'use client';

import { useState, useEffect, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { WheelGesturesPlugin } from 'embla-carousel-wheel-gestures';
import { HeaderBar } from '@/components/HeaderBar';
import { RoscoCircle } from '@/components/RoscoCircle';
import { ControlPanel } from '@/components/ControlPanel';
import { GeneratorModal } from '@/components/GeneratorModal';
import { SettingsModal } from '@/components/SettingsModal';
import { LeaderboardModal } from '@/components/LeaderboardModal';
import { usePasapalabraGame } from '@/game/usePasapalabraGame';

export default function Home() {
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
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
    prevGameState,
    currentLetterData,
    isCurrentDataValid,
    playerNames,
    initialTime,
    setIsPanelCollapsed,
    setSoundEnabled,
    setIsPaused,
    setPlayerNames,
    handleAction,
    handleUndo,
    startGame,
    resetGame,
    updateSourceData,
    updateInitialTime,
  } = usePasapalabraGame();

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


  return (
    <div className="h-screen gradient-bg font-[family-name:var(--font-nunito)] flex flex-col">
      <HeaderBar
        gameStarted={gameStarted}
        soundEnabled={soundEnabled}
        onSoundToggle={() => setSoundEnabled(!soundEnabled)}
        onGeneratorClick={() => setShowGeneratorModal(true)}
        onStart={startGame}
        onReset={resetGame}
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
              <div className="embla__container h-full flex items-center">
                {/* Empty slide at start to allow first rosco to center */}
                <div 
                  className="embla__slide flex-shrink-0"
                  style={{
                    width: 'calc(50vw - var(--rosco-size) / 2)',
                  }}
                />
                {roscos.map((rosco, index) => (
                  <div 
                    key={index} 
                    className="embla__slide flex-shrink-0 flex items-center justify-center"
                    style={{
                      width: 'var(--rosco-size)',
                      marginRight: index < roscos.length - 1 ? '1rem' : '0',
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
                      totalPlayers={roscos.length}
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
                  totalPlayers={roscos.length}
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
          prevGameState={prevGameState}
          onPauseToggle={() => setIsPaused(!isPaused)}
          onUndo={handleUndo}
          onAction={handleAction}
          onReset={resetGame}
          onShowLeaderboard={() => setShowLeaderboardModal(true)}
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
    </div>
  );
}
