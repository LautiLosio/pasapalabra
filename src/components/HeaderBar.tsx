import { Orbit, Play, RotateCcw, Sparkles, Volume2, VolumeX } from 'lucide-react';

interface HeaderBarProps {
  gameStarted: boolean;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  onGeneratorClick: () => void;
  onReset: () => void;
}

export const HeaderBar = ({
  gameStarted,
  soundEnabled,
  onSoundToggle,
  onGeneratorClick,
  onReset,
}: HeaderBarProps) => {
  return (
    <header className="glass-light px-4 md:px-6 py-3 flex justify-between items-center z-20 border-b border-border">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 flex items-center justify-center">
            <Orbit size={20} className="text-white" />
          </div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-orange-500 blur-lg opacity-50" />
        </div>
        <div className="hidden md:block">
          <h1 className="text-xl font-[family-name:var(--font-fredoka)] font-bold text-white tracking-tight">
            PASAPALABRA
          </h1>
          <p className="text-[10px] text-white/40 uppercase tracking-widest -mt-0.5">
            Control de Juego
          </p>
        </div>
        <h1 className="text-lg font-[family-name:var(--font-fredoka)] font-bold text-white md:hidden">
          PASAPALABRA
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Sound toggle */}
        <button
          onClick={onSoundToggle}
          className={`
            p-2.5 rounded-xl transition-all btn-press
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
            transition-all shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40
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
              transition-all shadow-lg shadow-green-500/30 hover:shadow-green-500/50
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
              transition-all btn-press
            "
          >
            <RotateCcw size={16} /> 
            <span className="hidden sm:inline">Reiniciar</span>
          </button>
        )}
      </div>
    </header>
  );
};
