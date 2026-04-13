export interface OLSearchResult {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  number_of_pages_median?: number;
  subject?: string[];
}

export interface ReadingProgress {
  type: "page" | "percent";
  value: number;
}

export interface WishlistBook {
  id: string;
  title: string;
  author: string;
  coverId?: number;
  /** True when a custom cover blob is stored for this book in IndexedDB */
  hasCustomCover?: boolean;
  score: number; // 1–10 priority
  tags: string[];
  addedAt: string;
  firstPublishYear?: number;
  pages?: number;
  notes?: string;
  /** Set to "reading" when the user has marked this book as currently in progress */
  readingStatus?: "reading";
  /** Current reading progress, only meaningful when readingStatus is "reading" */
  readingProgress?: ReadingProgress;
}

export interface ReadBook {
  id: string;
  title: string;
  author: string;
  coverId?: number;
  /** True when a custom cover blob is stored for this book in IndexedDB */
  hasCustomCover?: boolean;
  rating: number; // 1–5
  notes: string;
  dateRead: string;
  addedAt: string;
  firstPublishYear?: number;
  pages?: number;
}
