import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WishlistBook, ReadBook } from "../types/book";

interface BookStore {
  wishlist: WishlistBook[];
  readBooks: ReadBook[];
  totalBooksAdded: number;
  lastBackupPromptAt: number;

  addToWishlist: (book: Omit<WishlistBook, "addedAt">) => void;
  removeFromWishlist: (id: string) => void;
  updateWishlistScore: (id: string, score: number) => void;
  updateWishlistTags: (id: string, tags: string[]) => void;
  updateWishlistBook: (
    id: string,
    updates: Partial<
      Pick<
        WishlistBook,
        "title" | "author" | "firstPublishYear" | "pages" | "notes"
      >
    >,
  ) => void;

  markAsRead: (book: Omit<ReadBook, "addedAt">) => void;
  moveToRead: (
    wishlistId: string,
    rating: number,
    notes: string,
    dateRead: string,
  ) => void;
  removeFromRead: (id: string) => void;
  updateReadBook: (
    id: string,
    updates: Partial<Pick<ReadBook, "rating" | "notes" | "dateRead">>,
  ) => void;

  dismissBackupReminder: () => void;

  isInWishlist: (id: string) => boolean;
  isRead: (id: string) => boolean;

  importState: (data: {
    wishlist: WishlistBook[];
    readBooks: ReadBook[];
  }) => void;
}

export const useBookStore = create<BookStore>()(
  persist(
    (set, get) => ({
      wishlist: [],
      readBooks: [],
      totalBooksAdded: 0,
      lastBackupPromptAt: 0,

      addToWishlist: (book) => {
        if (get().isInWishlist(book.id) || get().isRead(book.id)) return;
        set((s) => ({
          wishlist: [
            { ...book, addedAt: new Date().toISOString() },
            ...s.wishlist,
          ],
          totalBooksAdded: s.totalBooksAdded + 1,
        }));
      },

      removeFromWishlist: (id) =>
        set((s) => ({ wishlist: s.wishlist.filter((b) => b.id !== id) })),

      updateWishlistScore: (id, score) =>
        set((s) => ({
          wishlist: s.wishlist.map((b) => (b.id === id ? { ...b, score } : b)),
        })),

      updateWishlistTags: (id, tags) =>
        set((s) => ({
          wishlist: s.wishlist.map((b) => (b.id === id ? { ...b, tags } : b)),
        })),

      updateWishlistBook: (id, updates) =>
        set((s) => ({
          wishlist: s.wishlist.map((b) =>
            b.id === id ? { ...b, ...updates } : b,
          ),
        })),

      markAsRead: (book) => {
        if (get().isRead(book.id)) return;
        set((s) => ({
          readBooks: [
            { ...book, addedAt: new Date().toISOString() },
            ...s.readBooks,
          ],
          totalBooksAdded: s.totalBooksAdded + 1,
        }));
      },

      moveToRead: (wishlistId, rating, notes, dateRead) => {
        const book = get().wishlist.find((b) => b.id === wishlistId);
        if (!book) return;
        // Moving wishlist → read doesn't count as a new addition
        set((s) => ({
          wishlist: s.wishlist.filter((b) => b.id !== wishlistId),
          readBooks: [
            {
              id: book.id,
              title: book.title,
              author: book.author,
              coverId: book.coverId,
              firstPublishYear: book.firstPublishYear,
              pages: book.pages,
              rating,
              notes,
              dateRead,
              addedAt: new Date().toISOString(),
            },
            ...s.readBooks,
          ],
        }));
      },

      removeFromRead: (id) =>
        set((s) => ({ readBooks: s.readBooks.filter((b) => b.id !== id) })),

      updateReadBook: (id, updates) =>
        set((s) => ({
          readBooks: s.readBooks.map((b) =>
            b.id === id ? { ...b, ...updates } : b,
          ),
        })),

      dismissBackupReminder: () =>
        set((s) => ({ lastBackupPromptAt: s.totalBooksAdded })),

      isInWishlist: (id) => get().wishlist.some((b) => b.id === id),
      isRead: (id) => get().readBooks.some((b) => b.id === id),

      importState: (data) =>
        set({ wishlist: data.wishlist, readBooks: data.readBooks }),
    }),
    { name: "bookkeeper-store" },
  ),
);
