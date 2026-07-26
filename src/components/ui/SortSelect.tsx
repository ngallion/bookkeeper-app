import { ArrowDownWideNarrow, ArrowUpNarrowWide, ChevronDown } from "lucide-react";

export type SortDirection = "asc" | "desc";

interface SortSelectProps<T extends string> {
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  direction: SortDirection;
  onDirectionChange: (direction: SortDirection) => void;
}

export function SortSelect<T extends string>({
  value,
  options,
  onChange,
  direction,
  onDirectionChange,
}: SortSelectProps<T>) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-paper-300/50 text-sm">Sort by:</span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="appearance-none bg-ink-700 text-paper-100 text-sm rounded-xl pl-3 pr-8 py-1.5 border border-paper-300/10 focus:border-amber-400/40 outline-none transition-colors cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-paper-300/40 pointer-events-none"
        />
      </div>
      <button
        onClick={() => onDirectionChange(direction === "asc" ? "desc" : "asc")}
        title={direction === "asc" ? "Ascending" : "Descending"}
        className="h-8 w-8 rounded-xl bg-ink-700 border border-paper-300/10 hover:border-amber-400/40 text-paper-300/60 hover:text-paper-100 flex items-center justify-center transition-colors"
      >
        {direction === "asc" ? (
          <ArrowUpNarrowWide size={15} />
        ) : (
          <ArrowDownWideNarrow size={15} />
        )}
      </button>
    </div>
  );
}