"use client";

"use client";

import React, { useState } from "react";
import Link from "next/link";
import SEO from "@/lib/SEO";
import {
  ArrowRight,
  LayoutGrid,
  Search,
  TrendingUp,
  FileText,
  ShieldCheck,
  BellRing,
  Sparkles,
  CheckCircle2,
  X,
} from "lucide-react";

const STORAGE_KEY = "jobsaddah_welcome_closed_2026";

const FEATURE_LIST = [
  {
    icon: LayoutGrid,
    title: "Apne hisaab se sections",
    desc: "Drag & drop layout se favourite sections ko top par lao aur irrelevant blocks hide karo.",
    badge: "Personalize",
  },
  {
    icon: Search,
    title: "Realtime gov search",
    desc: "Elastic search backend latest notifications ko milliseconds me surface karta hai.",
    badge: "Realtime",
  },
  {
    icon: TrendingUp,
    title: "Deadlines + trending alerts",
    desc: "Daily refresh last-date timers aur high demand forms ko highlight karta hai.",
    badge: "Insights",
  },
  {
    icon: FileText,
    title: "Required documents sabse upar",
    desc: "Official PDFs se verify karke mandatory docs ko top card me chipka dete hain.",
    badge: "Accuracy",
  },
  {
    icon: ShieldCheck,
    title: "404-safe official links",
    desc: "Broken URL detector duplicate/cached sitemaps se genuine source pick karta hai.",
    badge: "Trust",
  },
  {
    icon: Sparkles,
    title: "Smart filters & Hindi copy",
    desc: "Keyword booster Hindi me summary generate karta hai taaki share karna easy ho.",
    badge: "AI Assist",
  },
];

const FAQS = [
  {
    question: "Google ne pehle is page ko kyun skip kiya tha?",
    answer:
      "Pehle /welcome route client-side modal tha jo server render nahi ho raha tha. Ab hero, FAQ aur copy SSR friendly hain isliye crawl hona asaan hai.",
  },
  {
    question: "Kya ye updates remaining pages par bhi apply hue hain?",
    answer:
      "Haan, canonical URLs, sitemap cleanup aur robots rules align kiye gaye hain jisse duplicate ya redirect pages Search Console me error na bane.",
  },
  {
    question: "LocalStorage dismiss karne se SEO par koi effect?",
    answer:
      "Nahi. Modal dismiss hone ke baad bhi base content crawlable rahega aur canonical /welcome indexable hai.",
  },
];

const RESOURCES = [
  {
    label: "Latest Govt Jobs Feed",
    href: "/view-all",
    desc: "SSC, UPSC, Bank aur Railway cards ek hi scroll me.",
  },
  {
    label: "Favourite Jobs Tracker",
    href: "/fav-jobs",
    desc: "Deadline countdown + auto reminders.",
  },
  {
    label: "Private + Remote Jobs",
    href: "/private-jobs",
    desc: "Product, tech aur ops hiring alerts.",
  },
];

const INSIGHTS = [
  "2,800+ verified job URLs har din QA hoti hain.",
  "Sitemap se duplicate/redirect links hata diye gaye hain.",
  "Robots file sitemap pointer share karti hai jisse discovery fast ho.",
  "All-important documents ko structured list me format kiya gaya hai.",
];

function Feature({ icon: Icon, title, desc, badge }) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-100/70">
        <div className="rounded-lg bg-white/10 p-2">
          <Icon size={18} className="text-white" />
        </div>
        {badge && (
          <span className="rounded-full border border-white/20 px-2 py-0.5 text-[10px]">
            {badge}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-base font-semibold text-white">{title}</p>
        <p className="text-sm text-blue-100/80">{desc}</p>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }) {
  return (
    <details className="group rounded-2xl border border-white/10 bg-slate-900/60 p-4">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-white">
        {question}
        <span className="ml-2 text-xs text-blue-200 transition group-open:rotate-45">
          +
        </span>
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-blue-100/90">{answer}</p>
    </details>
  );
}

const getInitialVisibility = () => {
  if (typeof window === "undefined") return true;
  const pathname = window.location?.pathname || "";
  if (pathname.startsWith("/welcome")) return true;
  const isClosed = window.localStorage.getItem(STORAGE_KEY);
  return !isClosed;
};

