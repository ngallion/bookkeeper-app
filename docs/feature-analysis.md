# Bookkeeper — Feature Analysis

**Date**: 2026-04-11
**Scope**: Full audit of implemented features vs. baseline spec, with gap analysis and recommendations

---

## 1. Executive Summary

Bookkeeper is a single-user, offline-first reading tracker built as a PWA. Its core value proposition is privacy and simplicity: no accounts, no server, no cloud dependency. All state lives in `localStorage`.

The app has grown meaningfully beyond its original baseline (`docs/features.md`). Several items that were explicitly marked _out of scope_ have since been shipped (notably backup/export, barcode scanning, and manual book entry). This document captures the current full feature set, measures it against the baseline, and identifies areas for future investment.

---

## 2. Current Feature Inventory

### 2.1 Wishlist

| Feature                               | Baseline | Implemented | Notes                                             |
| ------------------------------------- | -------- | ----------- | ------------------------------------------------- |
| Search Open Library by title / author | Yes      | Yes         | 12 results, 350 ms debounce                       |
| Add book to wishlist                  | Yes      | Yes         | Duplicate check prevents re-adding                |
| Priority score (1–10)                 | Yes      | Yes         | `ScoreSelector` component with visual fill        |
| Free-form tags                        | Yes      | Yes         | Enter or comma to confirm; displayed as badges    |
| Sort by priority, title, date added   | Yes      | Yes         | Default: priority descending                      |
| Mark wishlist book as read            | Yes      | Yes         | Opens `MarkReadModal`, then removes from wishlist |
| Remove from wishlist                  | Implied  | Yes         | Trash icon per row                                |

### 2.2 Read Books

| Feature                                 | Baseline | Implemented | Notes                                        |
| --------------------------------------- | -------- | ----------- | -------------------------------------------- |
| Star rating (1–5)                       | Yes      | Yes         | Half-star support via custom SVG gradient    |
| Free-form notes                         | Yes      | Yes         | Textarea, unlimited length                   |
| Date read                               | Yes      | Yes         | Defaults to today in `MarkReadModal`         |
| Inline editing of rating / notes / date | Yes      | Yes         | Pencil icon → form in place → save or cancel |
| Sort by date read, rating, title        | Yes      | Yes         | Default: date read descending                |
| Remove from read list                   | Implied  | Yes         | Trash icon per row                           |

### 2.3 Book Discovery & Entry

| Feature                        | Baseline           | Implemented | Notes                                                    |
| ------------------------------ | ------------------ | ----------- | -------------------------------------------------------- |
| Open Library full-text search  | Yes                | Yes         |                                                          |
| ISBN barcode scanner           | No (not mentioned) | Yes         | `@zxing/browser`, lazy-loaded; torch + camera switch     |
| Manual book entry              | No (not mentioned) | Yes         | Custom title / author / year / pages; stable `local:` ID |
| Cover images from Open Library | Yes                | Yes         | S / M / L sizes via `coverId`                            |
| Fallback cover placeholder     | Implied            | Yes         | `BookCover` shows icon when no `coverId`                 |

### 2.4 Data Persistence & Backup

| Feature                           | Baseline     | Implemented | Notes                                                           |
| --------------------------------- | ------------ | ----------- | --------------------------------------------------------------- |
| localStorage via Zustand persist  | Yes          | Yes         |                                                                 |
| JSON export (backup)              | Out of scope | Yes         | Timestamped file: `bookkeeper-backup-YYYY-MM-DD.json`           |
| JSON import (restore)             | Out of scope | Yes         | Full validation + migration; confirmation dialog if overwriting |
| Backup schema migration (v0 → v1) | Out of scope | Yes         | `backup.ts` applies field-level defaults for old formats        |

### 2.5 Offline / PWA

| Feature                                           | Baseline | Implemented | Notes                           |
| ------------------------------------------------- | -------- | ----------- | ------------------------------- |
| Service worker (shell caching)                    | Yes      | Yes         | Via `vite-plugin-pwa` / Workbox |
| Cover image cache (30-day TTL, 200 entries)       | Yes      | Yes         | Cache First strategy            |
| Open Library API cache (24-hour TTL, 100 entries) | Partial  | Yes         | Network First strategy          |
| Installable as PWA                                | Yes      | Yes         | Web manifest present            |

### 2.6 Error Handling & Resilience

