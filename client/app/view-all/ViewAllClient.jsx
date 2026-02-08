"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getCleanPostUrl } from "@/lib/job-url";
import { ChevronLeft, Search, Briefcase, ExternalLink } from "lucide-react";

const PAGE_SIZE = 20;

const ViewAllClient = ({
  initialJobs = null,
  sectionName = "All Posts",
  sectionLink = "",
  initialPage = 1,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams?.toString() || "";
  const initialJobsList = useMemo(() => {
    return Array.isArray(initialJobs) ? initialJobs : [];
  }, [initialJobs]);
  const lastFetchRef = useRef("");

  // ✅ DO NOT mirror props into state repeatedly (fixes max update depth)
  const [jobs, setJobs] = useState(() => initialJobsList);
  const [loading, setLoading] = useState(
    () => !initialJobsList.length && Boolean(sectionLink),
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [resolvedLink, setResolvedLink] = useState(() => sectionLink || "");
  const [currentPage, setCurrentPage] = useState(initialPage);

  /* ---------------- Hydration ---------------- */
  useEffect(() => {
    setHydrated(true);
  }, []);

  /* ---------------- Set initial page once when prop changes ---------------- */
  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  /* ---------------- Resolve & sanitize `link` param ---------------- */
  useEffect(() => {
    if (!hydrated) return;

    const urlLink = new URLSearchParams(searchParamsString).get("link");

    // ✅ Always strip `link` from URL ASAP
    if (urlLink) {
      const params = new URLSearchParams(searchParamsString);
      params.delete("link");
      const qs = params.toString();
      const cleanUrl = qs ? `/view-all?${qs}` : "/view-all";

      // Remove from address bar without causing re-navigation loops
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", cleanUrl);
      }


      // ✅ Safe link: store & use
      try {
        sessionStorage.setItem(`view-all:link:${sectionName}`, urlLink);
      } catch {
        // ignore
      }
      setResolvedLink(urlLink);
      return;
    }

    // Fallback order:
    // 1) sectionLink prop
    // 2) sessionStorage if safe
    if (sectionLink) {
      setResolvedLink(sectionLink);
      try {
        window.sessionStorage.setItem(
          `view-all:link:${sectionName}`,
          sectionLink,
        );
      } catch {
        // ignore storage errors
      }
      try {
        document.cookie = "view_all_link=; Max-Age=0; path=/";
      } catch {
        // ignore cookie errors
      }
      return;
    }

    try {
      const stored = sessionStorage.getItem(`view-all:link:${sectionName}`);
      if (stored) {
        setResolvedLink(stored);
      } else {
        setResolvedLink("");
      }
    } catch {
      setResolvedLink("");
    }
  }, [hydrated, searchParamsString, sectionLink, sectionName]);

  /* ---------------- Fetch jobs (only if initialJobs empty) ---------------- */
  useEffect(() => {
    if (!hydrated) return;

    // If server already gave jobs, use them and don't fetch
    if (initialJobsList.length) {
      // set only once (avoid loops): only set if jobs is still empty
      setJobs((prev) => (prev?.length ? prev : initialJobsList));
      setLoading(false);
      return;
    }

    if (!resolvedLink) return;
    if (lastFetchRef.current === resolvedLink) return;
    lastFetchRef.current = resolvedLink;

    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/gov-post/view-all", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ link: resolvedLink }),
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed");

        const payload = await res.json();

        if (active && payload?.success && Array.isArray(payload.data)) {
          setJobs(payload.data);
        }
      } catch (e) {
        console.error("ViewAll fetch failed", e);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [hydrated, initialJobsList, resolvedLink]);

  /* ---------------- Helpers ---------------- */
  const handleJobSelect = (job) => {
    const url = getCleanPostUrl(job.link);
    router.push(url);
  };

  const filteredJobs = useMemo(() => {
    if (!searchQuery) return jobs;
    const q = searchQuery.toLowerCase();
    return jobs.filter((job) => job?.title?.toLowerCase().includes(q));
  }, [jobs, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const paginatedJobs = filteredJobs.slice(start, start + PAGE_SIZE);

  const buildPageHref = (page) => {
    const p = new URLSearchParams();
    if (sectionName) p.set("name", sectionName);
    if (page > 1) p.set("page", String(page));
    const qs = p.toString();
    return qs ? `/view-all?${qs}` : "/view-all";
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm mb-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>

            <h1 className="text-lg font-bold text-slate-800 truncate">
              {sectionName}
            </h1>
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search in this section..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // UX: reset to page 1 on search
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {loading ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
            <div className="mb-4 inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-full text-slate-400">
              <Search className="w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">
              Loading posts...
            </h3>
            <p className="text-slate-500 text-sm">Please wait</p>
          </div>
        ) : !paginatedJobs.length ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
            <div className="mb-4 inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-full text-slate-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">
              No posts found
            </h3>
            <p className="text-slate-500 text-sm">
              We couldn&apos;t find any posts matching your criteria.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <ul className="divide-y divide-slate-100">
                {paginatedJobs.map((job, index) => (
                  <li key={`${job?.link || "job"}-${index}`} className="group">
                    <button
                      onClick={() => handleJobSelect(job)}
                      className="w-full text-left px-5 py-4 hover:bg-blue-50/50 transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-4">
                        <div className="mt-1 w-8 h-8 flex-shrink-0 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                          <Briefcase className="w-4 h-4" />
                        </div>

                        <div>
                          <h3 className="text-[15px] font-semibold text-slate-800 group-hover:text-blue-700 leading-snug">
                            {job.title}
                          </h3>

                          {job.updatedAt && (
                            <p className="text-[12px] text-slate-400 mt-1 uppercase tracking-wide">
                              Updated:{" "}
                              {new Date(job.updatedAt).toLocaleDateString()}
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

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between text-sm text-slate-600">
                <Link
                  href={buildPageHref(Math.max(1, safePage - 1))}
                  className={`px-3 py-2 rounded-lg border ${
                    safePage === 1
                      ? "border-slate-200 text-slate-400 pointer-events-none"
                      : "border-slate-300 hover:border-blue-400 hover:text-blue-600"
                  }`}
                >
                  Previous
                </Link>

                <span>
                  Page <strong>{safePage}</strong> of{" "}
                  <strong>{totalPages}</strong>
                </span>

                <Link
                  href={buildPageHref(Math.min(totalPages, safePage + 1))}
                  className={`px-3 py-2 rounded-lg border ${
                    safePage === totalPages
                      ? "border-slate-200 text-slate-400 pointer-events-none"
                      : "border-slate-300 hover:border-blue-400 hover:text-blue-600"
                  }`}
                >
                  Next
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ViewAllClient;
