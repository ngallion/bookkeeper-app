import { useState, useRef, useEffect, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Plus, Check, ScanBarcode, PenLine } from "lucide-react";
import { searchBooks } from "../services/openLibrary";
import { useBookStore } from "../store/bookStore";
import { BookCover } from "./ui/BookCover";
import { ManualBookModal } from "./ManualBookModal";
import type { OLSearchResult } from "../types/book";

const BarcodeScannerModal = lazy(() =>
  import("./BarcodeScannerModal").then((m) => ({
    default: m.BarcodeScannerModal,
  })),
);

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onScannerOpenChange?: (open: boolean) => void;
}

export function SearchModal({ open, onClose, onScannerOpenChange }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);

  const openScanner = () => { setScannerOpen(true); onScannerOpenChange?.(true); };
  const closeScanner = () => { setScannerOpen(false); onScannerOpenChange?.(false); };
  const [manualOpen, setManualOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addToWishlist, isInWishlist, isRead } = useBookStore();

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setTimeout(() => {
        setQuery("");
        setDebouncedQuery("");
      }, 0);
    }
  }, [open]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(t);
  }, [query]);

  const { data: results = [], isFetching } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchBooks(debouncedQuery),
    enabled: debouncedQuery.length > 1,
    staleTime: 1000 * 60 * 5,
  });

  const handleAdd = (book: OLSearchResult) => {
    addToWishlist({
      id: book.key,
      title: book.title,
      author: book.author_name?.[0] ?? "Unknown author",
      coverId: book.cover_i,
      score: 5,
      tags: [],
      firstPublishYear: book.first_publish_year,
      pages: book.number_of_pages_median,
    });
  };

  if (!open) return null;

  return (
    <>
      <Suspense fallback={null}>
        <BarcodeScannerModal
          open={scannerOpen}
          onClose={closeScanner}
        />
      </Suspense>
      <div
        className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          className="absolute inset-0 bg-ink-900/80 backdrop-blur-sm"
          onClick={onClose}
        />

        <div className="relative w-full max-w-2xl bg-ink-700 rounded-2xl shadow-2xl border border-paper-300/10 overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-paper-300/10">
            <Search size={18} className="text-paper-300/50 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a book..."
              className="flex-1 bg-transparent text-paper-100 placeholder-paper-300/40 outline-none text-base"
            />
            {isFetching && (
              <div className="w-4 h-4 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin shrink-0" />
            )}
            <button
              onClick={openScanner}
              title="Scan barcode"
              className="text-paper-300/50 hover:text-amber-400 transition-colors shrink-0"
            >
              <ScanBarcode size={18} />
            </button>
            <button
              onClick={onClose}
              className="text-paper-300/50 hover:text-paper-100 transition-colors shrink-0"
            >
              <X size={18} />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {results.length === 0 &&
              debouncedQuery.length > 1 &&
              !isFetching && (
                <div className="flex flex-col items-center gap-3 py-10">
                  <p className="text-paper-300/50 text-sm">No results found</p>
                  <button
                    onClick={() => setManualOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-ink-600 hover:bg-ink-700 text-paper-300/70 hover:text-paper-100 text-sm transition-colors border border-paper-300/10"
                  >
                    <PenLine size={14} />
                    Add &ldquo;{debouncedQuery}&rdquo; manually
                  </button>
                </div>
              )}
            {results.length === 0 && debouncedQuery.length <= 1 && (
              <p className="text-center text-paper-300/40 py-12 text-sm">
                Type to search Open Library...
              </p>
            )}
            {results.map((book) => {
              const inWishlist = isInWishlist(book.key);
              const alreadyRead = isRead(book.key);
              const added = inWishlist || alreadyRead;

              return (
                <div
                  key={book.key}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-ink-600/50 transition-colors border-b border-paper-300/5 last:border-0"
                >
                  <BookCover
                    coverId={book.cover_i}
                    title={book.title}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-paper-100 font-medium truncate">
                      {book.title}
                    </p>
                    <p className="text-paper-300/60 text-sm truncate">
                      {book.author_name?.[0] ?? "Unknown"}
                      {book.first_publish_year
                        ? ` · ${book.first_publish_year}`
                        : ""}
                    </p>
                    {alreadyRead && (
                      <span className="text-xs text-amber-400/70">
                        Already read
                      </span>
                    )}
                    {inWishlist && !alreadyRead && (
                      <span className="text-xs text-amber-400/70">
                        On wishlist
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => !added && handleAdd(book)}
                    disabled={added}
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      added
                        ? "bg-amber-400/20 text-amber-400 cursor-default"
                        : "bg-ink-600 text-paper-300/60 hover:bg-amber-400 hover:text-ink-900"
                    }`}
                  >
                    {added ? <Check size={14} /> : <Plus size={14} />}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer: manual entry */}
          <div className="border-t border-paper-300/10 px-4 py-2.5 flex justify-center">
            <button
              onClick={() => setManualOpen(true)}
              className="flex items-center gap-1.5 text-xs text-paper-300/40 hover:text-paper-300/70 transition-colors"
            >
              <PenLine size={12} />
              Can&rsquo;t find it? Add manually
            </button>
          </div>
        </div>
      </div>
      <ManualBookModal
        open={manualOpen}
        onClose={() => setManualOpen(false)}
        initialTitle={debouncedQuery}
      />
    </>
  );
}
