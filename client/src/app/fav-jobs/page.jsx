import React from "react";
import Link from "next/link";
import SEO from "@/lib/SEO";
import SectionsWithPosts from "@/components/SectionsWithPosts";
import MobileJobListWrapper from "@/components/mobile/MobileJobListWrapper";
import ReminderComponent from "@/components/ReminderComponent";
import { ArrowRight, ChevronDown, Flame, Radio } from "lucide-react";
import Tools from "@/components/layout/Tools";
import { resolveJobDetailHref } from "@/lib/job-url";
import { getFavPosts, getSectionsWithPosts } from "@/lib/api/gov";

// Scrollbar hiding utility
const scrollbarHideStyles = `
  .scrollbar-hide::-webkit-scrollbar {
      display: none;
  }
  .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
  }
`;

function pickLastDate(post) {
  const d = post?.recruitment?.importantDates || {};
  return (
    d.applicationLastDate ||
    d.applicationEndDate ||
    d.lastDateToApplyOnline ||
    d.onlineApplyLastDate ||
    d.lastDateOfRegistration ||
    d.lastDate ||
    ""
  );
}

function formatDate(s) {
  const parsed = parseDate(s);
  if (parsed)
    return parsed.toLocaleDateString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  if (!s) return "–";
  return typeof s === "string" ? s.trim() : String(s);
}

