"use client";

import {
  BookOpen,
  Calendar,
  Clock,
  CreditCard,
  Download,
  ExternalLink,
  MapPin,
  Briefcase,
  Printer,
  FileText,
  ClipboardList,
} from "lucide-react";
import SEO, { generateJobPostingSchema } from "@/lib/SEO";
import useIsMobile from "@/hooks/useIsMobile";
import GovtPostMobile from "@/components/mobile/GovtPostMobile";
import { toTitleCase } from "@/lib/text";

const formatDateFromArray = (dates = [], keywords = []) => {
  const lowerKeywords = keywords.map((k) => k.toLowerCase());
  const match = dates.find((entry) => {
    const lower = entry?.toLowerCase?.() || "";
    return lowerKeywords.some((keyword) => lower.includes(keyword));
  });
  if (!match) return null;
  const parts = match.split(/[:|-]/);
  if (parts.length > 1) return parts.slice(1).join("").trim();
  return match;
};

const SectionTitle = ({ title, icon: Icon }) => (
  <div className="flex items-center gap-2 mb-2 pb-1 border-b-2 border-slate-800">
    {Icon && <Icon size={18} className="text-slate-900" />}
    <h2 className="text-base font-bold uppercase tracking-wider text-slate-900">
      {title}
    </h2>
  </div>
);

const KeyValueGrid = ({ label, value }) => (
  <div className="flex flex-col border border-slate-200 p-2 bg-white">
    <span className="text-[10px] font-bold uppercase text-slate-500 mb-1">
      {label}
    </span>
    <span className="text-sm font-semibold text-slate-800 leading-tight">
      {value}
    </span>
  </div>
);

const CompactRow = ({ label, value, bg = "bg-white" }) => (
  <div className={`flex border-b border-slate-200 last:border-0 ${bg}`}>
    <div className="w-1/3 p-2 text-xs font-semibold text-slate-600 border-r border-slate-200 flex items-center bg-slate-50">
      {label}
    </div>
    <div className="w-2/3 p-2 text-sm text-slate-800 font-medium">{value}</div>
  </div>
);

const formatStableDate = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "--/--/----";
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
};

