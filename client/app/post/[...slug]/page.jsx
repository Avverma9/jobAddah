"use client";

import { useEffect, useMemo, useState, use } from "react";
import { ExternalLink, CheckSquare } from "lucide-react";
import SEO, { generateJobPostingSchema } from "@/lib/SEO";
import { extractRecruitmentData, extractText } from "@/util/post-helper";

// --- HELPERS ---

// Fix 1: Date Cleaner Logic
// Agar value bahut lambi hai (junk text) ya keywords contain karti hai, toh use skip karo
const cleanDateValue = (label, value) => {
  if (!value) return "Notify Soon";
  // Admit card aksar junk text le leta hai agar date available na ho
  if (
    label.toLowerCase().includes("admit card") ||
    label.toLowerCase().includes("exam date")
  ) {
    if (
      value.length > 25 ||
      value.includes("Related") ||
      value.includes("Form")
    ) {
      return "Notify Soon";
    }
  }
  // General safety for other dates
  if (value.length > 50) return "Check Notification";
  return value;
};

const SALARY_KEYS = [
  ["salaryRange", "Salary Range"],
  ["payScale", "Pay Scale"],
  ["gradePay", "Grade Pay"],
  ["salary", "Salary"],
  ["package", "Offered Package"],
  ["startingSalary", "Starting Salary"],
  ["allowances", "Allowances"],
];

const buildSalaryHighlights = (details) => {
  if (!details) return [];
  return SALARY_KEYS.reduce((list, [key, label]) => {
    const value = details[key];
    if (value) {
      list.push({ label, value: extractText(value) });
    }
    return list;
  }, []);
};

const findLinkByKeywords = (links, keywords = []) => {
  if (!links || !links.length) return null;
  const normalizedKeywords = keywords.map((keyword) => keyword.toLowerCase());
  return links.find((link) => {
    const label = (link.label || "").toLowerCase();
    return normalizedKeywords.some((keyword) => label.includes(keyword));
  });
};

const findImportantDateLine = (dates = []) => {
  if (!dates || !dates.length) return null;
  const cleanDates = dates.filter(Boolean);
  if (!cleanDates.length) return null;
  const priority = [
    "deadline",
    "last date",
    "closing",
    "apply by",
    "notification end",
  ];
  for (const keyword of priority) {
    const hit = cleanDates.find((line) => line.toLowerCase().includes(keyword));
    if (hit) return hit;
  }
  return cleanDates[0];
};

const buildIntroParagraphs = (detail) => {
  const sources = [
    detail.shortDescription,
    detail.noteToCandidates,
    detail.confirmationAdvice,
    detail.additionalDetails?.overview,
    detail.additionalDetails?.summary,
  ].filter(Boolean);

  if (sources.length) return sources;

  const vacancyTotal = detail.vacancy?.total || "multiple";
  const organization = detail.organization || "the recruiting body";
  return [
    `The ${organization} recruitment is inviting applications for ${vacancyTotal} posts through the official notification for ${detail.title}.`,
    `JobsAddah is tracking every update so you can prepare before the form goes live.`,
  ];
};

const buildHighlightBullets = (detail) => {
  const bullets = [];
  const totalVacancy = detail.vacancy?.total;
  if (totalVacancy && totalVacancy !== "See Notification") {
    bullets.push(`Total Vacancies: ${totalVacancy}`);
  }
  if (detail.organization) {
    bullets.push(`Recruiter: ${detail.organization}`);
  }
  const positions = detail.vacancy?.positions || [];
  const featured = positions.slice(0, 3).map((pos) => {
    const count = pos.count || pos.total || "N/A";
    return `${pos.name} (${count} posts)`;
  });
  if (featured.length) {
    bullets.push(`Key Posts: ${featured.join(", ")}`);
  }
  if (detail.selection?.length) {
    bullets.push(`Selection Rounds: ${detail.selection.length}`);
  }
  const deadlineLine = findImportantDateLine(detail.dates);
  if (deadlineLine) {
    bullets.push(`Key Deadline: ${deadlineLine}`);
  }
  return bullets;
};

