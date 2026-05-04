import { useState, useEffect } from "react";
import {
  ClipboardCopy,
  Check,
  ExternalLink,
  Heart,
  MessageSquare,
  X,
} from "lucide-react";
import { useBookStore } from "../store/bookStore";

function buildAIPrompt(wishlist: unknown, readBooks: unknown): string {
  return `I use an app called Bookkeeper to track my reading. Here is my current library data as JSON:

WISHLIST (books I want to read):
${JSON.stringify(wishlist, null, 2)}

READ BOOKS (books I have finished):
${JSON.stringify(readBooks, null, 2)}

Based on my reading history and wishlist, please recommend 5–10 books I might enjoy. For each recommendation, briefly explain why it suits my taste.`;
}

interface AILinkProps {
  href: string;
  label: string;
  color: string;
}

function AILink({ href, label, color }: AILinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90 ${color}`}
    >
      {label}
      <ExternalLink size={13} />
    </a>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-xs uppercase tracking-widest text-amber-300/60 font-semibold">
        {title}
      </h2>
      <div className="bg-ink-700 rounded-2xl border border-paper-300/5 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 flex flex-col gap-3 border-b border-paper-300/5 last:border-0">
      {children}
    </div>
  );
}

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const ANIM_MS = 300;

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const { wishlist, readBooks } = useBookStore();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(open);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      setClosing(false);
    } else if (mounted) {
      setClosing(true);
      const t = setTimeout(() => { setMounted(false); setClosing(false); }, ANIM_MS);
      return () => clearTimeout(t);
    }
  }, [open, mounted]);

  if (!mounted) return null;

  const handleCopyPrompt = async () => {
    const prompt = buildAIPrompt(wishlist, readBooks);
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:px-4">
      <style>{`
        @keyframes settings-slide-up {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes settings-slide-down {
          from { transform: translateY(0); }
          to   { transform: translateY(100%); }
        }
      `}</style>
      <div
        className="absolute inset-0 bg-ink-900/80 backdrop-blur-sm transition-opacity duration-300"
        style={{ opacity: closing ? 0 : 1 }}
        onClick={onClose}
      />
      <div
        className="relative w-full sm:max-w-lg bg-ink-800 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-paper-300/10 max-h-[92dvh] flex flex-col"
        style={{ animation: `${closing ? "settings-slide-down" : "settings-slide-up"} ${ANIM_MS}ms cubic-bezier(0.32,0.72,0,1) both` }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-paper-300/10 shrink-0">
          <span className="font-semibold text-paper-100">Settings</span>
          <button
            onClick={onClose}
            className="text-paper-300/50 hover:text-paper-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-5">
          <div className="flex flex-col gap-6 pb-4">
            {/* Feedback */}
            <Section title="Feedback">
              <Row>
                <div className="flex items-start gap-3">
                  <MessageSquare
                    size={18}
                    className="text-paper-300/40 shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-paper-100 text-sm font-medium">
                      Report an issue or suggest a feature
                    </p>
                    <p className="text-paper-300/50 text-xs mt-0.5">
                      Opens GitHub Issues
                    </p>
                  </div>
                  <a
                    href="https://github.com/ngallion/bookkeeper-app/issues/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors shrink-0 mt-0.5"
                  >
                    Open
                    <ExternalLink size={12} />
                  </a>
                </div>
              </Row>
            </Section>

            {/* Support */}
            <Section title="Support Bookkeeper">
              <Row>
                <div className="flex items-start gap-3">
                  <Heart size={18} className="text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-paper-100 text-sm font-medium">
                      Buy me a coffee
                    </p>
                    <p className="text-paper-300/50 text-xs mt-0.5">
                      If you're enjoying Bookkeeper, a tip helps keep it
                      going.
                    </p>
                  </div>
                  <a
                    href="https://ko-fi.com/nicholasgallion"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 transition-colors shrink-0 mt-0.5"
                  >
                    Leave a tip
                    <ExternalLink size={12} />
                  </a>
                </div>
              </Row>
            </Section>

            {/* AI Feedback */}
            <Section title="AI Recommendations">
              <Row>
                <p className="text-paper-300/60 text-sm leading-relaxed">
                  Copy a prompt with your full library data embedded, then paste
                  it into your AI of choice to get personalised book
                  recommendations.
                </p>
                <button
                    onClick={handleCopyPrompt}
                    className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        copied
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-amber-400 hover:bg-amber-300 text-ink-900"
                    }`}
                >
                  {copied ? <Check size={15} /> : <ClipboardCopy size={15} />}
                  {copied ? "Copied!" : "Copy recommendation prompt"}
                </button>
                <div className="flex gap-2">
                  <AILink
                      href="https://claude.ai"
                      label="Claude"
                      color="bg-[#c96442]"
                  />
                  <AILink
                      href="https://chatgpt.com"
                      label="ChatGPT"
                      color="bg-[#10a37f]"
                  />
                </div>
              </Row>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}
