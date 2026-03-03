'use client';

import { Timer, Trophy, Skull } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { motion } from 'motion/react';
import { Question, STATUS, getPlayerColor } from '@/game/types';
import { formatTime } from '@/game/usePasapalabraGame';
import { EditablePlayerName } from './EditablePlayerName';

interface RoscoCircleProps {
  data: Question[];
  active: boolean;
  activeIndex: number;
  playerId: number;
  isPublicMode: boolean;
  time: number;
  playerName: string;
  onPlayerNameChange: (value: string) => void;
  hasWinner: boolean;
  gameStarted: boolean;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const formatPercent = (value: number) => `${value.toFixed(4).replace(/\.?0+$/, '')}%`;
const DEFAULT_ROSCO_GEOMETRY = {
  letterOrbitPercent: 40,
  letterSize: 48,
  outerRingInset: 24,
  innerRingInset: 96,
  glowInset: -4,
};

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
  gameStarted,
}: RoscoCircleProps) => {
  const isVisuallyActive = isPublicMode || active || hasWinner || !gameStarted;
  const roscoRef = useRef<HTMLDivElement>(null);
  const [roscoSize, setRoscoSize] = useState(0);
  
  const correctCount = data.filter(i => i.status === STATUS.CORRECT).length;
  const incorrectCount = data.filter(i => i.status === STATUS.INCORRECT).length;
  
  const ringColor = getPlayerColor(playerId);
  
  const timerClass = hasWinner || time <= 0 ? 'timer-normal' : time <= 10 ? 'timer-critical' : time <= 30 ? 'timer-warning' : 'timer-normal';

  // Calculate animation values based on state
  const animationState = useMemo(() => {
    const isPublicView = hasWinner || isPublicMode || !gameStarted;
    const scale = isPublicView ? 1 : (active ? 1 : 0.5);
    return {
      scale,
      opacity: active || isPublicView ? 1 : 0.4,
    };
  }, [hasWinner, isPublicMode, active, gameStarted]);

  const springTransition = {
    type: 'spring' as const, 
    mass: 0.75, 
    stiffness: 200,
    damping: 20,
  };

  // Initial state: use a slight offset to ensure animations trigger
  const initialState = {
    scale: animationState.scale * 0.98,
    opacity: animationState.opacity * 0.98,
  };

  useEffect(() => {
    const node = roscoRef.current;
    if (!node) return;

    const updateSize = (size: number) => {
      setRoscoSize(prev => (Math.abs(prev - size) < 0.5 ? prev : size));
    };

    updateSize(node.getBoundingClientRect().width);

    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;
      updateSize(entry.contentRect.width);
    });

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const roscoGeometry = useMemo(() => {
    // Keep SSR and first client render identical; switch to measured geometry after mount.
    if (roscoSize <= 0) return DEFAULT_ROSCO_GEOMETRY;

    const ringSize = roscoSize;
    const totalLetters = Math.max(data.length, 1);

    const letterSize = clamp(ringSize * 0.093, 33, 54);
    const targetOverlap = clamp(ringSize * 0.004, 1.2, 2.8);
    const targetSpacing = letterSize - targetOverlap;
    const desiredRadius = (targetSpacing * totalLetters) / (2 * Math.PI);
    // Tighten the outer gap on larger (desktop) roscos without noticeably changing mobile.
    const desktopOrbitBoost = clamp((ringSize - 340) * 0.045, 0, 9);

    const maxRadius = ringSize / 2 - letterSize / 2 - ringSize * 0.04;
    const minRadius = ringSize / 2 - letterSize / 2 - ringSize * 0.12;
    const letterRadius = clamp(desiredRadius + desktopOrbitBoost, minRadius, maxRadius);

    const letterOuterEdge = letterRadius + letterSize / 2;
    const letterInnerEdge = Math.max(0, letterRadius - letterSize / 2);

    const outerRingGap = clamp(ringSize * 0.015 + desktopOrbitBoost * 0.35, 6, 14);
    const innerRingGap = clamp(ringSize * 0.02, 8, 14);

    const outerRingRadius = Math.min(ringSize / 2 - 2, letterOuterEdge + outerRingGap);
    const innerRingRadius = Math.max(0, letterInnerEdge - innerRingGap);

    const glowInset = -clamp(ringSize * 0.008, 3, 6);

    return {
      letterOrbitPercent: (letterRadius / ringSize) * 100,
      letterSize,
      outerRingInset: ringSize / 2 - outerRingRadius,
      innerRingInset: ringSize / 2 - innerRingRadius,
      glowInset,
    };
  }, [data.length, roscoSize]);

  const roscoStyles = useMemo(
    () =>
      ({
        '--rosco-letter-size': `${roscoGeometry.letterSize}px`,
        '--rosco-letter-orbit': `${roscoGeometry.letterOrbitPercent}%`,
        '--rosco-outer-ring-inset': `${roscoGeometry.outerRingInset}px`,
        '--rosco-inner-ring-inset': `${roscoGeometry.innerRingInset}px`,
        '--rosco-glow-inset': `${roscoGeometry.glowInset}px`,
      } as CSSProperties),
    [roscoGeometry]
  );
  
  return (
    <motion.div
      initial={initialState}
      animate={animationState}
      transition={springTransition}
      layout
      style={{ 
        position: 'relative',
        zIndex: active ? 10 : hasWinner || isPublicMode ? 1 : 0,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        touchAction: 'pan-x pinch-zoom',
      }}
      className={`
        flex flex-col items-center
        ${hasWinner
          ? 'saturate-100'
          : isVisuallyActive 
            ? '' 
            : 'saturate-50 pointer-events-none blur-[1px]'
        }
      `}
    >
      {/* Player badge */}
      <div className="flex flex-col items-center mb-4 animate-slide-up pointer-events-auto">
        <EditablePlayerName
          value={playerName}
          onChange={onPlayerNameChange}
          playerId={playerId}
        />
        
        {/* Timer */}
        <div
          className={`
            text-3xl md:text-4xl font-[family-name:var(--font-nunito)] font-extrabold tracking-wider mt-3 
            flex items-center gap-2 tabular-nums ${timerClass}
          `}
        >
          <Timer size={24} className="opacity-60" />
          {formatTime(time)}
        </div>
      </div>

      {/* Rosco container - responsive sizing */}
      <div ref={roscoRef} className="rosco-ring relative" style={roscoStyles}>
        {/* Outer glow ring - GPU optimized */}
        <div 
          className={`
            absolute rounded-full opacity-60
            bg-gradient-to-br ${ringColor}
            ${isVisuallyActive && active ? 'ring-glow-active' : ''}
          `}
          style={{
            inset: 'var(--rosco-glow-inset)',
            filter: 'blur(8px)',
            transform: 'translateZ(0)',
            willChange: 'opacity',
          }}
        />
        
        {/* Inner dark circle */}
        <div 
          className="absolute inset-0 rounded-full bg-surface-1"
          style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3), inset 0 -1px 2px rgba(255,255,255,0.03)' }}
        />

        {/* Decorative outer ring */}
        <div
          className="absolute rounded-full border opacity-60"
          style={{
            inset: 'var(--rosco-outer-ring-inset)',
            borderColor: 'rgba(255,255,255,0.12)',
          }}
        />
        
        {/* Decorative inner ring */}
        <div 
          className="absolute rounded-full opacity-30"
          style={{
            inset: 'var(--rosco-inner-ring-inset)',
            boxShadow: 'inset 0 0px 2px 0px rgba(255,255,255,1)',
          }}
        />
        
        {/* Letters */}
        {data.map((item, index) => {
          const total = data.length;
          const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
          const xPercent = 50 + roscoGeometry.letterOrbitPercent * Math.cos(angle);
          const yPercent = 50 + roscoGeometry.letterOrbitPercent * Math.sin(angle);

          const isCurrent = active && index === activeIndex;
          
          let bgStyle = 'bg-surface-3 text-white/80';
          let glowStyle = '';
          let shadowStyle = 'inset 0 1px 1px rgba(255,255,255,0.08), inset 0 -1px 1px rgba(0,0,0,0.12)';
          
          if (item.status === STATUS.CORRECT) {
            bgStyle = 'bg-gradient-to-br from-green-500 to-emerald-600 text-white';
            glowStyle = 'glow-correct';
            shadowStyle = 'inset 0 1px 1px rgba(255,255,255,0.2), inset 0 -1px 2px rgba(0,0,0,0.15)';
          } else if (item.status === STATUS.INCORRECT) {
            bgStyle = 'bg-gradient-to-br from-red-500 to-rose-600 text-white';
            glowStyle = 'glow-incorrect';
            shadowStyle = 'inset 0 1px 1px rgba(255,255,255,0.2), inset 0 -1px 2px rgba(0,0,0,0.15)';
          } else if (item.status === STATUS.SKIPPED) {
            bgStyle = 'bg-surface-2 text-white/40';
            shadowStyle = 'inset 0 1px 1px rgba(255,255,255,0.04), inset 0 -1px 1px rgba(0,0,0,0.1)';
          }

          // Position tooltip: above for bottom half letters, below for top half
          const showBelow = Math.sin(angle) < 0;
          // Horizontal alignment: left-align for right-side letters, right-align for left-side, center for middle
          const cosAngle = Math.cos(angle);
          const hAlign = cosAngle > 0.4 ? 'right' : cosAngle < -0.4 ? 'left' : 'center';

          return (
            <motion.div
              key={index}
              animate={isCurrent ? { scale: 1.15 } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18, mass: 0.6 }}
              className={`
                rosco-letter absolute rounded-full flex items-center justify-center 
                text-lg md:text-xl font-bold hover:z-[100] border border-white/10
                ${bgStyle} ${glowStyle}
                ${isCurrent ? 'z-20 !bg-gradient-to-br !from-yellow-400 !to-amber-500 !text-slate-900 letter-active-glow' : 'z-10'}
              `}
              style={{
                left: formatPercent(xPercent),
                top: formatPercent(yPercent),
                x: '-50%',
                y: '-50%',
                boxShadow: isCurrent ? 'inset 0 1px 2px rgba(255,255,255,0.3), inset 0 -1px 2px rgba(0,0,0,0.2)' : shadowStyle,
              }}
            >
              {item.letter}
              {/* Tooltip - CSS hover */}
              <div className={`letter-popover letter-popover--${showBelow ? 'below' : 'above'} letter-popover--${hAlign}`}>
                <span className="text-white/50 text-sm uppercase tracking-wider">
                  {item.condition || `Empieza por ${item.letter}`}
                </span>
                <span className="font-bold text-white text-base">{item.answer}</span>
                <span className="text-white/70 text-sm leading-relaxed">{item.description}</span>
              </div>
            </motion.div>
          );
        })}

        {/* Center stats */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-0">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <Trophy size={18} className="text-green-400" />
            <span className="text-3xl md:text-4xl font-[family-name:var(--font-fredoka)] font-bold text-green-400">
              {correctCount}
            </span>
          </div>
          <div className="text-[10px] text-white/40 uppercase tracking-widest">
            Respuestas
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Skull size={14} className="text-red-400/80" />
            <span className="text-xl font-[family-name:var(--font-fredoka)] font-semibold text-red-400">
              {incorrectCount}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