export default function JobDetailView({ data, canonicalPath, sourcePath }) {
  const isMobile = useIsMobile(640);
  const pageTitle = data?.title ? `${data.title} — JobsAddah` : "Job Details";
  const now = new Date();
  const lastUpdatedDisplay = formatStableDate(now);
  const footerYear = now.getUTCFullYear();

  const displayStartDate =
    data?.importantDates?.applicationStartDate ||
    formatDateFromArray(data?.dates, ["begin", "start", "open"]) ||
    "Available Soon";

  const displayEndDate =
    data?.importantDates?.applicationLastDate ||
    formatDateFromArray(data?.dates, ["last date", "end", "close"]) ||
    "Check Notification";

  if (isMobile) {
    return <GovtPostMobile post={data} />;
  }

  return (
    <>
      <SEO
        title={`${pageTitle} | Recruitment 2026`}
        description={data?.shortDescription}
        keywords={`${data?.title}, recruitment`}
        canonical={canonicalPath}
        section="Job Details"
        ogType="article"
        jsonLd={
          generateJobPostingSchema({
            title: data?.title,
            organization: data?.organization,
            description: data?.shortDescription,
            applicationStartDate: data?.importantDates?.applicationStartDate,
            applicationLastDate: data?.importantDates?.applicationLastDate,
            vacancies: data?.totalVacancies,
            link: sourcePath,
          })
        }
      />

      <div className="min-h-screen bg-slate-100 font-sans py-4 md:py-8 text-slate-900">
        <main className="max-w-5xl mx-auto bg-white shadow-lg border border-slate-300 rounded-sm overflow-hidden print:shadow-none print:border-none">
          <header className="bg-slate-900 text-white p-6">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-yellow-400 text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    New
                  </span>
                  <span className="text-slate-300 text-xs font-medium uppercase tracking-wide">
                    {data?.organization}
                  </span>
                </div>
                <h1 className="text-xl md:text-2xl font-bold leading-snug mb-2">
                  {data?.title}
                </h1>
                <div className="flex flex-wrap gap-4 text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} /> {data?.location || "All India"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={14} /> {data?.vacancy?.total} Posts
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> Last Updated: {lastUpdatedDisplay}
                  </span>
                </div>
              </div>
              <div className="hidden md:block">
                <button
                  onClick={() => window.print()}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded transition-colors"
                  title="Print Details"
                >
                  <Printer size={20} />
                </button>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-2 md:grid-cols-4 border-b border-slate-200">
            <KeyValueGrid label="Application Start" value={displayStartDate} />
            <KeyValueGrid label="Last Date" value={displayEndDate} />
            <KeyValueGrid label="Total Vacancy" value={data?.vacancy?.total} />
            <KeyValueGrid label="Official Website" value={data?.website ? "Available" : "N/A"} />
          </div>

          <div className="p-4 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <SectionTitle title="Important Dates" icon={Calendar} />
                <div className="border border-slate-300 rounded-sm text-sm">
                  {data?.dates?.map((dateStr, idx) => {
                    const parts = (dateStr || "").split(":");
                    return (
                      <CompactRow
                        key={idx}
                        label={parts[0] || "Date"}
                        value={parts.slice(1).join(":") || dateStr}
                      />
                    );
                  })}
                </div>
              </div>

              <div>
                <SectionTitle title="Application Fee" icon={CreditCard} />
                <div className="border border-slate-300 rounded-sm text-sm">
                  {data?.fees?.map((item, idx) => {
                    if (item.type === "header" || item.type === "payment") {
                      return (
                        <div
                          key={idx}
                          className="bg-slate-100 p-2 text-xs font-bold text-slate-700 text-center border-b border-slate-200 last:border-0 uppercase"
                        >
                          {item.text}
                        </div>
                      );
                    }
                    const parts = (item.text || "").split(":");
                    return (
                      <CompactRow
                        key={idx}
                        label={parts[0] || "Category"}
                        value={parts.slice(1).join(":") || ""}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <SectionTitle title="Age Limit Details" icon={Clock} />
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-sm flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm">
                <div className="space-y-1">
                  {data?.age?.text?.map((line, i) => (
                    <div key={i} className="flex items-center gap-2 text-blue-900 font-medium">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" /> {line}
                    </div>
                  ))}
                </div>
                {data?.age?.relaxation && (
                  <div className="text-xs text-blue-700 bg-white px-3 py-1 rounded border border-blue-100">
                    <strong>Relaxation:</strong> {data.age.relaxation}
                  </div>
                )}
              </div>
            </div>

            {data?.selection?.length > 0 && (
              <div>
                <SectionTitle title="Selection Process" icon={BookOpen} />
                <div className="border border-slate-300 rounded-sm p-4 bg-white">
                  <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                    {data.selection.map((item, idx) => {
                      const text = typeof item === "object" ? item.text || item.name : item;
                      return <li key={idx}>{text}</li>;
                    })}
                  </ul>
                </div>
              </div>
            )}

            {data?.documentation?.length > 0 && (
              <div>
                <SectionTitle title="Required Documentation" icon={ClipboardList} />
                <div className="border border-slate-300 rounded-sm p-4 bg-white">
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-700">
                    {data.documentation.map((doc, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <FileText size={16} className="text-slate-400 mt-0.5 shrink-0" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div>
              <div className="flex justify-between items-end mb-2 border-b-2 border-slate-800 pb-1">
                <div className="flex items-center gap-2">
                  <Briefcase size={18} />
                  <h2 className="text-base font-bold uppercase tracking-wider text-slate-900">
                    Vacancy Details
                  </h2>
                </div>
                <span className="text-xs font-bold bg-slate-200 px-2 py-1 rounded">
                  Total: {data?.vacancy?.total}
                </span>
              </div>

              <div className="overflow-x-auto border border-slate-300 rounded-sm">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-700 uppercase text-xs">
                    <tr>
                      <th className="border border-slate-300 px-3 py-2">Post Name</th>
                      <th className="border border-slate-300 px-3 py-2 text-center w-24">Total</th>
                      <th className="border border-slate-300 px-3 py-2">Qualification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.vacancy?.positions?.map((pos, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="border border-slate-300 px-3 py-2 font-semibold text-slate-800">
                          {pos.name}
                        </td>
                        <td className="border border-slate-300 px-3 py-2 text-center font-bold text-indigo-700">
                          {pos.count}
                        </td>
                        <td className="border border-slate-300 px-3 py-2 text-slate-600 text-xs">
                          {pos.qualification}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div id="links-area">
              <SectionTitle title="Important Links" icon={Download} />
              <div className="border border-slate-300 rounded-sm overflow-hidden">
                <table className="w-full text-sm border-collapse">
                  <tbody>
                    {data?.links?.map((link, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-slate-300 last:border-0 hover:bg-green-50/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-bold text-slate-700 w-2/3 border-r border-slate-300">
                          {toTitleCase(link.label || "Apply Online")}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <a
                            href={link.url}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-900 font-bold uppercase text-xs"
                            rel="noreferrer"
                          >
                            Click Here <ExternalLink size={14} />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200 text-center">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">
                JobsAddah • Recruitment Services • {footerYear}
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
