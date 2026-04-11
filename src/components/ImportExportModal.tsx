import { useRef, useState } from "react";
import { X, Download, Share2, CheckCircle, AlertCircle } from "lucide-react";
import { useBookStore } from "../store/bookStore";
import { validateBackup } from "../services/backup";
import type { WishlistBook, ReadBook } from "../types/book";

interface ImportExportModalProps {
  open: boolean;
  onClose: () => void;
}

type ImportStatus =
  | { type: "idle" }
  | { type: "success"; wishlist: number; read: number }
  | { type: "error"; message: string };

export function ImportExportModal({ open, onClose }: ImportExportModalProps) {
  const { wishlist, readBooks, importState } = useBookStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<ImportStatus>({
    type: "idle",
  });
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);
  const [pendingData, setPendingData] = useState<{
    wishlist: WishlistBook[];
    readBooks: ReadBook[];
    version: number;
    exportedAt: string;
  } | null>(null);

  if (!open) return null;

  const handleExport = async () => {
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      wishlist,
      readBooks,
    };
    const filename = `bookkeeper-backup-${new Date().toISOString().slice(0, 10)}.json`;
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: "application/json",
    });

    const file = new File([blob], filename, { type: "application/json" });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: "Bookkeeper backup" });
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportStatus({ type: "idle" });
    setConfirmOverwrite(false);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        const result = validateBackup(parsed);
        if (!result.ok) {
          setImportStatus({ type: "error", message: result.error });
          return;
        }
        if (wishlist.length > 0 || readBooks.length > 0) {
          setPendingData(result.data);
          setConfirmOverwrite(true);
        } else {
          importState(result.data);
          setImportStatus({
            type: "success",
            wishlist: result.data.wishlist.length,
            read: result.data.readBooks.length,
          });
        }
      } catch {
        setImportStatus({
          type: "error",
          message:
            "Could not parse file — make sure it's a valid Bookkeeper backup.",
        });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const confirmImport = () => {
    if (!pendingData) return;
    importState(pendingData);
    setImportStatus({
      type: "success",
      wishlist: pendingData.wishlist.length,
      read: pendingData.readBooks.length,
    });
    setConfirmOverwrite(false);
    setPendingData(null);
  };

  const totalBooks = wishlist.length + readBooks.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-ink-900/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-ink-700 rounded-2xl shadow-2xl border border-paper-300/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-paper-300/10">
          <span className="font-semibold text-paper-100">Backup & Restore</span>
          <button
            onClick={onClose}
            className="text-paper-300/50 hover:text-paper-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col gap-3">
          {/* Export */}
          <div className="bg-ink-600 rounded-xl p-4 flex flex-col gap-3">
            <div>
              <p className="text-paper-100 font-medium text-sm">Export</p>
              <p className="text-paper-300/50 text-xs mt-0.5">
                Download your library as a JSON file
                {totalBooks > 0 &&
                  ` (${totalBooks} book${totalBooks === 1 ? "" : "s"})`}
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={totalBooks === 0}
              className="flex items-center justify-center gap-2 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-default text-ink-900 font-semibold text-sm transition-colors"
            >
              <Share2 size={15} />
              Export backup
            </button>
          </div>

          {/* Import */}
          <div className="bg-ink-600 rounded-xl p-4 flex flex-col gap-3">
            <div>
              <p className="text-paper-100 font-medium text-sm">Import</p>
              <p className="text-paper-300/50 text-xs mt-0.5">
                Restore from a backup file — this replaces your current library
              </p>
            </div>

            {confirmOverwrite ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-amber-400 bg-amber-400/10 rounded-lg px-3 py-2">
                  This will replace your {totalBooks} existing book
                  {totalBooks === 1 ? "" : "s"} with{" "}
                  {(pendingData?.wishlist.length ?? 0) +
                    (pendingData?.readBooks.length ?? 0)}{" "}
                  from the backup. Continue?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setConfirmOverwrite(false);
                      setPendingData(null);
                    }}
                    className="flex-1 py-1.5 rounded-lg border border-paper-300/10 text-paper-300/60 hover:text-paper-100 text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmImport}
                    className="flex-1 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-ink-900 font-semibold text-sm transition-colors"
                  >
                    Replace
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-2 rounded-lg bg-ink-700 hover:bg-ink-800 text-paper-100 text-sm transition-colors border border-paper-300/10"
              >
                <Download size={15} />
                Choose backup file
              </button>
            )}

            {importStatus.type === "success" && (
              <div className="flex items-start gap-2 text-xs text-emerald-400 bg-emerald-400/10 rounded-lg px-3 py-2">
                <CheckCircle size={13} className="mt-0.5 shrink-0" />
                <span>
                  Imported {importStatus.wishlist} wishlist book
                  {importStatus.wishlist === 1 ? "" : "s"} and{" "}
                  {importStatus.read} read book
                  {importStatus.read === 1 ? "" : "s"}.
                </span>
              </div>
            )}
            {importStatus.type === "error" && (
              <div className="flex items-start gap-2 text-xs text-red-400 bg-red-400/10 rounded-lg px-3 py-2">
                <AlertCircle size={13} className="mt-0.5 shrink-0" />
                <span>{importStatus.message}</span>
              </div>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
