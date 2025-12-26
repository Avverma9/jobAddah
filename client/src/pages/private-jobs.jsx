import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import SEO from "../util/SEO";
import api from "../util/apiClient";
import { Building2, ExternalLink, Briefcase, AlertCircle, Loader2, Search, Bell, Menu } from "lucide-react";
import useIsMobile from "../hooks/useIsMobile";
import { MobileLayout } from "../components/MobileLayout";
import AdBanner728x90 from "../components/ads/Adsetra728x90";

export default function PrivateJobsBoard() {
  const isMobile = useIsMobile(640);
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catError, setCatError] = useState(null);

  // { [catLink]: { loading: boolean, jobs: Job[] } }
  const [sectionsByLink, setSectionsByLink] = useState({});

  // ============ STEP 1: Load categories (on mount) ============
  useEffect(() => {
    (async () => {
      try {
        setCatLoading(true);
        const catRes = await api.post("/pvt-scrapper/get-categories");
        const cats = Array.isArray(catRes)
          ? catRes
          : catRes.categories || catRes.data || [];
        setCategories(cats);
        setCatError(null);
      } catch (err) {
        setCatError(err.message || "Failed to load categories");
        console.error("Category loading error:", err);
      } finally {
        setCatLoading(false);
      }
    })();
  }, []); // Runs ONCE on mount

  // ============ STEP 2: Auto-load jobs for ALL categories (when categories change) ============
  useEffect(() => {
    if (!categories || categories.length === 0) return;

    const links = categories.map((c) => c.link).filter(Boolean);
    if (links.length === 0) return;

    let cancelled = false;
    const concurrency = 3; // Concurrent requests
    let idx = 0;

    const worker = async () => {
      while (!cancelled) {
        if (idx >= links.length) break;
        const current = idx++;
        const categoryUrl = links[current];

        if (!categoryUrl) continue;

        // Skip if already loaded
        if (sectionsByLink[categoryUrl]?.jobs && sectionsByLink[categoryUrl].jobs.length > 0) {
          continue;
        }

        try {
          // Mark as loading
          setSectionsByLink((prev) => ({
            ...prev,
            [categoryUrl]: { ...(prev[categoryUrl] || {}), loading: true },
          }));

          // Fetch jobs for this category
          const res = await api.post("/pvt-scrapper/scrape-category", {
            url: categoryUrl,
          });

          // Parse response (generic handling for multiple formats)
          let jobs = [];
          if (Array.isArray(res)) {
            jobs = res;
          } else if (Array.isArray(res?.jobs)) {
            jobs = res.jobs;
          } else if (Array.isArray(res?.data)) {
            jobs = res.data;
          } else if (Array.isArray(res?.sections)) {
            jobs = res.sections;
          }

          if (cancelled) return;

          // Store jobs
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

    // Start N concurrent workers
    const runners = Array.from({
      length: Math.min(concurrency, links.length),
    }).map(() => worker());

    // Cleanup on unmount or dependency change
    return () => {
      cancelled = true;
    };
  }, [categories]); // Runs when categories array changes

  // Main content component
  const PrivateJobsContent = () => (
    <>
     
      <Header />
       <SEO
        title="Private Jobs 2025 Board | ITI, Diploma, Campus Placement - JobsAddah"
        description="Live updated private job board with categories like campus placement, ITI jobs, diploma jobs and more – auto-fetched and listed directly."
        keywords="private jobs board, iti jobs, diploma jobs, campus placement, pvtjob, private sector jobs"
        canonical="/private-jobs"
        section="Private Jobs"
      />
<AdBanner728x90/>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-purple-500/20">
              <Building2 size={32} strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Private Jobs Board
              </h1>
              <p className="mt-1 text-sm md:text-base text-slate-500 dark:text-slate-400">
                Live updates for Campus Placements, ITI, & Diploma jobs.
              </p>
            </div>
          </div>
          {catLoading && (
            <div className="flex items-center gap-2 text-sm text-purple-600 bg-purple-50 dark:bg-purple-900/20 px-4 py-2 rounded-full animate-pulse">
              <Loader2 size={16} className="animate-spin" />
              <span>Syncing Categories...</span>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {catError && (
          <div className="mb-8 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center gap-3">
            <AlertCircle size={20} />
            <p>{catError}</p>
          </div>
        )}

        {/* Category Cards Grid */}
        <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
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
                  className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Briefcase size={16} strokeWidth={2.5} />
                      </div>
                      <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 truncate pr-2">
                        {catLoading
                          ? "Loading Category..."
                          : cat?.name || cat?.title || cat?.text || `Category ${idx + 1}`}
                      </h2>
                    </div>
                    {!isLoading && !hasError && (
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${
                          jobs.length > 0
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                        }`}
                      >
                        {jobs.length} Active
                      </span>
                    )}
                    {hasError && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                        Error
                      </span>
                    )}
                  </div>

                  {/* Card Body: Jobs List */}
                  <div className="p-2 flex-1 min-h-[200px]">
                    {isLoading ? (
                      // Loading Skeleton
                      <div className="space-y-3 p-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="flex gap-3 items-center">
                            <div className="h-2 w-2 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                            <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                          </div>
                        ))}
                      </div>
                    ) : hasError ? (
                      // Error State
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-6">
                        <AlertCircle size={32} className="mb-2 opacity-20" />
                        <p className="text-sm">Failed to load jobs.</p>
                      </div>
                    ) : jobs.length === 0 ? (
                      // Empty State
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-6">
                        <Briefcase size={32} className="mb-2 opacity-20" />
                        <p className="text-sm">No active jobs found.</p>
                      </div>
                    ) : (
                      // Jobs List (max 8 items)
                      <ul className="flex flex-col">
                        {jobs.slice(0, 8).map((job, jIdx) => (
                          <li key={jIdx}>
                            <a
                              href={job.link || "#"}
                              target={job.link ? "_blank" : undefined}
                              rel={job.link ? "noopener noreferrer" : undefined}
                              className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group/link"
                            >
                              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-500 flex-shrink-0 group-hover/link:scale-125 transition-transform" />
                              <span className="text-sm font-medium text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed group-hover/link:text-purple-600 dark:group-hover/link:text-purple-400">
                                {job.title}
                              </span>
                              {job.link && (
                                <ExternalLink
                                  size={12}
                                  className="mt-1 ml-auto text-slate-300 group-hover/link:text-purple-500 flex-shrink-0 opacity-0 group-hover/link:opacity-100 transition-all"
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
                    <div className="p-4 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/30 dark:bg-slate-800/30">
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full py-2.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 dark:hover:bg-slate-600 dark:hover:text-white transition-all shadow-sm hover:shadow"
                      >
                        View All Listings{" "}
                        <ExternalLink size={14} className="ml-2" />
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
            <Briefcase size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-700" />
            <p className="text-slate-500 dark:text-slate-400">
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
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <PrivateJobsContent />
    </div>
  );
}