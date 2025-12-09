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
  Download,
} from "lucide-react";
import { baseUrl } from "../../util/baseUrl";
import Header from "../components/Header";
import { ErrorScreen, extractRecruitmentData, LoadingSkeleton, VacancyTable } from "./post-helper";

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
  if (!data) return <ErrorScreen error="No data available" navigate={navigate} />;

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
      <Header />

      <main className="container mx-auto px-2 py-6 max-w-5xl">
        <div className="bg-white shadow-sm border border-slate-300 rounded-lg overflow-hidden">
          
          <div className="border-b border-slate-300 p-6 text-center bg-white">
            <div className="inline-block px-3 py-1 mb-3 text-xs font-bold tracking-wider text-blue-700 uppercase bg-blue-50 rounded-full">
              Latest Notification
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight mb-2">
              {data.title}
            </h1>
            {data.organization && (
              <div className="flex items-center justify-center gap-2 text-slate-600 font-medium">
                <Building size={18} />
                <span>{data.organization}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-300 border-b border-slate-300">
            <div>
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-300 flex items-center gap-2">
                <Calendar size={16} className="text-blue-600" />
                <h2 className="font-bold text-sm uppercase text-slate-700">Important Dates</h2>
              </div>
              <div className="p-4">
                <ul className="space-y-2 text-sm">
                  {data.dates.map((date, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <ChevronRight size={16} className="text-slate-400 mt-0.5 shrink-0" />
                      <span className="font-medium text-slate-700">{date}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-300 flex items-center gap-2">
                <CreditCard size={16} className="text-emerald-600" />
                <h2 className="font-bold text-sm uppercase text-slate-700">Application Fee</h2>
              </div>
              <div className="p-4">
                <ul className="space-y-1 text-sm">
                  {data.fees.map((item, idx) => {
                    const text = item.text || item;
                    const isHeader = item.type === "header";
                    const isPayment = item.type === "payment";

                    if (isHeader) {
                      return <li key={idx} className="font-bold text-slate-900 mt-2 mb-1 uppercase text-xs">{text}</li>;
                    }
                    if (isPayment) {
                      return <li key={idx} className="font-semibold text-emerald-700 mt-2 text-xs bg-emerald-50 inline-block px-2 py-1 rounded">{text}</li>;
                    }
                    return (
                      <li key={idx} className="flex items-start gap-2 text-slate-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                        <span>{text}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/50 border-b border-slate-300 p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-2">
                <Clock size={16} className="text-orange-600" />
                Age Limit Criteria
              </h3>
              <ul className="pl-6 list-disc text-sm text-slate-600 space-y-1">
                {data.age.text.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
              {data.age.relaxation && (
                 <p className="text-xs text-slate-500 mt-1 pl-6 italic">Note: {data.age.relaxation}</p>
              )}
            </div>
            <div className="bg-white border border-slate-200 rounded p-3 min-w-[180px] text-center shadow-sm">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Total Vacancy</span>
              <span className="block text-2xl font-black text-blue-600">{data.vacancy.total}</span>
              <span className="text-xs font-medium text-slate-500">Posts</span>
            </div>
          </div>

          {data.vacancy.positions.length > 0 && (
            <div className="border-b border-slate-300">
               <div className="bg-slate-50 px-4 py-2 border-b border-slate-300 font-bold text-sm uppercase text-slate-700">
                 Vacancy Details
               </div>
               <div className="p-0">
                 <VacancyTable positions={data.vacancy.positions} />
               </div>
            </div>
          )}

          {data.eligibility.length > 0 && (
            <div className="border-b border-slate-300">
               <div className="bg-slate-50 px-4 py-2 border-b border-slate-300 font-bold text-sm uppercase text-slate-700 flex items-center gap-2">
                 <BookOpen size={16} className="text-purple-600"/>
                 Eligibility Criteria
               </div>
               <div className="p-4">
                 <ul className="space-y-2 text-sm">
                   {data.eligibility.map((item, idx) => {
                     if (item.type === "header") return <li key={idx} className="font-bold text-purple-700 mt-3 border-b border-purple-100 pb-1">{item.label}</li>;
                     if (item.type === "item") return (
                       <li key={idx} className="pl-4 border-l-2 border-purple-200 py-1">
                         <span className="font-semibold text-slate-800 block">{item.label}</span>
                         <span className="text-slate-600">{item.text}</span>
                       </li>
                     );
                     const text = item.text || item;
                     return (
                       <li key={idx} className="flex items-start gap-2 text-slate-700">
                         <CheckCircle size={14} className="text-purple-500 mt-1 shrink-0" />
                         <span>{text}</span>
                       </li>
                     );
                   })}
                 </ul>
               </div>
            </div>
          )}

          {data.districtData.length > 0 && (
            <div className="border-b border-slate-300">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-300 font-bold text-sm uppercase text-slate-700">
                Region / District Wise Details
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-white text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2 font-semibold border-r border-slate-100">District Name</th>
                      <th className="px-4 py-2 font-semibold text-center border-r border-slate-100">Total</th>
                      <th className="px-4 py-2 font-semibold border-r border-slate-100">Last Date</th>
                      <th className="px-4 py-2 font-semibold text-center">Notification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.districtData.map((district, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-2 font-medium text-slate-700 border-r border-slate-100">{district.districtName}</td>
                        <td className="px-4 py-2 text-center font-bold text-emerald-600 border-r border-slate-100">{district.posts}</td>
                        <td className="px-4 py-2 text-slate-600 border-r border-slate-100">{district.lastDate}</td>
                        <td className="px-4 py-2 text-center">
                          <a href={district.notificationLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-xs font-bold uppercase">
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

          <div className="p-6 bg-slate-50">
            <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
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
                  className="flex items-center justify-between p-3 bg-white border border-slate-300 rounded shadow-sm hover:border-blue-500 hover:shadow-md transition-all group"
                >
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-700">{link.label}</span>
                  <ExternalLink size={14} className="text-slate-400 group-hover:text-blue-600" />
                </a>
              ))}
              {data.website && (
                 <a
                  href={data.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-white border border-slate-300 rounded shadow-sm hover:border-indigo-500 hover:shadow-md transition-all group"
                >
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700">Official Website</span>
                  <ExternalLink size={14} className="text-slate-400 group-hover:text-indigo-600" />
                </a>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default PostDetails;