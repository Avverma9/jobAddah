import { notFound } from "next/navigation";
import Link from "next/link";
import { cache } from "react";
import { connectDB } from "@/lib/db/connectDB";
import Post from "@/lib/models/job";
import {
  extractRecruitmentData,
  getLinkStatusMessage,
  isLinkClickable,
} from "@/util/post-helper";
import { getCleanPostUrl } from "@/lib/job-url";
import {
  CalendarDays,
  CheckCircle2,
  Building2,
  ChevronRight,
  HelpCircle,
  Flame,
  Download,
  ExternalLink,
  Share2,
  Maximize2,
  Clock,
  AlertCircle,
  IndianRupee,
  Users,
  Send,
  BookOpen,
  FileText,
  BadgeCheck,
  GraduationCap,
  Timer,
  Info,
  Ruler,
  Eye,
  Activity,
} from "lucide-react";
import {
  generateBreadcrumbSchema,
  generateJobPostingSchema,
} from "@/lib/seo-schemas";

/* =========================
   CONFIG + SANITIZERS
========================= */
const COMPETITOR_DOMAINS = [
  "sarkariresult.com",
  "sarkariresult.com.cm",
  "sarkariexam.com",
  "freejobalert.com",
  "jagranjosh.com",
];

const isCompetitorUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  const lower = url.toLowerCase();
  return COMPETITOR_DOMAINS.some((d) => lower.includes(d));
};

const sanitizeLinks = (links) => {
  if (!Array.isArray(links)) return [];
  return links
    .filter((l) => l && typeof l === "object" && typeof l.url === "string")
    .map((l) =>
      isCompetitorUrl(l.url) ? { ...l, url: "https://jobsaddah.com" } : l,
    );
};

const sanitizeUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  return isCompetitorUrl(url) ? "https://jobsaddah.com" : url;
};

/* =========================
   DATE HELPERS (SAFE)
========================= */
const MONTH_TOKENS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "sept",
  "oct",
  "nov",
  "dec",
];

const looksLikeDateValue = (value) => {
  const v = String(value || "").trim();
  if (!v) return false;
  const lower = v.toLowerCase();
  if (lower.includes("http") || lower.includes("www.")) return false;
  if (v.length > 140) return false;

  const hasMonth = MONTH_TOKENS.some((m) => lower.includes(m));
  const hasDatePattern =
    /\d{1,2}\s*[\/.-]\s*\d{1,2}(\s*[\/.-]\s*\d{2,4})?/.test(v) ||
    /\d{4}\s*[\/.-]\s*\d{1,2}(\s*[\/.-]\s*\d{1,2})?/.test(v);

  return hasMonth || hasDatePattern;
};

const sanitizeDateValue = (value) => {
  if (!value) return null;
  const v = String(value).replace(/\s+/g, " ").trim();
  if (!v) return null;
  const lower = v.toLowerCase();
  if (lower.includes("related") || lower.includes("other posts")) return null;

  if (looksLikeDateValue(v)) return v;

  if (
    lower.includes("to be announced") ||
    lower.includes("tba") ||
    lower.includes("check notification") ||
    lower.includes("will be updated") ||
    lower.includes("notify later") ||
    lower.includes("available soon")
  ) {
    return v;
  }
  return null;
};

const cleanDateValue = (val) => {
  if (!val) return "To be announced";
  const sanitized = sanitizeDateValue(val);
  return sanitized || "Check Notification";
};

/* =========================
   NORMALIZERS
========================= */
const normalizeItem = (item) => {
  if (!item) return { label: "", value: "" };

  if (typeof item === "string") {
    const parts = item.split(":");
    if (parts.length > 1) {
      return { label: parts[0].trim(), value: parts.slice(1).join(":").trim() };
    }
    return { label: item, value: "" };
  }

  if (typeof item === "object") {
    const label =
      item.label || item.key || item.text || item.title || item.type || "Detail";

    let value =
      item.value || item.val || item.date || item.amount || item.text || "";

    if (
      (!value || value === label) &&
      typeof label === "string" &&
      label.includes(":")
    ) {
      const parts = label.split(":");
      return { label: parts[0].trim(), value: parts.slice(1).join(":").trim() };
    }

    if (item.text && typeof item.text === "string" && item.text.includes(":")) {
      const parts = item.text.split(":");
      return { label: parts[0].trim(), value: parts.slice(1).join(":").trim() };
    }

    return { label: String(label), value: String(value) };
  }

  return { label: String(item), value: "" };
};

const toTitleLabel = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : ""))
    .join(" ");

const isValidLinkUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  if (!/^https?:\/\//i.test(url)) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const findLinkByLabel = (links, pattern) => {
  if (!Array.isArray(links)) return null;
  return (
    links.find((link) => {
      const { label } = normalizeItem(link);
      if (!label) return false;
      return pattern.test(String(label));
    }) || null
  );
};

const findDateValue = (detail, keywords) => {
  if (!Array.isArray(detail?.dates)) return null;
  const terms = Array.isArray(keywords) ? keywords : [keywords];

  const match = detail.dates.find((d) => {
    const { label } = normalizeItem(d);
    if (!label) return false;
    const lower = label.toLowerCase();
    return terms.some((term) => lower.includes(term));
  });

  if (!match) return null;
  const { value, label } = normalizeItem(match);
  const safeValue = sanitizeDateValue(value || label);
  return safeValue || null;
};

