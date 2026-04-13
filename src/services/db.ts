import { openDB } from "idb";
import type { DBSchema, IDBPDatabase } from "idb";

// ─── Schema ──────────────────────────────────────────────────────────────────

interface BookkeeperDB extends DBSchema {
  /** Key-value store that backs the Zustand persist middleware */
  kv: {
    key: string;
    value: string;
  };
  /** Cover photo blobs, keyed by book ID */
  covers: {
    key: string;
    value: Blob;
  };
}

const DB_NAME = "bookkeeper-db";
const DB_VERSION = 1;

// Singleton promise — resolved once the DB is open
let dbPromise: Promise<IDBPDatabase<BookkeeperDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<BookkeeperDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("kv")) {
          db.createObjectStore("kv");
        }
        if (!db.objectStoreNames.contains("covers")) {
          db.createObjectStore("covers");
        }
      },
    });
  }
  return dbPromise;
}

// ─── One-time localStorage → IndexedDB migration ─────────────────────────────

const LS_KEY = "bookkeeper-store";
const MIGRATED_FLAG = "bookkeeper-idb-migrated";

export async function migrateFromLocalStorage(): Promise<void> {
  // Only run once
  if (localStorage.getItem(MIGRATED_FLAG)) return;

  const existing = localStorage.getItem(LS_KEY);
  if (existing) {
    const db = await getDB();
    // Only migrate if IndexedDB doesn't already have data
    const current = await db.get("kv", LS_KEY);
    if (!current) {
      await db.put("kv", existing, LS_KEY);
    }
    // Remove from localStorage to free space
    localStorage.removeItem(LS_KEY);
  }

  localStorage.setItem(MIGRATED_FLAG, "1");
}

// ─── Zustand storage adapter ─────────────────────────────────────────────────

export const idbStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const db = await getDB();
    return (await db.get("kv", name)) ?? null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    const db = await getDB();
    await db.put("kv", value, name);
  },
  removeItem: async (name: string): Promise<void> => {
    const db = await getDB();
    await db.delete("kv", name);
  },
};

// ─── Cover photo CRUD ────────────────────────────────────────────────────────

export async function saveCover(bookId: string, blob: Blob): Promise<void> {
  const db = await getDB();
  await db.put("covers", blob, bookId);
}

export async function getCover(bookId: string): Promise<Blob | undefined> {
  const db = await getDB();
  return db.get("covers", bookId);
}

export async function deleteCover(bookId: string): Promise<void> {
  const db = await getDB();
  await db.delete("covers", bookId);
}
