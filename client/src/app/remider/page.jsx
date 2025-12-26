"use client";
import { ArrowRight, BellRing, Clock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Trim a full URL to pathname + search + hash (keeps relative paths as-is)
function trimUrl(fullUrl) {
  if (!fullUrl) return "";
  try {
    const u = new URL(fullUrl);
    return `${u.pathname}${u.search}${u.hash}`;
  } catch (e) {
    // If it's already a relative path or malformed, return as-is
    return String(fullUrl);
  }
}

function buildPostLink(rawUrl, fallbackId) {
  const urlStr = String(rawUrl || "").trim();
  if (!urlStr && !fallbackId) return "#";
  let trimmed = urlStr;
  try {
    if (urlStr.startsWith("http")) {
      const u = new URL(urlStr);
      trimmed = `${u.pathname}${u.search}${u.hash}`;
    } else if (!urlStr.startsWith("/")) {
      // malformed or protocol-less URL — keep as given but ensure leading slash
      trimmed = urlStr.startsWith("/") ? urlStr : `/${urlStr}`;
    }
  } catch (e) {
    // keep trimmed as urlStr
  }

  if (
    !trimmed ||
    trimmed === "/" ||
    trimmed === "null" ||
    trimmed === "undefined"
  ) {
    return fallbackId
      ? `/post?id=${encodeURIComponent(String(fallbackId))}`
      : "#";
  }

  // normalize double slashes
  trimmed = trimmed.replace(/\/+/g, "/");
  return `/post?url=${encodeURIComponent(trimmed)}`;
}

export default function ReminderComponent() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchReminders() {
      try {
        const res = await fetch("/api/gov/reminders?days=3");
        const data = await res.json().catch(() => null);

        if (data && data.success) {
          setReminders(data.reminders);
        }
      } catch (error) {
        setError(error?.message || String(error));
      } finally {
        setLoading(false);
      }
    }
    fetchReminders();
  }, []);

  // --- Compact Skeleton ---
  if (loading) {
    return (
      <div className="mb-6 p-4 rounded-xl bg-white border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse" />
          <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-gray-50 rounded-lg animate-pulse border border-gray-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!loading && reminders.length === 0) return null;

  return (
    <div className="mb-8 w-full group/container">
      {/* Header - Tight & Clean */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="relative shrink-0">
          <div className="p-1.5 bg-orange-50 rounded-full border border-orange-100">
            <BellRing className="w-4 h-4 text-orange-600 animate-[swing_3s_ease-in-out_infinite]" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white"></span>
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className="text-sm font-bold text-gray-900">Deadline Alerts</h3>
          <span className="text-[10px] text-gray-500 font-medium bg-gray-100 px-1.5 py-0.5 rounded-full">
            Next 3 Days
          </span>
        </div>
      </div>

      {/* Compact Grid Layout */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {reminders.map((reminder, index) => {
          const isUrgent = reminder.daysLeft <= 1;
          const href = buildPostLink(
            reminder?.url || reminder?.link || reminder?.postUrl || "",
            reminder?._id || reminder?.id
          );

          return (
            <Link
              key={reminder._id}
              href={href}
              className={`
                        group relative flex flex-col justify-between p-3 rounded-xl border transition-all duration-300
                        bg-white hover:bg-orange-50/30
                        border-gray-100 hover:border-orange-200
                        shadow-sm hover:shadow-md hover:-translate-y-0.5
                        animate-in fade-in slide-in-from-bottom-2
                    `}
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <div className="flex justify-between items-start gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <h4
                    className="font-bold text-gray-800 text-xs sm:text-sm leading-tight line-clamp-2 group-hover:text-orange-600 transition-colors"
                    title={reminder.title}
                  >
                    {reminder.title}
                  </h4>
                  <p className="text-[10px] text-gray-500 mt-1 truncate font-medium">
                    {reminder.organization}
                  </p>
                </div>

                {/* Compact Badge */}
                <div
                  className={`
                            shrink-0 flex flex-col items-center justify-center w-10 h-10 rounded-lg border
                            ${
                              isUrgent
                                ? "bg-red-50 border-red-100 text-red-600 shadow-sm"
                                : "bg-orange-50 border-orange-100 text-orange-600"
                            }
                        `}
                >
                  <span
                    className={`text-sm font-bold leading-none ${
                      isUrgent ? "animate-pulse" : ""
                    }`}
                  >
                    {reminder.daysLeft <= 0 ? "!" : reminder.daysLeft}
                  </span>
                  <span className="text-[8px] uppercase font-bold tracking-wider opacity-80 scale-90">
                    {reminder.daysLeft <= 0 ? "Now" : "Days"}
                  </span>
                </div>
              </div>

              {/* Compact Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-auto">
                <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                  <Clock className="w-3 h-3" />
                  <span>
                    {new Date(reminder.applicationLastDate).toLocaleDateString(
                      undefined,
                      { day: "numeric", month: "short" }
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-1 group-hover:translate-x-0">
                  Apply <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      
    </div>
  );
}