const findLastDate = (detail, recruitment) => {
  const direct =
    recruitment?.importantDates?.applicationLastDate ||
    recruitment?.importantDates?.lastDate ||
    recruitment?.importantDates?.lastDateToApply;

  const directSafe = sanitizeDateValue(direct);
  if (directSafe) return directSafe;

  if (Array.isArray(detail?.dates)) {
    const match = detail.dates.find((d) => {
      const { label } = normalizeItem(d);
      const l = (label || "").toLowerCase();
      return l.includes("application deadline") || l.includes("last date");
    });
    if (match) {
      const { value, label } = normalizeItem(match);
      return sanitizeDateValue(value || label);
    }
  }
  return null;
};

const getPaymentModes = (fees) => {
  if (!Array.isArray(fees)) return null;
  const payment = fees.find((f) => f?.type === "payment" && f?.text);
  if (!payment?.text) return null;
  const parts = payment.text.split(":");
  return parts.length > 1 ? parts.slice(1).join(":").trim() : payment.text;
};

const renderValueList = (items) => {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
      {items.map((item, i) => (
        <li key={i}>{typeof item === "string" ? item : normalizeItem(item).label}</li>
      ))}
    </ul>
  );
};

const hasSubstantialContent = (detail) => {
  if (!detail) return false;
  let score = 0;
  if (detail.title) score += 1;
  if (detail.organization) score += 1;
  if (detail.dates?.length) score += 1;
  if (detail.fees?.length) score += 1;
  if (detail.links?.length) score += 1;
  if (detail.vacancy?.positions?.length) score += 1;
  return score >= 4;
};

/* =========================
   SEO OVERVIEW (BOTTOM)
========================= */
function generateOverview(detail) {
  const org = detail.organization || "The Recruitment Board";
  const vacancy = detail.vacancy?.total || "various";
  const title = detail.title || "Government Job Opportunity";

  const startDate = findDateValue(detail, ["application start", "start date"]);
  const lastDate =
    findDateValue(detail, ["application deadline", "last date", "closing date"]) ||
    "the closing date";
  const examDate = findDateValue(detail, ["exam date", "exam"]);

  const feeSample = Array.isArray(detail.fees)
    ? detail.fees.find((f) => f?.type !== "payment" && (f?.text || f?.value))
    : null;
  const feeText = feeSample?.text || normalizeItem(feeSample).label || "";

  let eligibilitySample = "";
  if (Array.isArray(detail.eligibility) && detail.eligibility.length) {
    const item = detail.eligibility.find((i) => i?.text || typeof i === "string");
    if (typeof item === "string") eligibilitySample = item;
    else if (item?.position && item?.text) eligibilitySample = `${item.position}: ${item.text}`;
    else if (item?.text) eligibilitySample = item.text;
    else if (item?.label && item?.text) eligibilitySample = `${item.label}: ${item.text}`;
    else if (item?.label) eligibilitySample = item.label;
  } else if (Array.isArray(detail.vacancy?.positions)) {
    const pos = detail.vacancy.positions.find((p) => p?.qualification);
    if (pos?.qualification) eligibilitySample = `${pos.name || "Post"}: ${pos.qualification}`;
  }

  return (
    <div className="space-y-3 text-slate-700 leading-relaxed text-sm md:text-base">
      <p>
        <strong className="text-indigo-800">{org}</strong> has released the recruitment notice for{" "}
        <strong>{title}</strong> with <strong>{vacancy}</strong> vacancies.
        {startDate ? ` Applications open from ${startDate}.` : " Application dates are listed below."}{" "}
        The last date to apply is <strong>{lastDate}</strong>
        {examDate ? `, and the exam is expected around ${examDate}.` : "."}
      </p>
      <p>
        {eligibilitySample
          ? `Eligibility snapshot: ${eligibilitySample}.`
          : "Review the post-wise qualification table above for eligibility details."}
      </p>
      <p>
        {feeText ? `Fee example: ${feeText}.` : "Fee details are listed in the Application Fee section."}{" "}
        Use the Important Links section to apply and download the official notice.
      </p>
    </div>
  );
}

