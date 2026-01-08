"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, LayoutGrid, Search, TrendingUp, FileText, X } from "lucide-react";

function Feature({ icon: Icon, title, desc }) {
  return (
    <div className="flex gap-3 rounded-xl border border-white/15 bg-white/10 p-3 md:p-4">
      <div className="mt-0.5 rounded-lg bg-white/15 p-2">
        <Icon size={18} className="text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-white">{title}</p>
        <p className="text-xs leading-relaxed text-blue-100/90">{desc}</p>
      </div>
    </div>
  );
}

export default function Welcome() {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const isStandaloneVisit = window?.location?.pathname.startsWith("/welcome");

      if (isStandaloneVisit) {
        setShowWelcome(true);
        return;
      }

      const isClosed = localStorage.getItem("jobsaddah_welcome_closed_2026");
      setShowWelcome(!isClosed);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleClose = () => {
    setShowWelcome(false);
    localStorage.setItem("jobsaddah_welcome_closed_2026", "true");
  };

  if (!showWelcome) return null;

  return (
    <>
      <div className="fixed inset-0 z-50">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
          aria-hidden
        />

        {/* Container: mobile-safe height + scroll */}
        <div className="relative z-50 flex min-h-dvh items-center justify-center p-3 sm:p-6">
          <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-white/15 bg-linear-to-r from-blue-700 via-indigo-700 to-slate-900 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 p-4 sm:p-6">
              <div className="min-w-0">
                <p className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-900">
                  New Update • JobsAddah.com
                </p>

                <h1 className="mt-3 text-2xl font-extrabold leading-snug text-white sm:text-3xl md:text-4xl">
                  Ab Sarkari Jobs aur bhi smart tareeke se dekhiye
                </h1>

                <p className="mt-2 text-sm text-blue-100/90 sm:text-base">
                  JobsAddah.com pe aap sections ko khud se arrange kar sakte ho, realtime search se data
                  le sakte ho, aur deadlines + trending jobs easily track kar sakte ho.
                </p>
              </div>

              <button
                onClick={handleClose}
                className="shrink-0 rounded-full bg-white/15 p-2 text-white hover:bg-white/25"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[70dvh] overflow-auto px-4 pb-4 sm:px-6 sm:pb-6">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Feature
                  icon={LayoutGrid}
                  title="Apne hisaab se sections"
                  desc="JobsAddah.com par aap sections ko apni priority ke according arrange kar sakte ho."
                />
                <Feature
                  icon={Search}
                  title="Realtime search"
                  desc="Realtime search karke turant relevant government jobs ka data nikaliye."
                />
                <Feature
                  icon={TrendingUp}
                  title="Deadlines & trending jobs"
                  desc="Important deadlines ke saath aapko trending jobs bhi dikhengi."
                />
                <Feature
                  icon={FileText}
                  title="Required documents (accurate)"
                  desc="Har Sarkari job me top par required documents clearly aur accurate dikhaye jayenge."
                />
              </div>

              {/* CTA */}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-relaxed text-blue-100/80">
                  Tip: “Important Links” aur “Required Documents” pe dhyan dein—apply karne me time bachega.
                </p>

                <button
                  onClick={handleClose}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-yellow-400 px-5 py-3 text-sm font-extrabold text-slate-900 hover:bg-yellow-300 sm:w-auto"
                >
                  Explore Now <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
