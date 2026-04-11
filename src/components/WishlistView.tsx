import { useState } from "react";
import { Trash2, BookCheck, Tag, X } from "lucide-react";
import { useBookStore } from "../store/bookStore";
import { BookCover } from "./ui/BookCover";
import { ScoreSelector } from "./ui/ScoreSelector";
import { MarkReadModal } from "./MarkReadModal";
import type { WishlistBook } from "../types/book";

type SortKey = "score" | "title" | "addedAt";

export function WishlistView() {
  const {
    wishlist,
    removeFromWishlist,
    updateWishlistScore,
    updateWishlistTags,
  } = useBookStore();
  const [sort, setSort] = useState<SortKey>("score");
  const [markReadBook, setMarkReadBook] = useState<WishlistBook | null>(null);
  const [tagInput, setTagInput] = useState<Record<string, string>>({});

  const sorted = [...wishlist].sort((a, b) => {
    if (sort === "score") return b.score - a.score;
    if (sort === "title") return a.title.localeCompare(b.title);
    return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
  });

  const handleTagAdd = (id: string, value: string) => {
    const tag = value.trim().toLowerCase();
    if (!tag) return;
    const book = wishlist.find((b) => b.id === id);
    if (!book || book.tags.includes(tag)) return;
    updateWishlistTags(id, [...book.tags, tag]);
    setTagInput((prev) => ({ ...prev, [id]: "" }));
  };

  const handleTagRemove = (id: string, tag: string) => {
    const book = wishlist.find((b) => b.id === id);
    if (!book) return;
    updateWishlistTags(
      id,
      book.tags.filter((t) => t !== tag),
    );
  };

  if (wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-ink-700 flex items-center justify-center">
          <BookCheck size={28} className="text-paper-300/30" />
        </div>
        <div>
          <p className="text-paper-100 font-medium">Your wishlist is empty</p>
          <p className="text-paper-300/50 text-sm mt-1">
            Search for books and add them to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Sort bar */}
      <div className="flex items-center gap-2">
        <span className="text-paper-300/50 text-sm">Sort by:</span>
        {(["score", "title", "addedAt"] as SortKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setSort(key)}
            className={`text-sm px-3 py-1 rounded-full transition-colors ${
              sort === key
                ? "bg-amber-400 text-ink-900 font-semibold"
                : "text-paper-300/60 hover:text-paper-100"
            }`}
          >
            {key === "score"
              ? "Priority"
              : key === "addedAt"
                ? "Recently added"
                : "Title"}
          </button>
        ))}
      </div>

      {/* Book list */}
      <div className="flex flex-col gap-3">
        {sorted.map((book) => (
          <div
            key={book.id}
            className="bg-ink-700 rounded-xl p-4 border border-paper-300/5 hover:border-paper-300/10 transition-colors"
          >
            <div className="flex gap-4">
              <BookCover coverId={book.coverId} title={book.title} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-paper-100 font-semibold leading-tight truncate">
                      {book.title}
                    </h3>
                    <p className="text-paper-300/60 text-sm">
                      {book.author}
                      {book.firstPublishYear
                        ? ` · ${book.firstPublishYear}`
                        : ""}
                      {book.pages ? ` · ${book.pages}p` : ""}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => setMarkReadBook(book)}
                      title="Mark as read"
                      className="w-8 h-8 rounded-lg bg-ink-600 hover:bg-amber-400/20 text-paper-300/50 hover:text-amber-400 flex items-center justify-center transition-colors"
                    >
                      <BookCheck size={15} />
                    </button>
                    <button
                      onClick={() => removeFromWishlist(book.id)}
                      title="Remove"
                      className="w-8 h-8 rounded-lg bg-ink-600 hover:bg-red-500/20 text-paper-300/50 hover:text-red-400 flex items-center justify-center transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Score */}
                <div className="mt-3">
                  <ScoreSelector
                    value={book.score}
                    onChange={(score) => updateWishlistScore(book.id, score)}
                    label="Priority"
                  />
                </div>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-1 items-center">
                  {book.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 text-xs bg-ink-600 text-paper-300/70 px-2 py-0.5 rounded-full"
                    >
                      {tag}
                      <button
                        onClick={() => handleTagRemove(book.id, tag)}
                        className="hover:text-red-400 transition-colors"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  <div className="flex items-center gap-1">
                    <Tag size={11} className="text-paper-300/30" />
                    <input
                      value={tagInput[book.id] ?? ""}
                      onChange={(e) =>
                        setTagInput((prev) => ({
                          ...prev,
                          [book.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          handleTagAdd(book.id, tagInput[book.id] ?? "");
                        }
                      }}
                      placeholder="add tag…"
                      className="text-xs bg-transparent text-paper-300/50 placeholder-paper-300/25 outline-none w-20"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {markReadBook && (
        <MarkReadModal
          book={markReadBook}
          onClose={() => setMarkReadBook(null)}
        />
      )}
    </div>
  );
}
