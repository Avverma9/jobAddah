import SearchClient from "./SearchClient";
import { getBaseUrl } from "@/lib/server-url";

const MIN_QUERY_LENGTH = 2;
const RESULT_LIMIT = 20;

export const metadata = {
  title: "Search Jobs | JobsAddah",
  description:
    "Search JobsAddah for the latest Sarkari results, admit cards, and government job notifications.",
  robots: "noindex,follow",
};

async function fetchSearchResults(query) {
  if (!query || query.trim().length < MIN_QUERY_LENGTH) return [];
  try {
    const baseUrl = await getBaseUrl();
    const res = await fetch(
      `${baseUrl}/api/gov-post/find-by-title?title=${encodeURIComponent(
        query.trim(),
      )}&limit=${RESULT_LIMIT}`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const payload = await res.json();
    return Array.isArray(payload?.data) ? payload.data : [];
  } catch {
    return [];
  }
}

export default async function SearchPage({ searchParams }) {
  const query = (searchParams?.q || "").toString();
  const results = await fetchSearchResults(query);

  return <SearchClient initialQuery={query} initialResults={results} />;
}
