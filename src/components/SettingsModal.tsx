'use client';

import { Settings, Plus, X } from 'lucide-react';
import { InfoModal } from './InfoModal';
import { useState } from 'react';
import { MAX_PLAYERS, MIN_PLAYERS } from '@/game/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTime: number;
  onTimeChange: (time: number) => void;
  playerNames: string[];
  onPlayerNamesChange: (names: string[]) => void;
  gameStarted: boolean;
}

type PresetKey = '1' | '3' | '5' | 'otro';

const presetTimes = [
  { label: '1 min', value: 60000 },
  { label: '3 min', value: 180000 },
  { label: '5 min', value: 300000 },
] as const;

const getSelectedPreset = (time: number) => presetTimes.find(preset => preset.value === time);

const getPresetKey = (time: number): PresetKey => {
  const preset = getSelectedPreset(time);
  if (!preset) return 'otro';
  return preset.label === '1 min' ? '1' : preset.label === '3 min' ? '3' : '5';
};

export const SettingsModal = ({
  isOpen,
  onClose,
  initialTime,
  onTimeChange,
  playerNames,
  onPlayerNamesChange,
  gameStarted,
}: SettingsModalProps) => {
  const [selectedPreset, setSelectedPreset] = useState<PresetKey>(() => getPresetKey(initialTime));
  const [minutes, setMinutes] = useState(() => Math.floor(initialTime / 60000));
  const [seconds, setSeconds] = useState(() => Math.floor((initialTime % 60000) / 1000));
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  // Sync state when modal opens (React pattern: adjust state during render by comparing with previous props)
  if (isOpen && !prevIsOpen) {
    setPrevIsOpen(true);
    setMinutes(Math.floor(initialTime / 60000));
    setSeconds(Math.floor((initialTime % 60000) / 1000));
    setSelectedPreset(getPresetKey(initialTime));
  } else if (!isOpen && prevIsOpen) {
    setPrevIsOpen(false);
  }

  const handleMinutesChange = (value: number) => {
    const newMinutes = Math.max(0, Math.min(59, value));
    setMinutes(newMinutes);
    setSelectedPreset('otro');
    const totalMs = newMinutes * 60000 + seconds * 1000;
    if (totalMs > 0) {
      onTimeChange(totalMs);
    }
  };

  const handleSecondsChange = (value: number) => {
    const newSeconds = Math.max(0, Math.min(59, value));
    setSeconds(newSeconds);
    setSelectedPreset('otro');
    const totalMs = minutes * 60000 + newSeconds * 1000;
    if (totalMs > 0) {
      onTimeChange(totalMs);
    }
  };

  return (
    <InfoModal
      isOpen={isOpen}
      onClose={onClose}
      title="Configuración"
      subtitle="Ajusta el tiempo del juego"
      icon={<Settings size={20} className="text-white" />}
    >
      <div className="space-y-4 text-sm text-white/70">
        {gameStarted && (
          <div 
            className="bg-yellow-500/10 rounded-xl p-3 text-yellow-400 text-xs"
            style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.06), inset 0 -1px 1px rgba(0,0,0,0.1)' }}
          >
            ⚠️ El tiempo solo se aplicará en la próxima partida
          </div>
        )}

        <div 
          className="bg-white/5 rounded-xl p-4"
          style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.04), inset 0 -1px 1px rgba(0,0,0,0.08)' }}
        >
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Settings size={18} className="text-blue-400" />
            Tiempo por Jugador
          </h3>

          <div className="space-y-4">
            {/* Preset buttons */}
            <div>
              <label className="text-xs text-white/50 mb-2 block">Tiempo:</label>
              <div className="flex flex-wrap gap-2">
                {presetTimes.map((preset) => {
                  const presetKey = preset.label === '1 min' ? '1' : preset.label === '3 min' ? '3' : '5';
                  return (
                    <button
                      key={preset.value}
                      onClick={() => {
                        setSelectedPreset(presetKey);
                        onTimeChange(preset.value);
                      }}
                      className={`
                        px-3 py-1.5 rounded-lg text-xs font-semibold
                        ${selectedPreset === presetKey
                          ? 'bg-blue-500 text-white btn-neu'
                          : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white btn-ghost'
                        }
                      `}
                    >
                      {preset.label}
                    </button>
                  );
                })}
                <button
                  onClick={() => setSelectedPreset('otro')}
                  className={`
                    px-3 py-1.5 rounded-lg text-xs font-semibold
                    ${selectedPreset === 'otro'
                      ? 'bg-blue-500 text-white btn-neu'
                      : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white btn-ghost'
                    }
                  `}
                >
                  Otro
                </button>
              </div>
            </div>

            {/* Custom time input - only show when "otro" is selected */}
            {selectedPreset === 'otro' && (
              <div>
                <label className="text-xs text-white/50 mb-2 block">Tiempo personalizado:</label>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-xs text-white/60 mb-1 block">Minutos</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={minutes}
                      onChange={(e) => handleMinutesChange(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg bg-white/10 text-white text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.15), inset 0 -1px 1px rgba(255,255,255,0.05)' }}
                    />
                  </div>
                  <div className="text-2xl text-white/40 font-bold pt-6">:</div>
                  <div className="flex-1">
                    <label className="text-xs text-white/60 mb-1 block">Segundos</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={seconds}
                      onChange={(e) => handleSecondsChange(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-lg bg-white/10 text-white text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.15), inset 0 -1px 1px rgba(255,255,255,0.05)' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Player Management Section */}
        <div 
          className="bg-white/5 rounded-xl p-4"
          style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.04), inset 0 -1px 1px rgba(0,0,0,0.08)' }}
        >
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Settings size={18} className="text-purple-400" />
            Jugadores ({playerNames.length}/{MAX_PLAYERS})
          </h3>

          {gameStarted && (
            <div 
              className="bg-yellow-500/10 rounded-xl p-3 text-yellow-400 text-xs mb-4"
              style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.06), inset 0 -1px 1px rgba(0,0,0,0.1)' }}
            >
              ⚠️ Los jugadores solo se pueden modificar antes de iniciar el juego
            </div>
          )}

          <div className="space-y-3">
            {playerNames.map((name, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    const newNames = [...playerNames];
                    newNames[index] = e.target.value;
                    onPlayerNamesChange(newNames);
                  }}
                  disabled={gameStarted}
                  className="
                    flex-1 px-3 py-2 rounded-lg bg-white/10 
                    text-white text-sm font-medium
                    focus:outline-none focus:ring-2 focus:ring-purple-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                  "
                  style={{ boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.15), inset 0 -1px 1px rgba(255,255,255,0.05)' }}
                  placeholder={`Jugador ${index + 1}`}
                  maxLength={30}
                />
                <button
                  onClick={() => {
                    if (playerNames.length > MIN_PLAYERS && !gameStarted) {
                      const newNames = playerNames.filter((_, i) => i !== index);
                      onPlayerNamesChange(newNames);
                    }
                  }}
                  disabled={gameStarted || playerNames.length <= MIN_PLAYERS}
                  className="
                    w-10 h-10 rounded-lg bg-red-500/20 text-red-400 
                    hover:bg-red-500/30 btn-tinted
                    flex items-center justify-center
                  "
                  title="Remover jugador"
                >
                  <X size={18} />
                </button>
              </div>
            ))}

            <button
              onClick={() => {
                if (playerNames.length < MAX_PLAYERS && !gameStarted) {
                  const newNames = [...playerNames, `Jugador ${playerNames.length + 1}`];
                  onPlayerNamesChange(newNames);
                }
              }}
              disabled={gameStarted || playerNames.length >= MAX_PLAYERS}
              className="
                w-full py-2.5 rounded-lg bg-purple-500/20 text-purple-400 
                hover:bg-purple-500/30 btn-tinted
                flex items-center justify-center gap-2 font-semibold text-sm
              "
            >
              <Plus size={18} />
              Agregar Jugador
            </button>
          </div>
        </div>
      </div>
    </InfoModal>
  );
};

