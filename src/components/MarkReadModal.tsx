import { useState } from "react";
import { X, BookOpen } from "lucide-react";
import { useBookStore } from "../store/bookStore";
import { StarRating } from "./ui/StarRating";
import { BookCover } from "./ui/BookCover";
import type { WishlistBook } from "../types/book";

interface MarkReadModalProps {
  book: WishlistBook;
  onClose: () => void;
}

export function MarkReadModal({ book, onClose }: MarkReadModalProps) {
  const { moveToRead } = useBookStore();
  const [rating, setRating] = useState(3);
  const [notes, setNotes] = useState("");
  const [dateRead, setDateRead] = useState(
    new Date().toISOString().slice(0, 10),
  );

  const handleSubmit = () => {
    moveToRead(book.id, rating, notes, dateRead);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-ink-900/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-ink-700 rounded-2xl shadow-2xl border border-paper-300/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-paper-300/10">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-amber-400" />
            <span className="font-semibold text-paper-100">Mark as Read</span>
          </div>
          <button
            onClick={onClose}
            className="text-paper-300/50 hover:text-paper-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-5">
          {/* Book info */}
          <div className="flex gap-3 items-center">
            <BookCover
              coverId={book.coverId}
              bookId={book.id}
              hasCustomCover={book.hasCustomCover}
              title={book.title}
              size="sm"
            />
            <div>
              <p className="text-paper-100 font-medium leading-tight">
                {book.title}
              </p>
              <p className="text-paper-300/60 text-sm">{book.author}</p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-amber-300/70 uppercase tracking-wider">
              Your rating
            </label>
            <StarRating value={rating} onChange={setRating} size={24} />
          </div>

          {/* Date */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-amber-300/70 uppercase tracking-wider">
              Date read
            </label>
            <input
              type="date"
              value={dateRead}
              onChange={(e) => setDateRead(e.target.value)}
              className="bg-ink-600 text-paper-100 rounded-lg px-3 py-2 outline-none border border-paper-300/10 focus:border-amber-400/50 text-sm"
            />
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-2">
            <label className="text-xs text-amber-300/70 uppercase tracking-wider">
              Notes / review
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you think? (optional)"
              rows={3}
              className="bg-ink-600 text-paper-100 rounded-lg px-3 py-2 outline-none border border-paper-300/10 focus:border-amber-400/50 text-sm resize-none placeholder-paper-300/30"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-4 border-t border-paper-300/10">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-paper-300/10 text-paper-300/60 hover:text-paper-100 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2 rounded-lg bg-amber-400 text-ink-900 font-semibold hover:bg-amber-300 transition-colors text-sm"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
