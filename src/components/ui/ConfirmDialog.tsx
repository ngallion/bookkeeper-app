interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Remove",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-ink-900/80 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-xs bg-ink-700 rounded-2xl shadow-2xl border border-paper-300/10 p-5">
        <p className="text-paper-100 font-semibold">{title}</p>
        <p className="text-paper-300/60 text-sm mt-1.5">{message}</p>
        <div className="flex gap-2 mt-4">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-lg border border-paper-300/10 text-paper-300/60 hover:text-paper-100 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-lg bg-red-500/80 hover:bg-red-500 text-white font-semibold transition-colors text-sm"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}