'use client';

import { Settings } from 'lucide-react';
import { InfoModal } from './InfoModal';
import { useState, useEffect } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTime: number;
  onTimeChange: (time: number) => void;
  gameStarted: boolean;
}

export const SettingsModal = ({
  isOpen,
  onClose,
  initialTime,
  onTimeChange,
  gameStarted,
}: SettingsModalProps) => {
  const presetTimes = [
    { label: '1 min', value: 60000 },
    { label: '3 min', value: 180000 },
    { label: '5 min', value: 300000 },
  ];

  const getSelectedPreset = (time: number) => presetTimes.find(preset => preset.value === time);

  const [selectedPreset, setSelectedPreset] = useState<'1' | '3' | '5' | 'otro'>(
    getSelectedPreset(initialTime)?.label === '1 min' ? '1' :
    getSelectedPreset(initialTime)?.label === '3 min' ? '3' :
    getSelectedPreset(initialTime)?.label === '5 min' ? '5' : 'otro'
  );
  const [minutes, setMinutes] = useState(Math.floor(initialTime / 60000));
  const [seconds, setSeconds] = useState(Math.floor((initialTime % 60000) / 1000));

  useEffect(() => {
    if (isOpen) {
      const currentMinutes = Math.floor(initialTime / 60000);
      const currentSeconds = Math.floor((initialTime % 60000) / 1000);
      setMinutes(currentMinutes);
      setSeconds(currentSeconds);
      
      const preset = getSelectedPreset(initialTime);
      if (preset) {
        setSelectedPreset(preset.label === '1 min' ? '1' : preset.label === '3 min' ? '3' : '5');
      } else {
        setSelectedPreset('otro');
      }
    }
  }, [isOpen, initialTime]);

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
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-yellow-400 text-xs">
            ⚠️ El tiempo solo se aplicará en la próxima partida
          </div>
        )}

        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
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
                        px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                        ${selectedPreset === presetKey
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                          : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
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
                    px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                    ${selectedPreset === 'otro'
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-white/10 text-white/70 hover:bg-white/15 hover:text-white'
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
                      className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </InfoModal>
  );
};

