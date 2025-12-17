import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Briefcase, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSections } from "../../redux/slices/sectionsSlice";
import { fetchPrivateJobs } from "../../redux/slices/privateJobsSlice";
import { fetchFavPosts } from "../../redux/slices/favPostsSlice";
import {
  fetchSearchResults,
  clearSearch,
} from "../../redux/slices/searchSlice";
import { fetchReminders } from "../../redux/slices/remindersSlice";
import { UrgentReminderSection } from "./sections/remider";
import { SectionColumn } from "./sections/sections_list";
import { encodeBase64Url } from "../util/encode-decode";
import SEO from "../util/SEO";
import AdContainer from "../components/ads/AdContainer";
import Tools from "./tools/toolswidget";

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
  const title =
    job?.recruitment?.title || job?.title || job?.postTitle || "Job Post";
  const createdAt =
    job?.createdAt ||
    job?.recruitment?.createdAt ||
    job?.date ||
    job?.recruitment?.date ||
    job?.updatedAt ||
    null;

  return { ...job, id, title, createdAt };
};

const SEARCH_DATE_PRIORITY = [
  { key: "admitCardDate", label: "Admit Card" },
  { key: "examDate", label: "Exam" },
  { key: "applicationLastDate", label: "Last Date" },
  { key: "applicationStartDate", label: "Start Date" },
  { key: "notificationDate", label: "Notification" },
];

