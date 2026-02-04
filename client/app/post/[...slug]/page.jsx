import { notFound } from "next/navigation";
import Link from "next/link";
import { cache } from "react";
import { connectDB } from "@/lib/db/connectDB";
import Post from "@/lib/models/job";
import { extractRecruitmentData } from "@/util/post-helper";
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
} from "lucide-react";
import { generateJobPostingSchema } from "@/lib/seo-schemas";

// --- Configuration & Helpers ---

const COMPETITOR_DOMAINS = [
  "sarkariresult.com",
  "sarkariresult.com.cm",
  "sarkariexam.com",
  "freejobalert.com",
  "jagranjosh.com",
];

const sanitizeLinks = (links) => {
  if (!Array.isArray(links)) return [];
  return links
    .filter((l) => l && typeof l === "object" && typeof l.url === "string")
    .map((l) => {
      const u = l.url.toLowerCase();
      const isCompetitor = COMPETITOR_DOMAINS.some((d) => u.includes(d));
      return isCompetitor ? { ...l, url: "https://jobsaddah.com" } : l;
    });
};

const cleanDateValue = (val) => {
  if (!val) return "To be announced";
  const v = String(val).trim();
  if (v.length > 50 || v.toLowerCase().includes("related"))
    return "Check Notification";
  return v;
};

// Helper to safely extract label/value from mixed types (string or object)
const normalizeItem = (item) => {
  if (!item) return { label: "", value: "" };

  // Case 1: Item is a string "Label : Value"
  if (typeof item === "string") {
    const parts = item.split(":");
    if (parts.length > 1) {
      return {
        label: parts[0].trim(),
        value: parts.slice(1).join(":").trim(),
      };
    }
    return { label: item, value: "" };
  }

  // Case 2: Item is an object
  if (typeof item === "object") {
    // Try common keys that extractRecruitmentData helpers might return
    const label =
      item.label ||
      item.key ||
      item.text ||
      item.title ||
      item.type ||
      "Detail";
    let value =
      item.value || item.val || item.date || item.amount || item.text || "";

    // If value is empty or same as label, check if label has ':'
    if (
      (!value || value === label) &&
      typeof label === "string" &&
      label.includes(":")
    ) {
      const parts = label.split(":");
      return {
        label: parts[0].trim(),
        value: parts.slice(1).join(":").trim(),
      };
    }

    // Sometimes text field contains the full string
    if (item.text && typeof item.text === 'string' && item.text.includes(':')) {
       const parts = item.text.split(":");
       return {
        label: parts[0].trim(),
        value: parts.slice(1).join(":").trim(),
      };
    }

    return { label: String(label), value: String(value) };
  }

  return { label: String(item), value: "" };
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

// --- Text Generators (SEO Content) ---

function generateOverview(detail) {
  const org = detail.organization || "The Recruitment Board";
  const vacancy = detail.vacancy?.total || "various";
  const title = detail.title || "Government Job Opportunity";
  
  // Safe extraction for Last Date
  let lastDate = "the closing date";
  if(Array.isArray(detail.dates)) {
     const lastDateObj = detail.dates.find(d => {
        const { label } = normalizeItem(d);
        return label.toLowerCase().includes("last date");
     });
     if(lastDateObj) {
        lastDate = normalizeItem(lastDateObj).value || "the closing date";
     }
  }

  return (
    <div className="space-y-4 text-slate-700 leading-relaxed text-sm md:text-base">
      <p>
        <strong className="text-indigo-800">{org}</strong> has officially released the recruitment
        advertisement for <strong>{title}</strong>. This is a significant
        opportunity for candidates who are aspiring to join the government
        sector. The recruitment board has announced a total of{" "}
        <strong>{vacancy}</strong> vacancies for various posts. Eligible
        aspirants can now check the detailed notification, including the
        eligibility criteria, age limit, selection process, and important dates
        before applying.
      </p>
      <p>
        The online application process will be conducted through the official
        website. Interested aspirants are advised to read the complete
        notification carefully to avoid any mistakes during the application
        process. The application window is open for a limited time, and
        candidates must submit their forms before{" "}
        <strong>{lastDate}</strong>
        . Below, you will find a detailed breakdown of the recruitment process,
        including the direct link to apply, application fee structure, syllabus,
        and exam pattern.
      </p>
      <p>
        Securing a job in {org} is a prestigious achievement, offering stability
        and career growth. Ensure you prepare all necessary documents and meet
        the medical and physical standards (if applicable) required for the
        post. Read on for a comprehensive guide to this recruitment drive.
      </p>
    </div>
  );
}

// --- Data Fetching ---

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

async function getRelatedPosts() {
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
}

// --- Extraction Logic ---

const findLastDate = (detail, recruitment) => {
  const direct =
    recruitment?.importantDates?.applicationLastDate ||
    recruitment?.importantDates?.lastDate ||
    recruitment?.importantDates?.lastDateToApply;
  if (direct) return direct;

  if (Array.isArray(detail?.dates)) {
    const match = detail.dates.find((d) => {
        const { label } = normalizeItem(d);
        return label.toLowerCase().includes("application deadline") || label.toLowerCase().includes("last date");
    });
    if(match) return normalizeItem(match).value;
  }
  return "Check notification";
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
        <li key={i}>
          {typeof item === "string" ? item : normalizeItem(item).label}
        </li>
      ))}
    </ul>
  );
};

