"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  pickLastDate,
  calculateDaysLeft,
  getVacancyCount,
  formatVacancy,
  deriveCategory,
  getCategoryColors,
  getOrganization,
  formatDate,
  isBeginnerFriendly,
} from "@/lib/job-insights";
import { resolveJobDetailHref } from "@/lib/job-url";
import { Sparkles, TimerReset, Target, Bookmark } from "lucide-react";

const SECTION_META = {
  topForms: {
    title: "Today's Top 5 Forms",
    icon: Sparkles,
    accent: "text-amber-400",
    blurb: "Sabse zyada apply hone wale form yahi hai",
  },
  closingSoon: {
    title: "Closing in Next 48 Hours",
    icon: TimerReset,
    accent: "text-rose-400",
    blurb: "Deadline chill raha hai? Fatafat fill karo!",
  },
  beginner: {
    title: "Beginner Friendly Jobs",
    icon: Target,
    accent: "text-emerald-400",
    blurb: "Low cutoff / document-based roles for starters",
  },
};

const shimmerCard = (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 animate-pulse">
    <div className="h-4 w-24 bg-white/20 rounded mb-3" />
    <div className="h-5 w-3/4 bg-white/30 rounded mb-2" />
    <div className="h-3 w-1/2 bg-white/10 rounded" />
  </div>
);

function HighlightCard({ job }) {
  const title = job?.recruitment?.title || job?.title || "Untitled";
  const last = pickLastDate(job);
  const daysLeft = calculateDaysLeft(last);
  const dateDisplay = formatDate(last);
  const rawVacancy = getVacancyCount(job);
  const category = deriveCategory(title);
  const categoryColors = getCategoryColors(category);
  const href = resolveJobDetailHref({ url: job?.url, id: job?._id });
  const organization = getOrganization(job);
  const urgencyBadge =
    daysLeft == null
      ? "DATE OUT"
      : daysLeft <= 0
      ? "OUT TODAY"
      : daysLeft <= 2
      ? `ENDS IN ${daysLeft}D`
      : "NEW";

  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm p-4 hover:border-white/30 hover:-translate-y-0.5 transition"
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`text-[11px] font-bold tracking-widest ${categoryColors.bg} px-3 py-0.5 rounded-full capitalize`}>
          {category}
        </span>
        <span className="text-[10px] font-black uppercase text-white/80 tracking-[0.2em]">
          {urgencyBadge}
        </span>
      </div>

      <h4 className="text-white font-semibold leading-snug line-clamp-2">
        {title}
      </h4>
      <p className="text-xs text-white/70 mt-1 truncate">{organization}</p>

      <div className="mt-4 flex items-center justify-between text-white/90">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-white/50">Vacancy</p>
          <p className="text-xl font-black">{formatVacancy(rawVacancy)}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wide text-white/50">Deadline</p>
          <p className="text-sm font-semibold">{dateDisplay}</p>
          {daysLeft != null && (
            <p className="text-[11px] text-white/60">
              {daysLeft <= 0 ? "Closes today" : `${daysLeft} days left`}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-white/70">
        <span className="inline-flex items-center gap-1">
          <Bookmark className="w-3.5 h-3.5 fill-white/70" />
          Bookmark ready
        </span>
        <span className="text-white/60">Tap to open form</span>
      </div>
    </Link>
  );
}

export default function HomeHighlights() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetch("/api/gov/favs")
      .then((r) => r.json())
      .then((json) => {
        if (!mounted) return;
        if (json?.success && Array.isArray(json.data)) {
          setJobs(json.data);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const { topForms, closingSoon, beginner } = useMemo(() => {
    if (!jobs.length) {
      return { topForms: [], closingSoon: [], beginner: [] };
    }

    const withMeta = jobs.map((job) => {
      const last = pickLastDate(job);
      return {
        job,
        daysLeft: calculateDaysLeft(last),
        vacancy: getVacancyCount(job),
        title: job?.recruitment?.title || job?.title || "",
      };
    });

    const sortedByVacancy = [...withMeta]
      .filter((item) => (item.vacancy || 0) > 0)
      .sort((a, b) => (b.vacancy || 0) - (a.vacancy || 0));

    const closingSoon = withMeta
      .filter((item) => typeof item.daysLeft === "number" && item.daysLeft <= 2)
      .sort((a, b) => (a.daysLeft || Infinity) - (b.daysLeft || Infinity));

    const beginnerFriendly = withMeta.filter((item) =>
      isBeginnerFriendly(item.title)
    );

    return {
      topForms: sortedByVacancy.slice(0, 5).map((item) => item.job),
      closingSoon: closingSoon.slice(0, 5).map((item) => item.job),
      beginner: beginnerFriendly.slice(0, 5).map((item) => item.job),
    };
  }, [jobs]);

  const sections = [
    { id: "topForms", data: topForms },
    { id: "closing", data: closingSoon },
    { id: "beginner", data: beginner },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="rounded-3xl bg-[#0b1739] text-white p-5 sm:p-8 relative overflow-hidden">
  <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.45),transparent_55%)]" />
        <div className="relative">
          <div className="flex flex-col gap-5">
            {sections.map(({ id, data }) => {
              const meta = SECTION_META[id];
              if (!meta) return null;
              const Icon = meta.icon;

              return (
                <div key={id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center ${meta.accent}`}>
                        <Icon className="w-5 h-5" />
                      </span>
                      <div>
                        <h3 className="text-lg font-bold text-white">{meta.title}</h3>
                        <p className="text-sm text-white/70">{meta.blurb}</p>
                      </div>
                    </div>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/40">Swipe →</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {loading && Array.from({ length: 3 }).map((_, idx) => <div key={idx}>{shimmerCard}</div>)}
                    {!loading && data.length === 0 && (
                      <p className="text-sm text-white/60">No data available right now, check back soon.</p>
                    )}
                    {!loading && data.length > 0 && data.map((job) => <HighlightCard key={job._id} job={job} />)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
