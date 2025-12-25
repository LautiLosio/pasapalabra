import { Timer } from 'lucide-react';
import { Question, STATUS } from '@/game/types';
import { formatTime } from '@/game/usePasapalabraGame';

interface RoscoCircleProps {
  data: Question[];
  active: boolean;
  activeIndex: number;
  playerId: 'A' | 'B';
  isPublicMode: boolean;
  time: number;
}

export const RoscoCircle = ({
  data,
  active,
  activeIndex,
  playerId,
  isPublicMode,
  time,
}: RoscoCircleProps) => {
  const radius = 130;
  const center = 150;
  const isVisuallyActive = isPublicMode || active;

  return (
    <div
      className={`relative flex flex-col items-center transition-all duration-500 ${
        isVisuallyActive ? 'opacity-100 scale-100' : 'opacity-50 scale-90 grayscale'
      }`}
    >
      <div className="flex flex-col items-center mb-4">
        <h3
          className={`text-xl font-bold ${
            playerId === 'A' ? 'text-blue-600' : 'text-orange-500'
          }`}
        >
          Rosco {playerId}
        </h3>
        <div
          className={`text-3xl font-mono font-bold tracking-wider mt-1 flex items-center gap-2 tabular-nums ${
            active && !isPublicMode
              ? playerId === 'A'
                ? 'text-blue-600 animate-pulse'
                : 'text-orange-500 animate-pulse'
              : 'text-slate-400'
          }`}
        >
          <Timer size={24} />
          {formatTime(time)}
        </div>
      </div>

      <div className="relative w-[300px] h-[300px]">
        <div className="absolute inset-0 rounded-full border-4 border-gray-100 shadow-inner bg-white/50 backdrop-blur-sm"></div>
        {data.map((item, index) => {
          const total = data.length;
          const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
          const x = center + radius * Math.cos(angle);
          const y = center + radius * Math.sin(angle);

          let bgColor = 'bg-blue-100 text-blue-900 border-blue-200';
          if (item.status === STATUS.CORRECT)
            bgColor = 'bg-green-500 text-white border-green-600 shadow-green-200 shadow-lg';
          if (item.status === STATUS.INCORRECT)
            bgColor = 'bg-red-500 text-white border-red-600 shadow-red-200 shadow-lg';
          if (item.status === STATUS.SKIPPED)
            bgColor = 'bg-gray-400 text-white border-gray-500';

          const isCurrent = active && index === activeIndex;
          const currentStyle = isCurrent ? 'ring-4 ring-yellow-400 scale-125 z-10' : '';
          const letterSize = total > 26 ? 'text-[10px]' : 'text-xs';

          return (
            <div
              key={index}
              className={`absolute w-8 h-8 rounded-full flex items-center justify-center ${letterSize} font-bold border-2 transition-all duration-300 ${bgColor} ${currentStyle}`}
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {item.letter}
            </div>
          );
        })}

        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="text-4xl font-bold text-slate-700">
            {data.filter(i => i.status === STATUS.CORRECT).length}
          </div>
          <div className="text-xs text-slate-400 uppercase tracking-widest">Aciertos</div>
          <div className="text-xl font-bold text-red-400 mt-1">
            {data.filter(i => i.status === STATUS.INCORRECT).length}
          </div>
        </div>
      </div>
    </div>
  );
};

