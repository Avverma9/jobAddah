"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  ExternalLink,
  Grid,
  List,
  Search,
  LayoutGrid,
} from "lucide-react";
import SEO from "@/lib/SEO";
import ReminderComponent from "@/components/ReminderComponent";

// Helper to format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch (e) {
    return dateString;
  }
};

// Helper to clean links
const getCleanLink = (jobLink) => {
  const link = jobLink || "#";
  return link.startsWith("http")
    ? `/post?url=${encodeURIComponent(link)}`
    : link;
};

// --- Component 1: Grid View Card ---
const ViewAllJobCard = ({ job }) => {
  return (
    <Link
      href={getCleanLink(job.link || job.url)}
      className="group relative flex flex-col justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 h-full"
    >
      <div>
        <div className="flex justify-between items-start gap-3 mb-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <ExternalLink size={18} />
          </div>
        </div>
        <h3 className="text-sm sm:text-base font-bold text-slate-800 line-clamp-3 mb-2 leading-snug group-hover:text-indigo-700 transition-colors">
          {job.title}
        </h3>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
          <Calendar size={12} />
          <span>
            {job.lastDate ? formatDate(job.lastDate) : "Check Details"}
          </span>
        </div>
        <span className="text-indigo-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          <ChevronRight size={16} />
        </span>
      </div>
    </Link>
  );
};

// --- Component 2: List View Item ---
const ViewAllJobListItem = ({ job }) => {
  return (
    <Link
      href={getCleanLink(job.link || job.url)}
      className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200 gap-4"
    >
      <div className="flex items-start gap-4">
        <div className="hidden sm:flex p-2.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
          <LayoutGrid size={20} />
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-indigo-700 transition-colors">
            {job.title}
          </h3>
          <div className="flex items-center gap-2 mt-1.5 sm:hidden">
            <Calendar size={12} className="text-slate-400" />
            <span className="text-xs text-slate-500 font-medium">
              {job.lastDate ? formatDate(job.lastDate) : "Check Details"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-6 sm:min-w-[200px]">
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full">
          <Calendar size={14} />
          <span>
            {job.lastDate ? formatDate(job.lastDate) : "Check Details"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
          Apply <ChevronRight size={14} />
        </div>
      </div>
    </Link>
  );
};

// --- Main Content Component ---
function ViewAllContent() {
  const searchParams = useSearchParams();
  const targetUrl = searchParams.get("url");

  const [jobs, setJobs] = useState([]);
  const [pageTitle, setPageTitle] = useState("All Jobs");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New State for Search and View Mode
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'grid' | 'list'

  useEffect(() => {
    if (!targetUrl) {
      setError("No category URL provided.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/gov/section/by-link", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: targetUrl }),
        });

        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const json = await res.json();

        if (json.success) {
          if (Array.isArray(json.jobs)) {
            setJobs(json.jobs);
            try {
              const u = new URL(targetUrl);
              setPageTitle(
                u.pathname.replace(/\//g, " ").trim() || "Latest Jobs"
              );
            } catch {
              setPageTitle("Category Details");
            }
          } else if (json.data) {
            // Legacy parsing (if needed based on previous context)
            let allJobs = [];
            let extractedTitle = "Category Details";
            json.data.forEach((sectionItem) => {
              if (sectionItem.categories) {
                sectionItem.categories.forEach((cat) => {
                  if (cat.name) extractedTitle = cat.name;
                  if (cat.data) {
                    cat.data.forEach((subData) => {
                      if (subData.jobs && Array.isArray(subData.jobs)) {
                        allJobs = [...allJobs, ...subData.jobs];
                      }
                    });
                  }
                });
              }
            });
            setJobs(allJobs);
            setPageTitle(extractedTitle);
          } else {
            setError("No data found.");
          }
        } else {
          setError(json.error || "No data found.");
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [targetUrl]);

  // Filter Jobs based on Search
  const filteredJobs = jobs.filter((job) =>
    job.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* --- Header Section --- */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 mb-4 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Home
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200 pb-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight capitalize">
                {pageTitle}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {jobs.length} total listings available
              </p>
            </div>

            {/* --- Controls: Search & View Toggle --- */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              {/* Search Bar */}
              <div className="relative group w-full sm:w-72">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                />
              </div>

              {/* View Toggle Buttons */}
              <div className="flex bg-white p-1 rounded-xl border border-slate-200 shrink-0">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "grid"
                      ? "bg-indigo-50 text-indigo-600 shadow-sm"
                      : "text-slate-400 hover:bg-slate-50"
                  }`}
                  title="Grid View"
                >
                  <Grid size={18} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "list"
                      ? "bg-indigo-50 text-indigo-600 shadow-sm"
                      : "text-slate-400 hover:bg-slate-50"
                  }`}
                  title="List View"
                >
                  <List size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- Reminder Component --- */}
        <div className="mb-8">
          <ReminderComponent />
        </div>

        {/* --- Main Content --- */}
        {loading ? (
          // Loading Skeleton
          <div
            className={`grid gap-4 ${
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            }`}
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`${
                  viewMode === "grid" ? "h-48" : "h-24"
                } bg-white rounded-xl border border-slate-100 p-4 animate-pulse`}
              >
                <div className="flex gap-4 h-full">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg shrink-0"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error State
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="p-3 bg-red-50 text-red-500 rounded-full mb-3">
              <ExternalLink size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Oops!</h3>
            <p className="text-slate-500 max-w-md mx-auto mt-1 mb-6">{error}</p>
            <Link
              href="/"
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Go Home
            </Link>
          </div>
        ) : filteredJobs.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-slate-200">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
              <Search size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-900 font-semibold text-lg">
              No jobs found
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Try adjusting your search terms.
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 text-indigo-600 text-sm font-medium hover:underline"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          // Job List / Grid
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 animate-in fade-in zoom-in duration-300"
                : "flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300"
            }
          >
            {filteredJobs.map((job, idx) =>
              viewMode === "grid" ? (
                <ViewAllJobCard key={idx} job={job} />
              ) : (
                <ViewAllJobListItem key={idx} job={job} />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// --- Page Wrapper ---
export default function ViewAllPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <SEO title="Browse All Jobs | JobsAddah" />
      <ViewAllContent />
    </Suspense>
  );
}
