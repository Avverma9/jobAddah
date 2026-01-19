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
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
  Award,
  GraduationCap,
  IndianRupee,
} from "lucide-react";
import SEO, { generateJobPostingSchema } from "@/lib/SEO";
import useIsMobile from "@/hooks/useIsMobile";
import GovtPostMobile from "@/components/mobile/GovtPostMobile";
import { toTitleCase } from "@/lib/text";
import {
  extractText,
  isLinkClickable,
  getLinkStatusMessage,
  formatPhysicalStandards,
} from "@/lib/post-helper";

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

const SectionTitle = ({ title, icon: Icon, count }) => (
  <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-indigo-600">
    <div className="flex items-center gap-2">
      {Icon && (
        <div className="bg-indigo-100 p-2 rounded-lg">
          <Icon size={20} className="text-indigo-600" />
        </div>
      )}
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
    </div>
    {count !== undefined && (
      <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
        {count}
      </span>
    )}
  </div>
);

const StatCard = ({ label, value, icon: Icon, color = "indigo" }) => {
  const colorClasses = {
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700",
    green: "bg-green-50 border-green-200 text-green-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
  };

  return (
    <div
      className={`border-2 rounded-xl p-4 ${colorClasses[color]} hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon size={18} className="opacity-70" />}
        <span className="text-xs font-semibold uppercase tracking-wide opacity-80">
          {label}
        </span>
      </div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
};

const InfoRow = ({ label, value, highlight = false }) => (
  <div
    className={`flex border-b border-slate-200 last:border-0 ${
      highlight ? "bg-amber-50" : "bg-white hover:bg-slate-50"
    } transition-colors`}
  >
    <div className="w-2/5 p-3 text-sm font-semibold text-slate-600 border-r border-slate-200 flex items-center">
      {label}
    </div>
    <div className="w-3/5 p-3 text-sm text-slate-800 font-medium">{value}</div>
  </div>
);

const Badge = ({ children, variant = "default" }) => {
  const variants = {
    default: "bg-slate-100 text-slate-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    info: "bg-blue-100 text-blue-700",
    danger: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${variants[variant]}`}
    >
      {children}
    </span>
  );
};

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
        jsonLd={generateJobPostingSchema({
          title: data?.title,
          organization: data?.organization,
          description: data?.shortDescription,
          applicationStartDate: data?.importantDates?.applicationStartDate,
          applicationLastDate: data?.importantDates?.applicationLastDate,
          vacancies: data?.totalVacancies,
          link: sourcePath,
        })}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans py-6 md:py-10 text-slate-900">
        <main className="max-w-6xl mx-auto px-4">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-2xl shadow-2xl p-6 md:p-8 mb-6">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge variant="warning">
                    <span className="animate-pulse mr-1">●</span> New
                  </Badge>
                  {data?.advertisementNumber && (
                    <Badge variant="info">
                      Advt: {data.advertisementNumber}
                    </Badge>
                  )}
                  {data?.status && (
                    <Badge variant="success">{data.status}</Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <Building2 size={20} className="text-indigo-200" />
                  <span className="text-indigo-100 text-sm font-medium">
                    {extractText(data?.organization)}
                  </span>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold leading-tight mb-4">
                  {data?.title}
                </h1>

                <div className="flex flex-wrap gap-4 text-sm text-indigo-100">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={16} />
                    {extractText(data?.location) || "All India"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users size={16} />
                    {extractText(data?.vacancy?.total)} Posts
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={16} />
                    Updated: {lastUpdatedDisplay}
                  </span>
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="hidden md:flex bg-white/10 hover:bg-white/20 backdrop-blur text-white p-3 rounded-xl transition-all hover:scale-105"
                title="Print Details"
              >
                <Printer size={22} />
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Application Start"
              value={displayStartDate}
              icon={Calendar}
              color="green"
            />
            <StatCard
              label="Last Date"
              value={displayEndDate}
              icon={AlertCircle}
              color="orange"
            />
            <StatCard
              label="Total Vacancy"
              value={extractText(data?.vacancy?.total)}
              icon={Briefcase}
              color="indigo"
            />
            <StatCard
              label="Website"
              value={data?.website ? "Available" : "N/A"}
              icon={ExternalLink}
              color="blue"
            />
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-8">
            {/* Important Dates & Fee Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Important Dates */}
              <div>
                <SectionTitle
                  title="Important Dates"
                  icon={Calendar}
                  count={data?.dates?.length}
                />
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  {data?.dates?.map((dateStr, idx) => {
                    const parts = (dateStr || "").split(":");
                    return (
                      <InfoRow
                        key={idx}
                        label={parts[0] || "Date"}
                        value={parts.slice(1).join(":") || dateStr}
                        highlight={parts[0]?.toLowerCase().includes("last")}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Application Fee */}
              <div>
                <SectionTitle
                  title="Application Fee"
                  icon={IndianRupee}
                  count={data?.fees?.length}
                />
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  {data?.fees?.map((item, idx) => {
                    if (item.type === "payment") {
                      return (
                        <div
                          key={idx}
                          className="bg-green-50 border-t-2 border-green-200 p-3 text-sm font-semibold text-green-800"
                        >
                          <CreditCard size={16} className="inline mr-2" />
                          {item.text}
                        </div>
                      );
                    }
                    if (item.type === "exemption") {
                      return (
                        <div
                          key={idx}
                          className="bg-blue-50 border-t-2 border-blue-200 p-3 text-sm font-semibold text-blue-800"
                        >
                          <CheckCircle2 size={16} className="inline mr-2" />
                          {item.text}
                        </div>
                      );
                    }
                    const parts = (item.text || "").split(":");
                    return (
                      <InfoRow
                        key={idx}
                        label={parts[0] || "Category"}
                        value={parts.slice(1).join(":") || ""}
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Age Limit */}
            <div>
              <SectionTitle title="Age Limit Details" icon={Clock} />
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 p-5 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {data?.age?.text?.map((line, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 text-slate-800 font-medium bg-white p-3 rounded-lg shadow-sm"
                    >
                      <CheckCircle2 size={18} className="text-blue-600" />
                      {line}
                    </div>
                  ))}
                </div>

                {data?.age?.relaxation && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={18} className="text-amber-600 mt-0.5" />
                      <div>
                        <strong className="text-amber-900 text-sm">
                          Age Relaxation:
                        </strong>
                        <p className="text-sm text-amber-800 mt-1">
                          {extractText(data.age.relaxation)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {data?.age?.categoryWise?.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {data.age.categoryWise.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white border border-slate-200 rounded-lg p-2 text-center"
                      >
                        <div className="text-xs font-semibold text-slate-500">
                          {item.category} ({item.gender})
                        </div>
                        <div className="text-lg font-bold text-indigo-600">
                          {item.age}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Eligibility */}
            {data?.eligibility?.length > 0 && (
              <div>
                <SectionTitle title="Eligibility Criteria" icon={GraduationCap} />
                <div className="border border-slate-200 rounded-xl p-5 bg-slate-50 space-y-3">
                  {data.eligibility.map((item, idx) => {
                    if (item.type === "position") {
                      return (
                        <div
                          key={idx}
                          className="bg-white border border-indigo-200 rounded-lg p-4"
                        >
                          <div className="font-bold text-indigo-700 mb-2 flex items-center gap-2">
                            <Award size={16} />
                            {item.position}
                          </div>
                          <div className="text-sm text-slate-700">{item.text}</div>
                        </div>
                      );
                    }
                    if (item.type === "special") {
                      return (
                        <div
                          key={idx}
                          className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-2"
                        >
                          <AlertCircle size={16} className="text-amber-600 mt-1" />
                          <div className="text-sm text-slate-700">{item.text}</div>
                        </div>
                      );
                    }
                    return (
                      <div
                        key={idx}
                        className="bg-white border border-slate-200 rounded-lg p-4 flex items-start gap-3"
                      >
                        <CheckCircle2
                          size={16}
                          className="text-green-600 mt-1 shrink-0"
                        />
                        <div className="text-sm text-slate-700">
                          {item.label && (
                            <strong className="text-slate-900">
                              {item.label}:{" "}
                            </strong>
                          )}
                          {item.text}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Physical Standards */}
            {data?.physicalStandards &&
              formatPhysicalStandards(data.physicalStandards) && (
                <div>
                  <SectionTitle title="Physical Standards" icon={Users} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formatPhysicalStandards(data.physicalStandards).map(
                      (standard, idx) => (
                        <div
                          key={idx}
                          className="border border-slate-200 rounded-xl overflow-hidden"
                        >
                          <div className="bg-slate-100 px-4 py-2 font-bold text-slate-700">
                            {standard.gender}
                          </div>
                          <div className="p-4 space-y-2">
                            {standard.details.map((detail, i) => (
                              <div
                                key={i}
                                className="flex justify-between items-center text-sm"
                              >
                                <span className="text-slate-600">
                                  {detail.label}
                                </span>
                                <span className="font-semibold text-slate-800">
                                  {detail.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Selection Process */}
            {data?.selection?.length > 0 && (
              <div>
                <SectionTitle
                  title="Selection Process"
                  icon={BookOpen}
                  count={data.selection.length}
                />
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {data.selection.map((item, idx) => {
                      const text =
                        typeof item === "object"
                          ? extractText(item.text || item.name || item)
                          : String(item);
                      return (
                        <div
                          key={idx}
                          className="bg-white border border-green-200 rounded-lg p-3 flex items-center gap-3 hover:shadow-md transition-shadow"
                        >
                          <div className="bg-green-100 text-green-700 font-bold text-sm w-8 h-8 rounded-full flex items-center justify-center shrink-0">
                            {idx + 1}
                          </div>
                          <span className="text-sm font-medium text-slate-700">
                            {text}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Vacancy Details Table */}
            <div>
              <SectionTitle
                title="Vacancy Details"
                icon={Briefcase}
                count={extractText(data?.vacancy?.total)}
              />

              {/* Category-wise breakdown if available */}
              {data?.vacancy?.categoryWise && (
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
                  {Object.entries(data.vacancy.categoryWise).map(
                    ([category, count]) => (
                      <div
                        key={category}
                        className="bg-indigo-50 border border-indigo-200 rounded-lg p-2 text-center"
                      >
                        <div className="text-xs font-semibold text-indigo-600 uppercase">
                          {category}
                        </div>
                        <div className="text-lg font-bold text-indigo-700">
                          {count}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              <div className="overflow-x-auto border-2 border-slate-200 rounded-xl shadow-sm">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700">
                    <tr>
                      <th className="border-b-2 border-slate-300 px-4 py-3 text-left font-bold">
                        #
                      </th>
                      <th className="border-b-2 border-slate-300 px-4 py-3 text-left font-bold">
                        Post Name
                      </th>
                      <th className="border-b-2 border-slate-300 px-4 py-3 text-center font-bold w-24">
                        Posts
                      </th>
                      <th className="border-b-2 border-slate-300 px-4 py-3 text-left font-bold">
                        Qualification
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.vacancy?.positions?.map((pos, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-indigo-50 transition-colors"
                      >
                        <td className="border-b border-slate-200 px-4 py-3 text-slate-500 font-semibold">
                          {idx + 1}
                        </td>
                        <td className="border-b border-slate-200 px-4 py-3 font-semibold text-slate-800">
                          {extractText(pos.name)}
                        </td>
                        <td className="border-b border-slate-200 px-4 py-3 text-center">
                          <span className="inline-block bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded-full">
                            {extractText(pos.count)}
                          </span>
                        </td>
                        <td className="border-b border-slate-200 px-4 py-3 text-slate-600 text-xs">
                          {extractText(pos.qualification)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Documentation */}
            {data?.documentation?.length > 0 && (
              <div>
                <SectionTitle
                  title="Required Documents"
                  icon={ClipboardList}
                  count={data.documentation.length}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.documentation.map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-lg p-3 hover:bg-slate-100 transition-colors"
                    >
                      <FileText size={18} className="text-indigo-600 mt-0.5" />
                      <span className="text-sm text-slate-700">
                        {typeof doc === "string" ? (
                          doc
                        ) : doc && typeof doc === "object" ? (
                          doc.url ? (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline font-medium"
                            >
                              {extractText(doc.name) ||
                                extractText(doc.type) ||
                                "Download"}
                            </a>
                          ) : (
                            extractText(doc.name) ||
                            extractText(doc.type) ||
                            "Document"
                          )
                        ) : (
                          String(doc)
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

       
            {/* Important Links */}
            <div id="links-area">
              <SectionTitle
                title="Important Links"
                icon={Download}
                count={data?.links?.length}
              />
              <div className="space-y-3">
                {data?.links?.map((link, idx) => {
                  const clickable = isLinkClickable(link);
                  const statusMsg = getLinkStatusMessage(link);

                  return (
                    <div
                      key={idx}
                      className={`border-2 rounded-xl overflow-hidden ${
                        clickable
                          ? "border-green-200 bg-gradient-to-r from-green-50 to-emerald-50"
                          : "border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50"
                      }`}
                    >
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`p-2 rounded-lg ${
                              clickable ? "bg-green-100" : "bg-orange-100"
                            }`}
                          >
                            {clickable ? (
                              <CheckCircle2
                                size={20}
                                className="text-green-600"
                              />
                            ) : (
                              <AlertCircle
                                size={20}
                                className="text-orange-600"
                              />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">
                              {toTitleCase(link.label || "Apply Online")}
                            </div>
                            {statusMsg && (
                              <div className="text-xs text-orange-600 italic mt-1">
                                {statusMsg}
                              </div>
                            )}
                          </div>
                        </div>

                        {clickable ? (
                          <a
                            href={link.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-lg transition-all hover:scale-105 shadow-md"
                          >
                            Click Here
                            <ExternalLink size={16} />
                          </a>
                        ) : (
                          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 font-bold px-6 py-3 rounded-lg">
                            Coming Soon
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Notes */}
            {(data?.noteToCandidates || data?.confirmationAdvice) && (
              <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle size={24} className="text-amber-600 shrink-0" />
                  <div className="space-y-2">
                    {data.noteToCandidates && (
                      <div>
                        <strong className="text-amber-900 text-sm">
                          Important Note:
                        </strong>
                        <p className="text-sm text-amber-800 mt-1">
                          {data.noteToCandidates}
                        </p>
                      </div>
                    )}
                    {data.confirmationAdvice && (
                      <div>
                        <strong className="text-amber-900 text-sm">
                          Advisory:
                        </strong>
                        <p className="text-sm text-amber-800 mt-1">
                          {data.confirmationAdvice}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="inline-block bg-white rounded-xl shadow-md px-6 py-4">
              <p className="text-xs text-slate-500 font-medium">
                JobsAddah • Recruitment Services • {footerYear}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                For latest updates, visit official website
              </p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
