interface QuickChipsProps {
  options: string[];
  currentValue: string;
  onSelect: (val: string) => void;
}

export function QuickChips({ options, currentValue, onSelect }: QuickChipsProps) {
  return (
    <div className="no-export flex items-center gap-1 self-end sm:self-center">
      {options.map(opt => {
        const isSelected = currentValue.toLowerCase() === opt.toLowerCase();
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(opt)}
            className={`px-2 py-0.5 text-[11px] font-medium rounded transition ${
              isSelected
                ? 'accent-btn shadow-none'
                : 'bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:opacity-80'
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
