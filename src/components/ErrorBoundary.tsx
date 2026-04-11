import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";
import { AlertTriangle, RefreshCw, Trash2 } from "lucide-react";

interface Props {
  children: ReactNode;
  /** Render this instead of the default fallback UI */
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(error, this.reset);
    return <AppErrorFallback error={error} onReset={this.reset} />;
  }
}

function AppErrorFallback({
  error,
  onReset,
}: {
  error: Error;
  onReset: () => void;
}) {
  const clearAndReload = () => {
    try {
      localStorage.removeItem("bookkeeper-store");
    } catch {}
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-ink-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-ink-700 rounded-2xl border border-paper-300/10 p-6 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <div>
            <p className="text-paper-100 font-semibold">Something went wrong</p>
            <p className="text-paper-300/50 text-sm">
              The app hit an unexpected error
            </p>
          </div>
        </div>

        <div className="bg-ink-900 rounded-xl px-4 py-3 font-mono text-xs text-red-400/80 break-all leading-relaxed max-h-32 overflow-y-auto">
          {error.message}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-ink-900 font-semibold text-sm transition-colors"
          >
            <RefreshCw size={15} />
            Try again
          </button>
          <button
            onClick={clearAndReload}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-colors"
          >
            <Trash2 size={15} />
            Clear data and reload
          </button>
          <p className="text-paper-300/30 text-xs text-center">
            Clearing data is permanent and cannot be undone. Export a backup
            first if possible.
          </p>
        </div>
      </div>
    </div>
  );
}
