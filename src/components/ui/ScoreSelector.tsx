interface ScoreSelectorProps {
  value: number;
  onChange: (score: number) => void;
  label?: string;
}

export function ScoreSelector({
  value,
  onChange,
  label = "Priority",
}: ScoreSelectorProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-xs text-amber-300/70 uppercase tracking-wider">
          {label}
        </span>
      )}
      <div className="flex gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`w-7 h-7 rounded text-xs font-bold transition-all duration-150 ${
              n <= value
                ? "bg-amber-400 text-ink-900 shadow-sm shadow-amber-400/30"
                : "bg-ink-700 text-paper-300/50 hover:bg-ink-600 hover:text-paper-300"
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  );
}