export default function Welcome() {
  const [showWelcome, setShowWelcome] = useState(getInitialVisibility);

  const handleClose = () => {
    setShowWelcome(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "true");
    }
  };

  return (
    <>
      <SEO
        title="JobsAddah Welcome Hub — Smarter Sarkari Job Tracking"
        description="Jan 2026 product update: realtime search, verified PDFs, countdown reminders aur personalized sections ab ek hi welcome hub me."
        canonical="/welcome"
        section="Product Update"
      />

      <main className="relative min-h-dvh bg-slate-950 pb-16 pt-10 text-white">
        <div className="mx-auto w-full max-w-6xl px-5 md:px-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-100">
            Platform Update • January 2026
          </p>
          <h1 className="mt-6 text-3xl font-extrabold leading-tight text-white sm:text-4xl md:text-5xl">
            Smarter Sarkari Job Tracking with deadlines, docs & realtime alerts
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-blue-100/90">
            Welcome hub explain karta hai ki JobsAddah ka fresh layout Google ke liye crawlable aur students ke
            liye fast kyun hai. Hero content, FAQs aur walkthrough ab server-rendered hain—meaning Search Console me
            “Crawled but not indexed” type errors resolve ho jayeinge.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {["2,800+ verified job links", "< 60 sec deadline refresh", "RSS + sitemap ready", "Hindi + English copy"].map(
              (stat) => (
                <div
                  key={stat}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm font-semibold text-blue-100"
                >
                  {stat}
                </div>
              )
            )}
          </div>

          <section className="mt-10 grid gap-5 lg:grid-cols-3">
            {FEATURE_LIST.map((feature) => (
              <Feature key={feature.title} {...feature} />
            ))}
          </section>

          <section className="mt-10 grid gap-6 lg:grid-cols-2">
            <article className="rounded-3xl border border-white/10 bg-linear-to-br from-slate-900/70 to-slate-800/60 p-6">
              <h2 className="text-2xl font-bold text-white">Kya update hua?</h2>
              <p className="mt-3 text-sm text-blue-100/90">
                Crawlers ab bina JavaScript ke hero copy, feature list aur FAQ pad sakte hain. Iske alawa, sitemap se
                thin auth pages (<code>/login</code>, <code>/register</code>) hat chuke hain aur robots file direct sitemap pointer deti hai.
              </p>
              <ul className="mt-4 space-y-3">
                {INSIGHTS.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-blue-50">
                    <CheckCircle2 size={16} className="mt-0.5 text-emerald-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/view-all"
                  className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-5 py-3 text-sm font-bold text-slate-900 transition hover:bg-yellow-300"
                >
                  Explore Latest Jobs <ArrowRight size={16} />
                </Link>
                <Link
                  href="/fav-jobs"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white hover:bg-white/5"
                >
                  Track Deadlines
                </Link>
              </div>
            </article>

            <article className="rounded-3xl border border-white/10 bg-slate-900/60 p-6">
              <h2 className="text-2xl font-bold text-white">Important resources</h2>
              <div className="mt-4 space-y-4">
                {RESOURCES.map((resource) => (
                  <Link
                    key={resource.href}
                    href={resource.href}
                    className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-white/40"
                  >
                    <p className="text-base font-semibold text-white">{resource.label}</p>
                    <p className="text-sm text-blue-100/80">{resource.desc}</p>
                  </Link>
                ))}
              </div>
              <div className="mt-6 space-y-3">
                {[
                  ["Instant notifications", BellRing],
                  ["Verified documents", ShieldCheck],
                ].map(([label, Icon]) => (
                  <div key={label} className="flex items-center gap-3 text-sm text-blue-100/90">
                    <div className="rounded-full bg-white/10 p-2">
                      <Icon size={16} />
                    </div>
                    {label}
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="mt-12 rounded-3xl border border-white/10 bg-slate-900/70 p-6">
            <h2 className="text-2xl font-bold text-white">SEO & indexing FAQ</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {FAQS.map((faq) => (
                <FAQItem key={faq.question} {...faq} />
              ))}
            </div>
          </section>
        </div>
      </main>

      {showWelcome && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="welcome-modal-title">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
            aria-hidden
          />
          <div className="relative z-10 flex min-h-dvh items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-4xl overflow-hidden rounded-3xl border border-white/15 bg-linear-to-br from-blue-800 via-indigo-800 to-slate-900 shadow-2xl">
              <div className="flex items-start justify-between gap-3 border-b border-white/10 p-5 sm:p-7">
                <div className="min-w-0">
                  <p className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-slate-900">
                    Fresh release • JobsAddah
                  </p>
                  <h2 id="welcome-modal-title" className="mt-4 text-2xl font-black leading-tight text-white sm:text-3xl">
                    Ab Sarkari job hunting server-rendered aur index-friendly ho chuka hai
                  </h2>
                  <p className="mt-3 text-sm text-blue-100/90 sm:text-base">
                    Personalized sections, realtime search aur verified document cards ek hi modal me explain kiye gaye
                    hain. Close karne ke baad bhi aap niche ka detailed walkthrough pad sakte hain.
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="rounded-full bg-white/15 p-2 text-white transition hover:bg-white/30"
                  aria-label="Close welcome overlay"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="max-h-[70dvh] space-y-4 overflow-auto p-5 sm:p-7">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {FEATURE_LIST.slice(0, 4).map((feature) => (
                    <Feature key={feature.title} {...feature} />
                  ))}
                </div>
                <p className="text-xs text-blue-100/80">
                  Tip: “Important Links” aur “Required Documents” sabse upar milte hain—iss order ko crawlable banane ke
                  liye humne layout ko server-side render kiya hai.
                </p>
                <button
                  onClick={handleClose}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-yellow-400 px-6 py-3 text-sm font-extrabold text-slate-900 transition hover:bg-yellow-300"
                >
                  Continue to JobsAddah <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}