import { useState } from 'react';

interface ToggleButtonProps {
  label: string;
  options: string[];
  defaultSelected?: string;
  className?: string;
}

export function ToggleButton({ label, options, defaultSelected, className = "" }: ToggleButtonProps) {
  const [selected, setSelected] = useState(defaultSelected || options[0]);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="text-sm font-medium text-kairos-charcoal">{label}</label>
      <div className="flex bg-kairos-base-color rounded-full p-1 shadow-sm">
        {options.map((option) => (
          <button
            key={option}
            onClick={() => setSelected(option)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              selected === option
                ? 'bg-white text-kairos-charcoal shadow-sm'
                : 'text-kairos-charcoal/70 hover:text-kairos-charcoal'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}