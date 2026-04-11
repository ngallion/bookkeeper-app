# Bookkeeper

A personal book tracking PWA. Keep a wishlist of books you want to read, log the ones you've finished, and let a small possum librarian keep you company while you do it.

---

## Features

**Wishlist**

- Search Open Library to find and add books
- Scan a book's barcode with your camera to add it instantly
- Add books manually if they're not in the database
- Set a priority score and add tags to organise your list
- Sort by priority, title, or date added
- Filter/search your own list as it grows

**Read books**

- Mark wishlist books as read with a rating, date, and notes
- Add read books directly without going through the wishlist
- Star ratings with half-star precision
- Sort by date read, rating, or title
- Filter by title, author, or notes
- Auto-fetches book descriptions from Open Library

**Import / Export**

- Export your library as a JSON file
- On supported devices, uses the native share sheet to send the file
- Import a backup to restore your library

**Possum companion**

- A possum librarian lives in the corner of the app
- Reacts to what you're doing — searching, reading, petting
- Gets sleepy if you leave the app idle, falls asleep if you leave it long enough
- Celebrates when you finish a book
- Has opinions about books

**PWA**

- Installable on iOS and Android — works like a native app
- Prompts you to back up your library periodically so you don't lose your data
- Notifies you when an update is available

---

## Stack

- **React 19** + **TypeScript**
- **Vite** + **vite-plugin-pwa**
- **Tailwind CSS v4**
- **Zustand** — state management, persisted to localStorage
- **TanStack Query** — data fetching and caching
- **TanStack Virtual** — virtualised lists for large libraries
- **@zxing/browser** — barcode scanning via device camera
- **Open Library API** — book search and metadata

---

## Development

```bash
npm install
npm run dev
```

The dev server runs on the local network (`--host`) so you can test on a phone.

```bash
npm run build   # production build
npm run lint    # ESLint
npm run ci      # typecheck + lint + prettier
```
