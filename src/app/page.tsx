'use client';

import { useState } from 'react';
import { HeaderBar } from '@/components/HeaderBar';
import { RoscoCircle } from '@/components/RoscoCircle';
import { ControlPanel } from '@/components/ControlPanel';
import { GeneratorModal } from '@/components/GeneratorModal';
import { usePasapalabraGame } from '@/game/usePasapalabraGame';

export default function Home() {
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const {
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
  } = usePasapalabraGame();

  return (
    <div className="h-screen gradient-bg font-[family-name:var(--font-nunito)] flex flex-col">
      <HeaderBar
        gameStarted={gameStarted}
        soundEnabled={soundEnabled}
        onSoundToggle={() => setSoundEnabled(!soundEnabled)}
        onGeneratorClick={() => setShowGeneratorModal(true)}
        onReset={resetGame}
      />

      <main className="flex-1 flex flex-col relative min-h-0">
        {/* Rosco container - no overflow clipping to allow spring overshoot */}
        <section className="flex-1 relative min-h-0">
          <RoscoCircle
            data={roscoA}
            active={activePlayer === 'A'}
            activeIndex={currentIndexA}
            playerId="A"
            isPublicMode={isPanelCollapsed}
            time={timeLeftA}
            playerName={playerNames.A}
            onPlayerNameChange={(name) => setPlayerNames({ ...playerNames, A: name })}
            hasWinner={!!winner}
            gameStarted={gameStarted}
          />
          <RoscoCircle
            data={roscoB}
            active={activePlayer === 'B'}
            activeIndex={currentIndexB}
            playerId="B"
            isPublicMode={isPanelCollapsed}
            time={timeLeftB}
            playerName={playerNames.B}
            onPlayerNameChange={(name) => setPlayerNames({ ...playerNames, B: name })}
            hasWinner={!!winner}
            gameStarted={gameStarted}
          />
        </section>

        <ControlPanel
          isCollapsed={isPanelCollapsed}
          onToggleCollapse={() => setIsPanelCollapsed(!isPanelCollapsed)}
          winner={winner}
          winningReason={winningReason}
          gameStarted={gameStarted}
          currentLetterData={currentLetterData}
          isCurrentDataValid={isCurrentDataValid}
          isPaused={isPaused}
          prevGameState={prevGameState}
          playerNames={playerNames}
          onPauseToggle={() => setIsPaused(!isPaused)}
          onUndo={handleUndo}
          onAction={handleAction}
          onReset={resetGame}
        />
      </main>

      <GeneratorModal
        isOpen={showGeneratorModal}
        onClose={() => setShowGeneratorModal(false)}
        onGenerate={updateSourceData}
      />
    </div>
  );
}
