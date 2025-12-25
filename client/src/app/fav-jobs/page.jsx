"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import SEO from "@/lib/SEO";
import SectionsWithPosts from "@/components/SectionsWithPosts";
import MobileJobListWrapper from "@/components/mobile/MobileJobListWrapper";
import ReminderComponent from "@/components/ReminderComponent";
import {
  ChevronRight,
  Clock,
  TrendingUp,
  Briefcase,
  BellDot,
} from "lucide-react";
import Tools from "@/components/layout/Tools";

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
  if (!s) return "";
  if (/[A-Za-z]/.test(s)) return s.trim();
  const p = Date.parse(s);
  if (!isNaN(p))
    return new Date(p).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
    });
  return s;
}

export default function TrendingJobsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/api/gov/favs")
      .then((r) => r.json())
      .then((json) => {
        if (!mounted) return;
        if (json && json.success) setItems(json.data || []);
        else setError(json?.message || "Failed to load trending jobs");
      })
      .catch((err) => {
        if (mounted) setError(err.message || "Fetch error");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const TrendingJobCard = ({ post }) => {
    const title = post?.recruitment?.title || post.title || "Untitled";
    const last = pickLastDate(post);
    const dateStr = formatDate(last);
    const [month, day] = dateStr ? dateStr.split(" ") : ["", ""];

    const dest = post.url
      ? `/post?url=${encodeURIComponent(post.url)}`
      : `/post?id=${encodeURIComponent(String(post._id))}`;

    return (
      <>
        {/* --- MOBILE VIEW: CIRCULAR --- */}
        <Link
          href={dest}
          className="sm:hidden flex flex-col items-center gap-1.5 w-[72px] shrink-0 snap-start group active:scale-95 transition-transform"
        >
          <div className="relative w-[60px] h-[60px] rounded-full p-[2px] bg-gradient-to-tr from-orange-400 via-pink-500 to-indigo-500 shadow-sm">
            <div className="w-full h-full rounded-full bg-white border-2 border-white flex flex-col items-center justify-center overflow-hidden relative">
              {day && month ? (
                <>
                  <span className="text-[8px] font-bold text-red-500 uppercase leading-none -mb-0.5">
                    {month}
                  </span>
                  <span className="text-base font-black text-slate-800 leading-none">
                    {day}
                  </span>
                </>
              ) : (
                <TrendingUp size={20} className="text-indigo-500" />
              )}
            </div>
            <div className="absolute bottom-0 right-0 bg-blue-600 border-2 border-white w-4 h-4 rounded-full flex items-center justify-center">
              <Briefcase size={8} className="text-white" />
            </div>
          </div>
          <p className="text-[10px] leading-3 text-center font-medium text-slate-700 line-clamp-2 w-full break-words px-0.5">
            {title}
          </p>
        </Link>

        {/* --- DESKTOP VIEW: COMPACT RECTANGULAR GRID --- */}
        <Link
          href={dest}
          className="hidden sm:flex flex-col justify-between bg-white rounded-xl border border-slate-200 p-3.5 hover:border-indigo-300 hover:shadow-md transition-all duration-200 group h-full min-h-[110px]"
        >
          <div className="flex justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-indigo-700 transition-colors">
                {title}
              </h3>
            </div>
            <div className="shrink-0 text-slate-300 group-hover:text-indigo-500 transition-colors">
              <TrendingUp size={18} />
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Clock size={13} />
              <span>
                Last: <span className="text-slate-800">{dateStr || "N/A"}</span>
              </span>
            </div>
          </div>
        </Link>
      </>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-2 sm:py-6">
      <style>{scrollbarHideStyles}</style>
      <SEO title="Trending Jobs — JobsAddah" />

      <div className="mx-auto max-w-full sm:max-w-7xl sm:px-6">
        {/* Reminder Component with reduced margin */}
        <div className="mx-3 sm:mx-0 mb-3">
          <ReminderComponent />
        </div>

        {/* Trending Section */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3 px-3 sm:px-0">
            <div className="relative shrink-0">
              <div className="p-1.5 bg-orange-50 rounded-full border border-orange-100">
                <BellDot className="w-4 h-4 text-orange-600 animate-[swing_3s_ease-in-out_infinite]" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Most Applied
            </h3>
          </div>

          {loading && (
            <div className="w-full">
              {/* Mobile Skeleton */}
              <div className="flex gap-4 overflow-hidden px-3 pb-2 sm:hidden">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-2 shrink-0"
                  >
                    <div className="w-[60px] h-[60px] rounded-full bg-slate-200 animate-pulse" />
                    <div className="w-12 h-2 bg-slate-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
              {/* Desktop Skeleton */}
              <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-28 bg-white border border-slate-100 rounded-xl animate-pulse"
                  />
                ))}
              </div>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="w-full">
              {/* Mobile: Horizontal Scroll */}
              <div className="flex gap-3 overflow-x-auto px-3 pb-4 -mx-0 snap-x snap-mandatory scrollbar-hide sm:hidden">
                {items.map((post) => (
                  <TrendingJobCard key={post._id} post={post} />
                ))}
                <div className="w-1 shrink-0" />
              </div>

              {/* Desktop: Responsive Grid (2 cols on md, 3 on lg, 4 on xl) */}
              <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((post) => (
                  <TrendingJobCard key={post._id} post={post} />
                ))}
              </div>
            </div>
          )}
        </div>

      
          <Tools />
      
      </div>

      <div className="mt-2 sm:mt-6">
        <div className="sm:hidden">
          <MobileJobListWrapper />
        </div>
        <div className="hidden sm:block">
          <SectionsWithPosts />
        </div>
      </div>
    </div>
  );
}
