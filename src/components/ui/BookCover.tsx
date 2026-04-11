import { BookOpen } from "lucide-react";
import { coverUrl } from "../../services/openLibrary";

interface BookCoverProps {
  coverId?: number;
  title: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeMap = {
  sm: { width: 48, height: 72, icon: 18 },
  md: { width: 80, height: 120, icon: 28 },
  lg: { width: 128, height: 192, icon: 40 },
};

export function BookCover({
  coverId,
  title,
  size = "md",
  className = "",
}: BookCoverProps) {
  const { width, height, icon } = sizeMap[size];

  if (!coverId) {
    return (
      <div
        className={`flex items-center justify-center bg-ink-700 rounded shrink-0 ${className}`}
        style={{ width, height }}
      >
        <BookOpen size={icon} className="text-paper-300/30" />
      </div>
    );
  }

  return (
    <img
      src={coverUrl(coverId, size === "lg" ? "L" : "M")}
      alt={`Cover of ${title}`}
      width={width}
      height={height}
      className={`object-cover rounded shrink-0 bg-ink-700 ${className}`}
      loading="lazy"
    />
  );
}
