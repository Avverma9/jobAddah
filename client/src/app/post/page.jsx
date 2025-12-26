"use client";
import axios from "axios";
import {
  BookOpen,
  Building,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  ExternalLink,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ErrorScreen,
  LoadingSkeleton,
  VacancyTable,
  extractRecruitmentData,
} from "../../lib/post-helper";
import MobileLayout from "../../components/layout/MobileLayout";
import GovtPostMobile from "../../components/mobile/GovtPostMobile";
import useIsMobile from "../../hooks/useIsMobile";
import SEO, { generateJobPostingSchema } from "../../lib/SEO";
import { toTitleCase } from "../../lib/text";
import Head from "next/head";

const JobDetailPage = ({ urlParam: forwardedUrl = "", params = {} }) => {
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Loading...");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const isMobile = useIsMobile(640);
  const [hydrated, setHydrated] = useState(false);
  const fallbackAttemptedRef = useRef(false);
const api = process.env.NEXT_PUBLIC_API_URL 
  useEffect(() => setHydrated(true), []);

  // mounted guard to avoid running client-only logic during SSR
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // read client-side query param when available
  const searchParams = useSearchParams();
  const searchUrl = searchParams ? searchParams.get("url") || "" : "";

  const goBack = () => {
    if (typeof window !== "undefined") window.history.back();
  };

  const paramUrl = forwardedUrl || params?.url || searchUrl || "";
  const paramId = params?._id || params?.id || "";

  // Clean URL logic
  const cleanedParamUrl =
    typeof paramUrl === "string"
      ? paramUrl.split("&")[0].split("?")[0]
      : paramUrl;

  const triggerScraper = async (urlParam) => {
    try {
      console.log("🔄 Triggering scraper for URL:", urlParam);
      const response = await axios.post(`${api}/scrapper/scrape-complete`, {
        url: urlParam,
      });

      const status = response?.status || response?.statusCode || 200;
      return { success: status === 200 || status === 201, status };
    } catch (error) {
      console.error("❌ Scraper failed:", error);
      return { success: false, status: error?.response?.status || 500 };
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setLoadingMessage("Loading...");
      setError(null);

      if (!paramUrl && !paramId) {
        setError("Invalid parameters");
        setLoading(false);
        return;
      }

      const raw = paramUrl || paramId;
      const urlParam =
        typeof raw === "string" ? raw.split("&")[0].split("?")[0] : raw;

      const fetchFromPrimaryAPI = async () => {
        try {
          // Primary API call only
          const response = await axios.get(
            `/api/gov/post?url=${encodeURIComponent(urlParam)}`
          );
          const payload =
            response?.data || response?.job || response;
          return {
            payload,
            status: response?.status || response?.statusCode || 200,
          };
        } catch (error) {
          if (error?.response?.status === 404) {
            return { payload: null, status: 404 };
          }
          throw error;
        }
      };

      try {
        // Fetch data strictly from Primary API
        fallbackAttemptedRef.current = false;
        let { payload: validData, status } = await fetchFromPrimaryAPI();

        const isEmptyObject =
          validData &&
          typeof validData === "object" &&
          Object.keys(validData).length === 0;

        if ((!validData || isEmptyObject) && status === 404) {
          if (!fallbackAttemptedRef.current) {
            fallbackAttemptedRef.current = true;
            setLoadingMessage("We are fetching the latest data...");
            const { success, status: scraperStatus } = await triggerScraper(
              urlParam
            );

            if (!success) {
              throw new Error(
                `Failed to refresh data (status ${scraperStatus || "unknown"})`
              );
            }

            ({ payload: validData, status } = await fetchFromPrimaryAPI());
          }
        }

        if (
          !validData ||
          (typeof validData === "object" && Object.keys(validData).length === 0)
        ) {
          throw new Error(
            status === 404
              ? "No data found for the provided post"
              : "No valid data received from server"
          );
        }

        const extracted = extractRecruitmentData(
          validData?.data || validData || {}
        );

        setData(extracted);
      } catch (err) {
        console.error("Error loading post:", err);
        setError(err.message || "Failed to load post details");
      } finally {
        setLoading(false);
      }
    };

    if (!mounted) return;
    fetchData();
  }, [mounted, paramUrl, paramId]);

  // Render a consistent server-friendly loading state to avoid
  // hydration mismatches caused by client-only layout components
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg" />
            <h1 className="text-xl font-bold tracking-tight text-blue-900">
              {loadingMessage}
            </h1>
          </div>
          <div className="flex gap-3" />
        </header>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error) {
    // Use consistent server-rendered error layout to avoid hydration drift
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-red-500 text-white p-1.5 rounded-lg" />
            <h1 className="text-xl font-bold tracking-tight text-blue-900">Error</h1>
          </div>
        </header>
        <ErrorScreen error={error} navigate={goBack} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-400 text-white p-1.5 rounded-lg" />
            <h1 className="text-xl font-bold tracking-tight text-blue-900">Not Found</h1>
          </div>
        </header>
        <ErrorScreen error="No data available" navigate={goBack} />
      </div>
    );
  }

  const pageTitle = data?.title ? `${data.title} — JobsAddah` : "Job Details";

  const PostContent = () => (
    <>
      <SEO
        title={`${pageTitle} | Recruitment 2025 - JobsAddah`}
        description={`${data.title} Recruitment 2025 - Check eligibility, vacancy details, important dates, application process. Apply online for ${data.organization || "government job"} vacancy at JobsAddah.`}
        keywords={`${data.title}, ${data.organization || "government job"} recruitment 2025, vacancy, online form, admit card, result, eligibility, apply online, sarkari naukri`}
        canonical={`/post?${cleanedParamUrl ? `url=${encodeURIComponent(cleanedParamUrl)}` : `id=${encodeURIComponent(paramId || "")}`}`}
        section="Job Details"
        ogType="article"
        ogImage={`https://og-image.vercel.app/${encodeURIComponent(data.title)}.png?theme=light&md=0&fontSize=64px&images=https://jobsaddah.com/logo.png`}
        jsonLd={generateJobPostingSchema({
          title: data.title,
          organization: data.organization,
          description: data.shortDescription || `Apply for ${data.title} recruitment`,
          applicationStartDate: data.importantDates?.applicationStartDate,
          applicationLastDate: data.importantDates?.applicationLastDate,
          vacancies: data.totalVacancies,
          salary: data.salary,
          location: data.location || "India",
          qualification: data.qualification,
          link: cleanedParamUrl || paramId,
        })}
      />

      <main
        className={`container mx-auto px-2 py-6 max-w-5xl md:scroll-pt-20 ${
          hydrated && isMobile ? "pb-24" : ""
        }`}
      >
        <div className="flex justify-center my-4">
          <div className="md:hidden">
            {/* Ad removed */}
          </div>
          <div className="hidden md:flex">
            {/* Ad removed */}
          </div>
        </div>

        <div className="bg-white shadow-sm border border-slate-300 rounded-lg overflow-hidden">
          <div className="border-b border-slate-300 p-6 text-center bg-white">
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
                <h2 className="font-bold text-sm uppercase text-slate-700">
                  Important Dates
                </h2>
              </div>
              <div className="p-4">
                <ul className="space-y-2 text-sm">
                  {data.dates.map((date, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-slate-800">
                      <ChevronRight size={16} className="text-slate-400 mt-0.5 shrink-0" />
                      <span className="font-medium">{date}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-300 flex items-center gap-2">
                <CreditCard size={16} className="text-emerald-600" />
                <h2 className="font-bold text-sm uppercase text-slate-700">
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
                        <li key={idx} className="font-bold text-slate-900 mt-2 mb-1 uppercase text-xs">
                          {text}
                        </li>
                      );
                    }
                    if (isPayment) {
                      return (
                        <li key={idx} className="font-semibold text-emerald-700 mt-2 text-xs bg-emerald-50 inline-block px-2 py-1 rounded">
                          {text}
                        </li>
                      );
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
                <p className="text-xs text-slate-500 mt-1 pl-6 italic">
                  Note: {data.age.relaxation}
                </p>
              )}
            </div>
            <div className="bg-white border border-slate-200 rounded p-3 min-w-45 text-center shadow-sm">
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Vacancy
              </span>
              <span className="block text-2xl font-black text-blue-600">
                {data.vacancy.total}
              </span>
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
                <BookOpen size={16} className="text-purple-600" />
                Eligibility Criteria
              </div>
              <div className="p-4">
                <ul className="space-y-2 text-sm">
                  {data.eligibility.map((item, idx) => {
                    if (item.type === "header") {
                      return (
                        <li key={idx} className="font-bold text-purple-700 mt-3 border-b border-purple-100 pb-1">
                          {item.label || item.text || ""}
                        </li>
                      );
                    }
                    if (item.type === "item") {
                      return (
                        <li key={idx} className="pl-4 border-l-2 border-purple-200 py-1">
                          {item.label && (
                            <span className="font-semibold text-slate-800 block">
                              {item.label}
                            </span>
                          )}
                          <span className="text-slate-600">
                            {typeof item.text === "object" && item.text !== null
                              ? JSON.stringify(item.text)
                              : item.text || ""}
                          </span>
                        </li>
                      );
                    }
                    if (item.type === "text") {
                      return (
                        <li key={idx} className="text-slate-700">
                          {typeof item.text === "object" && item.text !== null
                            ? JSON.stringify(item.text)
                            : item.text || ""}
                        </li>
                      );
                    }
                    if (item.type === "listItem") {
                      return (
                        <li key={idx} className="flex items-start gap-2 text-slate-700">
                          <CheckCircle size={14} className="text-purple-500 mt-1 shrink-0" />
                          <span>
                            {typeof item.text === "object" && item.text !== null
                              ? JSON.stringify(item.text)
                              : item.text || ""}
                          </span>
                        </li>
                      );
                    }
                    if (item.type === "info") {
                      return (
                        <li key={idx} className="text-xs text-slate-500 italic">
                          {typeof item.text === "object" && item.text !== null
                            ? JSON.stringify(item.text)
                            : item.text || ""}
                        </li>
                      );
                    }
                    let text = item.text || item;
                    if (typeof text === "object" && text !== null) {
                      text = text.name || text.criteria || text.text || JSON.stringify(text);
                    }
                    return (
                      <li key={idx} className="flex items-start gap-2 text-slate-700">
                        <CheckCircle size={14} className="text-purple-500 mt-1 shrink-0" />
                        <span>{String(text || "")}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}

          {data.selection && data.selection.length > 0 && (
            <div className="border-b border-slate-300">
              <div className="bg-slate-50 px-4 py-2 border-b border-slate-300 font-bold text-sm uppercase text-slate-700 flex items-center gap-2">
                <BookOpen size={16} className="text-purple-600" />
                Selection Process
              </div>
              <div className="p-4">
                <ul className="space-y-2 text-sm list-disc pl-6">
                  {data.selection.map((item, idx) => {
                    let text = item;
                    if (typeof item === "object" && item !== null) {
                      text = item.text || item.name || item.label || JSON.stringify(item);
                    }
                    return (
                      <li key={idx} className="text-slate-700">
                        {String(text || "")}
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
                <table className="w-full text-sm text-left bg-white">
                  <thead className="bg-slate-100 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2 font-semibold border-r border-slate-100">
                        District Name
                      </th>
                      <th className="px-4 py-2 font-semibold text-center border-r border-slate-100">
                        Total
                      </th>
                      <th className="px-4 py-2 font-semibold border-r border-slate-100">
                        Last Date
                      </th>
                      <th className="px-4 py-2 font-semibold text-center">
                        Notification
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.districtData.map((district, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="px-4 py-2 font-medium text-slate-700 border-r border-slate-100">
                          {district.districtName}
                        </td>
                        <td className="px-4 py-2 text-center font-bold text-emerald-600 border-r border-slate-100">
                          {district.posts}
                        </td>
                        <td className="px-4 py-2 text-slate-600 border-r border-slate-100">
                          {district.lastDate}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <a
                            href={district.notificationLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline text-xs font-bold uppercase"
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
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-blue-700">
                    {toTitleCase(link.label || "")}
                  </span>
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
                  <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700">
                    Official Website
                  </span>
                  <ExternalLink size={14} className="text-slate-400 group-hover:text-indigo-600" />
                </a>
              )}
            </div>
          </div>
        </div>

      </main>
    </>
  );

  if (isMobile) {
    return <GovtPostMobile post={data} />;
  }

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <div className=" bg-gray-50 font-sans text-gray-900">
        <PostContent />
      </div>
    </>
  );
};

export default JobDetailPage;