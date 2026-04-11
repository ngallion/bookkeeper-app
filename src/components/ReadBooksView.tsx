import { useState } from "react";
import { Trash2, BookOpen, Pencil, Check, X } from "lucide-react";
import { useBookStore } from "../store/bookStore";
import { BookCover } from "./ui/BookCover";
import { StarRating } from "./ui/StarRating";
import type { ReadBook } from "../types/book";

type SortKey = "dateRead" | "rating" | "title";

export function ReadBooksView() {
  const { readBooks, removeFromRead, updateReadBook } = useBookStore();
  const [sort, setSort] = useState<SortKey>("dateRead");
  const [editing, setEditing] = useState<string | null>(null);
  const [editState, setEditState] = useState<
    Partial<Pick<ReadBook, "rating" | "notes" | "dateRead">>
  >({});

  const sorted = [...readBooks].sort((a, b) => {
    if (sort === "rating") return b.rating - a.rating;
    if (sort === "title") return a.title.localeCompare(b.title);
    return new Date(b.dateRead).getTime() - new Date(a.dateRead).getTime();
  });

  const startEdit = (book: ReadBook) => {
    setEditing(book.id);
    setEditState({
      rating: book.rating,
      notes: book.notes,
      dateRead: book.dateRead,
    });
  };

  const saveEdit = (id: string) => {
    updateReadBook(id, editState);
    setEditing(null);
  };

  if (readBooks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl bg-ink-700 flex items-center justify-center">
          <BookOpen size={28} className="text-paper-300/30" />
        </div>
        <div>
          <p className="text-paper-100 font-medium">No books read yet</p>
          <p className="text-paper-300/50 text-sm mt-1">
            Mark books from your wishlist as read, or add them directly
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
        {(["dateRead", "rating", "title"] as SortKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setSort(key)}
            className={`text-sm px-3 py-1 rounded-full transition-colors ${
              sort === key
                ? "bg-amber-400 text-ink-900 font-semibold"
                : "text-paper-300/60 hover:text-paper-100"
            }`}
          >
            {key === "dateRead"
              ? "Date read"
              : key === "rating"
                ? "Rating"
                : "Title"}
          </button>
        ))}
      </div>

      {/* Book list */}
      <div className="flex flex-col gap-3">
        {sorted.map((book) => {
          const isEditing = editing === book.id;
          return (
            <div
              key={book.id}
              className="bg-ink-700 rounded-xl p-4 border border-paper-300/5 hover:border-paper-300/10 transition-colors"
            >
              <div className="flex gap-4">
                <BookCover
                  coverId={book.coverId}
                  title={book.title}
                  size="md"
                />
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
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => saveEdit(book.id)}
                            className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center hover:bg-amber-400/30 transition-colors"
                          >
                            <Check size={15} />
                          </button>
                          <button
                            onClick={() => setEditing(null)}
                            className="w-8 h-8 rounded-lg bg-ink-600 text-paper-300/50 flex items-center justify-center hover:text-paper-100 transition-colors"
                          >
                            <X size={15} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(book)}
                            className="w-8 h-8 rounded-lg bg-ink-600 hover:bg-amber-400/20 text-paper-300/50 hover:text-amber-400 flex items-center justify-center transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => removeFromRead(book.id)}
                            className="w-8 h-8 rounded-lg bg-ink-600 hover:bg-red-500/20 text-paper-300/50 hover:text-red-400 flex items-center justify-center transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="mt-2">
                    <StarRating
                      value={
                        isEditing
                          ? (editState.rating ?? book.rating)
                          : book.rating
                      }
                      onChange={
                        isEditing
                          ? (r) => setEditState((s) => ({ ...s, rating: r }))
                          : undefined
                      }
                      readonly={!isEditing}
                      size={16}
                    />
                  </div>

                  {/* Date read */}
                  {isEditing ? (
                    <input
                      type="date"
                      value={editState.dateRead ?? book.dateRead}
                      onChange={(e) =>
                        setEditState((s) => ({
                          ...s,
                          dateRead: e.target.value,
                        }))
                      }
                      className="mt-2 bg-ink-600 text-paper-100 rounded-lg px-2 py-1 outline-none border border-paper-300/10 focus:border-amber-400/50 text-xs"
                    />
                  ) : (
                    <p className="text-paper-300/40 text-xs mt-1">
                      Read{" "}
                      {new Date(book.dateRead).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  )}

                  {/* Notes */}
                  {isEditing ? (
                    <textarea
                      value={editState.notes ?? book.notes}
                      onChange={(e) =>
                        setEditState((s) => ({ ...s, notes: e.target.value }))
                      }
                      placeholder="Add notes or a review…"
                      rows={2}
                      className="mt-2 w-full bg-ink-600 text-paper-100 rounded-lg px-2 py-1 outline-none border border-paper-300/10 focus:border-amber-400/50 text-sm resize-none placeholder-paper-300/30"
                    />
                  ) : (
                    book.notes && (
                      <p className="text-paper-300/70 text-sm mt-2 leading-relaxed line-clamp-3">
                        {book.notes}
                      </p>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