| Feature                                   | Baseline      | Implemented | Notes                                                               |
| ----------------------------------------- | ------------- | ----------- | ------------------------------------------------------------------- |
| React Error Boundary                      | Not mentioned | Yes         | Shows stack trace; offers "Try Again" or "Clear All Data"           |
| API error states in search                | Implied       | Yes         | Error message shown in `SearchModal`                                |
| Import validation with field-level errors | Not mentioned | Yes         | Returns `{ ok: false, error: string }` with specific failure reason |
| Barcode scan error states                 | Not mentioned | Yes         | Handles permission denied, no camera, network failure               |

---

## 3. Gap Analysis

### 3.1 Items Shipped Beyond Baseline (Positive Delta)

The following features were explicitly listed as _out of scope_ or not mentioned at all in `features.md`, but are now live:

1. **Backup / restore** — The most significant addition. Enables data portability and disaster recovery without requiring a server.
2. **Barcode scanner** — Dramatically reduces friction for adding physical books. Uses device camera and the ZXing library, lazy-loaded to keep the initial bundle lean.
3. **Manual book entry** — Covers books not indexed on Open Library. Uses a `local:` prefix scheme to keep IDs stable and avoid conflicts.
4. **Error boundary** — Prevents full-page crashes from propagating. Offers user-controlled data wipe as a last resort.
5. **Backup schema versioning** — Forward-looking migration support (`v0 → v1`) that will be critical if the data model ever evolves.

### 3.2 Baseline Items Not Yet Fully Addressed

| Baseline Item                                                     | Status          | Notes                                               |
| ----------------------------------------------------------------- | --------------- | --------------------------------------------------- |
| "What This App Is Not" guardrails (social, recommendations, etc.) | On track        | None of the deferred categories has been introduced |
| Reading progress (% or page tracking)                             | Not implemented | Still deferred per baseline                         |
| Cross-device sync                                                 | Not implemented | Still deferred                                      |
| Import from Goodreads / other services                            | Not implemented | Still deferred                                      |
| Multiple shelves / reading lists                                  | Not implemented | Still deferred                                      |

### 3.3 Implicit Gaps (Not in Baseline, Not Yet Implemented)

These are gaps discovered during audit that neither the baseline nor the implementation has addressed:

1. **Search within library** — Users cannot filter/search their own wishlist or read books. As lists grow, scrolling becomes the only discovery mechanism.
2. **Bulk operations** — No way to bulk-delete, bulk-tag, or bulk-export a subset of books.
3. **Reading statistics / insights** — No summary view (books read per year, average rating, most-used tags, etc.).
4. **Tag management** — Tags can only be edited per-book. There is no global rename, merge, or delete across all books.
5. **PWA update flow** — No UI prompt when a new service worker version is waiting. Users receive stale code until they manually reload or clear cache.
6. **Empty state guidance** — The wishlist and read list render blank when empty, with no onboarding hint about how to add the first book.
7. **Keyboard shortcuts** — Power users have no keyboard-driven workflow (e.g., `/` to open search, `Esc` to close modal).
8. **Pagination / virtual scrolling** — For users with large libraries (hundreds of books), all items render at once with no virtualization.

---

## 4. Technical Assessment

### 4.1 Strengths

- **Type safety**: TypeScript strict mode throughout; `OLSearchResult`, `WishlistBook`, and `ReadBook` are cleanly separated.
- **State architecture**: Zustand is the right choice here — small surface area, built-in `persist`, no boilerplate.
- **Bundle discipline**: `@zxing/browser` (heavy) is lazy-loaded via `React.lazy()`. Only loaded when the user opens the barcode scanner.
- **Caching layers**: Two independent caches (TanStack Query for in-session, Workbox for across sessions) cover the full lifecycle of API data.
- **Migration path**: `backup.ts` already handles schema versioning, which future data model changes will depend on.
- **Error boundary**: Provides a controlled recovery surface rather than a blank white screen.

### 4.2 Areas of Risk

| Risk                           | Severity | Detail                                                                                                                                                         |
| ------------------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| localStorage size limit        | Medium   | Browsers cap `localStorage` at ~5–10 MB. A library with thousands of books and long notes could approach this. No size warning exists.                         |
| Single point of truth          | Medium   | All data lives in one `localStorage` key. A corrupted entry or browser-level clear wipes everything. Backup is manual; there is no auto-export.                |
| Open Library availability      | Low      | The app is entirely dependent on one external API for discovery. Offline search of the user's own library is not possible.                                     |
| No input sanitization on notes | Low      | Notes are stored as strings and rendered in a `<textarea>`. Currently safe, but if rendering ever shifts to HTML (e.g., Markdown preview), XSS becomes a risk. |
| Service worker update latency  | Low      | Workbox's default behavior silently installs a new SW and activates it on next reload. Users on the old version receive no notification.                       |

---

## 5. Recommendations

