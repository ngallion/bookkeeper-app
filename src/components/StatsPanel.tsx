import { useMemo } from "react";
import { Star, BookOpen, User, FileText } from "lucide-react";
import { useBookStore } from "../store/bookStore";

export function StatsPanel() {
  const { readBooks } = useBookStore();

  const stats = useMemo(() => {
    const thisYear = new Date().getFullYear();

    const readThisYear = readBooks.filter(
      (b) => new Date(b.dateRead).getFullYear() === thisYear,
    ).length;

    const rated = readBooks.filter((b) => b.rating > 0);
    const avgRating =
      rated.length > 0
        ? rated.reduce((sum, b) => sum + b.rating, 0) / rated.length
        : null;

    const authorCounts: Record<string, number> = {};
    for (const b of readBooks) {
      authorCounts[b.author] = (authorCounts[b.author] ?? 0) + 1;
    }
    const topAuthor =
      Object.keys(authorCounts).length > 0
        ? Object.entries(authorCounts).sort((a, b) => b[1] - a[1])[0][0]
        : null;

    const pagesRead = readBooks
      .filter((b) => b.pages != null)
      .reduce((sum, b) => sum + (b.pages ?? 0), 0);

    return { readThisYear, avgRating, topAuthor, pagesRead };
  }, [readBooks]);

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <StatCard
        icon={<BookOpen size={14} className="text-amber-400" />}
        label={`Read in ${new Date().getFullYear()}`}
        value={String(stats.readThisYear)}
      />
      <StatCard
        icon={<Star size={14} className="text-amber-400" />}
        label="Avg rating"
        value={stats.avgRating != null ? stats.avgRating.toFixed(1) : "—"}
      />
      <StatCard
        icon={<User size={14} className="text-amber-400" />}
        label="Top author"
        value={stats.topAuthor ?? "—"}
        truncate
      />
      <StatCard
        icon={<FileText size={14} className="text-amber-400" />}
        label="Pages read"
        value={stats.pagesRead > 0 ? stats.pagesRead.toLocaleString() : "—"}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  truncate = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  truncate?: boolean;
}) {
  return (
    <div className="bg-ink-700 rounded-xl p-3 border border-paper-300/5 flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-paper-300/50 text-xs">
        {icon}
        {label}
      </div>
      <p
        className={`text-paper-100 font-semibold text-base leading-tight ${truncate ? "truncate" : ""}`}
        title={truncate ? value : undefined}
      >
        {value}
      </p>
    </div>
  );
}
