export interface OLSearchResult {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  number_of_pages_median?: number;
  subject?: string[];
}

export interface WishlistBook {
  id: string;
  title: string;
  author: string;
  coverId?: number;
  score: number; // 1–10 priority
  tags: string[];
  addedAt: string;
  firstPublishYear?: number;
  pages?: number;
  notes?: string;
}

export interface ReadBook {
  id: string;
  title: string;
  author: string;
  coverId?: number;
  rating: number; // 1–5
  notes: string;
  dateRead: string;
  addedAt: string;
  firstPublishYear?: number;
  pages?: number;
}
