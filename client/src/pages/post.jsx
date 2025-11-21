import React, { useEffect, useState } from "react";
import { baseUrl } from "../../util/baseUrl";
import {
  Moon,
  Sun,
  ChevronLeft,
  ExternalLink,
  Calendar,
  User,
  FileText,
  ListChecks,
} from "lucide-react";

export default function PostDetail({ idFromProp }) {
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const id =
    idFromProp ||
    new URLSearchParams(window.location.search).get("_id");

  // Theme init
  // On mount, set theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      // fallback: system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
        setIsDarkMode(true);
      } else {
        document.documentElement.classList.remove('dark');
        setIsDarkMode(false);
      }
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  };

  // Fetch post details
  useEffect(() => {
    if (!id) {
      setError("Post ID missing");
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`${baseUrl}/api/jobs/jobs/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load post");
        return r.json();
      })
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Something went wrong");
        setLoading(false);
      });
  }, [id]);

  const formatDate = (d) => {
    if (!d) return "N/A";
    // For ISO date
    if (typeof d === "string" && d.includes("T")) {
      try {
        return new Date(d).toLocaleDateString("en-GB");
      } catch {
        return d;
      }
    }
    return d;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg font-semibold text-gray-600 dark:text-gray-300">
        Loading job details…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 dark:text-red-400">
        Error: {error}
      </div>
    );
  }

  if (!post) return null;

  // ---------- DATA MAPPING ----------

  const importantDates = [
    {
      label: "Notification Date",
      value: post.important_dates?.notification_date,
    },
    {
      label: "Application Start",
      value: post.important_dates?.application_start,
    },
    {
      label: "Last Date",
      value: post.important_dates?.last_date,
    },
    {
      label: "Fee Payment Last Date",
      value: post.important_dates?.fee_payment_last_date,
    },
    {
      label: "Final Submit Last Date",
      value: post.important_dates?.final_submit_last_date,
    },
    {
      label: "Exam Date",
      value: post.important_dates?.exam_date,
    },
  ].filter((d) => d.value);

  const fees = [
    {
      label: "All Candidates",
      value: post.application_fee?.all_candidates,
    },
  ].filter((f) => f.value);

  const ageLimit = post.age_limit || {};
  const ageMax = ageLimit.maximum || {};
  // Map backend keys to user-friendly labels
  const ageKeyLabels = {
    general_male: 'General (Male)',
    general_female: 'General (Female)',
    BC_EBC: 'BC/EBC (Male/Female)',
    BC_EBC_male_female: 'BC/EBC (Male/Female)',
    SC_ST: 'SC/ST (Male/Female)',
    SC_ST_male_female: 'SC/ST (Male/Female)',
    EWS: 'EWS',
    BC: 'BC',
    EBC: 'EBC',
    SC: 'SC',
    ST: 'ST',
    OBC: 'OBC',
    // fallback for any other keys
  };

  const vacancyDetails = [
    { label: "General", value: post.vacancy_details?.general },
    { label: "EWS", value: post.vacancy_details?.EWS },
    { label: "BC", value: post.vacancy_details?.BC },
    { label: "BC Female", value: post.vacancy_details?.BC_female },
    { label: "EBC", value: post.vacancy_details?.EBC },
    { label: "SC", value: post.vacancy_details?.SC },
    { label: "ST", value: post.vacancy_details?.ST },
  ].filter((v) => v.value !== undefined && v.value !== null);

  const links = [
    post.apply_online_link && {
      label: "Apply Online",
      url: post.apply_online_link,
      primary: true,
    },
    post.official_website && {
      label: "Official Website",
      url: post.official_website,
    },
  ].filter(Boolean);

  const qualification =
    post.educitional_qualification ||
    post.educational_qualification ||
    "See official notification for detailed eligibility.";

  const safePostDate =
    typeof post.post_date === "string"
      ? post.post_date
      : formatDate(post.post_date || post.createdAt);

  const safeUpdated =
    post.updatedAt && typeof post.updatedAt === "string"
      ? formatDate(post.updatedAt)
      : "N/A";

  // ---------- UI ----------

  return (
    <div
      className={`min-h-screen ${
        isDarkMode
          ? "dark bg-slate-900 text-gray-100"
          : "bg-slate-50 text-gray-900"
      }`}
    >
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => (window.location.href = "/")}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 text-white flex items-center justify-center font-bold shadow-md text-lg">
              JA
            </div>
            <div className="leading-tight">
              <div className="font-extrabold text-lg tracking-tight">
                JobAddah
              </div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400">
                Smart Sarkari Updates
              </div>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <button
              onClick={() => window.history.back()}
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <ChevronLeft size={16} /> Back
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {isDarkMode ? (
                <Sun size={18} className="text-yellow-300" />
              ) : (
                <Moon size={18} className="text-slate-700" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Title + Meta */}
        <section className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-rose-700 dark:text-rose-300 leading-snug">
            {post.organization || "Job Notification"}
          </h1>

          <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200 text-[11px] font-semibold">
              {post.tag || "Job Update"}
            </span>
            <span className="text-slate-400">•</span>
            <span>
              Posted:&nbsp;
              <span className="font-medium">{safePostDate}</span>
            </span>
            <span className="text-slate-400 hidden sm:inline">|</span>
            <span className="hidden sm:inline">
              Updated:&nbsp;
              <span className="font-medium">{safeUpdated}</span>
            </span>
          </div>
        </section>

        {/* Overview Card */}
        <section className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Overview
            </h2>
            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Notification No:
                </span>
                <div>{post.notification_number || "N/A"}</div>
              </div>
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Total Posts:
                </span>
                <div>{post.total_posts || "N/A"}</div>
              </div>
              <div className="sm:col-span-2">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Qualification:
                </span>
                <div className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                  {qualification}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm flex flex-col gap-2 text-sm">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Meta
            </h2>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                Page Author:
              </span>
              <div>{"JobAddah Team"}</div>
            </div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                Official Website:
              </span>
              <div className="truncate">
                {post.official_website || "N/A"}
              </div>
            </div>
          </div>
        </section>

        {/* Important Dates / Fee / Age */}
        <section className="grid lg:grid-cols-3 gap-4">
          {/* Dates */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <Calendar size={18} className="text-emerald-500" />
              <h3 className="font-semibold text-sm uppercase tracking-wide">
                Important Dates
              </h3>
            </div>
            <div className="p-4 text-sm space-y-2">
              {importantDates.length ? (
                importantDates.map((d, i) => (
                  <div
                    key={i}
                    className="flex justify-between gap-3 border-b border-dashed border-slate-200 dark:border-slate-800 pb-1 last:pb-0 last:border-0"
                  >
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {d.label}:
                    </span>
                    <span className="text-slate-800 dark:text-slate-100 text-right">
                      {d.value}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500">
                  Check official notification.
                </div>
              )}
            </div>
          </div>

          {/* Fee */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <FileText size={18} className="text-blue-500" />
              <h3 className="font-semibold text-sm uppercase tracking-wide">
                Application Fee
              </h3>
            </div>
            <div className="p-4 text-sm space-y-2">
              {fees.length ? (
                fees.map((f, i) => (
                  <div
                    key={i}
                    className="flex justify-between gap-3 border-b border-dashed border-slate-200 dark:border-slate-800 pb-1 last:pb-0 last:border-0"
                  >
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {f.label}:
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {f.value}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-slate-500">
                  Fee details not available.
                </div>
              )}
              <p className="mt-2 text-xs text-slate-500">
                Payment mode: Online / E-Challan (as per official notice)
              </p>
            </div>
          </div>

          {/* Age */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <User size={18} className="text-amber-500" />
              <h3 className="font-semibold text-sm uppercase tracking-wide">
                Age Limit
              </h3>
            </div>
            <div className="p-4 text-sm space-y-2">
              <p>
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  As on:
                </span>{" "}
                {post.age_limit_as_on || "See notice"}
              </p>
              <p>
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  Minimum Age:
                </span>{" "}
                {ageLimit.minimum ?? "N/A"}
              </p>
              <div className="mt-2 space-y-1">
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  Maximum Age:
                </span>
                <ul className="ml-4 list-disc text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                  {Object.keys(ageMax).length ? (
                    Object.entries(ageMax).map(([k, v]) => (
                      <li key={k}>
                        {ageKeyLabels[k] || k.replace(/_/g, ' ').replace(/\b(\w)/g, l => l.toUpperCase())}: {v}
                      </li>
                    ))
                  ) : (
                    <li>As per rules</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Vacancy Details */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-rose-700 dark:text-rose-300">
              Vacancy Details
            </h3>
            <span className="text-xs text-slate-500">
              Total:{" "}
              <span className="font-semibold">
                {post.total_posts || "N/A"}
              </span>{" "}
              Posts
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 dark:bg-slate-800">
                <tr>
                  <th className="p-2 text-left border-b border-slate-200 dark:border-slate-700">
                    Category
                  </th>
                  <th className="p-2 text-right border-b border-slate-200 dark:border-slate-700">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {vacancyDetails.length ? (
                  vacancyDetails.map((v, i) => (
                    <tr
                      key={i}
                      className="odd:bg-white even:bg-slate-50 dark:odd:bg-slate-900 dark:even:bg-slate-800/60"
                    >
                      <td className="p-2 border-b border-slate-100 dark:border-slate-800 font-medium text-rose-700 dark:text-rose-300">
                        {v.label}
                      </td>
                      <td className="p-2 border-b border-slate-100 dark:border-slate-800 text-right">
                        {v.value}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={2}
                      className="p-3 text-center text-slate-500"
                    >
                      See official notification for full vacancy
                      breakup.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Selection Process */}
        {Array.isArray(post.mode_of_selection) &&
          post.mode_of_selection.length > 0 && (
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
                <ListChecks
                  size={18}
                  className="text-emerald-500"
                />
                <h3 className="font-semibold text-sm uppercase tracking-wide">
                  Selection Process
                </h3>
              </div>
              <ul className="p-4 space-y-1 text-sm list-disc ml-6">
                {post.mode_of_selection.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </section>
          )}

        {/* Important Links */}
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-rose-700 dark:text-rose-300">
              Important Links
            </h3>
          </div>
          <div className="p-4 space-y-3">
            {links.length ? (
              links.map((l, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0 last:pb-0"
                >
                  <span className="font-medium text-sm">
                    {l.label}
                  </span>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm transition ${
                      l.primary
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100"
                    }`}
                  >
                    <ExternalLink size={14} />
                    Open Link
                  </a>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No links available.
              </p>
            )}
          </div>
        </section>

        {/* Disclaimer */}
        <section className="text-[11px] text-center text-slate-500 dark:text-slate-400 mt-4 mb-8">
          <p>
            Disclaimer: Please cross-check all details with the
            official website / notification before applying.
          </p>
        </section>
      </main>
    </div>
  );
}
