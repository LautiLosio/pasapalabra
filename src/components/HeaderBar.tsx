'use client';

import { useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, Clock, Delete, Gamepad2, HelpCircle, Keyboard, Orbit, Play, RotateCcw, Settings, Sparkles, Target, Trophy, Users, Volume2, VolumeX } from 'lucide-react';
import { InfoModal, ShortcutRow } from './InfoModal';

interface HeaderBarProps {
  gameStarted: boolean;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  onGeneratorClick: () => void;
  onReset: () => void;
  onSettingsClick: () => void;
}

export const HeaderBar = ({
  gameStarted,
  soundEnabled,
  onSoundToggle,
  onGeneratorClick,
  onReset,
  onSettingsClick,
}: HeaderBarProps) => {
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);

  return (
    <>
    <header className="glass-light px-4 md:px-6 py-3 flex justify-between items-center z-20 border-b border-border">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 flex items-center justify-center">
          <Orbit size={20} className="text-white" />
        </div>
        <div className="hidden md:block">
          <h1 className="text-xl font-[family-name:var(--font-fredoka)] font-bold text-white tracking-tight">
            PASAPALABRA
          </h1>
          <p className="text-[10px] text-white/40 uppercase tracking-widest -mt-0.5">
            Control de Juego
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* How to Use button */}
        <button
          onClick={() => setShowHelpModal(true)}
          className="p-2.5 rounded-xl bg-white/10 text-white/70 hover:bg-white/15 hover:text-white transition-[background,color] duration-150 btn-press"
          title="Cómo Jugar"
        >
          <HelpCircle size={18} />
        </button>

        {/* Keyboard Shortcuts button */}
        <button
          onClick={() => setShowShortcutsModal(true)}
          className="p-2.5 rounded-xl bg-white/10 text-white/70 hover:bg-white/15 hover:text-white transition-[background,color] duration-150 btn-press hidden sm:flex"
          title="Atajos de Teclado"
        >
          <Keyboard size={18} />
        </button>

        {/* Settings button */}
        <button
          onClick={onSettingsClick}
          className="p-2.5 rounded-xl bg-white/10 text-white/70 hover:bg-white/15 hover:text-white transition-[background,color] duration-150 btn-press"
          title="Configuración"
        >
          <Settings size={18} />
        </button>

        {/* Sound toggle */}
        <button
          onClick={onSoundToggle}
          className={`
            p-2.5 rounded-xl transition-[background,color] duration-150 btn-press
            ${soundEnabled
              ? 'bg-white/10 text-white hover:bg-white/15'
              : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
            }
          `}
          title={soundEnabled ? 'Silenciar' : 'Activar Sonido'}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        {/* AI Generator button */}
        <button
          onClick={onGeneratorClick}
          className="
            flex items-center gap-2 
            bg-gradient-to-r from-purple-600 to-pink-600 
            hover:from-purple-500 hover:to-pink-500
            px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold text-white
            transition-[background,box-shadow] duration-150 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40
            btn-press
          "
        >
          <Sparkles size={16} className="text-yellow-200" />
          <span className="hidden md:inline">Generar con IA</span>
          <span className="md:hidden">IA</span>
        </button>

        {/* Start/Reset button */}
        {!gameStarted ? (
          <button
            onClick={onReset}
            className="
              flex items-center gap-2 
              bg-gradient-to-r from-green-500 to-emerald-500 
              hover:from-green-400 hover:to-emerald-400
              px-5 py-2.5 rounded-xl font-bold text-white text-sm md:text-base
              transition-[background,box-shadow] duration-150 shadow-lg shadow-green-500/30 hover:shadow-green-500/50
              btn-press
            "
          >
            <Play size={18} fill="currentColor" /> 
            <span className="hidden sm:inline">Iniciar</span>
          </button>
        ) : (
          <button
            onClick={onReset}
            className="
              flex items-center gap-2 
              bg-white/10 hover:bg-white/15
              px-4 py-2.5 rounded-xl text-sm text-white/80 hover:text-white
              transition-[background,color] duration-150 btn-press
            "
          >
            <RotateCcw size={16} /> 
            <span className="hidden sm:inline">Reiniciar</span>
          </button>
        )}
      </div>
    </header>

    {/* How to Use Modal */}
    <InfoModal
      isOpen={showHelpModal}
      onClose={() => setShowHelpModal(false)}
      title="Cómo Jugar"
      subtitle="Guía rápida del juego"
      icon={<HelpCircle size={20} className="text-white" />}
    >
      <div className="space-y-4 text-sm text-white/70">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h3 className="font-bold text-white mb-2 flex items-center gap-2">
            <Target size={18} className="text-blue-400" />
            Objetivo
          </h3>
          <p>Acertar el mayor número de palabras del rosco. Cada letra corresponde a una palabra que comienza o contiene esa letra.</p>
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h3 className="font-bold text-white mb-2 flex items-center gap-2">
            <Users size={18} className="text-purple-400" />
            Jugadores
          </h3>
          <p>Dos jugadores compiten con roscos independientes. Los turnos se alternan cuando un jugador falla o dice &quot;pasapalabra&quot;.</p>
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h3 className="font-bold text-white mb-2 flex items-center gap-2">
            <Clock size={18} className="text-orange-400" />
            Tiempo
          </h3>
          <p>Cada jugador tiene su propio cronómetro. El tiempo solo corre durante tu turno y se pausa automáticamente al cambiar.</p>
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h3 className="font-bold text-white mb-2 flex items-center gap-2">
            <Trophy size={18} className="text-yellow-400" />
            Victoria
          </h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Gana quien más aciertos tenga</li>
            <li>En empate: menos errores gana</li>
            <li>Si persiste: gana quien usó menos tiempo</li>
          </ul>
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h3 className="font-bold text-white mb-2 flex items-center gap-2">
            <Gamepad2 size={18} className="text-green-400" />
            Controles
          </h3>
          <ul className="list-disc list-inside space-y-1">
            <li><span className="text-green-400 font-semibold">Acierto:</span> Respuesta correcta</li>
            <li><span className="text-red-400 font-semibold">Error:</span> Respuesta incorrecta</li>
            <li><span className="text-blue-400 font-semibold">Pasapalabra:</span> Saltar letra</li>
          </ul>
        </div>
      </div>
    </InfoModal>

    {/* Keyboard Shortcuts Modal */}
    <InfoModal
      isOpen={showShortcutsModal}
      onClose={() => setShowShortcutsModal(false)}
      title="Atajos de Teclado"
      subtitle="Controla el juego rápidamente"
      icon={<Keyboard size={20} className="text-white" />}
    >
      <div className="space-y-3">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h3 className="font-bold text-white text-sm mb-3 uppercase tracking-wide">Respuestas</h3>
          <div className="space-y-0">
            <ShortcutRow keys={[<ArrowRight key="arrow-right" size={12} />, 'A']} description="Acierto (correcto)" />
            <ShortcutRow keys={[<ArrowLeft key="arrow-left" size={12} />, 'F']} description="Fallo (incorrecto)" />
            <ShortcutRow keys={[<ArrowDown key="arrow-down" size={12} />, 'P']} description="Pasapalabra (saltar)" />
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h3 className="font-bold text-white text-sm mb-3 uppercase tracking-wide">Control del juego</h3>
          <div className="space-y-0">
            <ShortcutRow keys={['Espacio']} description="Pausar / Reanudar" />
            <ShortcutRow keys={['Z', <Delete key="delete" size={12} />]} description="Deshacer última acción" />
            <ShortcutRow keys={['Esc', 'I']} description="Modo público (ocultar panel)" />
            <ShortcutRow keys={['M']} description="Silenciar / Activar sonido" />
          </div>
        </div>

        <p className="text-xs text-white/40 text-center pt-2">
          Los atajos no funcionan mientras escribes en campos de texto
        </p>
      </div>
    </InfoModal>
    </>
  );
};
