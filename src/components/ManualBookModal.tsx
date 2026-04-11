import { useState } from "react";
import { X, PenLine } from "lucide-react";
import { useBookStore } from "../store/bookStore";

interface ManualBookModalProps {
  open: boolean;
  onClose: () => void;
  /** Pre-fill the title from the search query */
  initialTitle?: string;
}

export function ManualBookModal({
  open,
  onClose,
  initialTitle = "",
}: ManualBookModalProps) {
  const { addToWishlist, isInWishlist, isRead } = useBookStore();

  const [title, setTitle] = useState(initialTitle);
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");
  const [pages, setPages] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const reset = () => {
    setTitle(initialTitle);
    setAuthor("");
    setYear("");
    setPages("");
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    // Generate a stable local ID from title + author so duplicates are detectable
    const id = `local:${title.trim().toLowerCase().replace(/\s+/g, "-")}-${author.trim().toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`;

    if (isInWishlist(id) || isRead(id)) {
      setError("This book is already in your library.");
      return;
    }

    const parsedYear = year ? parseInt(year, 10) : undefined;
    const parsedPages = pages ? parseInt(pages, 10) : undefined;

    addToWishlist({
      id,
      title: title.trim(),
      author: author.trim() || "Unknown author",
      score: 5,
      tags: [],
      firstPublishYear:
        parsedYear && !isNaN(parsedYear) ? parsedYear : undefined,
      pages: parsedPages && !isNaN(parsedPages) ? parsedPages : undefined,
    });

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-ink-900/80 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-sm bg-ink-700 rounded-2xl shadow-2xl border border-paper-300/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-paper-300/10">
          <div className="flex items-center gap-2">
            <PenLine size={16} className="text-amber-400" />
            <span className="font-semibold text-paper-100">Add manually</span>
          </div>
          <button
            onClick={handleClose}
            className="text-paper-300/50 hover:text-paper-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <div className="px-5 py-4 flex flex-col gap-3">
          <Field label="Title *">
            <input
              autoFocus
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="e.g. The Pragmatic Programmer"
              className="input"
            />
          </Field>

          <Field label="Author">
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="e.g. David Thomas"
              className="input"
            />
          </Field>

          <div className="flex gap-3">
            <Field label="Year">
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g. 1999"
                min={1000}
                max={new Date().getFullYear() + 2}
                className="input"
              />
            </Field>
            <Field label="Pages">
              <input
                type="number"
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                placeholder="e.g. 352"
                min={1}
                className="input"
              />
            </Field>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-4 border-t border-paper-300/10">
          <button
            onClick={handleClose}
            className="flex-1 py-2 rounded-lg border border-paper-300/10 text-paper-300/60 hover:text-paper-100 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-ink-900 font-semibold transition-colors text-sm"
          >
            Add to wishlist
          </button>
        </div>
      </div>
    </div>
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
    <div className="flex flex-col gap-1.5 flex-1">
      <label className="text-xs text-amber-300/70 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}
