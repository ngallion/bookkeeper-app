import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 18,
}: StarRatingProps) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          disabled={readonly}
          onClick={() => onChange?.(n)}
          className={`transition-colors duration-100 ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
        >
          <Star
            size={size}
            className={
              n <= value ? "text-amber-400 fill-amber-400" : "text-paper-300/30"
            }
          />
        </button>
      ))}
    </div>
  );
}