Ordered by impact-to-effort ratio. High-impact, low-effort items come first.

### 5.1 Quick Wins (Low Effort, High Value)

**A. Empty state onboarding**
Both list views should show a helpful empty state when no books exist (e.g., "Add your first book with the + button below"). Reduces confusion for first-time users.

**B. PWA update notification**
Use Workbox's `waiting` event to show a banner: "A new version is available — refresh to update." Without this, users may run stale code for days.

**C. Search within library**
Add a filter input above each list that filters in-memory by title or author. Zustand already holds all data; this requires only a `useState` filter and a `.filter()` call. No API changes.

**D. Reading statistics panel**
A simple summary section (books added this year, average rating, most-read author) adds value without architectural changes. All data already lives in the store.

### 5.2 Medium-Term Improvements (Moderate Effort)

**E. Auto-backup reminder or scheduled export**
Prompt users to export a backup after N books are added, or after a configurable interval. Reduces risk of data loss from accidental `localStorage` clear.

**F. Tag management view**
A dedicated "Manage Tags" screen allowing users to rename or delete a tag across all books. Requires a store-level `renameTag(old, new)` action.

**G. Goodreads CSV import**
Goodreads allows users to export their library as a CSV. A parser for that format would lower the barrier for existing readers to migrate to Bookkeeper.

**H. Reading progress tracking**
Add an optional `currentPage` field to wishlist books, with a visual progress bar. Keeps scope tight (no notes/dates until the book is finished).

### 5.3 Longer-Term Considerations

**I. IndexedDB migration**
If `localStorage` limits become a concern, migrating to IndexedDB (via `idb` or `Dexie`) would unlock larger storage and binary blob support (e.g., custom cover photos). The Zustand persist middleware would need replacement or wrapping.

**J. Optional cloud sync**
A lightweight sync layer (e.g., a user-owned CouchDB instance, PocketBase, or even a GitHub Gist) could provide cross-device access while preserving the privacy-first model. This should remain opt-in.

**K. Virtual scrolling**
For libraries exceeding ~500 items, `@tanstack/react-virtual` would prevent render blocking. Not urgent given typical library sizes, but worth planning for.

---

## 6. Feature Roadmap Suggestion

Based on the analysis above, a suggested prioritization for the next two iterations:

### Iteration 1 — Polish & Resilience

- [ ] Empty state onboarding copy for Wishlist and Read Books tabs
- [ ] PWA new-version notification banner
- [ ] In-list search/filter by title or author
- [ ] localStorage size warning (threshold: 3 MB)

### Iteration 2 — Discovery & Data Health

- [ ] Reading statistics panel (books this year, avg rating, top tags)
- [ ] Tag management (global rename / delete)
- [ ] Auto-backup prompt after 50+ books added
- [ ] Goodreads CSV import

---

## 7. Appendix: File Reference

| File                                     | Role                                                            |
| ---------------------------------------- | --------------------------------------------------------------- |
| `src/types/book.ts`                      | Data models: `WishlistBook`, `ReadBook`, `OLSearchResult`       |
| `src/store/bookStore.ts`                 | Zustand store, all state mutations, localStorage persistence    |
| `src/services/openLibrary.ts`            | Open Library API client (search, ISBN lookup, cover URL)        |
| `src/services/backup.ts`                 | Import validation, schema migration (v0 → v1)                   |
| `src/components/WishlistView.tsx`        | Wishlist list, sort controls, tag display, mark-as-read trigger |
| `src/components/ReadBooksView.tsx`       | Read list, inline editing, sort controls                        |
| `src/components/SearchModal.tsx`         | Book search UI, barcode trigger, add/manual-add flows           |
| `src/components/BarcodeScannerModal.tsx` | Camera access, ISBN decode, torch/camera-switch controls        |
| `src/components/MarkReadModal.tsx`       | Rating + notes + date form for completing a wishlist book       |
| `src/components/ManualBookModal.tsx`     | Manual entry form for books not on Open Library                 |
| `src/components/ImportExportModal.tsx`   | Export to JSON, import from file with validation                |
| `src/components/ErrorBoundary.tsx`       | Catches render errors; offers recover or data wipe              |
| `src/components/ui/BookCover.tsx`        | Cover image or fallback icon                                    |
| `src/components/ui/StarRating.tsx`       | Interactive 5-star rating with half-star support                |
| `src/components/ui/ScoreSelector.tsx`    | 1–10 priority selector with visual feedback                     |
| `vite.config.ts`                         | Vite, Tailwind, and PWA (Workbox) configuration                 |
| `docs/features.md`                       | Original feature baseline / product spec                        |
