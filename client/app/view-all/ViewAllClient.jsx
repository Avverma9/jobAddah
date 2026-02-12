"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCleanPostUrl } from "@/lib/job-url";
import { ChevronLeft, Search, Briefcase, ExternalLink } from "lucide-react";

const PAGE_SIZE = 20;

const ViewAllClient = ({
  initialJobs = null,
  sectionName = "All Posts",
  sectionCategory = "",
  initialPage = 1,
}) => {
  const router = useRouter();
  const initialJobsList = useMemo(
    () => (Array.isArray(initialJobs) ? initialJobs : []),
    [initialJobs],
  );
  const lastFetchRef = useRef("");

  const [jobs, setJobs] = useState(() => initialJobsList);
  const [loading, setLoading] = useState(() => !initialJobsList.length);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(initialPage);

  useEffect(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  useEffect(() => {
    if (initialJobsList.length) {
      setJobs(initialJobsList);
      setLoading(false);
    }
  }, [initialJobsList]);

  useEffect(() => {
    if (initialJobsList.length) return;

    const key = sectionCategory || "__all__";
    if (lastFetchRef.current === key) return;
    lastFetchRef.current = key;

    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/gov-post/view-all", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            sectionCategory ? { category: sectionCategory } : {},
          ),
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
  }, [initialJobsList, sectionCategory]);

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
    if (sectionCategory) p.set("category", sectionCategory);
    if (page > 1) p.set("page", String(page));
    const qs = p.toString();
    return qs ? `/view-all?${qs}` : "/view-all";
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12">
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
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

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
              We could not find any posts matching your criteria.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <ul className="divide-y divide-slate-100">
                {paginatedJobs.map((job, index) => {
                  const href = getCleanPostUrl(job?.link || job?.url || "");
                  if (!href || href === "#") return null;

                  return (
                    <li key={`${job?.link || "job"}-${index}`} className="group">
                      <Link
                        href={href}
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
                                Updated: {new Date(job.updatedAt).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>

                        <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-400 flex-shrink-0 transition-colors" />
                      </Link>
                    </li>
                  );
                })}
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
