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
          containScroll: 'keepSnaps',
          slidesToScroll: 1,
          skipSnaps: false,
          dragFree: false,
          duration: 15, // Higher value = slower, smoother transition (20-60 recommended)
        }
      : undefined,
    shouldUseCarousel
      ? [
          WheelGesturesPlugin({
            forceWheelAxis: 'x', // Force horizontal scrolling
          }),
        ]
      : []
  );

  // Scroll to active player when it changes
  // Account for the empty slide at the start (index 0), so player index + 1 = slide index
  useEffect(() => {
    if (!emblaApi || !shouldUseCarousel) return;
    
    // Use a small delay to allow animations to start smoothly
    const timeoutId = setTimeout(() => {
      const slideIndex = activePlayerIndex + 1; // +1 because first slide is empty
      // Use smooth scroll - second param false means animated (not jump)
      emblaApi.scrollTo(slideIndex, false);
    }, 100); // Delay to allow rosco animations to start first
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [emblaApi, activePlayerIndex, shouldUseCarousel]);


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