const buildSelectionSteps = (selection = []) =>
  selection
    .map((step) => {
      if (typeof step === "string") return step;
      return step?.name || step?.title || extractText(step);
    })
    .filter(Boolean);

const buildApplicationSteps = (
  detail,
  applyLabel,
  deadlineLine,
  notificationLabel,
) => {
  const steps = [];
  const org = detail.organization || "the recruiting body";
  if (notificationLabel) {
    steps.push(
      `Download and read the official ${notificationLabel} issued by ${org} to confirm vacancy details, eligibility, and fee structure.`,
    );
  } else {
    steps.push(
      `Download and read the official notification published by ${org} to confirm vacancy details, eligibility, and fee structure.`,
    );
  }

  if (applyLabel) {
    steps.push(
      `Use the ${applyLabel} link listed below to reach the application portal before you begin filling the form.`,
    );
  } else {
    steps.push(
      "Open the Apply Online link in the Important Links section and keep it ready before populating the form.",
    );
  }

  steps.push(
    "Match your academic, age, and document requirements with the Qualification Summary before entering personal and educational details.",
  );

  const docs = (detail.documentation || [])
    .map((doc) => doc.name || doc.type)
    .filter(Boolean);
  if (docs.length) {
    steps.push(
      `Keep ${docs.slice(0, 3).join(", ")} handy for quick uploads once the portal opens.`,
    );
  }

  if (deadlineLine) {
    const dateValue = deadlineLine.split(": ")[1] || deadlineLine;
    steps.push(
      `Submit the application and pay the fee before ${dateValue} to avoid last-minute issues.`,
    );
  } else {
    steps.push(
      `Submit the application before the closing date mentioned in the notification.`,
    );
  }

  steps.push(
    "Save the confirmation reference number and fee receipt for future communication.",
  );

  return steps;
};
// --- COMPONENTS ---

