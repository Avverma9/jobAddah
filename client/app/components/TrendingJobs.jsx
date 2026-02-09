"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, Flame, Radio } from "lucide-react";
import { useRouter } from "next/navigation";
import { getCleanPostUrl } from "@/lib/job-url";

// Utility logic to strip domains and build params
const stripDomainFromUrl = (rawUrl) => {
  if (!rawUrl) return "";
  try {
    const parsed = new URL(rawUrl, "https://example.com");
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch (error) {
    return rawUrl;
  }
};

const buildPostDetailParams = (post) => {
  const urlToStrip = post.url || post.link || "";
  const trimmedPath = stripDomainFromUrl(urlToStrip);
  if (!trimmedPath) return null;
  const params = new URLSearchParams();
  params.set("url", trimmedPath);
  if (post.recruitment?.title) params.set("title", post.recruitment.title);
  if (urlToStrip) params.set("source", urlToStrip);
  return params.toString();
};

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

function formatDate(s) {
  const parsed = parseDate(s);
  if (parsed)
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }).format(parsed);
  if (!s) return "–";
  return typeof s === "string" ? s.trim() : String(s);
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
    "Department"
  );
}

export default function TrendingJobs({ limit = 8, initialItems = null }) {
  const [items, setItems] = useState(
    Array.isArray(initialItems) ? initialItems : [],
  );
  const [loading, setLoading] = useState(!Array.isArray(initialItems));
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (Array.isArray(initialItems)) return;
    async function fetchFavs() {
      try {
        const res = await fetch("/api/gov-post/fav-post");
        const data = await res.json();
        if (data.success) {
          setItems(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch trending jobs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFavs();
  }, [initialItems]);

  const handleJobClick = (post) => {
    const rawUrl = post.url || post.link || "";
    const cleanUrl = getCleanPostUrl(rawUrl);
    if (cleanUrl) router.push(cleanUrl);
  };

  if (loading) {
    return (
      <div className="mb-10">
        <div className="flex items-center gap-2.5 mb-4 px-1">
          <div className="w-9 h-9 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-white border border-slate-50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) return null;

  const displayItems = isExpanded ? items : items.slice(0, limit);

  return (
    <div className="mb-12 w-full animate-in fade-in slide-in-from-bottom-2 duration-700">
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 px-1">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg border border-orange-100 shadow-sm">
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Trending Jobs</h3>
          </div>

          {items.length > limit && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 text-[11px] font-black text-blue-600 hover:text-blue-700 transition-colors group/link px-3 py-1.5 rounded-full bg-blue-50/50 border border-blue-100/50"
            >
              {isExpanded ? "Show Less" : "See All"}
              <ArrowRight className={`w-3 h-3 transition-transform ${isExpanded ? "-rotate-90" : "group-hover/link:translate-x-0.5"}`} />
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-[9px] font-black text-red-500 uppercase tracking-widest bg-red-50/50 px-2.5 py-1 rounded-lg border border-red-100/50 self-start sm:self-center">
            <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
            </span>
            <span className="flex items-center gap-1">Live</span>
        </div>
      </div>

      {/* Mobile Horizontal Scroll */}
      <div className="flex gap-3 overflow-x-auto pb-4 px-1 snap-x snap-mandatory scrollbar-hide sm:hidden">
        {displayItems.map((post) => (
          <TrendingCard key={post._id} post={post} onClick={() => handleJobClick(post)} isMobile />
        ))}
        <div className="w-4 shrink-0" />
      </div>

      {/* Desktop Grid Layout */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-3">
        {displayItems.map((post) => (
          <TrendingCard key={post._id} post={post} onClick={() => handleJobClick(post)} />
        ))}
      </div>
    </div>
  );
}

function TrendingCard({ post, onClick, isMobile = false }) {
  const title = post?.recruitment?.title || "Untitled Job";
  const last = pickLastDate(post);
  const dateStr = formatDate(last);
  const [daysLeft, setDaysLeft] = useState(null);
  useEffect(() => {
    setDaysLeft(calculateDaysLeft(last));
  }, [last]);
  const isHighlighted = daysLeft != null && daysLeft <= 2;
  const vacancyCount = formatVacancy(getVacancyCount(post));
  const organization = getOrganization(post);
  const category = deriveCategory(title);

  return (
    <div
      onClick={onClick}
      className={`${isMobile ? "shrink-0 w-[78vw] snap-start" : "w-full"} group cursor-pointer bg-white border border-slate-100 rounded-2xl p-4 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05),0_8px_15px_-2px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_30px_-5px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1.5 border-b-[3px] hover:border-b-blue-500 flex flex-col justify-between h-full`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-[8px] font-black tracking-widest uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100">
          {category}
        </span>
        <div className="text-right">
            <p className="text-[10px] text-slate-900 font-black tracking-tight">{vacancyCount} <span className="text-[8px] text-slate-400 font-bold uppercase ml-0.5">Vac</span></p>
        </div>
      </div>

      <div className="space-y-1 mb-4 min-h-[3.5rem]">
        <h4 className="text-[14px] font-bold text-slate-800 leading-[1.3] line-clamp-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h4>
        <p className="text-[10px] text-slate-400 font-semibold truncate uppercase tracking-tight">{organization}</p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
        <div className="space-y-0.5">
          <p className="text-[8px] uppercase tracking-[0.1em] text-slate-300 font-black">Last Date</p>
          <div className={`text-[12px] font-black tracking-tight ${isHighlighted ? "text-red-500" : "text-slate-900"}`}>
            {dateStr}
          </div>
        </div>
        <div
          className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all duration-300 ${isHighlighted ? "bg-red-50 border-red-100 text-red-500" : "bg-slate-50 border-slate-100 text-slate-700"} group-hover:bg-slate-900 group-hover:text-white shadow-sm`}
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}


