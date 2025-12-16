import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Briefcase, Clock, Search, TrendingUp } from "lucide-react";
import { useDispatch, useSelector } from 'react-redux';
import { fetchSections } from '../../redux/slices/sectionsSlice';
import { fetchPrivateJobs } from '../../redux/slices/privateJobsSlice';
import { fetchFavPosts } from '../../redux/slices/favPostsSlice';
import { fetchSearchResults, clearSearch } from '../../redux/slices/searchSlice';
import { fetchReminders } from '../../redux/slices/remindersSlice';
import { UrgentReminderSection } from "./sections/remider";
import { SectionColumn } from "./sections/sections_list";
import { encodeBase64Url } from "../util/encode-decode";
import SEO from "../util/SEO";
import AdContainer from "../components/ads/AdContainer";
import { useGlobalLoader } from "../components/GlobalLoader";
import Tools from "./tools/toolswidget";

const RECENT_VISITS_KEY = "jobsaddah_recent_visits";

const storageApi = (() => {
  const api = window.storage || window.Storage;
  return {
    async get(key) {
      if (!api?.get) return null;
      return api.get(key);
    },
    async set(key, value) {
      if (!api?.set) return;
      return api.set(key, value);
    },
  };
})();

const safeJsonParse = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const getRecentVisits = async () => {
  const result = await storageApi.get(RECENT_VISITS_KEY);
  if (!result?.value) return [];
  const visits = safeJsonParse(result.value, []);
  return Array.isArray(visits) ? visits : [];
};

const saveRecentVisit = async (jobData) => {
  const id = jobData?.id?.toString()?.trim();
  if (!id) return;

  const title = jobData?.title?.toString()?.trim() || "Job Post";
  const visitEntry = { id, title, timestamp: Date.now() };

  const existing = await getRecentVisits();
  const next = [visitEntry, ...existing.filter((v) => v?.id !== id)].slice(0, 8);

  await storageApi.set(RECENT_VISITS_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("recent-visits-updated"));
};

const getPostLink = (idOrUrl) => {
  if (!idOrUrl) return "#";
  const val = idOrUrl.toString().trim();
  if (val.startsWith("http://") || val.startsWith("https://")) {
    return `/post?url=${encodeBase64Url(val)}`;
  }
  return `/post?id=${val}`;
};

const normalizeJob = (job) => {
  const id = job?.link || job?.url || job?.id || job?._id;
  const title = job?.recruitment?.title || job?.title || job?.postTitle || "Job Post";
  const createdAt =
    job?.createdAt ||
    job?.recruitment?.createdAt ||
    job?.date ||
    job?.recruitment?.date ||
    job?.updatedAt ||
    null;

  return { ...job, id, title, createdAt };
};

const getTimeValue = (job) => {
  const raw = job?.createdAt;
  const t = raw ? new Date(raw).getTime() : NaN;
  if (!Number.isNaN(t)) return t;
  return job?.timestamp || 0;
};

const sortLatestFirst = (list) => {
  const arr = Array.isArray(list) ? [...list] : [];
  return arr.sort((a, b) => getTimeValue(b) - getTimeValue(a));
};

const QuickCard = ({ icon: Icon, title, id, color, jobData }) => {
  const colorMap = {
    orange:
      "bg-orange-50/50 hover:bg-orange-100 border-orange-100 text-orange-600 dark:bg-orange-900/10 dark:border-orange-900/30 dark:text-orange-400",
    gray:
      "bg-gray-50/50 hover:bg-gray-100 border-gray-100 text-gray-600 dark:bg-gray-800/30 dark:border-gray-700 dark:text-gray-400",
  };

  const activeClass = colorMap[color] || colorMap.gray;

  return (
    <Link
      to={getPostLink(id)}
      onClick={() => saveRecentVisit(jobData || { id, title })}
      className={`
        group relative flex flex-col items-center justify-center 
        p-3 min-w-[100px] h-[100px] sm:min-w-[110px] sm:h-[110px] 
        rounded-2xl border transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-lg backdrop-blur-sm
        ${activeClass}
      `}
    >
      <div className="mb-2 p-2 rounded-xl bg-white/60 dark:bg-white/5 shadow-sm ring-1 ring-black/5 dark:ring-white/10 group-hover:scale-110 transition-transform duration-300">
        <Icon size={24} strokeWidth={2} />
      </div>
      <span className="text-[11px] sm:text-xs font-bold text-center leading-tight line-clamp-2 px-1">
        {title}
      </span>
    </Link>
  );
};

