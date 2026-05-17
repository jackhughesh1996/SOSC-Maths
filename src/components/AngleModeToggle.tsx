import React from 'react';
import { AngleMode } from '../lib/mathUtils';

interface AngleModeToggleProps {
  value: AngleMode;
  onChange: (value: AngleMode) => void;
  compact?: boolean;
  className?: string;
}

export function AngleModeToggle({ 
  value, 
  onChange, 
  compact = false,
  className = ''
}: AngleModeToggleProps) {
  const baseButtonClass = "rounded-md font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer";
  const sizeClasses = compact ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs";

  const getButtonClass = (mode: AngleMode) => {
    const isSelected = value === mode;
    return `${baseButtonClass} ${sizeClasses} ${
      isSelected 
        ? "bg-blue-600 text-white shadow-sm" 
        : "bg-transparent text-gray-600 hover:bg-gray-200"
    }`;
  };

  return (
    <div 
      role="group" 
      aria-label="Angle mode" 
      className={`inline-flex gap-1 rounded-lg bg-gray-100 p-1 ${className}`}
    >
      <button
        type="button"
        aria-pressed={value === 'rad'}
        className={getButtonClass('rad')}
        onClick={() => onChange('rad')}
      >
        RAD
      </button>
      <button
        type="button"
        aria-pressed={value === 'deg'}
        className={getButtonClass('deg')}
        onClick={() => onChange('deg')}
      >
        DEG
      </button>
    </div>
  );
}
