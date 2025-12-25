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
    isPanelCollapsed,
    soundEnabled,
    timeLeftA,
    timeLeftB,
    isPaused,
    prevGameState,
    currentLetterData,
    isCurrentDataValid,
    setIsPanelCollapsed,
    setSoundEnabled,
    setIsPaused,
    handleAction,
    handleUndo,
    resetGame,
    updateSourceData,
  } = usePasapalabraGame();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      <HeaderBar
        gameStarted={gameStarted}
        soundEnabled={soundEnabled}
        onSoundToggle={() => setSoundEnabled(!soundEnabled)}
        onGeneratorClick={() => setShowGeneratorModal(true)}
        onReset={resetGame}
      />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <section className="flex-1 bg-slate-100 p-8 flex flex-col md:flex-row items-center justify-center gap-12 overflow-y-auto relative">
          <RoscoCircle
            data={roscoA}
            active={activePlayer === 'A'}
            activeIndex={currentIndexA}
            playerId="A"
            isPublicMode={isPanelCollapsed}
            time={timeLeftA}
          />
          <RoscoCircle
            data={roscoB}
            active={activePlayer === 'B'}
            activeIndex={currentIndexB}
            playerId="B"
            isPublicMode={isPanelCollapsed}
            time={timeLeftB}
          />
        </section>

        <ControlPanel
          isCollapsed={isPanelCollapsed}
          onToggleCollapse={() => setIsPanelCollapsed(!isPanelCollapsed)}
          winner={winner}
          gameStarted={gameStarted}
          activePlayer={activePlayer}
          currentLetterData={currentLetterData}
          isCurrentDataValid={isCurrentDataValid}
          isPaused={isPaused}
          prevGameState={prevGameState}
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