const RecentVisitsSection = ({ visits }) => {
  if (!visits?.length) return null;

  return (
    <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 px-1">
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
          <Clock size={14} className="text-white sm:w-4 sm:h-4" />
        </div>
        <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
          Recently Viewed Jobs
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">({visits.length})</span>
      </div>

      <div className="overflow-x-auto scrollbar-hide pb-2">
        <div className="flex gap-2 sm:gap-3 min-w-max">
          {visits.map((visit, index) => (
            <Link
              key={`recent-${visit.id}-${index}`}
              to={getPostLink(visit.id)}
              onClick={() => saveRecentVisit(visit)}
              className="group"
            >
              <div className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-full hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/40 dark:hover:to-indigo-900/40 transition-all duration-300 hover:shadow-md hover:scale-105 whitespace-nowrap">
                <TrendingUp size={14} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-blue-700 dark:text-blue-300 max-w-[200px] sm:max-w-[250px] truncate">
                  {visit.title || "Job Post"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // favPosts are now managed by Redux slice `favPosts`
  const { posts: favPosts, loading: isFavLoading } = useSelector((state) => state.favPosts);
  const [recentVisits, setRecentVisits] = useState([]);

  const dispatch = useDispatch();
  const { sections: dynamicSections, loading: isDynamicLoading, error } = useSelector((state) => state.sections);

  const { jobs: privateJobs, loading: isPrivateLoading } = useSelector((state) => state.privateJobs);

  const { results: searchResults, loading: isSearching } = useSelector((state) => state.search);

  const { expiresToday, expiringSoon, loading: remindersLoading } = useSelector((state) => state.reminders);

  const { withLoader } = useGlobalLoader();

  useEffect(() => {
    if (!searchQuery) {
      setIsTyping(false);
      // clear Redux search results when query is empty
      dispatch(clearSearch());
      return;
    }

    setIsTyping(true);
    const t = setTimeout(() => setIsTyping(false), 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    if (!searchQuery) {
      dispatch(clearSearch());
      return;
    }

    const t = setTimeout(() => {
      dispatch(fetchSearchResults(searchQuery));
    }, 1000);

    return () => clearTimeout(t);
  }, [searchQuery, dispatch]);

  useEffect(() => {
    const load = async () => {
      const visits = await getRecentVisits();
      setRecentVisits(sortLatestFirst(visits));
    };

    load();
    const onUpdate = () => load();
    window.addEventListener("recent-visits-updated", onUpdate);
    return () => window.removeEventListener("recent-visits-updated", onUpdate);
  }, []);

  useEffect(() => {
    dispatch(fetchSections());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchPrivateJobs());
  }, [dispatch]);

  useEffect(() => {
    // Use Redux thunk to fetch reminders and refresh periodically
    dispatch(fetchReminders());
    const interval = setInterval(() => dispatch(fetchReminders()), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    // Dispatch Redux thunk to load featured/favorite posts
    dispatch(fetchFavPosts());
  }, [dispatch]);

  const allJobsIndex = useMemo(() => {
    const all = [
      ...dynamicSections.flatMap((s) => s.data || []),
      ...privateJobs,
      ...favPosts,
      ...searchResults,
    ].map(normalizeJob);

    const map = new Map();
    for (const j of all) {
      if (j?.id) map.set(j.id, j);
    }
    return map;
  }, [dynamicSections, privateJobs, favPosts, searchResults]);

  const handleGlobalClick = async (e) => {
    const link = e.target.closest("a");
    if (!link?.href) return;

    try {
      const url = new URL(link.href);
      if (!url.pathname.includes("/post")) return;

      const urlParam = url.searchParams.get("url");
      const idParam = url.searchParams.get("id");
      const jobId = (urlParam || idParam || "").toString();
      if (!jobId) return;

      const jobData = allJobsIndex.get(jobId);
      await saveRecentVisit({
        id: jobId,
        title: jobData?.title || "Job Post",
      });
    } catch {}
  };

  const showSearchSkeleton = searchQuery.length > 0 && (isTyping || isSearching);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans" onClickCapture={handleGlobalClick}>
      <SEO
        title="JobsAddah – Your Career Gateway | Sarkari Result 2025, Latest Govt Jobs, Sarkari Naukri"
        description="JobsAddah – Your Career Gateway: India's #1 portal for sarkari result 2025, latest government jobs, sarkari naukri notifications, admit card downloads, exam results. SSC, Railway, Bank, UPSC, Defence jobs. Apply online for govt job vacancies today."
        keywords="JobsAddah, sarkari result 2025, latest govt jobs 2025"
        canonical="/"
      />

      <div className="bg-gradient-to-r from-blue-700 to-blue-600 dark:from-blue-800 dark:to-blue-700 text-white text-xs sm:text-sm py-2 shadow-md overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-blue-700 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-blue-600 to-transparent z-10" />
        <div className="animate-marquee whitespace-nowrap flex gap-8 sm:gap-10 items-center px-3 sm:px-4">
          {isDynamicLoading ? (
            <span className="text-[11px] sm:text-sm">Loading latest updates...</span>
          ) : dynamicSections?.length > 0 && dynamicSections[0]?.data?.length > 0 ? (
            dynamicSections[0].data.slice(0, 5).map((job, i) => (
              <Link
                key={i}
                to={getPostLink(job.id)}
                onClick={() => saveRecentVisit({ id: job.id, title: job.title })}
                className="flex items-center gap-1 sm:gap-2 font-medium whitespace-nowrap text-[11px] sm:text-sm hover:text-yellow-200 transition-colors"
              >
                <Bell size={12} className="fill-yellow-400 text-yellow-400 animate-pulse sm:w-3.5 sm:h-3.5" />
                {job.title}
              </Link>
            ))
          ) : (
            <span className="text-[11px] sm:text-sm">Welcome to JobsAddah - India's No.1 Job Portal</span>
          )}
        </div>
      </div>

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-7xl space-y-6 sm:space-y-8">
        <AdContainer placement="banner" pageType="homepage" format="horizontal" className="mb-6" />

        <div className="space-y-4 sm:space-y-6">
          <div className="relative max-w-2xl mx-auto w-full">
            <div className="gradient-border-wrapper">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none z-10">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search jobs, admit cards, results..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl shadow-sm focus:outline-none text-xs sm:text-sm bg-white dark:bg-gray-800 dark:text-white relative z-10"
                />
              </div>
            </div>

            {searchQuery.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 z-30 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl max-h-80 overflow-y-auto">
                <div className="p-2 sm:p-3">
                  {showSearchSkeleton ? (
                    <p className="text-gray-500 text-sm py-1.5 px-1">Searching...</p>
                  ) : searchResults.length === 0 ? (
                    <p className="text-gray-500 text-sm py-1.5 px-1">No results found.</p>
                  ) : (
                    <div className="space-y-1">
                      {searchResults.map((item) => {
                        const itemId = item.id;
                        const itemTitle = item.title;
                        return (
                          <Link
                            key={itemId}
                            to={getPostLink(itemId)}
                            onClick={() => {
                              saveRecentVisit({ id: itemId, title: itemTitle });
                              setSearchQuery("");
                            }}
                            className="block px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                          >
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{itemTitle}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.createdAt || ""}</p>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {favPosts?.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {favPosts.map((item) => (
                <QuickCard
                  key={item.id}
                  id={item.id}
                  icon={Briefcase}
                  title={item.title}
                  color="orange"
                  jobData={{ id: item.id, title: item.title }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6 sm:space-y-8">
          {recentVisits?.length > 0 && <RecentVisitsSection visits={recentVisits} />}

          <AdContainer placement="rectangle" pageType="homepage" format="rectangle" className="my-8" />

          <Tools />

          <UrgentReminderSection
            expiresToday={expiresToday}
            expiringSoon={expiringSoon}
            isLoading={remindersLoading}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {!isDynamicLoading &&
              dynamicSections.map((section, idx) => {
                const shouldShowAd = (idx + 1) % 3 === 0 && idx < dynamicSections.length - 1;
                return (
                  <React.Fragment key={`${section.name}-${idx}`}>
                    <SectionColumn
                      title={section.name}
                      icon={Briefcase}
                      data={section.data}
                      colorTheme={section.color}
                      postType={section.postType}
                      isLoading={false}
                    />
                    {shouldShowAd && (
                      <div className="md:col-span-2 lg:col-span-3">
                        <AdContainer placement="inFeed" pageType="homepage" format="fluid" className="my-6" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
          </div>

          <AdContainer placement="rectangle" pageType="homepage" format="rectangle" className="mt-8" />
        </div>
      </main>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee { animation: marquee 30s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .gradient-border-wrapper {
          position: relative;
          padding: 2px;
          border-radius: 0.75rem;
          background: linear-gradient(90deg, #ff0080, #ff8c00, #40e0d0, #00bfff, #9370db, #ff0080);
          background-size: 300% 300%;
          animation: gradientRotate 4s linear infinite;
        }
        @media (min-width: 640px) {
          .gradient-border-wrapper { border-radius: 1rem; }
        }
        @keyframes gradientRotate {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .gradient-border-wrapper:hover { animation: gradientRotate 2s linear infinite; }
      `}</style>
    </div>
  );
}
