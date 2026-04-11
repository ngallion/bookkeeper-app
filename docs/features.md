# Bookkeeper — Feature Baseline

## What This App Is

A personal, serverless reading tracker. No accounts, no server, no cloud dependency. Data lives in the browser. Works offline. Installable as a PWA.

---

## Core Focuses

### 1. Wishlist

Track books you want to read.

- Search Open Library by title or author
- Add any book to the wishlist
- Assign a **priority score (1–10)** — higher means you want to read it sooner
- Tag books freely (e.g. `sci-fi`, `gift idea`, `reread`)
- Sort wishlist by priority score, title, or date added
- Promote a wishlist book to "read" via the Mark as Read flow

### 2. Read Books

Keep a record of everything you've finished.

- **Star rating (1–5)**
- **Free-form notes** — reviews, quotes, thoughts
- **Date read** — tracked per book
- Inline editing of rating, notes, and date at any time
- Sort by date read, rating, or title

### 3. Book Data

Sourced from the [Open Library API](https://openlibrary.org/developers/api) — free, no API key required.

- Title, author, publication year, page count
- Cover images (cached offline via service worker)
- Search results are cached for 5 minutes; covers cached for 30 days

---

## What This App Is Not

- Not a social network — no sharing, followers, or public profiles
- Not a recommendation engine
- Not a bookstore or affiliate link aggregator
- Not synced across devices (local storage only)

---

## Technical Constraints

| Constraint    | Decision                                        |
| ------------- | ----------------------------------------------- |
| Serverless    | All state in `localStorage` via Zustand persist |
| No auth       | Single-user, single-device                      |
| Offline-first | Service worker caches shell + API responses     |
| No backend    | Open Library is the only external dependency    |

---

## Out of Scope (for now)

These are intentionally deferred — they may be added later but should not drive current design decisions:

- Cross-device sync
- User accounts / auth
- Social features
- Book recommendations
- Reading progress (% or page tracking)
- Multiple reading lists / shelves
- Import from Goodreads or other services
- Export / backup
