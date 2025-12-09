import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Share2,
  Printer,
  Calendar,
  CreditCard,
  Users,
  ExternalLink,
  ChevronRight,
  FileText,
  Award,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Clock,
  Building,
  Briefcase,
  Circle,
} from "lucide-react";
import { baseUrl } from "../../util/baseUrl";
import Header from "../components/Header";
import { ErrorScreen, extractRecruitmentData, LoadingSkeleton, VacancyTable } from "./post-helper";

const useQuery = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
};


// ==================== MAIN COMPONENT ====================
const PostDetails = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const query = useQuery();
  const navigate = useNavigate();

  const paramUrl = query.get("url");
  const paramId = query.get("id") || query.get("_id");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      let fetchUrl = "";

      if (paramUrl) {
        fetchUrl = `${baseUrl}/get-post/details?url=${paramUrl}`;
      } else if (paramId) {
        if (paramId.includes("http")) {
          fetchUrl = `${baseUrl}/get-post/details?url=${paramId}`;
        } else {
          fetchUrl = `${baseUrl}/get-job/${paramId}`;
        }
      } else {
        setError("Invalid parameters");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(fetchUrl);
        if (!response.ok) throw new Error("Failed to fetch data");

        const result = await response.json();
        const validData = result.job || result.data || result;

        if (validData) {
          const extracted = extractRecruitmentData(validData);
          setData(extracted);
        } else {
          throw new Error("No data found");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [paramUrl, paramId]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorScreen error={error} navigate={navigate} />;
  if (!data)
    return <ErrorScreen error="No data available" navigate={navigate} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
      <Header />


      <main className="container mx-auto px-4 py-10 max-w-7xl space-y-8">
        {/* Title Section */}
        <div className="text-center space-y-5 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
            <FileText size={16} />
            Latest Notification
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-blue-900 to-slate-800 uppercase leading-tight tracking-tight px-4">
            {data.title}
          </h1>
          {data.organization && (
            <div className="flex items-center justify-center gap-2 text-slate-600 text-base md:text-lg">
              <Building size={20} className="shrink-0" />
              <span className="font-semibold text-center">
                {data.organization}
              </span>
            </div>
          )}
          <div className="h-1.5 w-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mx-auto rounded-full shadow-md"></div>
        </div>

        {/* Important Dates & Application Fee */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
          {/* Important Dates */}
          {data.dates.length > 0 && (
            <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200">
              <div className="bg-gradient-to-r from-rose-600 to-pink-600 text-white px-6 py-4 flex items-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Calendar size={22} />
                </div>
                <h2 className="font-bold text-xl uppercase tracking-wide">
                  Important Dates
                </h2>
              </div>
              <div className="p-6 md:p-8">
                <ul className="space-y-4">
                  {data.dates.map((date, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-base font-medium text-slate-700 group"
                    >
                      <Clock
                        size={18}
                        className="text-rose-500 shrink-0 mt-1 group-hover:scale-110 transition-transform"
                      />
                      <span className="leading-relaxed">{date}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Application Fee */}
          {data.fees.length > 0 && (
            <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-4 flex items-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <CreditCard size={22} />
                </div>
                <h2 className="font-bold text-xl uppercase tracking-wide">
                  Application Fee
                </h2>
              </div>
              <div className="p-6 md:p-8">
                <ul className="space-y-3">
                  {data.fees.map((item, idx) => {
                    const text = item.text || item;
                    const isHeader = item.type === "header";
                    const isInfo = item.type === "info";
                    const isPayment = item.type === "payment";
                    const isItem = item.type === "item";

                    if (isHeader) {
                      return (
                        <li
                          key={idx}
                          className="font-bold text-slate-900 mt-5 first:mt-0 mb-2 text-base border-b-2 border-slate-200 pb-2"
                        >
                          {text}
                        </li>
                      );
                    }

                    if (isItem) {
                      return (
                        <li
                          key={idx}
                          className="flex items-start gap-3 text-sm text-slate-700 pl-3"
                        >
                          <Circle
                            size={8}
                            className="text-emerald-500 fill-emerald-500 shrink-0 mt-2"
                          />
                          <span className="leading-relaxed font-medium">
                            {text}
                          </span>
                        </li>
                      );
                    }

                    if (isInfo) {
                      return (
                        <li
                          key={idx}
                          className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded text-sm text-slate-700 leading-relaxed mt-4"
                        >
                          <span className="font-semibold text-blue-700">
                            ℹ️ Note:{" "}
                          </span>
                          {text}
                        </li>
                      );
                    }

                    if (isPayment) {
                      return (
                        <li
                          key={idx}
                          className="mt-4 pt-4 border-t-2 border-slate-200 font-semibold text-emerald-700 text-sm"
                        >
                          {text}
                        </li>
                      );
                    }

                    return (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-base text-slate-700"
                      >
                        <CheckCircle
                          size={18}
                          className="text-emerald-500 shrink-0 mt-1"
                        />
                        <span className="leading-relaxed font-medium">
                          {text}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>
        {/* Important Links */}
        {data.links.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 animate-in fade-in slide-in-from-bottom-9 duration-700">
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white px-6 py-4 flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <ExternalLink size={22} />
              </div>
              <h2 className="font-bold text-xl uppercase tracking-wide">
                Important Links
              </h2>
            </div>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200 hover:border-violet-400 hover:shadow-lg transition-all group"
                  >
                    <span className="text-slate-700 font-medium text-sm group-hover:text-violet-700 transition-colors">
                      {link.label}
                    </span>
                    <ChevronRight
                      size={20}
                      className="text-violet-600 group-hover:translate-x-1 transition-transform"
                    />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Age Limit & Total Vacancy */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
          {/* Age Limit */}
          {data.age.text.length > 0 && (
            <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200">
              <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-4 flex items-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Users size={22} />
                </div>
                <h2 className="font-bold text-xl uppercase tracking-wide">
                  Age Limit
                </h2>
              </div>
              <div className="p-6 md:p-8">
                <ul className="space-y-4">
                  {data.age.text.map((line, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-base font-semibold text-slate-800"
                    >
                      <CheckCircle
                        size={20}
                        className="text-amber-600 shrink-0 mt-0.5"
                      />
                      <span className="leading-relaxed">{line}</span>
                    </li>
                  ))}
                </ul>
                {data.age.relaxation && (
                  <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-lg">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      <span className="font-bold text-amber-700">
                        📌 Note:{" "}
                      </span>
                      {data.age.relaxation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Total Vacancy Card */}
          <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-center py-4 font-bold text-xl uppercase tracking-wider">
              Total Vacancies
            </div>
            <div className="flex flex-col items-center justify-center p-10 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 min-h-[240px]">
              <Award size={48} className="text-indigo-600 mb-4" />
              <span className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 tracking-tight">
                {data.vacancy.total}
              </span>
              {data.vacancy.total !== "See Notification" &&
                data.vacancy.total !== "Not Available" && (
                  <span className="text-indigo-600 font-bold uppercase text-sm mt-3 tracking-widest">
                    Posts
                  </span>
                )}
            </div>
          </div>
        </div>

        {/* Vacancy Table */}
        {data.vacancy.positions.length > 0 && (
          <VacancyTable positions={data.vacancy.positions} />
        )}

        {/* Eligibility Criteria */}
        {data.eligibility.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 animate-in fade-in slide-in-from-bottom-7 duration-700">
            <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white px-6 py-4 flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <BookOpen size={22} />
              </div>
              <h2 className="font-bold text-xl uppercase tracking-wide">
                Eligibility Criteria
              </h2>
            </div>
            <div className="p-6 md:p-8">
              <ul className="space-y-4">
                {data.eligibility.map((item, idx) => {
                  // Simple text item
                  if (item.type === "text" || typeof item === "string") {
                    const text = item.text || item;
                    return (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-base text-slate-700"
                      >
                        <CheckCircle
                          size={18}
                          className="text-purple-500 shrink-0 mt-1"
                        />
                        <span className="leading-relaxed">{text}</span>
                      </li>
                    );
                  }

                  // Header item (for grouped eligibility)
                  if (item.type === "header") {
                    return (
                      <li
                        key={idx}
                        className="font-bold text-lg text-purple-700 mt-6 first:mt-0 mb-2 border-b-2 border-purple-200 pb-2"
                      >
                        {item.label}
                      </li>
                    );
                  }

                  // List item under header
                  if (item.type === "listItem") {
                    return (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-sm text-slate-700 pl-6"
                      >
                        <Circle
                          size={8}
                          className="text-purple-400 fill-purple-400 shrink-0 mt-2"
                        />
                        <span className="leading-relaxed">{item.text}</span>
                      </li>
                    );
                  }

                  // Item with label
                  if (item.type === "item") {
                    return (
                      <li
                        key={idx}
                        className="border-l-4 border-purple-200 pl-4 py-2"
                      >
                        <div className="font-bold text-purple-700 text-sm mb-1">
                          {item.label}
                        </div>
                        <div className="text-slate-700 text-sm leading-relaxed">
                          {item.text}
                        </div>
                      </li>
                    );
                  }

                  // Info box
                  if (item.type === "info") {
                    return (
                      <li
                        key={idx}
                        className="p-4 bg-purple-50 border-l-4 border-purple-500 rounded-lg text-sm text-slate-700 leading-relaxed mt-4"
                      >
                        <span className="font-semibold text-purple-700">
                          📌 Note:{" "}
                        </span>
                        {item.text}
                      </li>
                    );
                  }

                  return null;
                })}
              </ul>
            </div>
          </div>
        )}

        {/* Selection Process */}
        {data.selection.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-4 flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <Briefcase size={22} />
              </div>
              <h2 className="font-bold text-xl uppercase tracking-wide">
                Selection Process
              </h2>
            </div>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.selection.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border border-cyan-200 hover:shadow-md transition-all"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <span className="text-slate-700 font-medium text-sm">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* District Wise Data */}
        {data.districtData.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-slate-200 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                <Building size={22} />
              </div>
              <h2 className="font-bold text-xl uppercase tracking-wide">
                District Wise Vacancy
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-slate-700 uppercase">
                      District Name
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-slate-700 uppercase">
                      Posts
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-slate-700 uppercase">
                      Last Date
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-slate-700 uppercase">
                      Notification
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.districtData.map((district, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-green-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-slate-800">
                        {district.districtName}
                      </td>
                      <td className="px-4 py-3 text-sm text-center font-bold text-green-600">
                        {district.posts}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-slate-700">
                        {district.lastDate}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <a
                          href={district.notificationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs font-semibold rounded-lg hover:bg-green-700 transition-all"
                        >
                          View <ExternalLink size={12} />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Official Website Link */}
        {data.website && (
          <div className="text-center pb-8">
            <a
              href={data.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:scale-105 transition-all"
            >
              <ExternalLink size={20} />
              Visit Official Website
            </a>
          </div>
        )}
      </main>
    </div>
  );
};

export default PostDetails;
