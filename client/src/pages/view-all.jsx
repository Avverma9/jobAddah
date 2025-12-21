import React, { useEffect, useState, useMemo } from "react";
import { baseUrl } from "../util/baseUrl";
import api from '../util/apiClient';
import { Link, useLocation } from "react-router-dom";
import {
  ChevronRight,
  Briefcase,
  Building2,
  Search,
  AlertCircle,
  FileText,
  Award,
  X,
  Bell,
  CheckCircle,
  BookOpen,
  List,
} from "lucide-react";
import SEO from "../util/SEO";
import AdContainer from "../components/ads/AdContainer";
import { useGlobalLoader } from "../components/GlobalLoader";
import useIsMobile from "../hooks/useIsMobile";
import { MobileLayout } from "../components/MobileLayout";

const VISIT_STORAGE_KEY = "jobsaddah_recent_visits_v2";

const getRecentVisitIds = () => {
  try {
    const stored = localStorage.getItem(VISIT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveRecentVisit = (id) => {
  if (!id) return;
  try {
    let visits = getRecentVisitIds();
    visits = visits.filter((visitId) => visitId !== id);
    visits.unshift(id);
    visits = visits.slice(0, 20);
    localStorage.setItem(VISIT_STORAGE_KEY, JSON.stringify(visits));
    window.dispatchEvent(new Event("recent-visits-updated"));
  } catch (error) {
    console.error(error);
  }
};

// Helper to extract path from URL (remove domain)
const extractPath = (url) => {
  if (!url) return "";
  try {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      const urlObj = new URL(url);
      return urlObj.pathname;
    }
    return url.startsWith("/") ? url : `/${url}`;
  } catch {
    return url.startsWith("/") ? url : `/${url}`;
  }
};

const getPostLink = (post) => {
  if (post.link && (post.link.startsWith("http") || post.link.startsWith("https") || post.link.startsWith("/"))) {
    const path = extractPath(post.link);
    return `/post?url=${encodeURIComponent(path)}`;
  }
  return `/post?id=${post._id}`;
};

const formatTitle = (type) =>
  type
    ? type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Latest Updates";

const getIconStyle = (type) => {
  if (!type) return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
  const t = type.toUpperCase();
  if (t.includes("RESULT")) return "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400";
  if (t.includes("ADMIT")) return "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400";
  if (t.includes("LATEST") || t.includes("JOB")) return "bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400";
  if (t.includes("ANSWER")) return "bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400";
  if (t.includes("SYLLABUS")) return "bg-orange-100 text-orange-600 dark:bg-orange-900/40 dark:text-orange-400";
  if (t.includes("ADMISSION")) return "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400";
  return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
};

const getIcon = (type) => {
  if (!type) return <FileText size={20} />;
  const t = type.toUpperCase();
  if (t.includes("RESULT")) return <Award size={20} />;
  if (t.includes("ADMIT")) return <FileText size={20} />;
  if (t.includes("LATEST")) return <Bell size={20} />;
  if (t.includes("ANSWER")) return <CheckCircle size={20} />;
  if (t.includes("SYLLABUS")) return <List size={20} />;
  if (t.includes("ADMISSION")) return <BookOpen size={20} />;
  return <Briefcase size={20} />;
};

const ListSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4 animate-pulse">
    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0"></div>
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/3"></div>
    </div>
    <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded shrink-0"></div>
  </div>
);

// SEO Data Configuration
const getSEOData = (type) => {
  const seoConfig = {
    JOB: {
      title: "Latest Government Jobs 2025 | Sarkari Naukri Vacancy - JobsAddah",
      description: "Find latest government jobs 2025, sarkari naukri notifications. SSC, Railway, Bank, UPSC, Defence, Police, Teaching jobs. 10th, 12th pass & graduate govt job vacancies. Apply online today!",
      keywords: "govt jobs 2025, sarkari naukri, government jobs, latest govt jobs, ssc jobs, railway jobs, bank jobs, upsc jobs, defence jobs, police vacancy, teacher vacancy, 10th pass govt job, 12th pass govt job, graduate govt job, central govt jobs, state govt jobs"
    },
    ADMIT_CARD: {
      title: "Admit Card 2025 Download | Sarkari Exam Hall Ticket - JobsAddah",
      description: "Download admit cards 2025 for SSC, Railway, Bank, UPSC, State PSC exams. Sarkari admit card, hall ticket, call letter download. Get exam roll number and exam date details.",
      keywords: "admit card 2025, sarkari admit card, hall ticket download, call letter, exam admit card, ssc admit card, railway admit card, upsc admit card, bank exam admit card, roll number download"
    },
    RESULT: {
      title: "Sarkari Result 2025 | Govt Exam Result, Cut Off, Merit List - JobsAddah",
      description: "Check sarkari result 2025, government exam results, cut off marks, merit list PDF. SSC, Railway, Bank, UPSC exam results declared today. Download score card and selection list.",
      keywords: "sarkari result 2025, govt exam result, result declared, cut off marks, merit list, final result, selection list, ssc result, railway result, bank result, upsc result"
    },
    ANSWER_KEY: {
      title: "Answer Key 2025 | Official Exam Answer Key PDF Download - JobsAddah",
      description: "Download official answer key 2025 for government exams. SSC, Railway, Bank exam answer key PDF with response sheet. Check correct answers and raise objections.",
      keywords: "answer key 2025, official answer key, answer key pdf, response sheet, exam answer key, ssc answer key, railway answer key, upsc answer key, objection form"
    },
    ADMISSION: {
      title: "Admission 2025 | University & College Admission Form - JobsAddah",
      description: "Government college admission 2025, university admission notifications. Engineering, Medical, B.Ed, D.El.Ed admissions. Apply online for govt college admission form.",
      keywords: "admission 2025, college admission, university admission, govt admission, engineering admission, medical admission, nvs admission, polytechnic admission, iti admission"
    },
    SYLLABUS: {
      title: "Govt Exam Syllabus 2025 | Exam Pattern & Study Material - JobsAddah",
      description: "Download government exam syllabus 2025 and exam pattern for SSC, Railway, Bank, UPSC exams. Complete study material, previous year papers, and mock tests for preparation.",
      keywords: "exam syllabus 2025, govt exam syllabus, exam pattern, study material, previous year paper, mock test, ssc syllabus, railway syllabus, bank syllabus, upsc syllabus"
    },
    PRIVATE_JOB: {
      title: "Private Jobs 2025 | IT Jobs, Fresher Jobs, WFH Jobs - JobsAddah",
      description: "Latest private jobs 2025, IT jobs for freshers, work from home jobs, MNC recruitment. Software developer, data analyst, digital marketing jobs. Apply for private sector vacancies.",
      keywords: "private jobs 2025, it jobs, fresher jobs, work from home, wfh jobs, mnc jobs, software developer jobs, data analyst jobs, digital marketing jobs, startup jobs"
    }
  };

  return seoConfig[type] || {
    title: `${formatTitle(type)} 2025 | Latest Updates & Notifications - JobsAddah`,
    description: `Browse all latest ${formatTitle(type).toLowerCase()} notifications and updates 2025. Official links, eligibility, and how to apply online.`,
    keywords: `${formatTitle(type).toLowerCase()} 2025, sarkari updates, government notifications, jobsaddah`
  };
};

export default function ViewAll() {
  const isMobile = useIsMobile(640);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postType, setPostType] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const location = useLocation();
  const { withLoader } = useGlobalLoader();

  useEffect(() => {
    const fetchData = async () => {
      const searchParams = new URLSearchParams(window.location.search);
      const type = searchParams.get("type");
      setPostType(type);
      setLoading(true);
      setError(null);
      setAllPosts([]);

      try {
        await withLoader(async () => {
          if (type === "PRIVATE_JOB") {
            const data = await api.get('/get-jobs?postType=PRIVATE_JOB');
            const jobs = Array.isArray(data) ? data : data.data || [];
            setAllPosts(jobs);
          } else {
            const catData = await api.post('/scrapper/get-categories');

            let targetUrl = null;

            if (catData.success && catData.categories) {
              const matchedCat = catData.categories.find(
                (c) =>
                  c.name.toLowerCase().includes(type.toLowerCase().replace("_", " ")) ||
                  type.toLowerCase().includes(c.name.toLowerCase())
              );
              if (matchedCat) targetUrl = matchedCat.link;
            }

            if (targetUrl) {
              const scrapeData = await api.post('/scrapper/scrape-category', { url: targetUrl });

              if (scrapeData.success) {
                const cleanData = scrapeData.jobs
                  .filter(
                    (job) =>
                      job.title.toLowerCase() !== "privacy policy" &&
                      job.title.toLowerCase() !== "sarkari result" &&
                      job.title.toLowerCase() !== "contact us"
                  )
                  .map((job) => ({
                    ...job,
                    _id: job.link,
                    postTitle: job.title,
                    postType: type,
                    createdAt: new Date().toISOString(),
                  }));
                setAllPosts(cleanData);
              } else {
                throw new Error("Failed to load category data");
              }
            } else {
              const fallbackData = await api.get('/get-all');
              const raw = Array.isArray(fallbackData) ? fallbackData : fallbackData.jobs || [];
              setAllPosts(raw.filter((p) => p.postType === type));
            }
          }
        }, `Loading ${formatTitle(type)}...`, 50);
      } catch (err) {
        console.error(err);
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.search, withLoader]);

  const processedPosts = useMemo(() => {
    let result = [...allPosts];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (post) =>
          (post.postTitle?.toLowerCase() || "").includes(query) ||
          (post.organization?.toLowerCase() || "").includes(query)
      );
    }

    result.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [allPosts, searchQuery, sortOrder]);

  const handleGlobalClick = (e) => {
    const link = e.target.closest("a");
    if (link && link.href) {
      const url = new URL(link.href);

      if (url.pathname.includes("/post")) {
        const urlParam = url.searchParams.get("url");
        if (urlParam) {
          saveRecentVisit(decodeURIComponent(urlParam));
          return;
        }

        const id = url.searchParams.get("id") || url.searchParams.get("_id");
        if (id) {
          saveRecentVisit(id);
          return;
        }
      }
    }
  };

  // Get SEO data based on postType
  const currentSEO = getSEOData(postType);

  // Main content component
  const ViewAllContent = () => (
    <>
      {/* SEO Component - Render once at top level */}
      <SEO
        title={currentSEO.title}
        description={currentSEO.description}
        keywords={currentSEO.keywords}
        canonical={`/view-all?type=${postType || 'all'}`}
        section={formatTitle(postType)}
      />

      <div
        className={`min-h-screen bg-gray-50 dark:bg-gray-950 font-sans selection:bg-blue-100 dark:selection:bg-blue-900 ${isMobile ? 'pb-24' : ''}`}
        onClickCapture={handleGlobalClick}
      >
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          {/* Top Banner Ad */}
          <AdContainer 
            placement="banner" 
            pageType="categoryPages"
            format="horizontal"
            className="mb-6"
          />
          
          <div className="mb-8 flex flex-col items-center text-center space-y-2">
            <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
              <span className={`p-2 rounded-lg ${getIconStyle(postType)}`}>
                {getIcon(postType)}
              </span>
              {formatTitle(postType)}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Browse all latest updates for {formatTitle(postType)}
            </p>
          </div>

          <div className="sticky top-4 z-30 mb-6">
            <div className="bg-white dark:bg-gray-800 p-2 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search jobs, organizations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {!loading && !error && (
            <div className="mb-4 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 px-1">
              <span>
                <strong>{processedPosts.length}</strong> Results Found
              </span>
            </div>
          )}

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <ListSkeleton key={n} />
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-2xl border border-red-100 dark:border-red-900/30 text-center">
              <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Error Loading Posts
              </h3>
              <p className="text-sm text-gray-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
              >
                Retry
              </button>
            </div>
          ) : processedPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
              <Search className="w-10 h-10 text-gray-400 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                No matches found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Try adjusting your search terms
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {processedPosts.map((post, index) => (
                <React.Fragment key={post._id}>
                  <Link
                    to={getPostLink(post)}
                    onClick={() => saveRecentVisit(post._id || post.link)}
                    className="group flex items-center gap-4 bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
                  >
                    <div
                      className={`shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${getIconStyle(
                        postType
                      )} group-hover:scale-110 transition-transform`}
                    >
                      {getIcon(postType)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2 pr-2">
                        {post.postTitle}
                      </h2>
                      {post.organization && (
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <Building2 size={12} />
                          <span className="truncate">{post.organization}</span>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 text-gray-300 group-hover:text-blue-500 dark:text-gray-600 dark:group-hover:text-blue-400 transition-colors">
                      <ChevronRight size={20} />
                    </div>
                  </Link>
                  
                  {/* Insert ad after every 5th post */}
                  {(index + 1) % 5 === 0 && index < processedPosts.length - 1 && (
                    <AdContainer 
                      placement="inFeed" 
                      pageType="categoryPages"
                      format="fluid"
                      className="my-4"
                    />
                  )}
                </React.Fragment>
              ))}
              
              {/* Bottom Rectangle Ad */}
              <AdContainer 
                placement="rectangle" 
                pageType="categoryPages"
                format="rectangle"
                className="mt-8"
              />
            </div>
          )}
        </main>
      </div>
    </>
  );

  // Return with mobile layout wrapper for mobile devices
  if (isMobile) {
    return (
      <MobileLayout title={formatTitle(postType)} showBack={true}>
        <ViewAllContent />
      </MobileLayout>
    );
  }

  // Desktop view
  return <ViewAllContent />;
}
