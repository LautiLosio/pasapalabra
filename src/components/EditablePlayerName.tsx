'use client';

import { useState, useRef, useEffect } from 'react';

interface EditablePlayerNameProps {
  value: string;
  onChange: (value: string) => void;
  playerId: number;
  className?: string;
}

const PLAYER_GRADIENTS = [
  'bg-gradient-to-r from-blue-600 to-blue-500 text-white btn-primary',
  'bg-gradient-to-r from-orange-600 to-orange-500 text-white btn-primary',
  'bg-gradient-to-r from-purple-600 to-purple-500 text-white btn-primary',
  'bg-gradient-to-r from-green-600 to-green-500 text-white btn-primary',
  'bg-gradient-to-r from-red-600 to-red-500 text-white btn-primary',
  'bg-gradient-to-r from-yellow-600 to-yellow-500 text-white btn-primary',
  'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white btn-primary',
  'bg-gradient-to-r from-teal-600 to-teal-500 text-white btn-primary',
  'bg-gradient-to-r from-pink-600 to-pink-500 text-white btn-primary',
  'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white btn-primary',
] as const;

export const EditablePlayerName = ({
  value,
  onChange,
  playerId,
  className = '',
}: EditablePlayerNameProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue) {
      onChange(trimmedValue);
    } else {
      setEditValue(value);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  const playerGradient = PLAYER_GRADIENTS[playerId % PLAYER_GRADIENTS.length];

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`
          px-3 py-1 md:px-5 md:py-1.5 rounded-full font-[family-name:var(--font-fredoka)] text-sm md:text-lg font-semibold tracking-wide
          ${playerGradient}
          outline-none ring-2 ring-white/40
          ${className}
        `}
        maxLength={30}
      />
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`
        px-3 py-1 md:px-5 md:py-1.5 rounded-full font-[family-name:var(--font-fredoka)] text-sm md:text-lg font-semibold tracking-wide
        ${playerGradient}
        cursor-pointer transition-all hover:scale-105 active:scale-95
        ${className}
      `}
      title="Clic para editar"
    >
      {value}
    </div>
  );
};