const TableSkeleton = () => (
  <div className="max-w-5xl mx-auto border-x border-slate-300 bg-white animate-pulse font-sans shadow-sm">
    {/* 1. Header Section Skeleton */}
    <div className="p-5 border-b-4 border-slate-300 bg-slate-50 flex flex-col items-center gap-4">
      {/* Title */}
      <div className="h-8 md:h-10 bg-slate-300 w-3/4 rounded-md" />
      {/* Meta Tags (Post Date / Advt) */}
      <div className="flex gap-3">
        <div className="h-6 bg-slate-200 w-32 rounded" />
        <div className="h-6 bg-slate-200 w-24 rounded" />
      </div>
      {/* Short Info Lines */}
      <div className="space-y-2 w-full max-w-4xl mt-2">
        <div className="h-3 bg-slate-200 w-full rounded" />
        <div className="h-3 bg-slate-200 w-5/6 mx-auto rounded" />
        <div className="h-3 bg-slate-200 w-4/6 mx-auto rounded" />
      </div>
    </div>

    {/* 2. Grid Section (Dates & Fees) */}
    <div className="grid md:grid-cols-2 border-b border-slate-300">
      {/* Left Column: Dates */}
      <div className="border-r border-slate-300">
        {/* Header Strip */}
        <div className="h-10 bg-slate-300 w-full" />
        {/* List Items */}
        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between p-3">
              <div className="h-4 bg-slate-200 w-1/3 rounded" />
              <div className="h-4 bg-slate-200 w-1/4 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Fees */}
      <div>
        {/* Header Strip */}
        <div className="h-10 bg-slate-300 w-full" />
        {/* List Items */}
        <div className="divide-y divide-slate-100">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between p-3">
              <div className="h-4 bg-slate-200 w-1/4 rounded" />
              <div className="h-4 bg-slate-200 w-1/5 rounded" />
            </div>
          ))}
          {/* Payment Note Box */}
          <div className="p-3">
            <div className="h-12 bg-slate-100 w-full rounded border border-slate-200" />
          </div>
        </div>
      </div>
    </div>

    {/* 3. Vacancy Total Strip */}
    <div className="h-20 bg-slate-100 border-b border-slate-300 flex flex-col items-center justify-center gap-3 p-2">
      <div className="h-6 bg-slate-300 w-1/2 rounded" />
      <div className="flex gap-2">
        <div className="h-5 bg-white w-16 border rounded" />
        <div className="h-5 bg-white w-16 border rounded" />
      </div>
    </div>

    {/* 4. Vacancy Table Skeleton */}
    <div className="border-b border-slate-300">
      <div className="h-10 bg-slate-300 w-full" /> {/* Table Header */}
      <div className="p-0">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex border-b border-slate-100 last:border-0">
            <div className="p-3 w-1/4 border-r border-slate-100">
              <div className="h-4 bg-slate-200 w-3/4 rounded" />
            </div>
            <div className="p-3 w-1/6 border-r border-slate-100 flex justify-center">
              <div className="h-4 bg-slate-200 w-1/2 rounded" />
            </div>
            <div className="p-3 flex-1">
              <div className="h-3 bg-slate-200 w-full rounded mb-2" />
              <div className="h-3 bg-slate-200 w-2/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* 5. How to Apply Text Block */}
    <div className="p-5 border-b border-slate-300 bg-slate-50 space-y-2">
      <div className="h-5 bg-slate-300 w-1/4 rounded mb-2" />
      <div className="h-3 bg-slate-200 w-full rounded" />
      <div className="h-3 bg-slate-200 w-11/12 rounded" />
      <div className="h-3 bg-slate-200 w-full rounded" />
    </div>

    {/* 6. Important Links Skeleton */}
    <div>
      <div className="h-10 bg-slate-300 w-full" />
      <div className="divide-y divide-slate-100">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center">
            <div className="p-3 w-2/3 border-r border-slate-100">
              <div className="h-5 bg-slate-200 w-1/2 rounded" />
            </div>
            <div className="p-3 flex-1 flex justify-center">
              <div className="h-5 bg-slate-200 w-24 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const TableHeader = ({ text, color = "bg-rose-600" }) => (
  <div
    className={`${color} text-white text-center font-bold text-lg py-2 uppercase tracking-wide border-b border-slate-300`}
  >
    {text}
  </div>
);

