"use client";

import {
  ArrowLeft,
  Calendar,
  CreditCard,
  ExternalLink,
  FileText,
  GraduationCap,
  LogIn,
  Share2,
  User,
  BookOpen, // For Selection
  ClipboardList // For Documentation
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import SEO, { generateJobPostingSchema } from "@/lib/SEO";
import { toTitleCase } from "@/lib/text";

// Small helper to extract readable text from unknown shapes
const extractText = (data) => {
  if (data == null) return "";
  if (typeof data === "string") return data;
  if (typeof data === "number" || typeof data === "boolean") return String(data);
  if (Array.isArray(data)) return data.map(extractText).filter(Boolean).join(", ");
  if (typeof data === "object") {
    if (data.label) return data.label;
    if (data.text) return data.text;
    if (data.value) return data.value;
    if (data.name) return data.name;
    if (data.criteria) return data.criteria;
    const primitives = Object.values(data).filter(v => (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')).map(String);
    if (primitives.length) return primitives.join(', ');
    try { return JSON.stringify(data); } catch (e) { return String(data); }
  }
  return String(data);
};

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

// Mobile Header for Post Details
const MobilePostHeader = ({ title, onBack, onShare }) => (
  <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
    <button 
      onClick={onBack} 
      className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition"
    >
      <ArrowLeft size={20} className="text-gray-600" />
    </button>
    <h1 className="flex-1 text-sm font-semibold text-gray-800 truncate">
      {title || "Job Details"}
    </h1>
    <button 
      onClick={onShare}
      className="p-2 hover:bg-gray-100 rounded-full transition"
    >
      <Share2 size={18} className="text-gray-600" />
    </button>
  </header>
);

// Title Card Component
const TitleCard = ({ badge, title, organization }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
    {badge && (
      <span className="text-[10px] font-bold tracking-wide uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded mb-2 inline-block">
        {badge}
      </span>
    )}
    <h1 className="text-lg font-bold text-gray-900 leading-snug mb-2">
      {title}
    </h1>
    {organization && (
      <p className="text-xs text-gray-500 font-medium">{organization}</p>
    )}
  </div>
);

// Quick Info Grid Component
const QuickInfoGrid = ({ dates, fees, age }) => {
  // Extract start and end dates from dates array
  const startDate = dates?.find(d => typeof d === 'string' && d.toLowerCase().includes("start"))?.split(": ")[1] || "N/A";
  const endDate = dates?.find(d => typeof d === 'string' && (d.toLowerCase().includes("deadline") || d.toLowerCase().includes("last")))?.split(": ")[1] || "N/A";
  
  // Extract fee info - safely handle different formats
  let feeText = "Check notification";
  if (fees && fees.length > 0) {
    const firstFee = fees[0];
    if (typeof firstFee === 'string') {
      feeText = firstFee;
    } else if (firstFee && typeof firstFee === 'object') {
      feeText = firstFee.text || firstFee.amount || extractText(firstFee);
    }
  }
  
  // Extract age info
  const minAge = age?.min || "18 Years";
  const maxAge = age?.max || "Check notification";
  const ageAsOn = age?.asOn || "";

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Dates */}
      <div className="bg-green-50 p-3 rounded-xl border border-green-100">
        <div className="flex items-center gap-2 mb-1">
          <Calendar size={16} className="text-green-600" />
          <span className="text-xs font-bold text-green-800">Dates</span>
        </div>
        <p className="text-[10px] text-gray-600">Start: {startDate}</p>
        <p className="text-[10px] text-gray-600">End: {endDate}</p>
      </div>

      {/* Fee */}
      <div className="bg-orange-50 p-3 rounded-xl border border-orange-100">
        <div className="flex items-center gap-2 mb-1">
          <CreditCard size={16} className="text-orange-600" />
          <span className="text-xs font-bold text-orange-800">Fee</span>
        </div>
        <p className="text-[10px] text-gray-600 line-clamp-2">{feeText}</p>
      </div>

      {/* Age Limit - Full Width */}
      <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 col-span-2">
        <div className="flex items-center gap-2 mb-1">
          <User size={16} className="text-purple-600" />
          <span className="text-xs font-bold text-purple-800">
            Age Limit {ageAsOn ? `(as on ${ageAsOn})` : ""}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-700 font-medium px-1">
          <span>Min: {minAge}</span>
          <span>Max: {maxAge}</span>
        </div>
      </div>
    </div>
  );
};

// Eligibility Section
const EligibilitySection = ({ eligibility }) => {
  let eligibilityItems = [];
  
  if (Array.isArray(eligibility)) {
    eligibilityItems = eligibility;
  } else if (eligibility?.qualification) {
    eligibilityItems = [eligibility.qualification, ...(eligibility.other || [])];
  } else if (typeof eligibility === 'string') {
    eligibilityItems = [eligibility];
  }

  if (!eligibilityItems || eligibilityItems.length === 0) return null;

  const getItemText = (item) => {
    if (typeof item === 'string') return item;
      if (item && typeof item === 'object') {
      if (item.name && item.criteria) return `${item.name}: ${extractText(item.criteria)}`;
      if (item.label && item.text) return `${item.label}: ${extractText(item.text)}`;
      if (item.type && item.text) return `${item.type}: ${extractText(item.text)}`;
      if (item.text) return extractText(item.text);
      if (item.value) return extractText(item.value);
      if (item.label) return extractText(item.label);
      if (item.name) return extractText(item.name);
      return extractText(item);
    }
    return String(item || '');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
        <GraduationCap size={18} className="text-blue-600" /> Eligibility
      </h3>
      <ul className="list-disc list-outside ml-4 text-xs text-gray-600 space-y-1">
        {eligibilityItems.map((item, idx) => (
          <li key={idx}>{getItemText(item)}</li>
        ))}
      </ul>
    </div>
  );
};

// --- NEW: Selection Process Section ---
const SelectionSection = ({ selection }) => {
  if (!selection || selection.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="font-bold text-gray-800 text-sm mb-2 flex items-center gap-2">
        <BookOpen size={18} className="text-indigo-600" /> Selection Process
      </h3>
      <ul className="list-disc list-outside ml-4 text-xs text-gray-600 space-y-1">
        {selection.map((item, idx) => {
           const text = typeof item === 'object' ? item.text || item.name : item;
           return <li key={idx}>{text}</li>;
        })}
      </ul>
    </div>
  );
};

// --- NEW: Documentation Section ---
const DocumentationSection = ({ documentation }) => {
  if (!documentation || documentation.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
        <ClipboardList size={18} className="text-teal-600" /> Required Documents
      </h3>
      <ul className="grid grid-cols-1 gap-2 text-xs text-gray-600">
        {documentation.map((doc, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <FileText size={14} className="text-gray-400 mt-0.5 shrink-0"/>
            <span>{doc}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Vacancy Table Component
const VacancyTable = ({ vacancy, districtData }) => {
  const vacancies = vacancy?.positions || districtData || [];
  
  if (!vacancies || vacancies.length === 0) {
    if (vacancy?.total) {
      return (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-2">Vacancy Details</h3>
          <p className="text-sm text-gray-600">Total Vacancies: <span className="font-bold text-blue-600">{vacancy.total}</span></p>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <h3 className="font-bold text-gray-800 text-sm">
          Vacancy Details {vacancy?.total ? `(${vacancy.total} Posts)` : ""}
        </h3>
      </div>
      <div className="max-h-60 overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                Post/District
              </th>
              <th className="px-3 py-2 text-center text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {vacancies.slice(0, 20).map((item, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                <td className="px-3 py-2 text-xs text-gray-800">
                  {item.name || item.postName || item.district || item.category || `Position ${idx + 1}`}
                </td>
                <td className="px-3 py-2 text-center font-bold text-xs text-gray-800">
                  {item.count || item.vacancies || item.total || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {vacancies.length > 20 && (
        <div className="p-2 text-center border-t border-gray-100 bg-gray-50">
          <span className="text-[10px] text-gray-400">Showing 20 of {vacancies.length} entries</span>
        </div>
      )}
    </div>
  );
};

// Important Links Section
const ImportantLinksSection = ({ links }) => {
  if (!links || !Array.isArray(links) || links.length === 0) return null;

  const getLinkStyle = (label) => {
    const l = label.toLowerCase();
    if (l.includes("apply") || l.includes("registration")) {
      return "bg-blue-600 text-white shadow-md active:scale-95";
    }
    if (l.includes("login")) {
      return "bg-white border border-blue-600 text-blue-600 active:bg-blue-50";
    }
    return "bg-gray-100 text-gray-700 hover:bg-gray-200";
  };

  const getLinkIcon = (label) => {
    const l = label.toLowerCase();
    if (l.includes("apply") || l.includes("registration")) {
      return <ExternalLink size={18} />;
    }
    if (l.includes("login")) {
      return <LogIn size={18} />;
    }
    return <FileText size={18} />;
  };

  return (
    <div className="space-y-2 pb-6">
      <h3 className="font-bold text-gray-800 text-sm px-1">Important Links</h3>
      {links.map((link, idx) => {
        const label = toTitleCase(link.label || `Link ${idx + 1}`);
        const url = link.url || '#';
        
        return (
          <a
            key={idx}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-between w-full p-3 rounded-xl font-medium text-sm transition ${getLinkStyle(label)}`}
          >
            <span className="line-clamp-1 capitalize">{label}</span>
            {getLinkIcon(label)}
          </a>
        );
      })}
    </div>
  );
};

// All Dates Section
const AllDatesSection = ({ dates }) => {
  if (!dates || dates.length === 0) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
        <Calendar size={18} className="text-green-600" /> Important Dates
      </h3>
      <ul className="space-y-2">
        {dates.map((date, idx) => (
          <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
            <span className="text-green-500 mt-0.5">•</span>
            <span>{date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// All Fees Section
const AllFeesSection = ({ fees }) => {
  if (!fees || fees.length === 0) return null;

  const getFeeText = (fee) => {
    if (typeof fee === 'string') return fee;
    if (fee && typeof fee === 'object') {
      if (fee.text) return fee.text;
      if (fee.type && fee.amount) return `${fee.type}: ${fee.amount}`;
      return extractText(fee);
    }
    return String(fee || '');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
        <CreditCard size={18} className="text-orange-600" /> Application Fee
      </h3>
      <ul className="space-y-2">
        {fees.map((fee, idx) => (
          <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
            <span className="text-orange-500 mt-0.5">•</span>
            <span>{getFeeText(fee)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

// Main GovtPostMobile Component
export default function GovtPostMobile({ post }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleBack = () => {
    if (router && router.back) router.back();
    else window.history.back();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title || "Job Post",
          text: `Check out this job: ${post?.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error("Share cancelled",err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const {
    title = "Job Details",
    organization = "",
    dates = [],
    fees = [],
    age = {},
    vacancy = {},
    eligibility = {},
    selection = [],
    links = {},
    districtData = [],
    documentation = [], // Destructured documentation here
    // For SEO
    shortDescription,
    importantDates,
    totalVacancies,
    salary,
    qualification
  } = post || {};

  const paramUrl = searchParams?.get("url") || null;
  const paramId = searchParams?.get("id") || searchParams?.get("_id") || null;

  return (
  <div className="min-h-screen bg-gray-50 pb-4" style={{ paddingTop: 'var(--site-header-height)' }}>
      <SEO
        title={`${title} | Recruitment 2025 - JobsAddah`}
        description={`${title} Recruitment 2025 - Check eligibility, vacancy details, important dates, application process. Apply online for ${organization || "government job"} vacancy at JobsAddah.`}
        keywords={`${title}, ${organization || "government job"} recruitment 2025, vacancy, online form, admit card, result, eligibility, apply online, sarkari naukri`}
        canonical={`/post?${
          paramUrl
            ? `url=${encodeURIComponent(paramUrl)}`
            : `id=${encodeURIComponent(paramId || "")}`
        }`}
        section="Job Details"
        ogType="article"
        ogImage={`https://og-image.vercel.app/${encodeURIComponent(title)}.png?theme=light&md=0&fontSize=64px&images=https://jobsaddah.com/logo.png`}
        jsonLd={generateJobPostingSchema({
          title: title,
          organization: organization,
          description: shortDescription || `Apply for ${title} recruitment`,
          applicationStartDate: importantDates?.applicationStartDate,
          applicationLastDate: importantDates?.applicationLastDate,
          vacancies: totalVacancies,
          salary: salary,
          location: post?.location || "India",
          qualification: qualification,
          link: paramUrl || paramId,
        })}
      />

      <MobilePostHeader 
        title={title}
        onBack={handleBack}
        onShare={handleShare}
      />

      <div className="px-4 py-5 space-y-4">
        {/* 1. Title Card */}
        <TitleCard
          badge="Latest Recruitment"
          title={title}
          organization={organization}
        />

        {/* 2. Quick Info Grid */}
        <QuickInfoGrid
          dates={dates}
          fees={fees}
          age={age}
        />

        {/* 3. All Dates */}
        <AllDatesSection dates={dates} />

        {/* 4. All Fees */}
        <AllFeesSection fees={fees} />

        {/* 5. Eligibility */}
        <EligibilitySection eligibility={eligibility} />

        {/* 6. Selection Process (Added) */}
        <SelectionSection selection={selection} />

        {/* 7. Documentation (Added) */}
        <DocumentationSection documentation={documentation} />

        {/* 8. Vacancy Table */}
        <VacancyTable 
          vacancy={vacancy}
          districtData={districtData}
        />

        {/* 9. Important Links */}
        <ImportantLinksSection links={links} />
      </div>
    </div>
  );
}