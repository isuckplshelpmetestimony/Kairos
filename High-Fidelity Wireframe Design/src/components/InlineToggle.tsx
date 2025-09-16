interface InlineToggleProps {
  label: string;
  isSelected: boolean;
  onToggle: () => void;
  selectedIcon?: React.ReactNode;
  ariaRole?: 'checkbox' | 'switch';
  showDropdownChevron?: boolean;
  isOpen?: boolean;
}

export function InlineToggle({ label, isSelected, onToggle, selectedIcon, ariaRole = 'checkbox', showDropdownChevron = false, isOpen = false }: InlineToggleProps) {
  return (
    <button
      type="button"
      role={ariaRole}
      aria-checked={isSelected}
      aria-label={label}
      aria-haspopup={showDropdownChevron ? 'listbox' : undefined}
      aria-expanded={showDropdownChevron ? isOpen : undefined}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onToggle();
        }
      }}
      className={`inline-flex items-center gap-1.5 px-1.5 py-1 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-kairos-charcoal/20 text-kairos-charcoal/80 hover:text-kairos-charcoal`}
    >
      <span className="hover:underline underline-offset-2 decoration-kairos-charcoal/40">{label}</span>
      {showDropdownChevron && (
        <svg
          aria-hidden="true"
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'} opacity-80`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
}