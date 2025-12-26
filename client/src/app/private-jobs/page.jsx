"use client";

import { useEffect, useState } from "react";
import SEO from "@/lib/SEO";

import axios from "axios";
import {
  AlertCircle,
  Briefcase,
  Building2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import AdBanner728x90 from "@/lib/ads/Adsetra728x90";
import Ad320x50 from "@/lib/ads/Ad320x50";
import useIsMobile from "../../hooks/useIsMobile";
import MobileLayout from "@/components/layout/MobileLayout";

export default function PrivateJobsPage() {
  const isMobile = useIsMobile(640);
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState(null);

  const [sectionsByLink, setSectionsByLink] = useState({});
  const api =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_CLIENT ||
    null;

  useEffect(() => {
    (async () => {
      if (!api) {
        const msg = "API base URL not configured. Set NEXT_PUBLIC_API_CLIENT";
        console.error(msg);
        setCatError(msg);
        setCatLoading(false);
        return;
      }

      try {
        setCatLoading(true);
        const resp = await axios
          .post(`${api}/pvt-scrapper/get-categories`)
          .then((r) => r.data);

        const cats = Array.isArray(resp)
          ? resp
          : resp?.categories || resp?.data || resp?.sections || [];

        setCategories(cats);
        setCatError(null);
      } catch (err) {
        const message = err?.response?.status
          ? `Failed to load categories: ${err.response.status}`
          : err.message || "Failed to load categories";
        setCatError(message);
        console.error("Category loading error:", err);
      } finally {
        setCatLoading(false);
      }
    })();
  }, [api ?? null]);

  useEffect(() => {
    if (!categories || categories.length === 0) return;

    const links = categories.map((c) => c.link).filter(Boolean);
    if (links.length === 0) return;

    let cancelled = false;
    const concurrency = 3;
    let idx = 0;

    const worker = async () => {
      while (!cancelled) {
        if (idx >= links.length) break;
        const current = idx++;
        const categoryUrl = links[current];

        if (!categoryUrl) continue;

        if (
          sectionsByLink[categoryUrl]?.jobs &&
          sectionsByLink[categoryUrl].jobs.length > 0
        ) {
          continue;
        }

        try {
          setSectionsByLink((prev) => ({
            ...prev,
            [categoryUrl]: { ...(prev[categoryUrl] || {}), loading: true },
          }));

          const resp = await axios
            .post(`${api}/pvt-scrapper/scrape-category`, { url: categoryUrl })
            .then((r) => r.data);

          let jobs = [];
          if (Array.isArray(resp)) {
            jobs = resp;
          } else if (Array.isArray(resp?.jobs)) {
            jobs = resp.jobs;
          } else if (Array.isArray(resp?.data)) {
            jobs = resp.data;
          } else if (Array.isArray(resp?.sections)) {
            jobs = resp.sections;
          }

          if (cancelled) return;

          setSectionsByLink((prev) => ({
            ...prev,
            [categoryUrl]: { loading: false, jobs: jobs || [] },
          }));
        } catch (err) {
          console.warn("Failed to load jobs for category:", categoryUrl, err);
          if (!cancelled) {
            setSectionsByLink((prev) => ({
              ...prev,
              [categoryUrl]: {
                ...(prev[categoryUrl] || {}),
                loading: false,
                jobs: [],
                error: true,
              },
            }));
          }
        }
      }
    };

    const runners = Array.from({
      length: Math.min(concurrency, links.length),
    }).map(() => worker());

    return () => {
      cancelled = true;
    };
  }, [categories, api ?? null]);

  // Main content component
  const PrivateJobsContent = () => (
    <>
      <SEO
        title="Private Jobs 2025 Board | ITI, Diploma, Campus Placement - JobsAddah"
        description="Live updated private job board with categories like campus placement, ITI jobs, diploma jobs and more."
        keywords="private jobs board, iti jobs, diploma jobs, campus placement"
        canonical="/private-jobs"
        section="Private Jobs"
      />

      {/* Top Banner Ad */}
      <div className="flex justify-center mb-4">
        <div className="md:hidden">
          <Ad320x50 />
        </div>
        <div className="hidden md:flex">
          <AdBanner728x90 />
        </div>
      </div>

      {/* Main Container - Reduced Top Margin (pt-2) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-2">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-xl shadow-md">
              <Building2 size={28} strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
                Private Jobs Board
              </h1>
              <p className="text-sm text-slate-500">
                Live updates for Campus Placements, ITI, & Diploma jobs.
              </p>
            </div>
          </div>
          {catLoading && (
            <div className="flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
              <Loader2 size={16} className="animate-spin" />
              <span>Syncing Categories...</span>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {catError && (
          <div className="mb-8 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
            <AlertCircle size={20} />
            <p>{catError}</p>
          </div>
        )}

        {/* Category Cards Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {(catLoading ? Array.from({ length: 6 }) : categories).map(
            (cat, idx) => {
              const link = cat?.link;
              const state = link ? sectionsByLink[link] || {} : {};
              const jobs = state.jobs || [];
              const isLoading = catLoading || state.loading;
              const hasError = state.error;

              return (
                <div
                  key={idx}
                  className="group bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 flex flex-col overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="shrink-0 h-8 w-8 rounded-lg bg-white border border-slate-200 text-indigo-600 flex items-center justify-center shadow-sm">
                        <Briefcase size={16} strokeWidth={2.5} />
                      </div>
                      <h2 className="text-sm font-bold text-slate-800 truncate pr-2">
                        {catLoading
                          ? "Loading..."
                          : cat?.name ||
                            cat?.title ||
                            cat?.text ||
                            `Category ${idx + 1}`}
                      </h2>
                    </div>

                    {/* Badges */}
                    {!isLoading && !hasError && (
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                          jobs.length > 0
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}
                      >
                        {jobs.length} Active
                      </span>
                    )}
                    {hasError && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                        Error
                      </span>
                    )}
                  </div>

                  {/* Card Body: Jobs List */}
                  <div className="p-2 flex-1 min-h-[180px]">
                    {isLoading ? (
                      // Loading Skeleton
                      <div className="space-y-3 p-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex gap-3 items-center">
                            <div className="h-2 w-2 rounded-full bg-slate-200 animate-pulse"></div>
                            <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
                          </div>
                        ))}
                      </div>
                    ) : hasError ? (
                      // Error State
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6">
                        <AlertCircle size={28} className="mb-2 opacity-30" />
                        <p className="text-xs">Failed to load jobs.</p>
                      </div>
                    ) : jobs.length === 0 ? (
                      // Empty State
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6">
                        <Briefcase size={28} className="mb-2 opacity-30" />
                        <p className="text-xs">No active jobs found.</p>
                      </div>
                    ) : (
                      // Jobs List
                      <ul className="flex flex-col">
                        {jobs.slice(0, 8).map((job, jIdx) => (
                          <li key={jIdx}>
                            <a
                              href={job.link || "#"}
                              target={job.link ? "_blank" : undefined}
                              rel={job.link ? "noopener noreferrer" : undefined}
                              className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors group/link border border-transparent hover:border-slate-100"
                            >
                              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0 group-hover/link:scale-125 transition-transform" />
                              <span className="text-xs md:text-sm font-medium text-slate-600 line-clamp-2 leading-relaxed group-hover/link:text-indigo-700">
                                {job.title}
                              </span>
                              {job.link && (
                                <ExternalLink
                                  size={12}
                                  className="mt-1 ml-auto text-slate-300 group-hover/link:text-indigo-400 shrink-0 opacity-0 group-hover/link:opacity-100 transition-all"
                                />
                              )}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Card Footer: View All Button */}
                  {!catLoading && !hasError && link && (
                    <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold uppercase tracking-wide text-slate-600 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all shadow-sm"
                      >
                        View All Listings
                        <ExternalLink size={12} className="ml-2" />
                      </a>
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>

        {/* No Data State */}
        {!catLoading && categories.length === 0 && !catError && (
          <div className="py-16 text-center">
            <Briefcase size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-500">
              No job categories available at the moment.
            </p>
          </div>
        )}
      </main>
    </>
  );

  // Return with mobile layout wrapper for mobile devices
  if (isMobile) {
    return (
      <MobileLayout title="Private Jobs" showBack={true}>
        <PrivateJobsContent />
      </MobileLayout>
    );
  }

  // Desktop view
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <div className="hidden md:flex justify-center w-full my-4">
        <AdBanner728x90 />
      </div>
      <PrivateJobsContent />
    </div>
  );
}
