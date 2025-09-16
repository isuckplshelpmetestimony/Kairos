interface InlineToggleProps {
  label: string;
  isSelected: boolean;
  onToggle: () => void;
  selectedIcon?: React.ReactNode;
  ariaRole?: 'checkbox' | 'switch';
}

export function InlineToggle({ label, isSelected, onToggle, selectedIcon, ariaRole = 'checkbox' }: InlineToggleProps) {
  return (
    <button
      type="button"
      role={ariaRole}
      aria-checked={isSelected}
      aria-label={label}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onToggle();
        }
      }}
      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kairos-charcoal/30 ${
        isSelected
          ? 'bg-kairos-soft-black text-kairos-chalk shadow-sm'
          : 'bg-kairos-base-color text-kairos-charcoal/70 hover:text-kairos-charcoal hover:bg-kairos-white-grey'
      }`}
    >
      {isSelected && (
        <span aria-hidden="true" className="inline-flex items-center justify-center mr-1 align-middle">
          {selectedIcon ?? (
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.5 7.5a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414l2.293 2.293 6.793-6.793a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </span>
      )}
      {label}
    </button>
  );
}