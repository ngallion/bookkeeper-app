import type { OLSearchResult } from "../types/book";

const BASE = "https://openlibrary.org";
const FIELDS =
  "key,title,author_name,cover_i,first_publish_year,number_of_pages_median,subject";

export async function searchBooks(query: string): Promise<OLSearchResult[]> {
  if (!query.trim()) return [];
  const url = `${BASE}/search.json?q=${encodeURIComponent(query)}&fields=${FIELDS}&limit=12`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Search failed");
  const data = await res.json();
  return data.docs as OLSearchResult[];
}

export async function lookupByISBN(
  isbn: string,
): Promise<OLSearchResult | null> {
  const url = `${BASE}/search.json?isbn=${encodeURIComponent(isbn)}&fields=${FIELDS}&limit=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("ISBN lookup failed");
  const data = await res.json();
  return (data.docs?.[0] as OLSearchResult) ?? null;
}

export function coverUrl(coverId: number, size: "S" | "M" | "L" = "M"): string {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

export async function fetchWorkDescription(
  workKey: string,
): Promise<string | null> {
  const url = `${BASE}${workKey}.json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const desc = data.description;
  if (!desc) return null;
  if (typeof desc === "string") return desc;
  if (typeof desc === "object" && typeof desc.value === "string")
    return desc.value;
  return null;
}
