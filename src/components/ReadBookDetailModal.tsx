import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { X, Trash2 } from "lucide-react";
import { useBookStore } from "../store/bookStore";
import { fetchWorkDescription } from "../services/openLibrary";
import { BookCover } from "./ui/BookCover";
import { StarRating } from "./ui/StarRating";
import type { ReadBook } from "../types/book";

interface ReadBookDetailModalProps {
  book: ReadBook;
  onClose: () => void;
}

export function ReadBookDetailModal({ book, onClose }: ReadBookDetailModalProps) {
  const { updateReadBook, removeFromRead } = useBookStore();

  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  const [year, setYear] = useState(book.firstPublishYear?.toString() ?? "");
  const [pages, setPages] = useState(book.pages?.toString() ?? "");
  const [rating, setRating] = useState(book.rating);
  const [notes, setNotes] = useState(book.notes);
  const [dateRead, setDateRead] = useState(book.dateRead);

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
    rating !== book.rating ||
    notes !== book.notes ||
    dateRead !== book.dateRead;

  const handleSave = () => {
    const parsedYear = year ? parseInt(year, 10) : undefined;
    const parsedPages = pages ? parseInt(pages, 10) : undefined;
    updateReadBook(book.id, {
      title: title.trim() || book.title,
      author: author.trim() || book.author,
      firstPublishYear: parsedYear && !isNaN(parsedYear) ? parsedYear : undefined,
      pages: parsedPages && !isNaN(parsedPages) ? parsedPages : undefined,
      rating,
      notes,
      dateRead,
    });
    onClose();
  };

  const handleDelete = () => {
    removeFromRead(book.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:px-4">
      <div
        className="absolute inset-0 bg-ink-900/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full sm:max-w-lg bg-ink-700 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-paper-300/10 max-h-[92dvh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-paper-300/10 shrink-0">
          <span className="font-semibold text-paper-100">Book details</span>
          <button
            onClick={onClose}
            className="text-paper-300/50 hover:text-paper-100 transition-colors"
          >
            <X size={18} />
          </button>
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

          {/* Rating + Date */}
          <div className="flex gap-6 items-start">
            <div>
              <p className="text-xs text-amber-300/70 uppercase tracking-wider mb-1.5">
                Rating
              </p>
              <StarRating value={rating} onChange={setRating} size={22} />
            </div>
            <Field label="Date read">
              <input
                type="date"
                value={dateRead}
                onChange={(e) => setDateRead(e.target.value)}
                className="input"
              />
            </Field>
          </div>

          {/* Description */}
          {isOLBook && (
            <div>
              <p className="text-xs text-amber-300/70 uppercase tracking-wider mb-1.5">
                Description
              </p>
              {descLoading ? (
                <div className="flex gap-1.5 items-center text-paper-300/40 text-sm">
                  <div className="w-3 h-3 border-2 border-paper-300/20 border-t-paper-300/60 rounded-full animate-spin" />
                  Loading…
                </div>
              ) : description ? (
                <p className="text-paper-300/70 text-sm leading-relaxed">
                  {description}
                </p>
              ) : null}
            </div>
          )}

          {/* Notes / review */}
          <div>
            <p className="text-xs text-amber-300/70 uppercase tracking-wider mb-1.5">
              Notes / review
            </p>
            <AutoResizeTextarea
              value={notes}
              onChange={setNotes}
              placeholder="What did you think?"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-4 border-t border-paper-300/10 shrink-0">
          <button
            onClick={handleDelete}
            className="w-9 h-9 rounded-lg bg-ink-600 hover:bg-red-500/20 text-paper-300/50 hover:text-red-400 flex items-center justify-center transition-colors shrink-0"
            title="Remove from read"
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
  );
}

function AutoResizeTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={1}
      className="w-full bg-ink-600 text-paper-100 rounded-lg px-3 py-2 text-sm border border-paper-300/10 focus:border-amber-400/50 outline-none resize-none placeholder-paper-300/30 overflow-hidden"
    />
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
