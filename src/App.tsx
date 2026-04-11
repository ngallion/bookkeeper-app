import { useState } from "react";
import {
  BookMarked,
  BookCheck,
  Plus,
  HardDriveDownload,
  Settings,
} from "lucide-react";
import { useBookStore } from "./store/bookStore";
import { WishlistView } from "./components/WishlistView";
import { ReadBooksView } from "./components/ReadBooksView";
import { SettingsModal } from "./components/SettingsView";
import { SearchModal } from "./components/SearchModal";
import { ImportExportModal } from "./components/ImportExportModal";
import { UpdateBanner } from "./components/UpdateBanner";
import { BackupReminderBanner } from "./components/BackupReminderBanner";
import { PossumCompanion } from "./components/PossumCompanion";

type Tab = "wishlist" | "read";

export default function App() {
  const [tab, setTab] = useState<Tab>("wishlist");
  const [searchOpen, setSearchOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { wishlist, readBooks } = useBookStore();

  return (
    <div className="min-h-screen bg-ink-800 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-ink-800/90 backdrop-blur-md border-b border-paper-300/10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <BookMarked size={22} className="text-amber-400" />
            <span className="text-paper-100 font-bold text-lg tracking-tight">
              Bookkeeper
            </span>
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            title="Settings"
            className="w-9 h-9 rounded-xl bg-ink-700 hover:bg-ink-600 text-paper-300/60 hover:text-paper-100 transition-all border border-paper-300/10 flex items-center justify-center"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={() => setBackupOpen(true)}
            title="Backup & Restore"
            className="w-9 h-9 rounded-xl bg-ink-700 hover:bg-ink-600 text-paper-300/60 hover:text-paper-100 transition-all border border-paper-300/10 flex items-center justify-center"
          >
            <HardDriveDownload size={16} />
          </button>
          <button
            onClick={() => setSearchOpen(true)}
            title="Add a book"
            className="hidden sm:flex w-9 h-9 rounded-xl bg-amber-400 hover:bg-amber-300 text-ink-900 items-center justify-center transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="sticky top-14.25 z-30 bg-ink-800/90 backdrop-blur-md border-b border-paper-300/10">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex gap-1">
            <TabButton
              active={tab === "wishlist"}
              onClick={() => setTab("wishlist")}
              icon={<BookMarked size={15} />}
              label="Wishlist"
              count={wishlist.length}
            />
            <TabButton
              active={tab === "read"}
              onClick={() => setTab("read")}
              icon={<BookCheck size={15} />}
              label="Read"
              count={readBooks.length}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        {tab === "wishlist" ? (
          <WishlistView onDetailOpenChange={setDetailOpen} />
        ) : (
          <ReadBooksView onDetailOpenChange={setDetailOpen} />
        )}
      </main>

      {/* FAB — mobile only */}
      <button
        onClick={() => setSearchOpen(true)}
        className="fixed bottom-6 right-6 sm:hidden w-14 h-14 rounded-full bg-amber-400 hover:bg-amber-300 text-ink-900 shadow-lg shadow-amber-400/30 flex items-center justify-center transition-all active:scale-95"
      >
        <Plus size={24} />
      </button>

      <SearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onScannerOpenChange={setScannerOpen}
      />
      <UpdateBanner />
      <BackupReminderBanner onExport={() => setBackupOpen(true)} />
      <ImportExportModal
        open={backupOpen}
        onClose={() => setBackupOpen(false)}
      />
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <div className={`transition-opacity duration-300 ${settingsOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        <PossumCompanion
          isSearching={searchOpen || scannerOpen || detailOpen}
          activeTab={tab}
        />
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
        active
          ? "border-amber-400 text-amber-400"
          : "border-transparent text-paper-300/50 hover:text-paper-100"
      }`}
    >
      {icon}
      {label}
      {count !== undefined && count > 0 && (
        <span
          className={`text-xs px-1.5 py-0.5 rounded-full ${
            active
              ? "bg-amber-400/20 text-amber-400"
              : "bg-ink-700 text-paper-300/50"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}
