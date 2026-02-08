"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getCleanPostUrl } from "@/lib/job-url";
import { Search, ExternalLink, Briefcase } from "lucide-react";

const MIN_QUERY_LENGTH = 2;

export default function SearchClient({
  initialQuery: initialQueryProp = "",
  initialResults = [],
}) {
  const router = useRouter();
  const initialQuery = initialQueryProp || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(initialResults);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(Boolean(initialQuery));
  const [userInitiated, setUserInitiated] = useState(false);
  const didHydrateRef = useRef(false);
  const initialQueryRef = useRef(initialQuery);
  const initialResultsRef = useRef(initialResults);

  const trimmedQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    setQuery(initialQuery);
    setUserInitiated(false);
  }, [initialQuery]);

  useEffect(() => {
    setResults(initialResults);
  }, [initialResults]);

  useEffect(() => {
    let isMounted = true;
    const runSearch = async () => {
      if (
        !didHydrateRef.current &&
        initialResultsRef.current?.length &&
        trimmedQuery === initialQueryRef.current
      ) {
        didHydrateRef.current = true;
        setHasSearched(Boolean(trimmedQuery));
        setIsSearching(false);
        return;
      }

      didHydrateRef.current = true;
      if (trimmedQuery.length < MIN_QUERY_LENGTH) {
        setResults([]);
        setIsSearching(false);
        setHasSearched(Boolean(trimmedQuery));
        return;
      }
      if (userInitiated) setIsSearching(true);
      try {
        const res = await fetch(
          `/api/gov-post/find-by-title?title=${encodeURIComponent(
            trimmedQuery,
          )}&limit=24`,
        );
        const payload = await res.json();
        if (!isMounted) return;
        const data = Array.isArray(payload?.data) ? payload.data : [];
        setResults(data);
      } catch {
        if (!isMounted) return;
        setResults([]);
      } finally {
        if (isMounted) {
          setIsSearching(false);
          setHasSearched(true);
        }
      }
    };
    runSearch();
    return () => {
      isMounted = false;
    };
  }, [trimmedQuery, userInitiated]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = trimmedQuery;
    if (next.length < MIN_QUERY_LENGTH) return;
    setUserInitiated(true);
    router.push(`/search?q=${encodeURIComponent(next)}`);
  };

  const handleOpen = (job) => {
    const url = getCleanPostUrl(job.url || job.link || "");
    if (url) router.push(url);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3">
            Search Jobs, Results, and Notifications
          </h1>
          <p className="text-sm text-slate-600 mb-6">
            Enter the post name, organization, or exam title. We will fetch the
            latest matching notifications for you.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => {
                  if (!userInitiated) setUserInitiated(true);
                  setQuery(e.target.value);
                }}
                placeholder="e.g. SSC CGL, Railway Group D, Bihar Police..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
              disabled={trimmedQuery.length < MIN_QUERY_LENGTH}
            >
              Search
            </button>
          </form>

          <div className="mt-6 text-xs text-slate-500">
            Tip: Try keywords like "admit card", "result", "syllabus", or the
            board name.
          </div>
        </div>

        <div className="mt-8">
          {isSearching && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 text-sm text-slate-500">
              Searching for "{trimmedQuery}"...
            </div>
          )}

          {!isSearching && hasSearched && results.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-500">
              No matching posts found. Try a different keyword.
            </div>
          )}

          {!isSearching && results.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                {results.length} Results
              </div>
              <ul className="divide-y divide-slate-100">
                {results.map((job, index) => (
                  <li key={`${job._id || "job"}-${index}`} className="group">
                    <button
                      onClick={() => handleOpen(job)}
                      className="w-full text-left px-5 py-4 hover:bg-blue-50/50 transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1 w-8 h-8 flex-shrink-0 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-[15px] font-semibold text-slate-800 group-hover:text-blue-700 leading-snug">
                            {job.title || "Untitled Post"}
                          </h3>
                          {job.organization && (
                            <p className="text-[12px] text-slate-500 mt-1">
                              {job.organization}
                            </p>
                          )}
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-400 flex-shrink-0 transition-colors" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-10 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 text-sm text-slate-600">
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            How we keep results accurate
          </h2>
          <p className="mb-3">
            JobsAddah checks official sources and verified notices before
            listing updates. Always open the official link from the job page
            before applying or making a payment.
          </p>
          <p>
            Looking for a complete list? Visit the main Sarkari Result sections
            or browse the "View All" pages for each category.
          </p>
        </div>
      </div>
    </div>
  );
}
