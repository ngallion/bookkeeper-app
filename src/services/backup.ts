import type { WishlistBook, ReadBook } from "../types/book";

export interface BackupFile {
  version: number;
  exportedAt: string;
  wishlist: WishlistBook[];
  readBooks: ReadBook[];
}

export type ValidationResult =
  | { ok: true; data: BackupFile }
  | { ok: false; error: string };

// ─── Per-field validators ────────────────────────────────────────────────────

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function isNumber(v: unknown): v is number {
  return typeof v === "number" && isFinite(v);
}

function isValidWishlistBook(v: unknown): v is WishlistBook {
  if (typeof v !== "object" || v === null) return false;
  const b = v as Record<string, unknown>;
  return (
    isString(b.id) &&
    isString(b.title) &&
    isString(b.author) &&
    isNumber(b.score) &&
    b.score >= 1 &&
    b.score <= 10 &&
    Array.isArray(b.tags) &&
    b.tags.every(isString) &&
    isString(b.addedAt)
  );
}

function isValidReadBook(v: unknown): v is ReadBook {
  if (typeof v !== "object" || v === null) return false;
  const b = v as Record<string, unknown>;
  return (
    isString(b.id) &&
    isString(b.title) &&
    isString(b.author) &&
    isNumber(b.rating) &&
    b.rating >= 0.5 &&
    b.rating <= 5 &&
    isString(b.notes) &&
    isString(b.dateRead) &&
    isString(b.addedAt)
  );
}

// ─── Migrations ──────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrate(raw: Record<string, any>): Record<string, any> {
  const data = { ...raw };
  const version = typeof data.version === "number" ? data.version : 0;

  // v0 → v1: tags field was absent in very early builds
  if (version < 1) {
    data.wishlist = (data.wishlist ?? []).map((b: Record<string, unknown>) => ({
      ...b,
      tags: Array.isArray(b.tags) ? b.tags : [],
      score: isNumber(b.score) ? b.score : 5,
    }));
    data.readBooks = (data.readBooks ?? []).map(
      (b: Record<string, unknown>) => ({
        ...b,
        notes: isString(b.notes) ? b.notes : "",
      }),
    );
    data.version = 1;
  }

  // Future migrations go here:
  // if (version < 2) { ... data.version = 2; }

  return data;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function validateBackup(raw: unknown): ValidationResult {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: "File is not a valid JSON object." };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const migrated = migrate(raw as Record<string, any>);

  if (!Array.isArray(migrated.wishlist)) {
    return { ok: false, error: 'Missing or invalid "wishlist" array.' };
  }
  if (!Array.isArray(migrated.readBooks)) {
    return { ok: false, error: 'Missing or invalid "readBooks" array.' };
  }

  const badWishlist = migrated.wishlist.findIndex(
    (b: unknown) => !isValidWishlistBook(b),
  );
  if (badWishlist !== -1) {
    return {
      ok: false,
      error: `Wishlist entry #${badWishlist + 1} has missing or invalid fields (expected id, title, author, score, tags, addedAt).`,
    };
  }

  const badRead = migrated.readBooks.findIndex(
    (b: unknown) => !isValidReadBook(b),
  );
  if (badRead !== -1) {
    return {
      ok: false,
      error: `Read books entry #${badRead + 1} has missing or invalid fields (expected id, title, author, rating, notes, dateRead, addedAt).`,
    };
  }

  return {
    ok: true,
    data: {
      version: migrated.version,
      exportedAt: isString(migrated.exportedAt)
        ? migrated.exportedAt
        : new Date().toISOString(),
      wishlist: migrated.wishlist,
      readBooks: migrated.readBooks,
    },
  };
}
