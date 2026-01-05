"use client";
import { ArrowRight, Clock, Flame, Radio } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Scrollbar hide utility
const scrollbarHideStyles = `
  .scrollbar-hide::-webkit-scrollbar {
      display: none;
  }
  .scrollbar-hide {
      -ms-overflow-style: none;
      scrollbar-width: none;
  }
`;

function trimUrl(fullUrl) {
  if (!fullUrl) return '';
  try {
    const u = new URL(fullUrl);
    return `${u.pathname}${u.search}${u.hash}`;
  } catch (e) {
    return String(fullUrl);
  }
}

function buildPostLink(rawUrl, fallbackId) {
  const urlStr = String(rawUrl || '').trim();
  if (!urlStr && !fallbackId) return '#';
  let trimmed = urlStr;
  try {
    if (urlStr.startsWith('http')) {
      const u = new URL(urlStr);
      trimmed = `${u.pathname}${u.search}${u.hash}`;
    } else if (!urlStr.startsWith('/')) {
      trimmed = urlStr.startsWith('/') ? urlStr : `/${urlStr}`;
    }
  } catch (e) {}

  if (!trimmed || trimmed === '/' || trimmed === 'null' || trimmed === 'undefined') {
    return fallbackId ? `/post?id=${encodeURIComponent(String(fallbackId))}` : '#';
  }
  trimmed = trimmed.replace(/\/+/, '/');
  return `/post?url=${encodeURIComponent(trimmed)}`;
}

const deriveCategory = (title = "") => {
  const normalized = title.toLowerCase();
  if (normalized.includes("police")) return "Police";
  if (normalized.includes("railway") || normalized.includes("rrb")) return "Railway";
  if (normalized.includes("bank") || normalized.includes("sbi") || normalized.includes("ibps")) return "Bank";
  if (normalized.includes("defence") || normalized.includes("army") || normalized.includes("navy") || normalized.includes("air force")) return "Defence";
  if (normalized.includes("teacher") || normalized.includes("ssc")) return "SSC";
  return "Govt";
};

const formatDate = (value) => {
  if (!value) return "–";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  } catch (e) {
    return value;
  }
};

const formatVacancy = (count) => {
  if (!count || Number(count) <= 0) return "N/A";
  return new Intl.NumberFormat("en-IN").format(count);
};

export default function ReminderComponent() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New State for toggling "View All"
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    async function fetchReminders() {
      try {
        // You might want to increase this limit (e.g., days=7 or no limit) so "View All" has more data to show
  const res = await fetch('/api/gov/reminders?days=7');
        const data = await res.json().catch(() => null);
        if (data && data.success) setReminders(data.reminders || []);
      } catch (err) {
        setError(err?.message || String(err));
      } finally {
        setLoading(false);
      }
    }
    fetchReminders();
  }, []);

  if (loading) {
    return (
      <div className="mb-6 p-4 rounded-xl bg-white border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse" />
          <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="flex gap-3 overflow-hidden sm:grid sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="min-w-[70vw] sm:min-w-0 h-20 bg-gray-50 rounded-lg animate-pulse border border-gray-100" />
          ))}
        </div>
      </div>
    );
  }

  if (!loading && reminders.length === 0) return null;

  return (
    <div className="mb-10 w-full">
      <style>{scrollbarHideStyles}</style>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 px-1">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-orange-50 text-orange-600 rounded-full">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Trending & Urgent Deadlines</h3>
            <p className="text-xs text-slate-500">Applications closing soon, updated live</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-red-500 uppercase tracking-wide">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="flex items-center gap-1"><Radio className="w-3 h-3" /> Live Updates</span>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 sm:overflow-visible sm:mx-0 sm:px-0">
        {reminders.map((reminder, index) => {
          const href = buildPostLink(reminder?.url || reminder?.link || reminder?.postUrl || '', reminder?._id || reminder?.id);
          const category = deriveCategory(reminder.title || "");
          const isHighlighted = reminder.daysLeft <= 2;

          if (!isExpanded && index >= 4) {
            return null;
          }

          return (
            <Link
              key={reminder._id || index}
              href={href}
              className="shrink-0 w-[80vw] max-w-[320px] sm:w-auto snap-center group bg-white border border-slate-100 rounded-2xl p-4 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.45)] hover:shadow-[0_15px_35px_-18px_rgba(15,23,42,0.55)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-[10px] font-black tracking-wide uppercase px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {category}
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">
                  Vac: <span className="text-slate-900">{formatVacancy(reminder.totalPosts)}</span> Posts
                </span>
              </div>

              <div className="space-y-1 mb-5">
                <h4 className="text-base font-semibold text-slate-900 leading-snug line-clamp-2">
                  {reminder.title}
                </h4>
                <p className="text-sm text-slate-500 font-medium truncate">
                  {reminder.organization}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">Deadline</p>
                  <div className={`text-sm font-bold ${isHighlighted ? 'text-red-500' : 'text-slate-700'}`}>
                    {formatDate(reminder.applicationLastDate)}
                  </div>
                </div>
                <div className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors ${isHighlighted ? 'bg-red-50 border-red-100 text-red-500' : 'bg-slate-50 border-slate-200 text-slate-700'} group-hover:bg-slate-900 group-hover:text-white`}>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {reminders.length > 4 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-full shadow-sm hover:shadow-md transition-all"
          >
            {isExpanded ? 'Show fewer alerts' : 'View full schedule'}
          </button>
        </div>
      )}
    </div>
  );
}