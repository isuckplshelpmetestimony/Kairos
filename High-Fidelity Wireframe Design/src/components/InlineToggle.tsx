import { useState } from 'react';

interface InlineToggleProps {
  label: string;
  isSelected: boolean;
  onToggle: () => void;
}

export function InlineToggle({ label, isSelected, onToggle }: InlineToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
        isSelected
          ? 'bg-kairos-soft-black text-kairos-chalk shadow-sm'
          : 'bg-kairos-base-color text-kairos-charcoal/70 hover:text-kairos-charcoal hover:bg-kairos-white-grey'
      }`}
    >
      {label}
    </button>
  );
}