export default function JobDetailsPage({ params }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const targetPath = Array.isArray(slug) ? `/${slug.join("/")}/` : `/${slug}/`;

  const [state, setState] = useState({
    status: "idle",
    data: null,
    error: null,
  });

  useEffect(() => {
    if (!targetPath) return;
    const controller = new AbortController();
    setState({ status: "loading", data: null, error: null });

    fetch(`/api/gov-post/post-details?url=${encodeURIComponent(targetPath)}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (res) => {
        const json = await res.json();
        if (controller.signal.aborted) return;
        if (json.success) {
          setState({ status: "success", data: json.data, error: null });
        } else {
          setState({
            status: "error",
            data: null,
            error: json.message || "Failed to load",
          });
        }
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        setState({
          status: "error",
          data: null,
          error: err?.message || "Failed to load",
        });
      });

    return () => controller.abort();
  }, [targetPath]);

  const rawData = state.data;
  const detail = useMemo(
    () => (rawData ? extractRecruitmentData(rawData) : null),
    [rawData],
  );
  const recruitment = rawData?.recruitment || {};

  if (state.status === "loading") return <TableSkeleton />;
  if (state.status === "error")
    return (
      <div className="text-center text-red-600 font-bold p-10">
        {state.error}
      </div>
    );
  if (!detail)
    return <div className="text-center p-10 font-bold">No Data Found</div>;

  const introParagraphs = buildIntroParagraphs(detail);
  const highlightBullets = buildHighlightBullets(detail);
  const selectionSteps = buildSelectionSteps(detail.selection);
  const deadlineLine = findImportantDateLine(detail.dates);
  const notificationLink = findLinkByKeywords(detail.links, [
    "notification",
    "pdf",
    "official",
  ]);
  const applyLink = findLinkByKeywords(detail.links, [
    "apply",
    "registration",
    "online",
  ]);
  const applicationSteps = buildApplicationSteps(
    detail,
    applyLink?.label,
    deadlineLine,
    notificationLink?.label,
  );
  const salaryHighlights = buildSalaryHighlights(detail.additionalDetails);
  const examDateLine = detail.dates?.find((line) =>
    line?.toLowerCase().includes("exam date"),
  );
  const applicationTips = [
    "Keep a clean copy of scanned documents ready before uploading to avoid repeated attempts.",
    `Use the ${detail.organization || "official"} portal and official links for fee payment to avoid phishing attempts.`,
    examDateLine
      ? `Mark ${examDateLine} on your calendar and download the admit card once the notification is live.`
      : "Track the exam date closely so you do not miss admit card or correction windows.",
  ];

  // Fix 2: Payment Method filtering
  // Hum "Payment Method" text ko list se hata denge aur alag se yellow box me dikhayenge
  const feeList =
    detail.fees?.filter(
      (f) => !f.text.toLowerCase().includes("payment method"),
    ) || [];

  return (
    <div className="bg-white min-h-screen py-6 font-sans text-slate-900">
      <SEO
        title={`${detail.title} - Sarkari Result`}
        description={`Apply for ${detail.title}. Check Dates, Fees, Documents & Link.`}
        section={detail.organization}
        jsonLd={[generateJobPostingSchema(detail)]}
      />

      <div className="max-w-5xl mx-auto border-x border-slate-300 shadow-sm">
        {/* --- HEADER --- */}
        <div className="text-center p-5 border-b-4 border-rose-600 bg-slate-50">
          <h1 className="text-2xl md:text-3xl font-black text-rose-700 uppercase mb-3 leading-tight">
            {detail.title}
          </h1>
          <div className="flex flex-wrap justify-center gap-3 text-sm font-bold text-slate-700">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Post Date:{" "}
              {rawData?.createdAt
                ? new Date(rawData.createdAt).toLocaleDateString()
                : "Recent"}
            </span>
            {recruitment.advertisementNumber && (
              <span className="bg-slate-200 text-slate-800 px-2 py-1 rounded">
                Advt No: {recruitment.advertisementNumber}
              </span>
            )}
          </div>
          {detail.shortInfo && (
            <p className="mt-4 text-sm text-slate-600 max-w-4xl mx-auto leading-relaxed text-justify px-2">
              <span className="font-bold text-rose-600">
                Short Information:{" "}
              </span>
              {detail.shortInfo}
            </p>
          )}
        </div>

        {/* --- 2 COLUMN SECTION (Dates & Fee) --- */}
        <div className="grid md:grid-cols-2 border-b border-slate-300">
          {/* COLUMN 1: IMPORTANT DATES */}
          <div className="border-r border-slate-300">
            <TableHeader text="Important Dates" color="bg-rose-600" />
            <ul className="divide-y divide-slate-200 text-sm">
              {detail.dates?.map((d, i) => {
                const parts = d.split(": ");
                const label = parts[0];
                // Fix 1 Applied Here: Join rest of parts and clean it
                const rawValue = parts.slice(1).join(": ");
                const value = cleanDateValue(label, rawValue);

                return (
                  <li
                    key={i}
                    className="flex justify-between items-center p-3 hover:bg-rose-50/50"
                  >
                    <span className="font-bold text-slate-700 w-1/2">
                      {label}
                    </span>
                    <span className="font-bold text-slate-900 w-1/2 text-right">
                      {value}
                    </span>
                  </li>
                );
              })}
              {(!detail.dates || detail.dates.length === 0) && (
                <li className="p-3 text-center">Check Notification</li>
              )}
            </ul>
          </div>

          {/* COLUMN 2: APPLICATION FEE */}
          <div>
            <TableHeader text="Application Fee" color="bg-blue-700" />
            <div className="p-0">
              <ul className="divide-y divide-slate-200 text-sm">
                {feeList.map((fee, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-center p-3 hover:bg-blue-50/50"
                  >
                    <span className="font-bold text-slate-700">
                      {fee.text.split("-")[0] || "Category"}
                    </span>
                    <span className="font-black text-slate-900">
                      {fee.text.split("-")[1] || fee.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Fix 2: Hardcoded/Static Payment Note at bottom to avoid duplication */}
              <div className="bg-yellow-50 p-3 text-xs text-center border-t border-yellow-200 font-bold text-slate-700 leading-tight">
                Pay the Examination Fee Through Debit Card, Credit Card, Net
                Banking or E-Challan Only.
              </div>
            </div>
          </div>
        </div>

        {/* --- AGE & VACANCY STRIP --- */}
        <div className="bg-slate-100 border-b border-slate-300 p-4 text-center">
          <h3 className="text-lg md:text-xl font-black text-slate-800 uppercase">
            Vacancy Details Total :{" "}
            <span className="text-rose-600">
              {detail.vacancy?.total || "NA"}
            </span>{" "}
            Posts
          </h3>
          {detail.age?.text && (
            <div className="mt-2 text-sm font-semibold text-slate-600 flex flex-wrap justify-center gap-3">
              {detail.age.text.map((t, i) => (
                <span
                  key={i}
                  className="bg-white border px-2 py-0.5 rounded shadow-sm"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* --- VACANCY TABLE --- */}
        <div className="border-b border-slate-300">
          <TableHeader
            text="Post Name, Eligibility & Total Post"
            color="bg-green-700"
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-center">
              <thead className="bg-green-50 text-green-900 font-bold border-b border-green-200">
                <tr>
                  <th className="p-3 w-1/4 border-r border-green-200">
                    Post Name
                  </th>
                  <th className="p-3 w-1/6 border-r border-green-200">Total</th>
                  <th className="p-3">Eligibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {detail.vacancy?.positions?.map((pos, i) => (
                  <tr key={i} className="hover:bg-green-50/30">
                    <td className="p-3 border-r border-slate-200 font-bold text-rose-700 align-middle">
                      {pos.name}
                    </td>
                    <td className="p-3 border-r border-slate-200 font-black text-slate-900 align-middle">
                      {pos.count}
                    </td>
                    <td className="p-3 text-left text-slate-700 align-middle leading-relaxed">
                      {pos.qualification}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {salaryHighlights.length > 0 && (
          <section className="px-6 py-6 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Salary Range & Benefits
            </h2>
            <ul className="space-y-3 text-sm text-slate-700">
              {salaryHighlights.map((item, idx) => (
                <li key={idx} className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-800">
                    {item.label}:
                  </span>
                  <span>{item.value}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* --- DISTRICT DETAILS (Optional) --- */}
        {detail.districtData?.length > 0 && (
          <div className="border-b border-slate-300">
            <TableHeader
              text="District Wise Vacancy Details"
              color="bg-slate-600"
            />
            <div className="bg-slate-50 p-2 max-h-60 overflow-y-auto">
              <div className="flex flex-wrap gap-2 justify-center">
                {detail.districtData.map((d, i) => (
                  <div
                    key={i}
                    className="bg-white border border-slate-300 px-3 py-1 text-xs font-bold rounded shadow-sm"
                  >
                    {d.districtName}:{" "}
                    <span className="text-rose-600">{d.posts}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- FIX 3: DOCUMENTATION SECTION --- */}
        {detail.documentation && detail.documentation.length > 0 && (
          <div className="border-b border-slate-300">
            <TableHeader
              text="Documents Required (Upload)"
              color="bg-orange-600"
            />
            <div className="p-4 bg-orange-50/20">
              <ul className="grid md:grid-cols-2 gap-3 text-sm">
                {detail.documentation.map((doc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckSquare className="w-4 h-4 text-orange-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-800">
                        {doc.name || doc.type}
                      </span>
                      {doc.format && (
                        <span className="text-xs text-slate-500 block">
                          Format: {doc.format}
                        </span>
                      )}
                      {doc.size && (
                        <span className="text-xs text-slate-500 block">
                          Size: {doc.size}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* --- HOW TO APPLY --- */}
        <div className="p-5 border-b border-slate-300 bg-slate-50 text-sm">
          <h4 className="font-bold text-blue-800 mb-2 uppercase text-center md:text-left">
            How to Fill Form
          </h4>
          <div
            className="space-y-1 text-slate-700 leading-relaxed list-disc-inside"
            dangerouslySetInnerHTML={{
              __html:
                detail.howToApply ||
                "Read the full notification before applying.",
            }}
          />
        </div>

        {/* --- IMPORTANT LINKS --- */}
        <div>
          <TableHeader text="Useful Important Links" color="bg-rose-600" />
          <table className="w-full text-sm border-collapse">
            <tbody className="divide-y divide-slate-200">
              {detail.links?.map((link, i) => (
                <tr key={i} className="hover:bg-rose-50 transition-colors">
                  <td className="p-3 font-bold text-slate-700 w-2/3 pl-5 md:pl-8 border-r border-slate-200">
                    {link.label}
                  </td>
                  <td className="p-3 text-center">
                    {link.isActive ? (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-blue-700 hover:text-blue-900 hover:underline"
                      >
                        Click Here <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <span className="text-slate-400 font-semibold cursor-not-allowed">
                        Link Activate Soon
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {/* Manual Official Website Link Row */}
              {recruitment.organization?.website && (
                <tr className="bg-slate-50 hover:bg-slate-100">
                  <td className="p-3 font-bold text-slate-700 w-2/3 pl-5 md:pl-8 border-r border-slate-200">
                    Official Website
                  </td>
                  <td className="p-3 text-center">
                    <a
                      href={recruitment.organization.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-blue-700 hover:text-blue-900 hover:underline"
                    >
                      Click Here <ExternalLink className="w-4 h-4" />
                    </a>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {(introParagraphs.length > 0 || highlightBullets.length > 0) && (
          <section className="px-6 py-6 border-b border-slate-200 bg-slate-50/70">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Recruitment Snapshot
            </h2>
            <div className="space-y-3 text-sm text-slate-600">
              {introParagraphs.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
            {highlightBullets.length > 0 && (
              <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-sm text-slate-700">
                {highlightBullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {detail.eligibility?.length > 0 && (
          <section className="px-6 py-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Qualification Summary
            </h2>
            <div className="grid gap-3 md:grid-cols-2 text-sm text-slate-700">
              {detail.eligibility.map((item, idx) => {
                const text = item.text || extractText(item);
                if (!text) return null;
                return (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-100 rounded-lg p-4"
                  >
                    {item.position && (
                      <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">
                        {item.position}
                      </div>
                    )}
                    <p className="leading-relaxed text-slate-700">{text}</p>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {selectionSteps.length > 0 && (
          <section className="px-6 py-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Selection Process
            </h2>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-700">
              {selectionSteps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </section>
        )}

        {applicationSteps.length > 0 && (
          <section className="px-6 py-6 border-b border-slate-200 bg-white">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Application Steps & Tips
            </h2>
            <ol className="list-decimal pl-5 space-y-2 text-sm text-slate-700">
              {applicationSteps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs text-slate-600">
              {applicationTips.map((tip, idx) => (
                <div
                  key={idx}
                  className="border border-slate-100 rounded-lg p-3 bg-slate-50"
                >
                  {tip}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
