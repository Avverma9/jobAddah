import React, { useEffect, useState, useMemo } from "react";
import { baseUrl } from "../../util/baseUrl";
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

const getPostLink = (post) => {
  if (post.link && (post.link.startsWith("http") || post.link.startsWith("https"))) {
    return `/post?url=${post.link}`;
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
      title: "JobsAddah – Your Career Gateway | Latest Govt Jobs 2025, Sarkari Naukri Notifications",
      description: "JobsAddah – Your Career Gateway: Latest government jobs 2025, sarkari naukri notifications. SSC, Railway, Bank, UPSC, Defence, Police jobs. 10th, 12th pass govt jobs. Apply online for govt job vacancies today.",
      keywords: "JobsAddah, latest govt jobs 2025, sarkari naukri, government jobs, bihar sarkari naukri, up sarkari result, ssc gd constable vacancy, railway group d recruitment, sarkari job alert, govt job alert, employment news, govt job notifications, sarkari naukri vacancy, ssc jobs, railway jobs, bank jobs, upsc exam, defence jobs, army bharti, police vacancy, 10th pass govt job, 12th pass govt job, graduate govt job, govt job apply online, direct recruitment govt job, govt job without exam, sarkari recruitment 2025, sarkari career portal"
    },
    ADMIT_CARD: {
      title: "JobsAddah – Your Career Gateway | Admit Card Download 2025, Sarkari Admit Card",
      description: "JobsAddah – Your Career Gateway: Download admit cards 2025 for SSC, Railway, Bank, UPSC, State PSC exams. Sarkari admit card, hall ticket download, call letter govt exam. Get exam roll number.",
      keywords: "JobsAddah, admit card, sarkari admit card, ssc admit card 2025, railway admit card download, up police si admit card, ssc cpo admit card, ctet admit card 2026, rrb ntpc admit card, ssc delhi police admit card, emrs teacher admit card, bihar bpsc admit card, afcat admit card 2026, govt exam admit card, hall ticket download, exam admit card 2025, roll number download, call letter govt exam, admit card download, exam hall ticket, sarkari exam admit card"
    },
    RESULT: {
      title: "JobsAddah – Your Career Gateway | Sarkari Result 2025, Latest Govt Exam Results",
      description: "JobsAddah – Your Career Gateway: Sarkari Result 2025, latest government exam results, cut off marks, merit list PDF. SSC, Railway, Bank exam results. Check result declared today.",
      keywords: "JobsAddah, sarkari result 2025, sarkari result bihar board, up board result 2025, ssc result 2025, railway result 2025, ibps clerk result, ssc gd result 2026, up police result 2025, bihar bssc result, jpsc result 2025, bseb deled result, govt exam result, result declared, exam result today, cut off marks, merit list pdf, final result govt job, selection list, sarkari result latest, sarkari result official website 2025"
    },
    ANSWER_KEY: {
      title: "JobsAddah – Your Career Gateway | Answer Key 2025, Official Answer Key PDF",
      description: "JobsAddah – Your Career Gateway: Download official answer key 2025 for government exams. SSC, Railway, Banking exam answer key PDF, response sheet, exam solution PDF with objections.",
      keywords: "JobsAddah, answer key, ssc chsl answer key, official answer key, govt exam answer key, answer key pdf, response sheet, exam solution pdf, answer key download, sarkari exam answer key, sarkari result answer key check"
    },
    ADMISSION: {
      title: "JobsAddah – Your Career Gateway | Government College Admission 2025, Apply Online",
      description: "JobsAddah – Your Career Gateway: Government college admission 2025, university admission notifications. Engineering, Medical, Management college admissions. Apply online for govt college admission.",
      keywords: "JobsAddah, government college admission, sarkari admission form, nvs class 9 admission, nvs class 11 admission, bihar deled admission, up deled admission, bcece counselling 2025, iti admission bihar, polytechnic admission 2025, clat admission form, cmat admission 2026, university admission, engineering admission, medical college admission, govt college admission 2025, admission notification, college admission form"
    },
    SYLLABUS: {
      title: "JobsAddah – Your Career Gateway | Govt Exam Syllabus 2025, Exam Pattern PDF",
      description: "JobsAddah – Your Career Gateway: Download government exam syllabus 2025 and exam pattern for SSC, Railway, Bank, UPSC exams. Complete study material PDF for sarkari exam preparation.",
      keywords: "JobsAddah, govt exam syllabus, ssc gd syllabus 2025, railway exam pattern, upsc syllabus pdf, ssc cgl syllabus, ssc chsl syllabus, ctet syllabus 2026, bihar police syllabus, up police syllabus, rrb group d syllabus, ibps po syllabus, exam pattern, government exam syllabus, study material, sarkari exam syllabus, exam syllabus pdf, govt exam pattern, sarkari result exam syllabus pdf"
    },
    PRIVATE_JOB: {
      title: "JobsAddah – Your Career Gateway | Private Jobs 2025, IT Jobs, MNC Recruitment",
      description: "JobsAddah – Your Career Gateway: Latest private jobs 2025, IT jobs, Non-IT jobs, MNC recruitment, startup hiring. Private sector job vacancies, company jobs, apply for private jobs online.",
      keywords: "JobsAddah, private jobs, private jobs in india, it jobs for freshers, work from home jobs, naukri.com jobs, pvtjob.in updates, latest private vacancy, digital marketing jobs, software developer jobs, android developer jobs, react native jobs, IT jobs, MNC jobs, private sector recruitment, job vacancies, company jobs, private job vacancy, IT job vacancy"
    }
  };

  return seoConfig[type] || {
    title: `JobsAddah – Your Career Gateway | ${formatTitle(type)} - Latest Updates 2025`,
    description: `JobsAddah – Your Career Gateway: Browse all latest ${formatTitle(type).toLowerCase()} notifications and updates. Updated daily with official links.`,
    keywords: `JobsAddah, ${formatTitle(type).toLowerCase()}, sarkari updates, government notifications, sarkari result 2025, career gateway`
  };
};

export default function ViewAll() {
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
            const res = await fetch(`${baseUrl}/get-jobs?postType=PRIVATE_JOB`);
            const data = await res.json();
            if (!res.ok) throw new Error("Failed to fetch private jobs");

            const jobs = Array.isArray(data) ? data : data.data || [];
            setAllPosts(jobs);
          } else {
            const catRes = await fetch(`${baseUrl}/scrapper/get-categories`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            });
            const catData = await catRes.json();

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
              const scrapeRes = await fetch(`${baseUrl}/scrapper/scrape-category`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: targetUrl }),
              });
              const scrapeData = await scrapeRes.json();

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
              const fallbackRes = await fetch(`${baseUrl}/get-all`);
              const fallbackData = await fallbackRes.json();
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

  return (
    <>
      {/* SEO Component - Render once at top level */}
      <SEO
        title={currentSEO.title}
        description={currentSEO.description}
        keywords={currentSEO.keywords}
        canonical={`/view-all?type=${postType || 'all'}`}
      />

      <div
        className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans selection:bg-blue-100 dark:selection:bg-blue-900"
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
}