// --- UI Components ---

const SectionHeader = ({ title, icon: Icon, colorClass = "text-blue-700" }) => (
  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
    <div className={`p-1.5 rounded-lg bg-slate-50 ${colorClass}`}>
      <Icon size={20} />
    </div>
    <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
  </div>
);

const InfoCard = ({ title, children, className = "" }) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}>
    {title && (
      <div className="bg-slate-50/80 border-b border-slate-200 px-4 py-3">
        <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">{title}</h3>
      </div>
    )}
    <div className="p-0">{children}</div>
  </div>
);

const StatusBadge = ({ label, type = "neutral" }) => {
  const styles = {
    active: "bg-green-100 text-green-700 border-green-200",
    closed: "bg-red-100 text-red-700 border-red-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
    highlight: "bg-blue-100 text-blue-700 border-blue-200",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${styles[type]}`}>
      {label}
    </span>
  );
};

// --- Main Page ---

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const rawData = await getJobDetails(resolvedParams.slug);

  if (!rawData) return { title: "Job Details - JobsAddah" };

  const detail = extractRecruitmentData(rawData);
  const shouldIndex = hasSubstantialContent(detail);
  const title = `${detail.title} - Apply Online, Syllabus, Exam Date`;
  const desc = `Latest Update: ${detail.organization} has released a notification for ${detail.vacancy?.total || 'various'} posts. Check eligibility, age limit, selection process, and direct apply link.`;

  const slugPath = Array.isArray(resolvedParams.slug)
    ? resolvedParams.slug.join("/")
    : resolvedParams.slug;

  return {
    title: title.slice(0, 60),
    description: desc.slice(0, 160),
    alternates: { canonical: `/post/${slugPath}` },
    openGraph: { title, description: desc, type: "article" },
    robots: shouldIndex ? "index,follow" : "noindex,follow",
  };
}

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
  
  const postDate = rawData.createdAt
    ? new Date(rawData.createdAt).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
      })
    : "Recent";

  const slugPath = Array.isArray(slug) ? slug.join("/") : slug;
  const shareUrl = `${(process.env.NEXT_PUBLIC_SITE_URL || "https://jobsaddah.com").replace(/\/$/, "")}/post/${slugPath}`;
  const shareText = encodeURIComponent(`${detail.title} | ${shareUrl}`);

  // FAQs Data
  const faqs = [
    {
      q: `What is the last date to apply for ${detail.organization}?`,
      a: `The last date to apply is ${
        recruitment.importantDates?.applicationLastDate ||
        findLastDate(detail, recruitment) ||
        "mentioned in the official notification"
      }. Candidates are advised to submit before the deadline.`,
    },
    {
      q: `How many vacancies are available in ${detail.title}?`,
      a: `There are a total of ${detail.vacancy?.total || "multiple"} vacancies announced for various posts.`,
    },
    {
      q: `What is the age limit for this recruitment?`,
      a: normalizeItem(detail.age?.text?.[0]).label || "Please check the official notification for detailed age criteria and relaxations.",
    },
    {
      q: `Can I apply online?`,
      a: "Yes, candidates can apply online through the official link provided in the 'Important Links' section below.",
    },
  ];

  const paymentModes = getPaymentModes(detail.fees);
  const ageCategoryWise = Array.isArray(detail.age?.categoryWise)
    ? detail.age.categoryWise
    : [];
  const physical = detail.physicalStandards || null;
  const physicalTest = detail.physicalTest || null;
  const docs = Array.isArray(detail.documentation) ? detail.documentation : [];
  const notes =
    detail.additionalDetails?.noteToCandidates ||
    detail.additionalDetails?.additionalInfo ||
    recruitment?.additionalInfo ||
    "";

  return (
    <article className="min-h-screen bg-[#f8fafc] font-sans text-slate-900 pb-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateJobPostingSchema(detail)),
        }}
      />

      {/* --- Breadcrumb & Meta Bar --- */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4 text-xs md:text-sm text-slate-500">
           <div className="flex items-center gap-2">
              <Link href="/" className="hover:text-indigo-600">Home</Link> 
              <ChevronRight size={12} />
              <span className="font-medium text-slate-900 truncate max-w-[200px]">{detail.organization}</span>
           </div>
           <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><Clock size={14} /> Updated: {postDate}</span>
              <div className="h-4 w-px bg-slate-300"></div>
              <a href={`https://wa.me/?text=${shareText}`} target="_blank" className="flex items-center gap-1 text-green-600 font-bold hover:underline">
                 <Share2 size={14} /> Share
              </a>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* === LEFT COLUMN: MAIN CONTENT === */}
        <div className="lg:col-span-9 space-y-8">
          
          {/* 1. Hero Header */}
          <header className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
             <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                   <Building2 className="text-slate-400" size={32} />
                </div>
                <div className="flex-1 space-y-2">
                   <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 leading-tight">
                      {detail.title}
                   </h1>
                   <div className="flex flex-wrap gap-2 pt-1">
                      <StatusBadge label={detail.organization} type="neutral" />
                      <StatusBadge label={`Vacancy: ${detail.vacancy?.total || "Various"}`} type="highlight" />
                      <StatusBadge label="Apply Online" type="active" />
                   </div>
                </div>
                <div className="hidden md:block">
                   <a href="#links" className="flex flex-col items-center justify-center h-20 w-24 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl transition-colors border border-indigo-100 group">
                      <Download className="mb-1 group-hover:-translate-y-1 transition-transform" size={24} />
                      <span className="text-xs font-bold">Notice</span>
                   </a>
                </div>
             </div>
          </header>

          {/* 2. Detailed Info (SEO Rich) */}
          <section className="bg-indigo-50/50 rounded-xl p-6 border border-indigo-100">
             {generateOverview(detail)}
          </section>

          {/* 3. Dates & Fees (Grid Layout) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Important Dates */}
             <InfoCard title="Important Schedule" className="border-t-4 border-t-rose-500">
                <div className="divide-y divide-slate-100">
                   {detail.dates?.map((d, i) => {
                      const { label, value } = normalizeItem(d);
                      if(!label && !value) return null;
                      return (
                         <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                               <CalendarDays size={16} className="text-rose-500" />
                               {label}
                            </div>
                            <div className="text-sm font-bold text-slate-900 text-right">
                               {cleanDateValue(value)}
                            </div>
                         </div>
                      );
                   })}
                   {!detail.dates?.length && <div className="p-4 text-slate-500 text-sm italic">Dates to be updated.</div>}
                </div>
             </InfoCard>

             {/* Application Fee */}
             <InfoCard title="Application Fee" className="border-t-4 border-t-emerald-500">
                <div className="divide-y divide-slate-100">
                   {detail.fees?.map((f, i) => {
                      const { label, value } = normalizeItem(f);
                      // Skip payment mode text here if desired, or show everything
                      if(label.toLowerCase().includes("payment")) return null; 
                      
                      return (
                         <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                               <CheckCircle2 size={16} className="text-emerald-500" />
                               {label}
                            </div>
                            <div className="text-sm font-bold text-slate-900">
                               {value}
                            </div>
                         </div>
                      );
                   })}
                   {paymentModes && (
                     <div className="p-3 bg-slate-50 text-xs text-slate-500 border-t border-slate-100 flex gap-2">
                        <IndianRupee size={14} /> 
                        Payment Mode: {paymentModes}
                     </div>
                   )}
                </div>
             </InfoCard>
          </div>

          {/* 4. Age Limit & Vacancy Details */}
          <section>
             <SectionHeader title="Vacancy Details & Eligibility" icon={Users} colorClass="text-purple-600" />
             
             {/* Age Limit Box (show only when no category-wise data) */}
             {ageCategoryWise.length === 0 && (
               <div className="mb-6 bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                     <Clock className="text-purple-600" size={20} />
                  </div>
                  <div className="flex-1">
                     <h4 className="font-bold text-slate-900 text-sm uppercase mb-1">Age Limit</h4>
                     <div className="text-sm text-slate-600">
                        {/* Check if age is object with array text, or simple object, or array */}
                        {(() => {
                          const ageData = detail.age;
                          if(ageData?.text && Array.isArray(ageData.text)) {
                              return ageData.text.map((t, i) => <span key={i} className="block">• {typeof t === 'string' ? t : normalizeItem(t).label}</span>);
                          }
                          if(Array.isArray(ageData)) {
                               return ageData.map((t, i) => <span key={i} className="block">• {normalizeItem(t).label}</span>);
                          }
                          return <span>• {normalizeItem(ageData).label || "Age limit as per official notification rules."}</span>
                        })()}
                     </div>
                     {detail.age?.relaxation && (
                       <div className="mt-2 text-xs text-slate-500">
                          <strong>Relaxation:</strong> {detail.age.relaxation}
                       </div>
                     )}
                   </div>
                </div>
             )}

             {ageCategoryWise.length > 0 && (
               <div className="mb-6 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                 <div className="bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                   Age Limit (Category Wise)
                 </div>
                 <div className="px-4 py-3 border-b border-slate-200 text-xs text-slate-600 flex flex-wrap gap-2">
                   {detail.age?.text?.length ? (
                     detail.age.text.map((t, i) => (
                       <span key={i} className="px-2 py-1 bg-white border border-slate-200 rounded-md">
                         {typeof t === "string" ? t : normalizeItem(t).label}
                       </span>
                     ))
                   ) : (
                     <span className="px-2 py-1 bg-white border border-slate-200 rounded-md">
                       Age details as per notification
                     </span>
                   )}
                   {detail.age?.relaxation && (
                     <span className="px-2 py-1 bg-white border border-slate-200 rounded-md">
                       Relaxation: {detail.age.relaxation}
                     </span>
                   )}
                 </div>
                 <div className="overflow-x-auto">
                   <table className="w-full text-sm text-left">
                     <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-xs tracking-wider">
                       <tr>
                         <th className="px-4 py-3 border-b border-slate-200">Category</th>
                         <th className="px-4 py-3 border-b border-slate-200">Gender</th>
                         <th className="px-4 py-3 border-b border-slate-200 text-right">Age</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                       {ageCategoryWise.map((row, i) => (
                         <tr key={i}>
                           <td className="px-4 py-3 font-semibold text-slate-700">{row.category}</td>
                           <td className="px-4 py-3 text-slate-600">{row.gender}</td>
                           <td className="px-4 py-3 text-right font-bold text-slate-900">{row.age}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>
             )}

             {/* Modern Table */}
             <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                   <table className="w-full text-sm text-left">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-xs tracking-wider">
                         <tr>
                            <th className="px-6 py-4 border-b border-slate-200">Post Name</th>
                            <th className="px-6 py-4 border-b border-slate-200 text-center w-24">Total</th>
                            <th className="px-6 py-4 border-b border-slate-200">Qualification / Eligibility</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                         {detail.vacancy?.positions?.length ? (
                            detail.vacancy.positions.map((pos, i) => (
                               <tr key={i} className="hover:bg-indigo-50/30 transition-colors group">
                                  <td className="px-6 py-4 font-bold text-indigo-700 align-top group-hover:text-indigo-900">
                                     {pos.name || "Post"}
                                  </td>
                                  <td className="px-6 py-4 font-black text-slate-800 text-center align-top bg-slate-50/50">
                                     {pos.count || "-"}
                                  </td>
                                  <td className="px-6 py-4 text-slate-600 align-top leading-relaxed">
                                     {pos.qualification || "Refer to notification"}
                                  </td>
                               </tr>
                            ))
                         ) : (
                            <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-500">Detailed vacancy distribution is available in the notification.</td></tr>
                         )}
                      </tbody>
                   </table>
                </div>
             </div>
          </section>

          {(physical || physicalTest) && (
            <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <SectionHeader title="Physical Standards / PET" icon={CheckCircle2} colorClass="text-rose-600" />
              {physical && (
                <div className="overflow-x-auto mb-4">
                  <table className="w-full text-sm text-left border border-slate-200">
                    <thead className="bg-slate-100 text-slate-700 text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-2 border-b border-slate-200">Gender</th>
                        <th className="px-4 py-2 border-b border-slate-200">Height</th>
                        <th className="px-4 py-2 border-b border-slate-200">Chest</th>
                        <th className="px-4 py-2 border-b border-slate-200">Weight</th>
                        <th className="px-4 py-2 border-b border-slate-200">Eyesight</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {["male", "female"].map((gender) => {
                        const row = physical?.[gender];
                        if (!row || Object.keys(row).length === 0) return null;
                        return (
                          <tr key={gender}>
                            <td className="px-4 py-2 font-semibold text-slate-700 capitalize">{gender}</td>
                            <td className="px-4 py-2 text-slate-600">{row.height || "-"}</td>
                            <td className="px-4 py-2 text-slate-600">{row.chest || "-"}</td>
                            <td className="px-4 py-2 text-slate-600">{row.weight || "-"}</td>
                            <td className="px-4 py-2 text-slate-600">{row.eyesight || "-"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {physicalTest && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border border-slate-200">
                    <thead className="bg-slate-100 text-slate-700 text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-2 border-b border-slate-200">Gender</th>
                        <th className="px-4 py-2 border-b border-slate-200">Distance</th>
                        <th className="px-4 py-2 border-b border-slate-200">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {["male", "female"].map((gender) => {
                        const row = physicalTest?.[gender];
                        if (!row || Object.keys(row).length === 0) return null;
                        return (
                          <tr key={gender}>
                            <td className="px-4 py-2 font-semibold text-slate-700 capitalize">{gender}</td>
                            <td className="px-4 py-2 text-slate-600">{row.distance || "-"}</td>
                            <td className="px-4 py-2 text-slate-600">{row.duration || "-"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          <section className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">Selection Process</h3>
              {renderValueList(detail.selection) || (
                <p className="text-sm text-slate-500">Selection stages will be updated soon.</p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">Documents Required</h3>
              {docs.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                  {docs.map((doc, i) => (
                    <li key={i}>{doc?.name || doc?.type || String(doc)}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">Refer to official notification.</p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">Important Notes</h3>
              {notes ? (
                <p className="text-sm text-slate-700 leading-relaxed">{notes}</p>
              ) : (
                <p className="text-sm text-slate-500">Always verify with official sources.</p>
              )}
            </div>
          </section>

          {/* 5. How to Apply */}
          <section className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
             <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <HelpCircle className="text-orange-500" /> How to Apply
             </h3>
             <ul className="space-y-3">
                {[
                   "Check the eligibility from the official notification.",
                   "Click on the 'Apply Online' link given below.",
                   "Fill out the application form with correct details.",
                   "Upload the required documents (Photo, Signature, etc.).",
                   "Pay the application fee if applicable.",
                   "Print the final application form for future reference."
                ].map((step, i) => (
                   <li key={i} className="flex gap-3 text-sm text-slate-700">
                      <span className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs border border-slate-200">{i + 1}</span>
                      <span>{step}</span>
                   </li>
                ))}
             </ul>
          </section>

          {/* 6. IMPORTANT LINKS (Action Zone) */}
          <section id="links" className="scroll-mt-20">
             <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 md:p-8 shadow-lg text-white">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                   <ExternalLink className="text-emerald-400" /> Important Links
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {detail.links?.length > 0 ? (
                      detail.links.map((link, i) => {
                         const { label } = normalizeItem(link);
                         const isApply = /apply|online|registration/i.test(label || "");
                         return (
                            <div key={i} className="flex flex-col sm:flex-row items-stretch sm:items-center bg-white/10 rounded-xl overflow-hidden border border-white/10 hover:bg-white/15 transition-all group">
                               <div className="px-4 py-3 flex-1 font-medium text-sm text-slate-200 group-hover:text-white flex items-center gap-2">
                                  {isApply ? <Send size={16} className="text-emerald-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                                  {label || "Click Here"}
                               </div>
                               <a 
                                  href={link.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className={`px-6 py-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${
                                     isApply 
                                     ? "bg-emerald-500 hover:bg-emerald-400 text-white" 
                                     : "bg-white text-slate-900 hover:bg-slate-200"
                                  }`}
                               >
                                  {isApply ? "Apply Now" : "Click Here"}
                                  {isApply ? <ExternalLink size={14} /> : <Download size={14} />}
                               </a>
                            </div>
                         );
                      })
                   ) : (
                      <div className="col-span-2 text-center py-4 text-slate-400">Links will be activated soon.</div>
                   )}
                </div>
                
                {/* Manual Social Buttons */}
                <div className="mt-6 flex flex-wrap gap-3">
                   <a href="#" className="flex-1 bg-[#229ED9] hover:bg-[#1f8ubc] px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-bold text-sm transition-colors">
                      <Send size={16} /> Join Telegram
                   </a>
                   <a href="#" className="flex-1 bg-[#25D366] hover:bg-[#20bd5a] px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 font-bold text-sm transition-colors text-white">
                      <Users size={16} /> WhatsApp Group
                   </a>
                </div>
             </div>
          </section>

          {/* 7. PREPARING FOR RECRUITMENT (LONG SEO CONTENT) */}
          <section className="mt-8 scroll-mt-20">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
               <BookOpen className="text-slate-600" /> Preparing for the Recruitment
            </h2>
            {hasSubstantialContent(detail) ? (
                <div className="prose prose-slate max-w-none text-slate-700 space-y-4 text-sm md:text-base leading-relaxed bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <p>
                    Treat this notification as a living document. The dates, number of vacancies, and application conditions can shift slightly between the draft notification you see today and the final advertisement that opens for submissions. Bookmark this page, download the official PDF, and compare the terminology used here with the language on the issuing organization's website before you start filling out any forms. Doing that extra cross-check keeps you clear of last-minute surprises and ensures that every claim in your application mirrors what the recruiters actually published.
                  </p>
                  <p>
                    Eligibility is more than just the marks on your certificate. Consider not only the minimum educational qualification and age limit, but also domicile clauses, physical standards, and any reservations the body may use for specific districts or departments. Review the timeline of application windows and linking instructions with a calendar view, then note any documents that require certified copies, medical certificates, or self-attestation. A methodical checklist now prevents frantic scanning later when the online portal is live.
                  </p>
                  <p>
                    Build a personal schedule that mirrors the recruitment milestones. Most Sarkari notifications open the form 10-14 days before the first deadline, so plan a rehearsal run where you log in to the portal, capture the form structure, and test uploading scans of your ID, experience proof, and signature. If you rely on a shared computer or cyber cafe, block out a slot well before the last date so you can submit comfortably even if the network slows down on the final day.
                  </p>
                  <p>
                    Keep your documents organized in both digital and hard-copy folders. Maintain two copies of each certificate, one as a PDF and one as a photograph with consistent naming (e.g., "aadhaar-front.jpg"). That makes it easy to upload the right file during the online application and to present the same paperwork at the biometric or document-verification stage. If there are photographs or signatures with specifications, create them at a shop or printer that understands the requirement--JobsAddah regularly highlights those dimension notes so you do not lose points due to an incorrectly sized photo.
                  </p>
                  <p>
                    When the admit card or hall ticket is released, revisit this page to review the contest details while keeping track of new updates via the reminder component on the right. Maintaining calm focus amid the noise of notification updates helps you read every instruction and margin note, which is where the real preparation advantage lies. A collected mindset prevents mistakes like choosing the wrong category or missing a question about preferable centres.
                  </p>
                  <p>
                    JobsAddah surfaces data from multiple scraped sources, but you can reinforce it by using the reminder alerts, trending- jobs feed, and the search bar at the top to quickly jump from this notification to complementary job listings. See the "Important Links" table below for direct application portals, syllabus outlines, and download instructions so you can keep all information under the same roof. Together, these steps build the 800+ words of context you need for a well-informed, confident application.
                  </p>
                  <p>
                    Finally, when you print this page or save it as a PDF, make a note of the reference number and the exact slug so you can refer to the same URL when the admit card is issued. A consistent URL makes it easier to share this notification with mentors, coaches, or peers, and it also helps search engines anchor the page in their index by following the canonical `/post/${Array.isArray(slug) ? slug.join("/") : slug}` path that everyone already uses on JobsAddah.
                  </p>
                </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-xl text-slate-500 italic border border-slate-200">
                Verified recruitment details are being updated. Check back soon.
              </div>
            )}
          </section>

          {/* 8. FAQs */}
          <section className="mt-8">
              <SectionHeader title="Frequently Asked Questions (FAQs)" icon={BookOpen} colorClass="text-teal-600" />
              <div className="space-y-3">
                  {faqs.map((faq, i) => (
                  <details
                      key={i}
                      className="group bg-white border border-slate-200 rounded-xl open:ring-1 open:ring-teal-500/20 open:shadow-sm transition-all duration-200"
                  >
                      <summary className="flex cursor-pointer items-center justify-between p-4 font-bold text-slate-800 select-none">
                      {faq.q}
                      <ChevronRight className="text-slate-400 w-5 h-5 group-open:rotate-90 transition-transform duration-200" />
                      </summary>
                      <div className="px-4 pb-4 text-slate-600 leading-relaxed border-t border-slate-100 pt-4 text-sm">
                      {faq.a}
                      </div>
                  </details>
                  ))}
              </div>
          </section>

        </div>

        {/* === RIGHT COLUMN: SIDEBAR === */}
        <aside className="lg:col-span-3 space-y-8">
           
           {/* Tool Card */}
           <div className="sticky top-4 space-y-6">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-5 text-white shadow-md relative overflow-hidden group">
                 <div className="absolute -right-4 -top-4 bg-white/10 h-24 w-24 rounded-full group-hover:scale-110 transition-transform"></div>
                 <Maximize2 className="mb-3 relative z-10" size={28} />
                 <h3 className="font-bold text-lg mb-1 relative z-10">Image Resizer</h3>
                 <p className="text-xs text-indigo-100 mb-4 relative z-10 leading-relaxed opacity-90">
                    Format your photo & signature to exact pixels and KB size required for this form.
                 </p>
                 <Link href="/tools/image" className="inline-flex items-center gap-2 bg-white text-indigo-700 text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-indigo-50 transition-colors shadow-sm relative z-10">
                    Open Tool <ChevronRight size={14} />
                 </Link>
              </div>

              {/* Related Jobs */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                 <div className="bg-slate-50 px-3 py-2 border-b border-slate-200 flex items-center gap-2">
                    <Flame className="text-orange-500 fill-orange-500" size={16} />
                    <span className="font-bold text-slate-700 text-xs">Trending Now</span>
                 </div>
                 <div className="divide-y divide-slate-100">
                    {relatedPosts.length > 0 ? (
                       relatedPosts.map((post, i) => {
                          const url = getCleanPostUrl(post.url || post.link);
                          if(!url) return null;
                          return (
                             <Link key={i} href={url} className="block p-2 hover:bg-slate-50 group transition-colors">
                                <h4 className="text-[11px] font-semibold text-slate-800 line-clamp-2 group-hover:text-indigo-600 leading-snug mb-1">
                                   {post.recruitment?.title || "Latest Government Job Notification"}
                                </h4>
                                <div className="flex items-center justify-end text-[9px] text-slate-400 font-medium uppercase tracking-wider">
                                   Check Details <ChevronRight size={10} />
                                </div>
                             </Link>
                          );
                       })
                    ) : (
                       <div className="p-3 text-center text-xs text-slate-400">No recent updates</div>
                    )}
                 </div>
                 <Link href="/latest-jobs" className="block p-2 text-center text-[11px] font-bold text-indigo-600 bg-slate-50 border-t border-slate-100 hover:underline">
                    View All Jobs
                 </Link>
              </div>

              {/* Ad Placeholder or Info */}
              <div className="bg-slate-100 rounded-xl p-4 text-center border border-slate-200 border-dashed">
                  <div className="flex justify-center mb-2">
                     <AlertCircle className="text-slate-400" />
                  </div>
                  <p className="text-xs text-slate-500">
                     Always verify details with the official notification before applying.
                  </p>
              </div>
           </div>
        </aside>

      </div>
    </article>
  );
}
