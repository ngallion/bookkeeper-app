import { useRef } from "react";
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

function ratingFromClientX(container: HTMLDivElement, clientX: number): number {
  const { left, width } = container.getBoundingClientRect();
  const x = Math.max(0, Math.min(clientX - left, width));
  const raw = (x / width) * 5;
  // Round to nearest 0.5
  return Math.max(0.5, Math.round(raw * 2) / 2);
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 18,
}: StarRatingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>, n: number) => {
    if (!onChange) return;
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    onChange(x < width / 2 ? n - 0.5 : n);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!onChange || readonly) return;
    dragging.current = true;
    // Prevent scroll while dragging stars
    e.preventDefault();
    const touch = e.touches[0];
    onChange(ratingFromClientX(containerRef.current!, touch.clientX));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!onChange || readonly || !dragging.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    onChange(ratingFromClientX(containerRef.current!, touch.clientX));
  };

  const handleTouchEnd = () => {
    dragging.current = false;
  };

  return (
    <div
      ref={containerRef}
      className="flex gap-0.5"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
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
