import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Calendar,
  CreditCard,
  ExternalLink,
  ChevronRight,
  BookOpen,
  CheckCircle,
  Clock,
  Building,
  Download,
} from "lucide-react";
import { baseUrl } from "../../util/baseUrl";
import Header from "../components/Header";
import {
  ErrorScreen,
  extractRecruitmentData,
  LoadingSkeleton,
  VacancyTable,
} from "./post-helper";
import { decryptResponse } from "../../util/encode-decode"; // ✅ ADDED
import AdContainer from "../components/ads/AdContainer";
import { useGlobalLoader } from "../components/GlobalLoader";

// ✅ Common handler: encrypted OR normal JSON
const parseApiResponse = async (res) => {
  const json = await res.json();
  if (json && json.iv && json.data) return decryptResponse(json);
  return json;
};

const useQuery = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
};

const PostDetails = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const query = useQuery();
  const navigate = useNavigate();
  const { withLoader } = useGlobalLoader();

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
          fetchUrl = `${baseUrl}/get-post/details?url=${paramId}`;
        }
      } else {
        setError("Invalid parameters");
        setLoading(false);
        return;
      }

      try {
        await withLoader(async () => {
          const response = await fetch(fetchUrl);
          if (!response.ok) throw new Error("Failed to fetch data");

          // ✅ encrypted → decrypt | normal → return
          const result = await parseApiResponse(response);

          const validData = result?.data || result?.job || result;

          if (validData) {
            const extracted = extractRecruitmentData(validData);
            setData(extracted);
          } else {
            throw new Error("No data found");
          }
        }, "Loading job details...", 50);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [paramUrl, paramId, withLoader]);

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorScreen error={error} navigate={navigate} />;
  if (!data)
    return <ErrorScreen error="No data available" navigate={navigate} />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100">
      <Header />

      <main className="container mx-auto px-2 py-6 max-w-5xl">
        {/* Top Banner Ad */}
        <AdContainer 
          placement="banner" 
          pageType="jobDetail"
          format="horizontal"
          className="mb-6"
        />
        
        <div className="bg-white dark:bg-gray-900 shadow-sm border border-slate-300 dark:border-gray-700 rounded-lg overflow-hidden">
          {/* Header section */}
          <div className="border-b border-slate-300 dark:border-gray-700 p-6 text-center bg-white dark:bg-gray-900">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-gray-100 leading-tight mb-2">
              {data.title}
            </h1>
            {data.organization && (
              <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-gray-300 font-medium">
                <Building size={18} />
                <span>{data.organization}</span>
              </div>
            )}
          </div>

          {/* In-Article Ad after title */}
          <AdContainer 
            placement="inArticle" 
            pageType="jobDetail"
            format="fluid"
            className="my-6"
          />

          {/* Dates + Fee */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-300 dark:divide-gray-700 border-b border-slate-300 dark:border-gray-700">
            {/* Dates */}
            <div>
              <div className="bg-slate-50 dark:bg-gray-800 px-4 py-2 border-b border-slate-300 dark:border-gray-700 flex items-center gap-2">
                <Calendar size={16} className="text-blue-600" />
                <h2 className="font-bold text-sm uppercase text-slate-700 dark:text-gray-100">
                  Important Dates
                </h2>
              </div>
              <div className="p-4">
                <ul className="space-y-2 text-sm">
                  {data.dates.map((date, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-slate-800 dark:text-gray-200"
                    >
                      <ChevronRight
                        size={16}
                        className="text-slate-400 dark:text-gray-500 mt-0.5 shrink-0"
                      />
                      <span className="font-medium">{date}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Fee */}
            <div>
              <div className="bg-slate-50 dark:bg-gray-800 px-4 py-2 border-b border-slate-300 dark:border-gray-700 flex items-center gap-2">
                <CreditCard size={16} className="text-emerald-600" />
                <h2 className="font-bold text-sm uppercase text-slate-700 dark:text-gray-100">
                  Application Fee
                </h2>
              </div>
              <div className="p-4">
                <ul className="space-y-1 text-sm">
                  {data.fees.map((item, idx) => {
                    const text = item.text || item;
                    const isHeader = item.type === "header";
                    const isPayment = item.type === "payment";

                    if (isHeader) {
                      return (
                        <li
                          key={idx}
                          className="font-bold text-slate-900 dark:text-gray-100 mt-2 mb-1 uppercase text-xs"
                        >
                          {text}
                        </li>
                      );
                    }
                    if (isPayment) {
                      return (
                        <li
                          key={idx}
                          className="font-semibold text-emerald-700 dark:text-emerald-300 mt-2 text-xs bg-emerald-50 dark:bg-emerald-900/30 inline-block px-2 py-1 rounded"
                        >
                          {text}
                        </li>
                      );
                    }
                    return (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-slate-600 dark:text-gray-300"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-gray-500 mt-1.5 shrink-0" />
                        <span>{text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          {/* Age + Total vacancy */}
          <div className="bg-blue-50/50 dark:bg-blue-950/30 border-b border-slate-300 dark:border-gray-700 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 dark:text-gray-100 text-sm flex items-center gap-2 mb-2">
                <Clock size={16} className="text-orange-600" />
                Age Limit Criteria
              </h3>
              <ul className="pl-6 list-disc text-sm text-slate-600 dark:text-gray-300 space-y-1">
                {data.age.text.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
              {data.age.relaxation && (
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 pl-6 italic">
                  Note: {data.age.relaxation}
                </p>
              )}
            </div>
            <div className="bg-white dark:bg-gray-900 border border-slate-200 dark:border-gray-700 rounded p-3 min-w-[180px] text-center shadow-sm">
              <span className="block text-xs font-bold text-slate-400 dark:text-gray-400 uppercase tracking-wider">
                Total Vacancy
              </span>
              <span className="block text-2xl font-black text-blue-600 dark:text-blue-400">
                {data.vacancy.total}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-gray-400">
                Posts
              </span>
            </div>
          </div>

          {/* Vacancy details (single section) */}
          {data.vacancy.positions.length > 0 && (
            <div className="border-b border-slate-300 dark:border-gray-700">
              <div className="bg-slate-50 dark:bg-gray-800 px-4 py-2 border-b border-slate-300 dark:border-gray-700 font-bold text-sm uppercase text-slate-700 dark:text-gray-100">
                Vacancy Details
              </div>
              <div className="p-0">
                <VacancyTable positions={data.vacancy.positions} />
              </div>
            </div>
          )}

          {/* Rectangle Ad after vacancy details */}
          <AdContainer 
            placement="rectangle" 
            pageType="jobDetail"
            format="rectangle"
            className="my-6"
          />

          {/* Eligibility */}
          {data.eligibility.length > 0 && (
            <div className="border-b border-slate-300 dark:border-gray-700">
              <div className="bg-slate-50 dark:bg-gray-800 px-4 py-2 border-b border-slate-300 dark:border-gray-700 font-bold text-sm uppercase text-slate-700 dark:text-gray-100 flex items-center gap-2">
                <BookOpen size={16} className="text-purple-600" />
                Eligibility Criteria
              </div>
              <div className="p-4">
                <ul className="space-y-2 text-sm">
                  {data.eligibility.map((item, idx) => {
                    if (item.type === "header")
                      return (
                        <li
                          key={idx}
                          className="font-bold text-purple-700 dark:text-purple-300 mt-3 border-b border-purple-100 dark:border-purple-900/40 pb-1"
                        >
                          {item.label}
                        </li>
                      );
                    if (item.type === "item")
                      return (
                        <li
                          key={idx}
                          className="pl-4 border-l-2 border-purple-200 dark:border-purple-800 py-1"
                        >
                          <span className="font-semibold text-slate-800 dark:text-gray-100 block">
                            {item.label}
                          </span>
                          <span className="text-slate-600 dark:text-gray-300">
                            {item.text}
                          </span>
                        </li>
                      );
                    const text = item.text || item;
                    return (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-slate-700 dark:text-gray-200"
                      >
                        <CheckCircle
                          size={14}
                          className="text-purple-500 mt-1 shrink-0"
                        />
                        <span>{text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}

          {/* District wise */}
          {data.districtData.length > 0 && (
            <div className="border-b border-slate-300 dark:border-gray-700">
              <div className="bg-slate-50 dark:bg-gray-800 px-4 py-2 border-b border-slate-300 dark:border-gray-700 font-bold text-sm uppercase text-slate-700 dark:text-gray-100">
                Region / District Wise Details
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left bg-white dark:bg-gray-900">
                  <thead className="bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-300 border-b border-slate-200 dark:border-gray-700">
                    <tr>
                      <th className="px-4 py-2 font-semibold border-r border-slate-100 dark:border-gray-800">
                        District Name
                      </th>
                      <th className="px-4 py-2 font-semibold text-center border-r border-slate-100 dark:border-gray-800">
                        Total
                      </th>
                      <th className="px-4 py-2 font-semibold border-r border-slate-100 dark:border-gray-800">
                        Last Date
                      </th>
                      <th className="px-4 py-2 font-semibold text-center">
                        Notification
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-gray-800">
                    {data.districtData.map((district, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50 dark:hover:bg-gray-800"
                      >
                        <td className="px-4 py-2 font-medium text-slate-700 dark:text-gray-200 border-r border-slate-100 dark:border-gray-800">
                          {district.districtName}
                        </td>
                        <td className="px-4 py-2 text-center font-bold text-emerald-600 dark:text-emerald-400 border-r border-slate-100 dark:border-gray-800">
                          {district.posts}
                        </td>
                        <td className="px-4 py-2 text-slate-600 dark:text-gray-300 border-r border-slate-100 dark:border-gray-800">
                          {district.lastDate}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <a
                            href={district.notificationLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-bold uppercase"
                          >
                            View PDF
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Important links */}
          <div className="p-6 bg-slate-50 dark:bg-gray-900">
            <h3 className="font-bold text-slate-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <Download size={18} className="text-blue-600" />
              Important Links
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.links.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded shadow-sm hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all group"
                >
                  <span className="text-sm font-semibold text-slate-700 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                    {link.label}
                  </span>
                  <ExternalLink
                    size={14}
                    className="text-slate-400 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-300"
                  />
                </a>
              ))}
              {data.website && (
                <a
                  href={data.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 border border-slate-300 dark:border-gray-700 rounded shadow-sm hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-md transition-all group"
                >
                  <span className="text-sm font-semibold text-slate-700 dark:text-gray-100 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                    Official Website
                  </span>
                  <ExternalLink
                    size={14}
                    className="text-slate-400 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300"
                  />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Rectangle Ad */}
        <AdContainer 
          placement="rectangle" 
          pageType="jobDetail"
          format="rectangle"
          className="mt-6"
        />
      </main>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default PostDetails;