const formatDisplayDate = (value) => {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const buildHighlight = (importantDates = {}, fallbackDate) => {
  for (const entry of SEARCH_DATE_PRIORITY) {
    const raw = importantDates?.[entry.key];
    if (raw) {
      return {
        label: entry.label,
        value: formatDisplayDate(raw),
      };
    }
  }

  if (fallbackDate) {
    return {
      label: "Updated",
      value: formatDisplayDate(fallbackDate),
    };
  }

  return null;
};

const mapSearchResultMeta = (result) => {
  if (!result) return null;
  const recruitment = result.recruitment || {};
  const organization =
    recruitment?.organization?.shortName ||
    recruitment?.organization?.name ||
    "";

  const totalPosts = recruitment?.vacancyDetails?.totalPosts;
  const firstPosition = recruitment?.vacancyDetails?.positions?.[0];

  const formatPosition = (position) => {
    if (!position) return "";
    if (typeof position === "string") return position;
    if (typeof position === "object") {
      return [position.name, position.count, position.eligibility]
        .filter(Boolean)
        .join(" • ");
    }
    return String(position);
  };

  const secondaryLine = [
    organization,
    totalPosts ? `${totalPosts} Posts` : null,
  ]
    .filter(Boolean)
    .join(" • ");
  const tertiaryLine =
    formatPosition(firstPosition) || recruitment?.selectionProcess?.[0] || "";

  const highlight = buildHighlight(
    recruitment?.importantDates,
    result?.updatedAt
  );

  const linkTarget = result?.url || result?._id || result?.id || "";
  const visitId = linkTarget || result?._id || result?.id;

  return {
    key: result?._id || `${linkTarget}-${recruitment?.title}`,
    title: recruitment?.title || result?.title || "Job Post",
    secondaryLine,
    tertiaryLine,
    highlight,
    linkTarget,
    visitId,
  };
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
      "bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 border-orange-200 text-orange-700 dark:from-orange-900/20 dark:to-orange-800/20 dark:border-orange-800/50 dark:text-orange-300",
    gray: "bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-gray-200 text-gray-700 dark:from-gray-800/30 dark:to-gray-700/30 dark:border-gray-700 dark:text-gray-300",
  };

  const activeClass = colorMap[color] || colorMap.gray;

  return (
    <Link
      to={getPostLink(id)}
      className={`group relative flex flex-col items-center justify-center p-4 min-h-[110px] rounded-xl border-2 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-95 ${activeClass}`}
    >
      <div className="mb-2.5 p-2.5 rounded-xl bg-white/70 dark:bg-white/10 shadow-sm group-hover:scale-110 transition-transform duration-200">
        <Icon size={28} strokeWidth={2.5} />
      </div>
      <span className="text-xs font-bold text-center leading-tight line-clamp-2 px-1">
        {title}
      </span>
    </Link>
  );
};

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const dispatch = useDispatch();

  // Redux state
  const { posts: favPosts, loading: isFavLoading } = useSelector(
    (state) => state.favPosts
  );
  const { sections: dynamicSections, loading: isDynamicLoading } = useSelector(
    (state) => state.sections
  );
  const { jobs: privateJobs } = useSelector((state) => state.privateJobs);
  const { results: searchResults, loading: isSearching } = useSelector(
    (state) => state.search
  );
  const {
    expiresToday,
    expiringSoon,
    loading: remindersLoading,
  } = useSelector((state) => state.reminders);

  // Debounced search
  useEffect(() => {
    if (!searchQuery) {
      dispatch(clearSearch());
      return;
    }

    const timer = setTimeout(() => {
      dispatch(fetchSearchResults(searchQuery));
    }, 800);

    return () => clearTimeout(timer);
  }, [searchQuery, dispatch]);

  // Load sections and jobs on mount
  useEffect(() => {
    dispatch(fetchSections());
    dispatch(fetchPrivateJobs());
    dispatch(fetchFavPosts());

    // Refresh reminders every 5 minutes
    dispatch(fetchReminders());
    const interval = setInterval(
      () => dispatch(fetchReminders()),
      5 * 60 * 1000
    );
    return () => clearInterval(interval);
  }, [dispatch]);

  // Build job index for quick lookups
  const allJobsIndex = useMemo(() => {
    const all = [
      ...dynamicSections.flatMap((s) => s.data || []),
      ...privateJobs,
      ...favPosts,
      ...searchResults,
    ].map(normalizeJob);

    const map = new Map();
    all.forEach((j) => {
      if (j?.id) map.set(j.id, j);
    });
    return map;
  }, [dynamicSections, privateJobs, favPosts, searchResults]);

  // Search UI state
  const decoratedSearchResults = useMemo(
    () => searchResults.map(mapSearchResultMeta).filter(Boolean),
    [searchResults]
  );

  const showSearchDropdown = searchQuery.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <SEO
        title="JobsAddah – Sarkari Result 2025 | Latest Govt Jobs, Admit Card, Sarkari Naukri"
        description="JobsAddah is India's #1 Sarkari Result portal for latest government jobs 2025, sarkari naukri notifications, admit cards, exam results. Get SSC, Railway, Bank, UPSC, Defence job alerts. Apply online for central & state govt vacancies."
        canonical="/"
        section="Home"
      />

      <div className="bg-gradient-to-r from-blue-700 to-blue-600 dark:from-blue-800 dark:to-blue-700 text-white text-xs py-2.5 shadow-md overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-blue-700 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-blue-600 to-transparent z-10 pointer-events-none" />
        <div className="animate-marquee whitespace-nowrap flex gap-8 items-center px-4">
          {isDynamicLoading ? (
            <span className="text-sm">Loading latest updates...</span>
          ) : dynamicSections?.[0]?.data?.length > 0 ? (
            dynamicSections[0].data.slice(0, 5).map((job, i) => (
              <Link
                key={i}
                to={getPostLink(job.id)}
                className="flex items-center gap-2 font-medium hover:text-yellow-200 transition-colors"
              >
                <Bell
                  size={14}
                  className="fill-yellow-400 text-yellow-400 animate-pulse"
                />
                {job.title}
              </Link>
            ))
          ) : (
            <span className="text-sm">
              Welcome to JobsAddah - India's #1 Job Portal
            </span>
          )}
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 max-w-7xl space-y-6">
        <AdContainer
          placement="banner"
          pageType="homepage"
          format="horizontal"
          className="mb-4"
        />

        <div className="space-y-5">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <div className="gradient-border-wrapper">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search jobs, results, admit cards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl shadow-sm focus:outline-none text-sm bg-white dark:bg-gray-800 dark:text-white relative z-10"
                />
              </div>
            </div>

            {/* Search Dropdown */}
            {showSearchDropdown && (
              <div className="absolute left-0 right-0 top-full mt-2 z-30 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl max-h-96 overflow-y-auto">
                <div className="p-2">
                  {isSearching ? (
                    <p className="text-gray-500 text-sm py-2 px-3">
                      Searching...
                    </p>
                  ) : decoratedSearchResults.length === 0 ? (
                    <p className="text-gray-500 text-sm py-2 px-3">
                      No results found.
                    </p>
                  ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-700">
                      {decoratedSearchResults.map((item) => (
                        <Link
                          key={item.key}
                          to={getPostLink(item.linkTarget)}
                          onClick={() => {
                            setSearchQuery("");
                          }}
                          className="block px-3 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition rounded-lg"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 space-y-0.5">
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {item.title}
                              </p>
                              {item.secondaryLine && (
                                <p className="text-xs text-gray-600 dark:text-gray-300">
                                  {item.secondaryLine}
                                </p>
                              )}
                              {item.tertiaryLine && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {item.tertiaryLine}
                                </p>
                              )}
                            </div>
                            {item.highlight && (
                              <span className="flex flex-col items-end text-[10px] font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-md px-2 py-1">
                                <span className="text-[9px] text-blue-500 dark:text-blue-200">
                                  {item.highlight.label}
                                </span>
                                <span>{item.highlight.value}</span>
                              </span>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Featured Posts */}
          {favPosts?.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
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

        <div className="space-y-6">
          <AdContainer
            placement="rectangle"
            pageType="homepage"
            format="rectangle"
            className="my-6"
          />

          <Tools />

          <UrgentReminderSection
            expiresToday={expiresToday}
            expiringSoon={expiringSoon}
            isLoading={remindersLoading}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {!isDynamicLoading &&
              dynamicSections.map((section, idx) => {
                const shouldShowAd =
                  (idx + 1) % 3 === 0 && idx < dynamicSections.length - 1;
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
                        <AdContainer
                          placement="inFeed"
                          pageType="homepage"
                          format="fluid"
                          className="my-6"
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
          </div>

          <AdContainer
            placement="rectangle"
            pageType="homepage"
            format="rectangle"
            className="mt-6"
          />
        </div>
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
        .scrollbar-hide { 
          -ms-overflow-style: none; 
          scrollbar-width: none; 
        }
        .gradient-border-wrapper {
          position: relative;
          padding: 2px;
          border-radius: 0.75rem;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #f59e0b, #3b82f6);
          background-size: 300% 300%;
          animation: gradientRotate 4s linear infinite;
        }
        @keyframes gradientRotate {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .gradient-border-wrapper:hover { 
          animation: gradientRotate 2s linear infinite; 
        }
      `}</style>
    </div>
  );
}
