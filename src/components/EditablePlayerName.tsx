'use client';

import { useState, useRef, useEffect } from 'react';

interface EditablePlayerNameProps {
  value: string;
  onChange: (value: string) => void;
  playerId: 'A' | 'B';
  className?: string;
}

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

  const playerGradient = playerId === 'A' 
    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30' 
    : 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/30';

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
          outline-none border-2 border-white/50
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

