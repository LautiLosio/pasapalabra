import { Play, RotateCcw, Sparkles, Volume2, VolumeX } from 'lucide-react';

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
    <header className="bg-slate-900 text-white p-4 shadow-lg flex justify-between items-center z-20">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-green-500 animate-spin"></div>
        <h1 className="text-xl font-bold tracking-tight hidden md:block">
          CONTROL DE JUEGO <span className="text-blue-400 font-normal">| CONSOLA</span>
        </h1>
        <h1 className="text-xl font-bold tracking-tight md:hidden">PASAPALABRA</h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onSoundToggle}
          className={`p-2 rounded-full transition-colors ${
            soundEnabled
              ? 'bg-slate-700 text-white hover:bg-slate-600'
              : 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
          }`}
          title={soundEnabled ? 'Silenciar' : 'Activar Sonido'}
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        <button
          onClick={onGeneratorClick}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-full text-xs md:text-sm font-bold transition-all shadow-lg hover:shadow-purple-500/30 border border-purple-400/30"
        >
          <Sparkles size={16} className="text-yellow-200" />{' '}
          <span className="hidden md:inline">Generar con IA</span>
          <span className="md:hidden">IA</span>
        </button>

        {!gameStarted ? (
          <button
            onClick={onReset}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-6 py-2 rounded-full font-bold transition-all shadow-lg hover:shadow-green-500/20 text-sm md:text-base"
          >
            <Play size={18} /> Iniciar
          </button>
        ) : (
          <button
            onClick={onReset}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm transition-colors"
          >
            <RotateCcw size={16} /> Reiniciar
          </button>
        )}
      </div>
    </header>
  );
};

