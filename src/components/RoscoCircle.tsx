import { Timer, Trophy, Skull } from 'lucide-react';
import { useRef, useCallback, useMemo } from 'react';
import { Question, STATUS } from '@/game/types';
import { formatTime } from '@/game/usePasapalabraGame';
import { EditablePlayerName } from './EditablePlayerName';

interface RoscoCircleProps {
  data: Question[];
  active: boolean;
  activeIndex: number;
  playerId: 'A' | 'B';
  isPublicMode: boolean;
  time: number;
  playerName: string;
  onPlayerNameChange: (value: string) => void;
  hasWinner: boolean;
}

export const RoscoCircle = ({
  data,
  active,
  activeIndex,
  playerId,
  isPublicMode,
  time,
  playerName,
  onPlayerNameChange,
  hasWinner,
}: RoscoCircleProps) => {
  const isVisuallyActive = isPublicMode || active || hasWinner;
  
  const correctCount = data.filter(i => i.status === STATUS.CORRECT).length;
  const incorrectCount = data.filter(i => i.status === STATUS.INCORRECT).length;
  
  const ringColor = playerId === 'A' 
    ? 'from-blue-500 via-blue-400 to-cyan-400' 
    : 'from-orange-500 via-orange-400 to-amber-400';

  const popoverRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const showPopover = useCallback((index: number) => {
    const el = popoverRefs.current.get(index);
    if (el && 'showPopover' in el) el.showPopover();
  }, []);

  const hidePopover = useCallback((index: number) => {
    const el = popoverRefs.current.get(index);
    if (el && 'hidePopover' in el) el.hidePopover();
  }, []);
  
  // Timer urgency (no animation when game is over or time is 0)
  const timerClass = hasWinner || time <= 0 ? 'timer-normal' : time <= 10 ? 'timer-critical' : time <= 30 ? 'timer-warning' : 'timer-normal';

  // Position styles for responsive layout - using inline styles to avoid z-index transition issues
  const getPositionStyle = useMemo((): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      transition: 'left 0.4s, top 0.4s, transform 0.4s, opacity 0.3s ease-out, filter 0.3s ease-out',
    };

    if (hasWinner || isPublicMode) {
      // Side by side on desktop, stacked on mobile - handled via CSS media queries
      return {
        ...baseStyle,
        zIndex: 1,
      };
    }

    if (active) {
      return {
        ...baseStyle,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 10,
      };
    }

    // Inactive: slide to side
    return {
      ...baseStyle,
      left: playerId === 'A' ? '22%' : '78%',
      top: '50%',
      transform: 'translate(-50%, -50%) scale(0.5)',
      zIndex: 0,
    };
  }, [hasWinner, isPublicMode, active, playerId]);

  // Position classes only for public mode responsive positioning
  const positionClasses = useMemo(() => {
    if (hasWinner || isPublicMode) {
      return playerId === 'A' 
        ? 'rosco-public rosco-public-a' 
        : 'rosco-public rosco-public-b';
    }
    return '';
  }, [hasWinner, isPublicMode, playerId]);

  return (
    <div
      style={getPositionStyle}
      className={`
        ${positionClasses}
        flex flex-col items-center
        ease-[linear(0,0.008_1.1%,0.034_2.3%,0.134_4.9%,0.264_7.3%,0.683_14.3%,0.797_16.5%,0.89_18.6%,0.967_20.7%,1.027_22.8%,1.073_25%,1.104_27.3%,1.123_30.6%,1.119_34.3%,1.018_49.5%,0.988_58.6%,0.985_65.2%,1_84.5%,1)]
        ${hasWinner
          ? 'opacity-100 saturate-100'
          : isVisuallyActive 
            ? 'opacity-100' 
            : 'opacity-40 saturate-50 pointer-events-none blur-[1px]'
        }
      `}
    >
      {/* Player badge */}
      <div className="flex flex-col items-center mb-2 md:mb-4 animate-slide-up pointer-events-auto">
        <EditablePlayerName
          value={playerName}
          onChange={onPlayerNameChange}
          playerId={playerId}
        />
        
        {/* Timer */}
        <div
          className={`
            text-2xl md:text-4xl font-[family-name:var(--font-nunito)] font-extrabold tracking-wider mt-2 md:mt-3 
            flex items-center gap-2 tabular-nums ${timerClass}
          `}
        >
          <Timer size={20} className="opacity-60 md:w-7 md:h-7" />
          {formatTime(time)}
        </div>
      </div>

      {/* Rosco container - responsive sizing */}
      <div className="rosco-ring relative">
        {/* Outer glow ring */}
        <div 
          className={`
            absolute inset-[-4px] rounded-full opacity-60
            bg-gradient-to-br ${ringColor}
            ${isVisuallyActive && active ? 'ring-glow-active' : ''}
          `}
          style={{ filter: 'blur(8px)' }}
        />
        
        {/* Inner dark circle */}
        <div className="absolute inset-0 rounded-full bg-surface-1 border border-border" />
        
        {/* Decorative inner ring */}
        <div className="absolute inset-8 rounded-full border border-border-bright opacity-30" />
        
        {/* Letters - using percentage positioning for responsiveness */}
        {data.map((item, index) => {
          const total = data.length;
          const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
          // Use percentages: 50% is center, radius is ~43.75% of container (175/400)
          const xPercent = 50 + 43.75 * Math.cos(angle);
          const yPercent = 50 + 43.75 * Math.sin(angle);

          const isCurrent = active && index === activeIndex;
          
          let bgStyle = 'bg-surface-3 text-white/80 border-border-bright';
          let glowStyle = '';
          
          if (item.status === STATUS.CORRECT) {
            bgStyle = 'bg-gradient-to-br from-green-500 to-emerald-600 text-white border-green-400';
            glowStyle = 'glow-correct';
          } else if (item.status === STATUS.INCORRECT) {
            bgStyle = 'bg-gradient-to-br from-red-500 to-rose-600 text-white border-red-400';
            glowStyle = 'glow-incorrect';
          } else if (item.status === STATUS.SKIPPED) {
            bgStyle = 'bg-surface-2 text-white/40 border-border';
          }

          const anchorName = `--letter-${playerId}-${index}`;

          return (
            <div
              key={index}
              className={`
                rosco-letter absolute rounded-full flex items-center justify-center 
                text-[10px] md:text-xs font-bold border-2 transition-all duration-200 cursor-pointer
                ${bgStyle} ${glowStyle}
                ${isCurrent ? 'letter-active z-20 !bg-gradient-to-br !from-yellow-400 !to-amber-500 !text-slate-900 !border-yellow-300' : ''}
              `}
              style={{
                left: `${xPercent}%`,
                top: `${yPercent}%`,
                transform: isCurrent ? undefined : 'translate(-50%, -50%)',
                anchorName,
              } as React.CSSProperties}
              onMouseEnter={() => showPopover(index)}
              onMouseLeave={() => hidePopover(index)}
            >
              {item.letter}
              {/* Native Popover - renders in top layer */}
              <div
                ref={(el) => { if (el) popoverRefs.current.set(index, el); }}
                popover="manual"
                className="
                  m-0 p-0 border-0 bg-transparent
                  min-w-[200px] max-w-[280px]
                "
                style={{
                  positionAnchor: anchorName,
                  top: 'anchor(top)',
                  left: 'anchor(center)',
                  translate: '-50% calc(-100% - 8px)',
                  positionArea: 'top',
                } as React.CSSProperties}
              >
                <div className="px-3 py-2 rounded-lg bg-surface-1 border border-border-bright shadow-xl text-left">
                  <div className="text-xs text-white/50 uppercase tracking-wide mb-1">
                    {item.condition === 'starts' ? `Empieza con ${item.letter}` : `Contiene ${item.letter}`}
                  </div>
                  <div className="text-sm font-bold text-white mb-1">{item.answer}</div>
                  <div className="text-xs text-white/70 leading-relaxed">{item.description}</div>
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-border-bright" />
                </div>
              </div>
            </div>
          );
        })}

        {/* Center stats */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Trophy size={14} className="text-green-400 md:w-[18px] md:h-[18px]" />
            <span className="text-2xl md:text-4xl font-[family-name:var(--font-fredoka)] font-bold text-green-400">
              {correctCount}
            </span>
          </div>
          <div className="text-[10px] md:text-xs text-white/40 uppercase tracking-widest">
            Respuestas
          </div>
          <div className="flex items-center justify-center gap-1">
            <Skull size={14} className="text-red-400/80 md:w-[18px] md:h-[18px]" />
            <span className="text-2xl md:text-4xl font-[family-name:var(--font-fredoka)] font-bold text-red-400">
              {incorrectCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
