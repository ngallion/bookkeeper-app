import { BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { coverUrl } from "../../services/openLibrary";
import { getCover } from "../../services/db";

interface BookCoverProps {
  coverId?: number;
  /** Book ID used to look up a custom cover blob in IndexedDB */
  bookId?: string;
  /** When true, attempts to load a custom cover from IndexedDB first */
  hasCustomCover?: boolean;
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
  bookId,
  hasCustomCover,
  title,
  size = "md",
  className = "",
}: BookCoverProps) {
  const { width, height, icon } = sizeMap[size];

  // Object URL for the custom cover blob (revoked on unmount / when it changes)
  const [customUrl, setCustomUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!hasCustomCover || !bookId) {
      setCustomUrl(null);
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;

    getCover(bookId).then((blob) => {
      if (cancelled || !blob) return;
      objectUrl = URL.createObjectURL(blob);
      setCustomUrl(objectUrl);
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [bookId, hasCustomCover]);

  // Custom cover takes precedence
  const src = customUrl ?? (coverId ? coverUrl(coverId, size === "lg" ? "L" : "M") : null);

  if (!src) {
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
      src={src}
      alt={`Cover of ${title}`}
      width={width}
      height={height}
      className={`object-cover rounded shrink-0 bg-ink-700 ${className}`}
      loading="lazy"
    />
  );
}
