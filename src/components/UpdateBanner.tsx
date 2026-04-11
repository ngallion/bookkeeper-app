import { useRegisterSW } from "virtual:pwa-register/react";
import { RefreshCw, X } from "lucide-react";

export function UpdateBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-ink-700 border border-amber-400/30 text-paper-100 text-sm px-4 py-3 rounded-xl shadow-xl w-[calc(100%-2rem)] max-w-sm">
      <RefreshCw size={15} className="text-amber-400 shrink-0" />
      <span className="flex-1">A new version is available</span>
      <button
        onClick={() => updateServiceWorker(true)}
        className="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-ink-900 font-semibold text-xs transition-colors shrink-0"
      >
        Refresh
      </button>
      <button
        onClick={() => setNeedRefresh(false)}
        className="text-paper-300/40 hover:text-paper-100 transition-colors"
      >
        <X size={15} />
      </button>
    </div>
  );
}
