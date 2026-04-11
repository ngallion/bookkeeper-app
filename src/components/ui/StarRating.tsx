import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
}

function HalfStar({ size }: { size: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Empty backing */}
      <Star size={size} className="text-paper-300/30" />
      {/* Filled left half */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: "50%" }}
      >
        <Star size={size} className="text-amber-400 fill-amber-400" />
      </div>
    </div>
  );
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 18,
}: StarRatingProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>, n: number) => {
    if (!onChange) return;
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    onChange(x < width / 2 ? n - 0.5 : n);
  };

  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => {
        const full = value >= n;
        const half = !full && value >= n - 0.5;

        return (
          <button
            key={n}
            disabled={readonly}
            onClick={(e) => handleClick(e, n)}
            className={`transition-transform duration-100 ${
              readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
            }`}
          >
            {full ? (
              <Star size={size} className="text-amber-400 fill-amber-400" />
            ) : half ? (
              <HalfStar size={size} />
            ) : (
              <Star size={size} className="text-paper-300/30" />
            )}
          </button>
        );
      })}
    </div>
  );
}