function parseDate(value) {
  if (!value) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;

  const direct = Date.parse(trimmed);
  if (!Number.isNaN(direct)) return new Date(direct);

  const normalized = trimmed.replace(
    /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/,
    (_, d, m, y) => {
      const year = y.length === 2 ? `20${y}` : y.padStart(4, "0");
      return `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    }
  );

  if (normalized !== trimmed) {
    const alt = Date.parse(normalized);
    if (!Number.isNaN(alt)) return new Date(alt);
  }

  return null;
}

function calculateDaysLeft(value) {
  const parsed = parseDate(value);
  if (!parsed) return null;
  const now = new Date();
  parsed.setHours(23, 59, 59, 999);
  return Math.ceil((parsed - now) / (1000 * 60 * 60 * 24));
}

function formatVacancy(count) {
  if (!count || Number(count) <= 0) return "N/A";
  return new Intl.NumberFormat("en-IN").format(count);
}

function getVacancyCount(post) {
  const vacancy = post?.recruitment?.vacancyDetails || {};
  return (
    vacancy.totalPosts ||
    vacancy.total ||
    vacancy.totalVacancy ||
    post?.recruitment?.totalPosts ||
    post?.totalPosts ||
    post?.posts ||
    0
  );
}

function deriveCategory(title = "") {
  const normalized = title.toLowerCase();
  if (normalized.includes("police")) return "Police";
  if (normalized.includes("railway") || normalized.includes("rrb")) return "Railway";
  if (normalized.includes("bank") || normalized.includes("sbi") || normalized.includes("ibps")) return "Bank";
  if (normalized.includes("defence") || normalized.includes("army") || normalized.includes("navy") || normalized.includes("air force")) return "Defence";
  if (normalized.includes("teacher") || normalized.includes("ssc")) return "SSC";
  return "Govt";
}

function getOrganization(post) {
  return (
    post?.recruitment?.organization?.name ||
    post?.recruitment?.organization ||
    post?.organization ||
    "Multiple Departments"
  );
}

export default async function TrendingJobsPage({ limit, showToolsInPreview = false } = {}) {
  // Server-side fetch favorite posts and sections to render initial HTML with content
  let items = [];
  let error = null;
  let loading = false;

  try {
    const favResp = await getFavPosts();
    const favJson = favResp && typeof favResp.json === 'function' ? await favResp.json() : null;
    if (favJson && favJson.success) items = favJson.data || [];
    else error = favJson?.message || "Failed to load trending jobs";
  } catch (err) {
    error = err?.message || "Fetch error";
  }

  // Sections for the desktop layout
  let sections = [];
  try {
    const secResp = await getSectionsWithPosts();
    const secJson = secResp && typeof secResp.json === 'function' ? await secResp.json() : null;
    if (secJson && secJson.success) sections = secJson.data || [];
  } catch (err) {
    // swallow - sections are optional
  }

  const TrendingJobCard = ({ post }) => {
    const title = post?.recruitment?.title || post.title || "Untitled";
    const last = pickLastDate(post);
    const dateStr = formatDate(last);
    const daysLeft = calculateDaysLeft(last);
    const isHighlighted = daysLeft != null && daysLeft <= 2;
    const vacancyCount = formatVacancy(getVacancyCount(post));
    const organization = getOrganization(post);
    const category = deriveCategory(title);

    const dest = resolveJobDetailHref({ url: post?.url, id: post?._id });

    return (
      <Link
        href={dest}
  className="group shrink-0 w-[82vw] max-w-85 sm:w-full snap-start bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.45)] hover:shadow-[0_15px_35px_-18px_rgba(15,23,42,0.55)] transition-all duration-300 hover:-translate-y-1"
      >
        <div className="flex items-start justify-between mb-4">
          <span className="text-[10px] font-black tracking-wide uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {category}
          </span>
          <span className="text-[11px] text-slate-500 font-semibold">
            Vac: <span className="text-slate-900">{vacancyCount}</span> {vacancyCount === "N/A" ? "" : "Posts"}
          </span>
        </div>

        <div className="space-y-1.5 mb-5">
          <h4 className="text-base font-semibold text-slate-900 leading-snug line-clamp-2">
            {title}
          </h4>
          <p className="text-sm text-slate-500 font-medium truncate">{organization}</p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">Deadline</p>
            <div className={`text-sm font-bold ${isHighlighted ? "text-red-500" : "text-slate-700"}`}>
              {dateStr}
            </div>
          </div>
          <div
            className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${
              isHighlighted
                ? "bg-red-50 border-red-100 text-red-500"
                : "bg-slate-50 border-slate-200 text-slate-700"
            } group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900`}
          >
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    );
  };

  // If `limit` is provided this component is being used as a preview.
  // In preview mode we should not force a full viewport height (min-h-screen)
  // because that creates large blank space when embedded in other pages.
  const isPreview = typeof limit === "number" && limit > 0;
  const showSEO = !isPreview;
  const shouldShowTools = !isPreview || showToolsInPreview;

  return (
    <div className={`${isPreview ? "" : "min-h-screen"} bg-slate-50 py-2 sm:py-6`}>
      <style>{scrollbarHideStyles}</style>
      {showSEO && (
        <SEO
          title="Trending Jobs — JobsAddah"
          description="Track the most applied government job openings, trending recruitment updates, and urgent deadlines curated by JobsAddah."
          canonical="/fav-jobs"
          section="Trending Jobs"
        />
      )}

      <div className="mx-auto max-w-full sm:max-w-7xl sm:px-6">
        <div className="mx-3 sm:mx-0 mb-3">
          <ReminderComponent />
        </div>

        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3 px-3 sm:px-0">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-50 text-orange-600 rounded-full">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">Most Applied Jobs</h3>
                <p className="text-xs text-slate-500">High traffic openings people are applying to right now</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-red-500 uppercase tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="flex items-center gap-1 text-red-500">
                <Radio className="w-3 h-3" /> Live Trends
              </span>
            </div>
          </div>

          {loading && (
            <div className="w-full">
              <div className="flex gap-3 overflow-x-auto px-3 pb-2 sm:hidden">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="shrink-0 w-[82vw] max-w-85 h-40 bg-white border border-slate-100 rounded-2xl animate-pulse"
                  />
                ))}
              </div>
              <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-44 bg-white border border-slate-100 rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="w-full">
              {/* Mobile: Horizontal Scroll */}
              <div className="flex gap-3 overflow-x-auto px-3 pb-4 mx-0 snap-x snap-mandatory scrollbar-hide sm:hidden">
                {(isPreview ? items.slice(0, limit) : items).map((post) => (
                  <TrendingJobCard key={post._id} post={post} />
                ))}
                <div className="w-1 shrink-0" />
              </div>

              {/* Desktop: Grid - 4 Columns for better readability (server-rendered, limited preview) */}
              <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {(isPreview ? items.slice(0, limit) : items.slice(0, 8)).map((post) => (
                  <TrendingJobCard key={post._id} post={post} />
                ))}
              </div>
            </div>
          )}
        </div>

    {/* Tools section can be forced to show even in preview mode */}
    {shouldShowTools && <Tools />}
      </div>

      <div className="mt-2 sm:mt-6">
        <div className="sm:hidden">
          <MobileJobListWrapper />
        </div>
        <div className="hidden sm:block">
          <SectionsWithPosts sections={sections} />
        </div>
      </div>
    </div>
  );
}