import { useState, useId } from "react";

const STAR_PATH =
  "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";
const ACTIVE = "#fbbf24";
const INACTIVE = "rgba(255,255,255,0.15)";

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
}

function StarSvg({ size, fill }: { size: number; fill: number }) {
  const id = useId();
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor={ACTIVE} />
          <stop offset={`${fill * 100}%`} stopColor={INACTIVE} />
        </linearGradient>
      </defs>
      <path d={STAR_PATH} fill={`url(#${id})`} />
    </svg>
  );
}

export function StarRating({
  value,
  onChange,
  readonly = false,
  size = 18,
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const display = hovered ?? value;

  return (
    <div
      className="flex"
      style={{ gap: 2 }}
      onMouseLeave={() => setHovered(null)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = display >= star ? 1 : display >= star - 0.5 ? 0.5 : 0;
        return (
          <div
            key={star}
            style={{ position: "relative", width: size, height: size }}
          >
            <StarSvg size={size} fill={fill} />
            {!readonly && (
              <>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    right: "50%",
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => setHovered(star - 0.5)}
                  onClick={() => onChange?.(star - 0.5)}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    left: "50%",
                    cursor: "pointer",
                  }}
                  onMouseEnter={() => setHovered(star)}
                  onClick={() => onChange?.(star)}
                />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
