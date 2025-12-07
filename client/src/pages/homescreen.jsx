import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Bell,
  ChevronRight,
  Award,
  FileText,
  Briefcase,
  BookOpen,
  ExternalLink,
  Calendar,
  TrendingUp,
  Building2,
  AlertCircle,
  Clock,
  MapPin,
  Loader,
  ChevronDown,
} from "lucide-react";
import { baseUrl } from "../../util/baseUrl";
import Header from "../components/Header";
import { PrivateJobCard } from "./sections/private";
import { UrgentReminderSection } from "./sections/remider";
import { SectionColumn } from "./sections/sections_list";

const VISIT_STORAGE_KEY = "jobAddah_visit_counts";

const getVisitCounts = () => {
  try {
    const stored = localStorage.getItem(VISIT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const getTopVisitedIds = (limit = 10) => {
  const counts = getVisitCounts();
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);
};

const isNewJob = (createdAt) => {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  const threeDays = 3 * 24 * 60 * 60 * 1000;
  return now - created <= threeDays;
};

const extractJobData = (job) => {
  const lastDate = job.importantDates?.length
    ? job.importantDates.find((d) =>
        d.label?.toLowerCase().includes("last")
      )?.value || job.importantDates[0]?.value
    : "Check Details";

  const examDate = job.importantDates?.find((d) =>
    d.label?.toLowerCase().includes("exam")
  )?.value;

  const applicationFee = job.applicationFee?.[0]?.amount || 0;
  const maxAge = job.ageLimit?.maxAge || "";

  return {
    id: job._id,
    title: job.postTitle || "Notification",
    organization: job.organization || "",
    totalPosts: job.totalVacancyCount || 0,
    lastDate,
    postType: job.postType || "JOB",
    jobType: job.jobType || "",
    createdAt: job.createdAt,
    isNew: isNewJob(job.createdAt),
    allFields: [
      ...(examDate ? [{ label: "Exam Date", value: examDate }] : []),
      ...(applicationFee > 0
        ? [{ label: "Application Fee", value: `₹${applicationFee}` }]
        : []),
      ...(maxAge ? [{ label: "Max Age", value: maxAge }] : []),
      ...(job.vacancyDetails?.[0]?.postName
        ? [
            {
              label: "Posts",
              value: job.vacancyDetails[0].postName,
            },
          ]
        : []),
    ],
  };
};

const QuickCard = ({ icon: Icon, title, id, color }) => {
  const colorMap = {
    orange:
      "bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/50",
    pink: "bg-pink-50 text-pink-600 border-pink-100 hover:bg-pink-100 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-900/50",
    purple:
      "bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-900/50",
    blue: "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/50",
    green:
      "bg-green-50 text-green-600 border-green-100 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50",
  };

  return (
    <Link
      to={`/post?_id=${id}`}
      className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all group ${colorMap[color]}`}
      aria-label={title}
    >
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/80 dark:bg-gray-800/50 rounded-lg flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 transition-transform">
        <Icon size={20} className="sm:w-6 sm:h-6" />
      </div>
      <span className="font-bold text-xs sm:text-sm text-center leading-tight line-clamp-2 group-hover:underline">
        {title}
      </span>
    </Link>
  );
};

// New Component for Recent Visits - Horizontal Scrollable
const RecentVisitsSection = ({ data, isLoading }) => {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    const scrollAmount = 300;
    if (direction === "left") {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (isLoading || data.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-900/10 p-4 sm:p-5 border-b border-orange-200 dark:border-orange-900/30">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-white sm:w-5 sm:h-5" />
            </div>
            Your Recent Visits
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
            Jobs you've recently viewed
          </p>
        </div>
        <Link
          to="/recent-visits"
          className="text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 text-xs sm:text-sm font-semibold flex items-center gap-1 transition-colors"
        >
          View All
          <ChevronRight size={16} />
        </Link>
      </div>

      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto px-4 sm:px-5 py-4 sm:py-6 scrollbar-hide"
          style={{
            scrollBehavior: "smooth",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          {data.map((job) => (
            <Link
              key={job.id}
              to={`/post?_id=${job.id}`}
              className="flex-shrink-0 w-72 sm:w-80 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-900/30 p-4 sm:p-5 hover:shadow-lg dark:hover:shadow-xl transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {job.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {job.organization}
                  </p>
                </div>
                {job.isNew && (
                  <span className="flex-shrink-0 ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    NEW
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                  <Calendar size={14} className="flex-shrink-0" />
                  <span>{job.lastDate}</span>
                </div>
                {job.totalPosts > 0 && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                    <Briefcase size={14} className="flex-shrink-0" />
                    <span>{job.totalPosts} Posts</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-2 flex-wrap">
                {job.allFields.slice(0, 2).map((field, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold bg-white dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                  >
                    {field.label}: {field.value}
                  </span>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-orange-200 dark:border-orange-900/30 flex items-center justify-between">
                <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                  {job.postType}
                </span>
                <ChevronRight
                  size={16}
                  className="text-orange-600 dark:text-orange-400 group-hover:translate-x-1 transition-transform"
                />
              </div>
            </Link>
          ))}
        </div>

        {data.length > 3 && (
          <>
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ml-2"
              aria-label="Scroll left"
            >
              <ChevronRight size={20} className="rotate-180 text-gray-700 dark:text-gray-300" />
            </button>
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mr-2"
              aria-label="Scroll right"
            >
              <ChevronRight size={20} className="text-gray-700 dark:text-gray-300" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const getUserStateFromGeolocation = async () => {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    return data.region || "ALL";
  } catch (error) {
    console.error("Geolocation error:", error);
    return "ALL";
  }
};

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedState, setSelectedState] = useState("ALL");
  const [favPosts, setFavPosts] = useState([]);

  const [reminders, setReminders] = useState({
    expiresToday: [],
    expiringSoon: [],
    isLoading: true,
  });

  const [latestJobsByState, setLatestJobsByState] = useState({
    data: [],
    isLoading: true,
    state: "ALL",
  });

  const [categoryData, setCategoryData] = useState({
    results: [],
    admitCards: [],
    answerKeys: [],
    admissions: [],
    scholarships: [],
    privateJobs: [],
    isLoading: true,
  });

  useEffect(() => {
    const initializeUserState = async () => {
      const storedState = localStorage.getItem("userState");
      if (storedState) {
        setSelectedState(storedState);
      } else {
        const detectedState = await getUserStateFromGeolocation();
        setSelectedState(detectedState);
        localStorage.setItem("userState", detectedState);
      }
    };

    initializeUserState();
  }, []);

  useEffect(() => {
    const fetchAllCategoryData = async () => {
      try {
        setCategoryData((prev) => ({ ...prev, isLoading: true }));

        const endpoints = {
          results: "/get-jobs?postType=RESULT",
          admitCards: "/get-jobs?postType=ADMIT_CARD",
          answerKeys: "/get-jobs?postType=ANSWER_KEY",
          admissions: "/get-jobs?postType=ADMISSION",
          scholarships: "/get-jobs?postType=SCHOLARSHIP",
          privateJobs: "/get-jobs?postType=PRIVATE_JOB",
        };

        const results = await Promise.all(
          Object.entries(endpoints).map(([key, endpoint]) =>
            fetch(`${baseUrl}${endpoint}`)
              .then((res) => res.json())
              .then((data) => ({
                key,
                data: Array.isArray(data)
                  ? data
                  : data.data || data.jobs || [],
              }))
              .catch(() => ({ key, data: [] }))
          )
        );

        const categorized = {};
        results.forEach(({ key, data }) => {
          categorized[key] = data.map(extractJobData);
        });

        setCategoryData((prev) => ({
          ...prev,
          ...categorized,
          isLoading: false,
        }));
      } catch (error) {
        console.error("Error fetching category data:", error);
        setCategoryData((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchAllCategoryData();
  }, []);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const response = await fetch(`${baseUrl}/reminders/expiring-jobs`);
        const data = await response.json();

        if (data.success) {
          setReminders({
            expiresToday: data.expiresToday || [],
            expiringSoon: data.expiringSoon || [],
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Error fetching reminders:", error);
        setReminders((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchReminders();
    const interval = setInterval(fetchReminders, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchLatestJobsByState = async () => {
      try {
        setLatestJobsByState((prev) => ({ ...prev, isLoading: true }));

        const response = await fetch(
          `${baseUrl}/smart-by-state?state=${selectedState}`
        );
        const data = await response.json();

        if (data.success) {
          const jobsData = data.data.map(extractJobData);
          setLatestJobsByState({
            data: jobsData,
            isLoading: false,
            state: data.state,
          });
        } else {
          setLatestJobsByState({
            data: [],
            isLoading: false,
            state: selectedState,
          });
        }
      } catch (error) {
        console.error("Error fetching state jobs:", error);
        setLatestJobsByState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    if (selectedState) {
      fetchLatestJobsByState();
    }
  }, [selectedState]);

  useEffect(() => {
    fetch(`${baseUrl}/fav-posts`)
      .then((res) => res.json())
      .then((data) => setFavPosts(data?.data || []));
  }, []);

  const handleStateChange = (newState) => {
    setSelectedState(newState);
    localStorage.setItem("userState", newState);
  };

  const filteredData = useMemo(() => {
    const filterBySearch = (items) => {
      if (!searchQuery) return items;
      return items.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    };

    return {
      results: filterBySearch(categoryData.results),
      admitCards: filterBySearch(categoryData.admitCards),
      answerKeys: filterBySearch(categoryData.answerKeys),
      admissions: filterBySearch(categoryData.admissions),
      scholarships: filterBySearch(categoryData.scholarships),
      privateJobs: filterBySearch(categoryData.privateJobs),
      stateJobs: filterBySearch(latestJobsByState.data),
    };
  }, [categoryData, latestJobsByState.data, searchQuery]);

  const topVisited = useMemo(() => {
    const topVisitedIds = getTopVisitedIds(10);
    const allJobs = [
      ...categoryData.results,
      ...categoryData.admitCards,
      ...categoryData.answerKeys,
      ...categoryData.admissions,
      ...categoryData.scholarships,
      ...categoryData.privateJobs,
    ];

    return allJobs.filter((job) => topVisitedIds.includes(job.id));
  }, [categoryData]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans">
      <Header />

      <div className="bg-gradient-to-r from-blue-700 to-blue-600 dark:from-blue-800 dark:to-blue-700 text-white text-xs sm:text-sm py-2 shadow-md overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-blue-700 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-blue-600 to-transparent z-10" />
        <div className="animate-marquee whitespace-nowrap flex gap-8 sm:gap-10 items-center px-3 sm:px-4">
          {filteredData.stateJobs.slice(0, 5).map((job, i) => (
            <span
              key={i}
              className="flex items-center gap-1 sm:gap-2 font-medium whitespace-nowrap text-[11px] sm:text-sm"
            >
              <Bell
                size={12}
                className="fill-yellow-400 text-yellow-400 animate-pulse sm:w-3.5 sm:h-3.5"
              />
              {job.title}
            </span>
          ))}
          {filteredData.stateJobs.length === 0 && (
            <span className="text-[11px] sm:text-sm">
              Welcome to JobsAddah - India's No.1 Job Portal
            </span>
          )}
        </div>
      </div>

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-7xl space-y-6 sm:space-y-8">
        {/* Search & Quick Cards Section */}
        <div className="space-y-4 sm:space-y-6">
          <div className="relative max-w-2xl mx-auto w-full">
            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search jobs, admit cards, results..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs sm:text-sm bg-white dark:bg-gray-800 dark:text-white"
            />
          </div>

          {favPosts.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {favPosts.map((item) => (
                <QuickCard
                  key={item._id}
                  id={item._id}
                  icon={Briefcase}
                  title={item.postTitle || "Notification"}
                  color="orange"
                />
              ))}
            </div>
          )}
        </div>

        {categoryData.isLoading ? (
          <div className="py-16 sm:py-20 text-center">
            <div className="inline-block w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-3 sm:mt-4 text-gray-500 font-medium text-sm">
              Loading updates...
            </p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-8">
            {/* Recent Visits - Full Width */}
            {topVisited.length > 0 && (
              <RecentVisitsSection data={topVisited} isLoading={false} />
            )}

            {/* Mobile: Latest Jobs Section First */}
            <div className="lg:hidden">
              <SectionColumn
                title={`Latest ${latestJobsByState.state} Jobs`}
                icon={MapPin}
                data={filteredData.stateJobs}
                colorTheme="green"
                postType="JOB"
                isLoading={latestJobsByState.isLoading}
                showStateSelector={true}
                currentState={selectedState}
                onStateChange={handleStateChange}
              />
            </div>

            {/* Urgent Reminders */}
            <UrgentReminderSection
              expiresToday={reminders.expiresToday}
              expiringSoon={reminders.expiringSoon}
              isLoading={reminders.isLoading}
            />

            {/* Desktop: 3-Column Grid with Latest Jobs */}
            <div className="hidden lg:grid grid-cols-3 gap-4 sm:gap-6">
              <SectionColumn
                title="Results"
                icon={Award}
                data={filteredData.results}
                colorTheme="red"
                postType="RESULT"
                isLoading={categoryData.isLoading}
              />
              <SectionColumn
                title="Admit Cards"
                icon={FileText}
                data={filteredData.admitCards}
                colorTheme="blue"
                postType="ADMIT_CARD"
                isLoading={categoryData.isLoading}
              />
              <SectionColumn
                title={`Latest ${latestJobsByState.state} Jobs`}
                icon={MapPin}
                data={filteredData.stateJobs}
                colorTheme="green"
                postType="JOB"
                isLoading={latestJobsByState.isLoading}
                showStateSelector={true}
                currentState={selectedState}
                onStateChange={handleStateChange}
              />
            </div>

            {/* Mobile: 2-Column or 1-Column Grid */}
            <div className="lg:hidden space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <SectionColumn
                  title="Results"
                  icon={Award}
                  data={filteredData.results}
                  colorTheme="red"
                  postType="RESULT"
                  isLoading={categoryData.isLoading}
                />
                <SectionColumn
                  title="Admit Cards"
                  icon={FileText}
                  data={filteredData.admitCards}
                  colorTheme="blue"
                  postType="ADMIT_CARD"
                  isLoading={categoryData.isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <SectionColumn
                title="Answer Keys"
                icon={FileText}
                data={filteredData.answerKeys}
                colorTheme="pink"
                postType="ANSWER_KEY"
                isLoading={categoryData.isLoading}
              />
              <SectionColumn
                title="Admissions"
                icon={BookOpen}
                data={filteredData.admissions}
                colorTheme="purple"
                postType="ADMISSION"
                isLoading={categoryData.isLoading}
              />
              <SectionColumn
                title="Scholarships"
                icon={Award}
                data={filteredData.scholarships}
                colorTheme="blue"
                postType="SCHOLARSHIP"
                isLoading={categoryData.isLoading}
              />
            </div>

            {/* Private Jobs Section */}
            <div
              id="private-jobs"
              className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-2xl shadow-sm border border-slate-100 dark:border-gray-700 overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-900 dark:bg-slate-800 text-white p-4 sm:p-6 gap-3 sm:gap-4">
                <div>
                  <div className="flex items-center gap-2 font-bold text-base sm:text-2xl mb-0.5 sm:mb-1 dark:text-gray-100">
                    <div className="p-1.5 sm:p-2 bg-purple-500 rounded-lg">
                      <Building2 size={18} className="sm:w-6 sm:h-6" />
                    </div>
                    MNC & Private Jobs
                  </div>
                  <p className="text-slate-400 dark:text-slate-300 text-xs sm:text-sm">
                    Top private companies hiring now. Apply directly.
                  </p>
                </div>
                <Link
                  to="/private-jobs"
                  className="bg-white/10 hover:bg-white/20 text-white px-3 sm:px-5 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-semibold transition-colors border border-white/10 inline-block whitespace-nowrap"
                >
                  View All
                </Link>
              </div>

              <div className="p-3 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
                {filteredData.privateJobs.length > 0 ? (
                  filteredData.privateJobs.map((job) => (
                    <PrivateJobCard key={job.id} job={job} />
                  ))
                ) : categoryData.isLoading ? (
                  <div className="col-span-1 sm:col-span-2 lg:col-span-4 text-center p-6 sm:p-8">
                    <Loader className="mx-auto mb-2 text-slate-400 dark:text-slate-500 animate-spin w-6 h-6 sm:w-8 sm:h-8" />
                    <p className="text-slate-400 dark:text-slate-300 text-xs sm:text-sm">
                      Loading private jobs...
                    </p>
                  </div>
                ) : (
                  <div className="col-span-1 sm:col-span-2 lg:col-span-4 text-center p-6 sm:p-8 text-gray-400 dark:text-gray-500 text-xs sm:text-sm">
                    No private jobs available
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
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
}