/* =========================
   SSR DATA FETCHING
========================= */
const getJobDetails = cache(async (slug) => {
  let targetPath = Array.isArray(slug) ? slug.join("/") : slug;
  if (!targetPath) return null;
  if (!targetPath.startsWith("/")) targetPath = "/" + targetPath;
  if (!targetPath.endsWith("/")) targetPath = targetPath + "/";

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;

  try {
    const res = await fetch(`${apiUrl}/scrapper/scrape-complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: targetPath }),
      next: { revalidate: 3600 },
    });

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("text/html")) return null;
    if (!res.ok) return null;

    const json = await res.json();
    return json?.success ? json.data : null;
  } catch {
    return null;
  }
});

const getRelatedPosts = cache(async () => {
  try {
    await connectDB();
    const posts = await Post.aggregate([
      { $match: { fav: true } },
      { $sample: { size: 6 } },
      { $project: { "recruitment.title": 1, url: 1, link: 1 } },
    ]);
    return JSON.parse(JSON.stringify(posts));
  } catch {
    return [];
  }
});

/* =========================
   UI HELPERS
========================= */
const Badge = ({ icon: Icon, label, tone = "neutral" }) => {
  const tones = {
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    good: "bg-emerald-100 text-emerald-700 border-emerald-200",
    warn: "bg-amber-100 text-amber-800 border-amber-200",
    info: "bg-blue-100 text-blue-700 border-blue-200",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${tones[tone]}`}>
      {Icon ? <Icon size={14} /> : null}
      {label}
    </span>
  );
};

const Panel = ({ title, icon: Icon, right, children }) => (
  <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {Icon ? (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700">
            <Icon size={18} />
          </span>
        ) : null}
        <h2 className="font-extrabold text-slate-900">{title}</h2>
      </div>
      {right ? <div className="text-xs text-slate-500">{right}</div> : null}
    </div>
    <div>{children}</div>
  </section>
);

const TwoColTable = ({ leftTitle, rightTitle, rows }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="bg-slate-100 text-slate-700 text-xs uppercase tracking-wider">
        <tr>
          <th className="px-5 py-3 border-b border-slate-200">{leftTitle}</th>
          <th className="px-5 py-3 border-b border-slate-200 text-right">{rightTitle}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((r, i) => (
          <tr key={i} className="hover:bg-slate-50/70">
            <td className="px-5 py-3 text-slate-700 font-semibold">{r.label}</td>
            <td className="px-5 py-3 text-right text-slate-900 font-extrabold">{r.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ContentSection = ({ title, children }) => (
  <div>
    <h3 className="text-sm font-extrabold text-slate-900 mb-2 uppercase tracking-wide">
      {title}
    </h3>
    {children}
  </div>
);

const renderTextValue = (value, fallback = "Not provided.") => (
  <p className="text-sm text-slate-700 leading-relaxed">{value || fallback}</p>
);

const renderListValue = (items, fallback = "Not provided.") =>
  renderValueList(items) || <p className="text-sm text-slate-500">{fallback}</p>;

/* =========================
   METADATA (SSR)
========================= */
export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const rawData = await getJobDetails(resolvedParams.slug);

  if (!rawData) return { title: "Job Details - JobsAddah" };

  const detail = extractRecruitmentData(rawData);
  const safeTitle = detail.title || "Government Job Opportunity";
  const organization = detail.organization || "The Recruitment Board";
  const vacancyTotal = detail.vacancy?.total || "various";
  const title = `${safeTitle} - Apply Online, Syllabus, Exam Date`;
  const desc = `Latest Update: ${organization} has released a notification for ${vacancyTotal} posts. Check dates, eligibility, fees, and direct apply link.`;

  const slugPath = Array.isArray(resolvedParams.slug)
    ? resolvedParams.slug.join("/")
    : resolvedParams.slug;

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://jobsaddah.com").replace(/\/$/, "");
  const canonicalUrl = `${siteUrl}/post/${slugPath}`;

  return {
    title: title.slice(0, 60),
    description: desc.slice(0, 160),
    alternates: { canonical: canonicalUrl },
    openGraph: { title, description: desc, type: "article", url: canonicalUrl },
    robots: "index,follow",
  };
}

/* =========================
   PAGE (SSR)
========================= */
export default async function JobDetailsPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  if (!slug) notFound();

  const [rawData, relatedPosts] = await Promise.all([
    getJobDetails(slug),
    getRelatedPosts(),
  ]);

  if (!rawData) notFound();

  const detail0 = extractRecruitmentData(rawData);
  const detail = { ...detail0, links: sanitizeLinks(detail0.links) };
  const recruitment = rawData.recruitment || {};

  const createdDate = rawData.createdAt
    ? new Date(rawData.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const updatedDate = rawData.updatedAt
    ? new Date(rawData.updatedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const postDate = updatedDate || createdDate || "Recent";

  const slugPath = Array.isArray(slug) ? slug.join("/") : slug;
  const shareUrl = `${(process.env.NEXT_PUBLIC_SITE_URL || "https://jobsaddah.com").replace(/\/$/, "")}/post/${slugPath}`;
  const shareText = encodeURIComponent(`${detail.title} | ${shareUrl}`);

  // Key dates (for highlights)
  const startDate = findDateValue(detail, ["application start", "start date"]);
  const lastDate =
    sanitizeDateValue(recruitment.importantDates?.applicationLastDate) ||
    findLastDate(detail, recruitment) ||
    null;

  const examDate = findDateValue(detail, ["exam date", "exam"]);
  const admitCardDate = findDateValue(detail, ["admit card"]);
  const resultDate = findDateValue(detail, ["result"]);

  // Fees, age, docs, notes, physical
  const paymentModes = getPaymentModes(detail.fees);

  const ageCategoryWise = Array.isArray(detail.age?.categoryWise)
    ? detail.age.categoryWise
    : [];

  const physical = detail.physicalStandards || null;
  const physicalTest = detail.physicalTest || null;

  const docs = Array.isArray(detail.documentation) ? detail.documentation : [];
  const content = detail.content || {};
  const notes =
    detail.additionalDetails?.noteToCandidates ||
    detail.additionalDetails?.additionalInfo ||
    recruitment?.additionalInfo ||
    "";

  // Links
  const linkLabelMap = {
    applyOnline: "Apply Online",
    officialNotification: "Official Notification",
    officialWebsite: "Official Website",
    syllabus: "Syllabus",
    examPattern: "Exam Pattern",
    admitCard: "Admit Card",
    resultLink: "Result",
    answerKey: "Answer Key",
    documentVerificationNotice: "Document Verification Notice",
    faq: "FAQ",
  };

  const importantLinksRaw =
    detail.recruitment?.importantLinks || recruitment?.importantLinks || {};

  const importantLinksList = Object.entries(linkLabelMap).map(([key, label]) => {
    const value = importantLinksRaw[key];
    const url =
      typeof value === "string"
        ? value
        : typeof value === "object" && value !== null
          ? value.url || value.link || value.href || ""
          : "";
    const activationDate =
      typeof value === "object" && value !== null ? value.activationDate || null : null;
    const safeUrl = isValidLinkUrl(url) ? sanitizeUrl(url) : null;

    return {
      label,
      url: safeUrl,
      activationDate,
      isActive: Boolean(safeUrl),
      isPending: !safeUrl,
    };
  });

  if (Array.isArray(detail.links) && detail.links.length) {
    const seen = new Set(importantLinksList.map((l) => l.url).filter(Boolean));
    detail.links.forEach((link) => {
      if (link?.url && !seen.has(link.url)) {
        seen.add(link.url);
        importantLinksList.push(link);
      }
    });
  }

  const applyLink = findLinkByLabel(importantLinksList, /apply|registration|online/i);
  const noticeLink = findLinkByLabel(
    importantLinksList,
    /notification|advertisement|official|notice|download/i,
  );

  const sourceUrl = sanitizeUrl(
    detail.sourceUrl || detail.website || rawData.sourceUrl || rawData.url || "",
  );

  const applyHref = isLinkClickable(applyLink) ? applyLink.url : "#important-links";
  const noticeHref = isLinkClickable(noticeLink) ? noticeLink.url : "#important-links";

  const sourceHref =
    sourceUrl &&
    sourceUrl !== applyLink?.url &&
    sourceUrl !== noticeLink?.url
      ? sourceUrl
      : "";

  // Syllabus flag
  const syllabusAvailable = Array.isArray(detail.links)
    ? detail.links.some((link) => {
        const label = normalizeItem(link).label || "";
        return /syllabus|exam pattern/i.test(label);
      })
    : false;

  // Update summary / highlights (old code parity)
  const updateSummary =
    updatedDate && createdDate && updatedDate !== createdDate
      ? `Last updated on ${updatedDate} (posted on ${createdDate}).`
      : createdDate
        ? `Posted on ${createdDate}.`
        : "Recently published.";

  const updateHighlights = [
    startDate ? `Application opens: ${startDate}` : null,
    lastDate ? `Last date to apply: ${lastDate}` : null,
    admitCardDate ? `Admit card: ${admitCardDate}` : null,
    examDate ? `Exam date: ${examDate}` : null,
    resultDate ? `Result: ${resultDate}` : null,
    syllabusAvailable
      ? "Syllabus / exam pattern link is available in Important Links."
      : "Syllabus link is not published yet; keep checking the official notice.",
    updateSummary,
  ].filter(Boolean);

  // Eligibility highlights (for checklist)
  const eligibilityHighlights = [];
  if (Array.isArray(detail.eligibility) && detail.eligibility.length) {
    detail.eligibility.forEach((item) => {
      if (eligibilityHighlights.length >= 6) return;
      if (!item) return;
      if (typeof item === "string") eligibilityHighlights.push(item);
      else if (item.position && item.text)
        eligibilityHighlights.push(`${item.position}: ${item.text}`);
      else if (item.label && item.text)
        eligibilityHighlights.push(`${item.label}: ${item.text}`);
      else if (item.text) eligibilityHighlights.push(item.text);
      else {
        const { label } = normalizeItem(item);
        if (label) eligibilityHighlights.push(label);
      }
    });
  } else if (Array.isArray(detail.vacancy?.positions)) {
    detail.vacancy.positions.slice(0, 5).forEach((pos) => {
      if (pos?.qualification) {
        eligibilityHighlights.push(`${pos.name || "Post"}: ${pos.qualification}`);
      }
    });
  }

  const feeHighlights = Array.isArray(detail.fees)
    ? detail.fees
        .filter((f) => f?.type !== "payment")
        .map((f) => f?.text || normalizeItem(f).label)
        .filter(Boolean)
        .slice(0, 6)
    : [];

  const ageHighlights = Array.isArray(detail.age?.text)
    ? detail.age.text
        .map((t) => (typeof t === "string" ? t : normalizeItem(t).label))
        .filter(Boolean)
    : [];

  if (detail.age?.relaxation) {
    ageHighlights.push(`Relaxation: ${detail.age.relaxation}`);
  }

  const docHighlights = docs
    .map((doc) => doc?.name || doc?.type || String(doc))
    .filter(Boolean)
    .slice(0, 10);

  // Tables: Important dates (FULL — not just few)
  const dateLabelMap = [
    ["notificationDate", "Notification Date"],
    ["postDate", "Post Date"],
    ["applicationStartDate", "Application Start Date"],
    ["applicationLastDate", "Application Last Date"],
    ["feePaymentLastDate", "Fee Payment Last Date"],
    ["correctionDate", "Correction Date"],
    ["preExamDate", "Pre Exam Date"],
    ["mainsExamDate", "Mains Exam Date"],
    ["examDate", "Exam Date"],
    ["admitCardDate", "Admit Card Date"],
    ["resultDate", "Result Date"],
    ["answerKeyReleaseDate", "Answer Key Release Date"],
    ["finalAnswerKeyDate", "Final Answer Key Date"],
    ["documentVerificationDate", "Document Verification Date"],
    ["counsellingDate", "Counselling Date"],
    ["meritListDate", "Merit List Date"],
  ];

  const importantDatesRaw =
    detail.recruitment?.importantDates || recruitment?.importantDates || {};

  const scheduleRows = dateLabelMap.map(([key, label]) => ({
    label,
    value: cleanDateValue(importantDatesRaw[key]),
  }));

  if (importantDatesRaw.other && typeof importantDatesRaw.other === "object") {
    Object.entries(importantDatesRaw.other).forEach(([key, value]) => {
      scheduleRows.push({
        label: toTitleLabel(key),
        value: cleanDateValue(value),
      });
    });
  }

  // Fees rows full
  const feesRows = Array.isArray(detail.fees)
    ? detail.fees
        .map((f) => {
          const { label, value } = normalizeItem(f);
          if (!label && !value) return null;
          const l = (label || "").toLowerCase();
          if (l.includes("payment")) return null;
          return { label: label || "Fee", value: value || "-" };
        })
        .filter(Boolean)
    : [];

  // FAQs
  const contentFaqs = Array.isArray(content.faq)
    ? content.faq
        .map((item) => ({
          q: item?.q || item?.question || "",
          a: item?.a || item?.answer || "",
        }))
        .filter((item) => item.q && item.a)
    : [];

  const faqs = [
    ...contentFaqs,
    {
      q: `What is the last date to apply for ${detail.organization || "this recruitment"}?`,
      a: `The last date to apply is ${lastDate || "mentioned in the official notification"}. Always confirm on the official notice before submitting.`,
    },
    {
      q: `How many vacancies are available?`,
      a: `Total vacancies: ${detail.vacancy?.total || "multiple"} (post-wise breakup is provided above).`,
    },
    {
      q: `What is the selection process?`,
      a: Array.isArray(detail.selection) && detail.selection.length
        ? detail.selection.map((s) => (typeof s === "string" ? s : normalizeItem(s).label)).join(" • ")
        : "Selection process will be updated soon. Check official notification.",
    },
    {
      q: `Where can I apply online and download notice?`,
      a: "Use the Apply Online / Download Notice buttons or Important Links section.",
    },
  ];

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://jobsaddah.com" },
    { name: "Jobs", url: "https://jobsaddah.com/post" },
    { name: detail.title || "Job Details", url: shareUrl },
  ]);

  return (
    <article className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 pb-12">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateJobPostingSchema(detail)) }}
      />
      {breadcrumbSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      ) : null}

      {/* Top meta bar */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4 text-xs md:text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Link href="/" className="hover:text-indigo-600">Home</Link>
            <ChevronRight size={12} />
            <span className="font-medium text-slate-900 truncate max-w-[260px]">
              {detail.organization || "Recruitment"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock size={14} /> Updated: {postDate}
            </span>
            <div className="h-4 w-px bg-slate-300"></div>
            <a
              href={`https://wa.me/?text=${shareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-green-600 font-bold hover:underline"
            >
              <Share2 size={14} /> Share
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT */}
        <div className="lg:col-span-9 space-y-6">
          {/* HERO */}
          <header className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                <Building2 className="text-slate-400" size={32} />
              </div>

              <div className="flex-1 space-y-3">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
                  {detail.title || "Job Details"}
                </h1>

                <div className="flex flex-wrap gap-2">
                  <Badge icon={Building2} label={detail.organization || "Organization"} />
                  <Badge icon={Users} label={`Vacancy: ${detail.vacancy?.total || "Various"}`} tone="info" />
                  {lastDate ? <Badge icon={Timer} label={`Last Date: ${lastDate}`} tone="warn" /> : null}
                  <Badge icon={BadgeCheck} label="Apply Online" tone="good" />
                  <Badge icon={BookOpen} label={syllabusAvailable ? "Syllabus Available" : "Syllabus Pending"} tone={syllabusAvailable ? "good" : "neutral"} />
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href={applyHref}
                    target={applyHref.startsWith("http") ? "_blank" : undefined}
                    rel={applyHref.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-extrabold hover:bg-emerald-500 transition-colors inline-flex items-center gap-2"
                  >
                    <Send size={16} /> Apply Online
                  </a>

                  <a
                    href={noticeHref}
                    target={noticeHref.startsWith("http") ? "_blank" : undefined}
                    rel={noticeHref.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-extrabold hover:bg-slate-800 transition-colors inline-flex items-center gap-2"
                  >
                    <Download size={16} /> Official Notification
                  </a>

                  {sourceHref ? (
                    <a
                      href={sourceHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-extrabold hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
                    >
                      <ExternalLink size={16} /> Official Website
                    </a>
                  ) : null}

                  <a
                    href="#important-links"
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-extrabold hover:bg-slate-50 transition-colors inline-flex items-center gap-2"
                  >
                    <ChevronRight size={16} /> Important Links
                  </a>
                </div>
              </div>
            </div>
          </header>

          {/* TABLE-FIRST: Schedule + Fees */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Panel title="Important Schedule (All Dates)" icon={CalendarDays} right="Full official timeline">
              {scheduleRows.length ? (
                <TwoColTable leftTitle="Event" rightTitle="Date" rows={scheduleRows} />
              ) : (
                <div className="p-5 text-sm text-slate-500">Dates will be updated soon.</div>
              )}
            </Panel>

            <Panel title="Application Fee (All Categories)" icon={IndianRupee} right={paymentModes ? `Payment: ${paymentModes}` : "Fee details"}>
              {feesRows.length ? (
                <>
                  <TwoColTable leftTitle="Category" rightTitle="Fee" rows={feesRows} />
                  {paymentModes ? (
                    <div className="px-5 py-3 text-xs text-slate-600 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
                      <IndianRupee size={14} /> Payment Mode: <span className="font-bold">{paymentModes}</span>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="p-5 text-sm text-slate-500">
                  Fee details are not available yet. Please check official notification.
                </div>
              )}
            </Panel>
          </div>

          {/* AGE LIMIT (text + relaxation + category wise) */}
          <Panel title="Age Limit" icon={Clock} right="Includes relaxation if available">
            <div className="p-5 space-y-4">
              {Array.isArray(detail.age?.text) && detail.age.text.length ? (
                <div className="text-sm text-slate-700">
                  {detail.age.text.map((t, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-slate-400">•</span>
                      <span>{typeof t === "string" ? t : normalizeItem(t).label}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Age limit will be updated as per notification.</p>
              )}

              {detail.age?.relaxation ? (
                <div className="text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3">
                  <span className="font-extrabold">Relaxation:</span> {detail.age.relaxation}
                </div>
              ) : null}

              {ageCategoryWise.length ? (
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-100 text-slate-700 text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 border-b border-slate-200">Category</th>
                        <th className="px-4 py-3 border-b border-slate-200">Gender</th>
                        <th className="px-4 py-3 border-b border-slate-200 text-right">Age</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ageCategoryWise.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/70">
                          <td className="px-4 py-3 font-semibold text-slate-700">{row.category}</td>
                          <td className="px-4 py-3 text-slate-600">{row.gender}</td>
                          <td className="px-4 py-3 text-right font-extrabold text-slate-900">{row.age}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          </Panel>

          {/* VACANCY TABLE */}
          <Panel title="Vacancy Details & Eligibility (Post-wise)" icon={Users} right="Main recruitment table">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-700 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3 border-b border-slate-200">Post Name</th>
                    <th className="px-5 py-3 border-b border-slate-200 text-center w-28">Total</th>
                    <th className="px-5 py-3 border-b border-slate-200">Qualification / Eligibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {detail.vacancy?.positions?.length ? (
                    detail.vacancy.positions.map((pos, i) => (
                      <tr key={i} className="hover:bg-indigo-50/40 transition-colors">
                        <td className="px-5 py-3 font-extrabold text-indigo-700 align-top">{pos.name || "Post"}</td>
                        <td className="px-5 py-3 text-center font-black text-slate-900 bg-slate-50/50 align-top">
                          {pos.count || "-"}
                        </td>
                        <td className="px-5 py-3 text-slate-700 align-top leading-relaxed">
                          {pos.qualification || "Refer to official notification"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-5 py-8 text-center text-slate-500">
                        Post-wise vacancy distribution is not available yet. Please check official notice.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* PHYSICAL + PET */}
          {(physical || physicalTest) ? (
            <Panel title="Physical Standards / PET" icon={Activity} right="If applicable">
              <div className="p-5 space-y-6">
                {physical ? (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-100 text-slate-700 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3 border-b border-slate-200">Gender</th>
                          <th className="px-4 py-3 border-b border-slate-200">
                            <span className="inline-flex items-center gap-2"><Ruler size={14} /> Height</span>
                          </th>
                          <th className="px-4 py-3 border-b border-slate-200">Chest</th>
                          <th className="px-4 py-3 border-b border-slate-200">Weight</th>
                          <th className="px-4 py-3 border-b border-slate-200">
                            <span className="inline-flex items-center gap-2"><Eye size={14} /> Eyesight</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {["male", "female"].map((gender) => {
                          const row = physical?.[gender];
                          if (!row || Object.keys(row).length === 0) return null;
                          return (
                            <tr key={gender} className="hover:bg-slate-50/70">
                              <td className="px-4 py-3 font-semibold text-slate-700 capitalize">{gender}</td>
                              <td className="px-4 py-3 text-slate-600">{row.height || "-"}</td>
                              <td className="px-4 py-3 text-slate-600">{row.chest || "-"}</td>
                              <td className="px-4 py-3 text-slate-600">{row.weight || "-"}</td>
                              <td className="px-4 py-3 text-slate-600">{row.eyesight || "-"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : null}

                {physicalTest ? (
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-100 text-slate-700 text-xs uppercase tracking-wider">
                        <tr>
                          <th className="px-4 py-3 border-b border-slate-200">Gender</th>
                          <th className="px-4 py-3 border-b border-slate-200">Distance</th>
                          <th className="px-4 py-3 border-b border-slate-200">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {["male", "female"].map((gender) => {
                          const row = physicalTest?.[gender];
                          if (!row || Object.keys(row).length === 0) return null;
                          return (
                            <tr key={gender} className="hover:bg-slate-50/70">
                              <td className="px-4 py-3 font-semibold text-slate-700 capitalize">{gender}</td>
                              <td className="px-4 py-3 text-slate-600">{row.distance || "-"}</td>
                              <td className="px-4 py-3 text-slate-600">{row.duration || "-"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </div>
            </Panel>
          ) : null}

          {/* SELECTION + DOCUMENTS + NOTES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Panel title="Selection Process" icon={CheckCircle2}>
              <div className="p-5">
                {renderValueList(detail.selection) || (
                  <p className="text-sm text-slate-500">Selection stages will be updated soon.</p>
                )}
              </div>
            </Panel>

            <Panel title="Documents Required" icon={FileText}>
              <div className="p-5">
                {docs.length ? (
                  <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                    {docs.map((doc, i) => (
                      <li key={i}>{doc?.name || doc?.type || String(doc)}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">Refer to official notification.</p>
                )}
              </div>
            </Panel>
          </div>

          <Panel title="Important Notes / Additional Info" icon={AlertCircle}>
            <div className="p-5 text-sm text-slate-700 leading-relaxed">
              {notes ? notes : "Always verify details with official notification before applying."}
            </div>
          </Panel>

          {/* CONTENT (FULL FIELDS) */} 
          {
            content?.originalSummary && (
                 <Panel title="Content Summary" icon={Info} right="From backend content">
            <div className="p-5 space-y-6">
              <ContentSection title="Original Summary">
                {renderTextValue(content.originalSummary)}
              </ContentSection>

              <ContentSection title="Who Should Apply">
                {renderListValue(content.whoShouldApply)}
              </ContentSection>

              <ContentSection title="Key Highlights">
                {renderListValue(content.keyHighlights)}
              </ContentSection>

              <ContentSection title="Application Steps">
                {renderListValue(content.applicationSteps)}
              </ContentSection>

              <ContentSection title="Selection Process Summary">
                {renderTextValue(content.selectionProcessSummary)}
              </ContentSection>

              <ContentSection title="Documents Checklist">
                {renderListValue(content.documentsChecklist)}
              </ContentSection>

              <ContentSection title="Fee Summary">
                {renderTextValue(content.feeSummary)}
              </ContentSection>

              <ContentSection title="Important Notes">
                {renderListValue(content.importantNotes)}
              </ContentSection>

              <ContentSection title="Content FAQs">
                {contentFaqs.length ? (
                  <div className="space-y-2">
                    {contentFaqs.map((faq, i) => (
                      <div key={i} className="border border-slate-200 rounded-lg p-3">
                        <div className="text-sm font-extrabold text-slate-800 mb-1">{faq.q}</div>
                        <div className="text-sm text-slate-600 leading-relaxed">{faq.a}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Not provided.</p>
                )}
              </ContentSection>
            </div>
          </Panel>
            )
          }
       

          {/* IMPORTANT LINKS */}
          <section id="important-links" className="scroll-mt-20">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 md:p-8 shadow-lg text-white">
              <div className="flex items-center justify-between gap-3 mb-6">
                <h2 className="text-xl font-black flex items-center gap-2">
                  <ExternalLink className="text-emerald-400" /> Important Links
                </h2>
                <span className="text-xs text-slate-300">Prefer official sources</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {importantLinksList.length ? (
                  importantLinksList.map((link, i) => {
                    const { label } = normalizeItem(link);
                    const displayLabel = label || "Official Link";
                    const isApply = /apply|online|registration/i.test(displayLabel);
                    const clickable = isLinkClickable(link);
                    const statusMessage = getLinkStatusMessage(link);

                    return (
                      <div
                        key={i}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white/10 rounded-xl overflow-hidden border border-white/10 hover:bg-white/15 transition-all"
                      >
                        <div className="px-4 py-3 flex-1 font-semibold text-sm text-slate-200">
                          <div className="flex items-center gap-2">
                            {isApply ? (
                              <Send size={16} className="text-emerald-400" />
                            ) : (
                              <ChevronRight size={16} className="text-slate-300" />
                            )}
                            {displayLabel}
                          </div>
                          {statusMessage ? (
                            <div className="text-xs text-slate-300 mt-1">{statusMessage}</div>
                          ) : null}
                        </div>

                        {clickable ? (
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`px-6 py-3 text-sm font-extrabold flex items-center justify-center gap-2 transition-colors ${
                              isApply
                                ? "bg-emerald-500 hover:bg-emerald-400 text-white"
                                : "bg-white text-slate-900 hover:bg-slate-200"
                            }`}
                          >
                            {isApply ? "Apply Now" : "Open"}
                            <ExternalLink size={14} />
                          </a>
                        ) : (
                          <div className="px-6 py-3 text-sm font-extrabold flex items-center justify-center bg-white/10 text-slate-300 cursor-not-allowed">
                            Pending
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="col-span-2 text-center py-6 text-slate-300">
                    Links will be updated soon.
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* CHECKLIST (old parity) */}
          <Panel title="Post-Specific Checklist (Key Highlights)" icon={BookOpen} right="High-value summary">
            <div className="p-5">
              {hasSubstantialContent(detail) ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <h3 className="text-sm font-extrabold text-slate-900 mb-2 uppercase tracking-wide">
                      Eligibility Snapshot
                    </h3>
                    {eligibilityHighlights.length ? (
                      <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                        {eligibilityHighlights.map((it, i) => <li key={i}>{it}</li>)}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500">Eligibility details will be updated soon.</p>
                    )}
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <h3 className="text-sm font-extrabold text-slate-900 mb-2 uppercase tracking-wide">
                      Fees & Age Notes
                    </h3>
                    {feeHighlights.length ? (
                      <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700 mb-3">
                        {feeHighlights.map((it, i) => <li key={i}>{it}</li>)}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500 mb-3">Fee details are listed above.</p>
                    )}

                    {ageHighlights.length ? (
                      <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                        {ageHighlights.map((it, i) => <li key={i}>{it}</li>)}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500">Age limits will be updated soon.</p>
                    )}
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <h3 className="text-sm font-extrabold text-slate-900 mb-2 uppercase tracking-wide">
                      Document Checklist
                    </h3>
                    {docHighlights.length ? (
                      <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                        {docHighlights.map((it, i) => <li key={i}>{it}</li>)}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500">Document list not published yet.</p>
                    )}
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <h3 className="text-sm font-extrabold text-slate-900 mb-2 uppercase tracking-wide">
                      Updates & Strategy
                    </h3>
                    {updateHighlights.length ? (
                      <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                        {updateHighlights.map((it, i) => <li key={i}>{it}</li>)}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-500">Follow official notice for updates.</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-slate-500 italic">
                  Verified recruitment details are being updated. Check back soon.
                </div>
              )}
            </div>
          </Panel>

          {/* FAQs */}
          <Panel title="FAQs" icon={HelpCircle} right="Common questions">
            <div className="p-5 space-y-3">
              {faqs.map((faq, i) => (
                <details key={i} className="group bg-white border border-slate-200 rounded-xl open:ring-1 open:ring-indigo-500/20 open:shadow-sm transition-all duration-200">
                  <summary className="flex cursor-pointer items-center justify-between p-4 font-extrabold text-slate-800 select-none">
                    {faq.q}
                    <ChevronRight className="text-slate-400 w-5 h-5 group-open:rotate-90 transition-transform duration-200" />
                  </summary>
                  <div className="px-4 pb-4 text-slate-600 leading-relaxed border-t border-slate-100 pt-4 text-sm">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </Panel>

          {/* SEO OVERVIEW (BOTTOM) */}
          <Panel title="Overview" icon={Info} right="Static SEO content">
            <div className="p-5">{generateOverview(detail)}</div>
          </Panel>

          {/* DISCLAIMER */}
          <section className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-900">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 text-amber-600" size={18} />
              <div>
                <h3 className="font-extrabold text-amber-900 mb-1">Verification Disclaimer</h3>
                <p className="leading-relaxed">
                  JobsAddah aggregates information from official sources and public notices.
                  Always cross-check dates, eligibility, and fees on the official website before applying.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="lg:col-span-3 space-y-8">
          <div className="sticky top-4 space-y-6">
            {/* Tool Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-5 text-white shadow-md relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 bg-white/10 h-24 w-24 rounded-full group-hover:scale-110 transition-transform"></div>
              <Maximize2 className="mb-3 relative z-10" size={28} />
              <h3 className="font-extrabold text-lg mb-1 relative z-10">Image Resizer</h3>
              <p className="text-xs text-indigo-100 mb-4 relative z-10 leading-relaxed opacity-90">
                Format photo & signature to exact pixels and KB size required for forms.
              </p>
              <Link href="/tools/image" className="inline-flex items-center gap-2 bg-white text-indigo-700 text-xs font-extrabold px-4 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors shadow-sm relative z-10">
                Open Tool <ChevronRight size={14} />
              </Link>
            </div>

            {/* Trending */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center gap-2">
                <Flame className="text-orange-500 fill-orange-500" size={16} />
                <span className="font-extrabold text-slate-700 text-xs">Trending Now</span>
              </div>

              <div className="divide-y divide-slate-100">
                {relatedPosts.length ? (
                  relatedPosts.map((post, i) => {
                    const url = getCleanPostUrl(post.url || post.link);
                    if (!url) return null;
                    return (
                      <Link key={i} href={url} className="block p-3 hover:bg-slate-50 group transition-colors">
                        <h4 className="text-[12px] font-extrabold text-slate-800 line-clamp-2 group-hover:text-indigo-600 leading-snug mb-1">
                          {post.recruitment?.title || "Latest Government Job Notification"}
                        </h4>
                        <div className="flex items-center justify-end text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                          Check Details <ChevronRight size={10} />
                        </div>
                      </Link>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-xs text-slate-400">No recent updates</div>
                )}
              </div>

              <Link href="/latest-jobs" className="block p-3 text-center text-[12px] font-extrabold text-indigo-600 bg-slate-50 border-t border-slate-100 hover:underline">
                View All Jobs
              </Link>
            </div>

            <div className="bg-slate-100 rounded-2xl p-4 text-center border border-slate-200 border-dashed">
              <div className="flex justify-center mb-2">
                <AlertCircle className="text-slate-400" />
              </div>
              <p className="text-xs text-slate-500">
                Always verify details from official notification before applying.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
