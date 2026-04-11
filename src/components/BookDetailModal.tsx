import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, BookCheck, Trash2 } from "lucide-react";
import { useBookStore } from "../store/bookStore";
import { fetchWorkDescription } from "../services/openLibrary";
import { BookCover } from "./ui/BookCover";
import { ScoreSelector } from "./ui/ScoreSelector";
import { MarkReadModal } from "./MarkReadModal";
import type { WishlistBook } from "../types/book";

interface BookDetailModalProps {
  book: WishlistBook;
  onClose: () => void;
}

export function BookDetailModal({ book, onClose }: BookDetailModalProps) {
  const {
    updateWishlistBook,
    updateWishlistScore,
    updateWishlistTags,
    removeFromWishlist,
  } = useBookStore();

  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [year, setYear] = useState(book.firstPublishYear?.toString() ?? "");
  const [pages, setPages] = useState(book.pages?.toString() ?? "");
  const [notes, setNotes] = useState(book.notes ?? "");
  const [tagInput, setTagInput] = useState("");
  const [markReadOpen, setMarkReadOpen] = useState(false);

  const isOLBook = book.id.startsWith("/works/");

  const { data: description, isLoading: descLoading } = useQuery({
    queryKey: ["work-description", book.id],
    queryFn: () => fetchWorkDescription(book.id),
    enabled: isOLBook,
    staleTime: Infinity,
  });

  const isDirty =
    title !== book.title ||
    author !== book.author ||
    year !== (book.firstPublishYear?.toString() ?? "") ||
    pages !== (book.pages?.toString() ?? "") ||
    notes !== (book.notes ?? "");

  const handleSave = () => {
    const parsedYear = year ? parseInt(year, 10) : undefined;
    const parsedPages = pages ? parseInt(pages, 10) : undefined;
    updateWishlistBook(book.id, {
      title: title.trim() || book.title,
      author: author.trim() || book.author,
      firstPublishYear:
        parsedYear && !isNaN(parsedYear) ? parsedYear : undefined,
      pages: parsedPages && !isNaN(parsedPages) ? parsedPages : undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  const handleTagAdd = (value: string) => {
    const tag = value.trim().toLowerCase();
    if (!tag || book.tags.includes(tag)) return;
    updateWishlistTags(book.id, [...book.tags, tag]);
    setTagInput("");
  };

  const handleTagRemove = (tag: string) => {
    updateWishlistTags(
      book.id,
      book.tags.filter((t) => t !== tag),
    );
  };

  const handleDelete = () => {
    removeFromWishlist(book.id);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:px-4">
        <div
          className="absolute inset-0 bg-ink-900/80 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative w-full sm:max-w-lg bg-ink-700 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-paper-300/10 max-h-[92dvh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-paper-300/10 shrink-0">
            <span className="font-semibold text-paper-100">Book details</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMarkReadOpen(true)}
                title="Mark as read"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 text-amber-400 text-xs font-medium transition-colors"
              >
                <BookCheck size={13} />
                Mark read
              </button>
              <button
                onClick={onClose}
                className="text-paper-300/50 hover:text-paper-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="overflow-y-auto flex-1 px-5 py-5 flex flex-col gap-5">
            {/* Cover + core fields */}
            <div className="flex gap-4">
              <BookCover coverId={book.coverId} title={book.title} size="lg" />
              <div className="flex-1 flex flex-col gap-2.5 min-w-0">
                <Field label="Title">
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input"
                  />
                </Field>
                <Field label="Author">
                  <input
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="input"
                  />
                </Field>
                <div className="flex gap-2">
                  <Field label="Year">
                    <input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="—"
                      className="input"
                    />
                  </Field>
                  <Field label="Pages">
                    <input
                      type="number"
                      value={pages}
                      onChange={(e) => setPages(e.target.value)}
                      placeholder="—"
                      className="input"
                    />
                  </Field>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-xs text-amber-300/70 uppercase tracking-wider mb-1.5">
                Description
              </p>
              {isOLBook &&
                (descLoading ? (
                  <div className="flex gap-1.5 items-center text-paper-300/40 text-sm mb-3">
                    <div className="w-3 h-3 border-2 border-paper-300/20 border-t-paper-300/60 rounded-full animate-spin" />
                    Loading…
                  </div>
                ) : description ? (
                  <p className="text-paper-300/70 text-sm leading-relaxed mb-3">
                    {description}
                  </p>
                ) : null)}
              {/* User notes — shown when API has no description, or always for manual books */}
              {!isOLBook || (!descLoading && !description) ? (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add your own description or notes…"
                  rows={4}
                  className="w-full bg-ink-600 text-paper-100 rounded-lg px-3 py-2 text-sm border border-paper-300/10 focus:border-amber-400/50 outline-none resize-none placeholder-paper-300/30"
                />
              ) : (
                !descLoading && (
                  <div>
                    <p className="text-xs text-paper-300/40 uppercase tracking-wider mb-1.5">
                      Your notes
                    </p>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add your own notes…"
                      rows={3}
                      className="w-full bg-ink-600 text-paper-100 rounded-lg px-3 py-2 text-sm border border-paper-300/10 focus:border-amber-400/50 outline-none resize-none placeholder-paper-300/30"
                    />
                  </div>
                )
              )}
            </div>

            {/* Priority */}
            <div>
              <ScoreSelector
                value={book.score}
                onChange={(score) => updateWishlistScore(book.id, score)}
                label="Priority"
              />
            </div>

            {/* Tags */}
            <div>
              <p className="text-xs text-amber-300/70 uppercase tracking-wider mb-1.5">
                Tags
              </p>
              <div className="flex flex-wrap gap-1.5 items-center">
                {book.tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 text-xs bg-ink-600 text-paper-300/70 px-2 py-0.5 rounded-full"
                  >
                    {tag}
                    <button
                      onClick={() => handleTagRemove(tag)}
                      className="hover:text-red-400 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      handleTagAdd(tagInput);
                    }
                  }}
                  placeholder="add tag…"
                  className="text-xs bg-transparent text-paper-300/50 placeholder-paper-300/25 outline-none w-24"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2 px-5 py-4 border-t border-paper-300/10 shrink-0">
            <button
              onClick={handleDelete}
              className="w-9 h-9 rounded-lg bg-ink-600 hover:bg-red-500/20 text-paper-300/50 hover:text-red-400 flex items-center justify-center transition-colors shrink-0"
              title="Remove from wishlist"
            >
              <Trash2 size={15} />
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-paper-300/10 text-paper-300/60 hover:text-paper-100 transition-colors text-sm"
            >
              {isDirty ? "Discard" : "Close"}
            </button>
            {isDirty && (
              <button
                onClick={handleSave}
                className="flex-1 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-ink-900 font-semibold transition-colors text-sm"
              >
                Save
              </button>
            )}
          </div>
        </div>
      </div>

      {markReadOpen && (
        <MarkReadModal
          book={book}
          onClose={() => {
            setMarkReadOpen(false);
            onClose();
          }}
        />
      )}
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 flex-1">
      <label className="text-xs text-amber-300/70 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}
