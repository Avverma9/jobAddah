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

const VISIT_STORAGE_KEY = "jobAddah_visit_counts";

const getVisitCounts = () => {
  try {
    const stored = localStorage.getItem(VISIT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const incrementVisitCount = (jobId) => {
  try {
    const counts = getVisitCounts();
    counts[jobId] = (counts[jobId] || 0) + 1;
    localStorage.setItem(VISIT_STORAGE_KEY, JSON.stringify(counts));
    return counts[jobId];
  } catch {
    return 0;
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

const parseDate = (dateString) => {
  if (
    !dateString ||
    dateString.toLowerCase().includes("soon") ||
    dateString.toLowerCase().includes("notify")
  ) {
    return null;
  }
  const parts = dateString.split("-");
  if (parts.length === 3) {
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }
  return null;
};

const getDaysRemaining = (dateString) => {
  const date = parseDate(dateString);
  if (!date) return null;

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  const timeDiff = date - now;
  const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  return daysRemaining;
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

const ListItem = ({
  item,
  colorTheme,
  showTrending = false,
  showUrgent = false,
}) => {
  const getThemeColors = () => {
    switch (colorTheme) {
      case "red":
        return {
          text: "text-rose-600",
          bg: "bg-rose-50",
          border: "border-rose-100",
          btn: "bg-rose-600 hover:bg-rose-700",
        };
      case "blue":
        return {
          text: "text-blue-600",
          bg: "bg-blue-50",
          border: "border-blue-100",
          btn: "bg-blue-600 hover:bg-blue-700",
        };
      case "green":
        return {
          text: "text-emerald-600",
          bg: "bg-emerald-50",
          border: "border-emerald-100",
          btn: "bg-emerald-600 hover:bg-emerald-700",
        };
      case "orange":
        return {
          text: "text-orange-600",
          bg: "bg-orange-50",
          border: "border-orange-100",
          btn: "bg-orange-600 hover:bg-orange-700",
        };
      case "pink":
        return {
          text: "text-pink-600",
          bg: "bg-pink-50",
          border: "border-pink-100",
          btn: "bg-pink-600 hover:bg-pink-700",
        };
      case "purple":
        return {
          text: "text-purple-600",
          bg: "bg-purple-50",
          border: "border-purple-100",
          btn: "bg-purple-600 hover:bg-purple-700",
        };
      default:
        return {
          text: "text-gray-600",
          bg: "bg-gray-50",
          border: "border-gray-100",
          btn: "bg-gray-600 hover:bg-gray-700",
        };
    }
  };

  const theme = getThemeColors();

  const handleViewDetails = () => {
    incrementVisitCount(item.id);
  };

  return (      <Link
        to={`/post?_id=${item.id}`}
        onClick={handleViewDetails}
        className="group block border-b border-gray-100 dark:border-gray-700 last:border-0 p-3 sm:p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <div className="flex justify-between items-start gap-2">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug line-clamp-2">
              {item.title}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              {showUrgent && (
                <span className="text-[9px] sm:text-[10px] font-bold bg-red-600 text-white px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse">
                  <AlertCircle size={8} /> URGENT
                </span>
              )}
              {showTrending && (
                <span className="text-[9px] sm:text-[10px] font-bold bg-orange-500 text-white px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <TrendingUp size={8} /> HOT
                </span>
              )}
              {item.isNew && (
                <span className="text-[9px] sm:text-[10px] font-bold bg-red-500 text-white px-1.5 sm:px-2 py-0.5 rounded-full animate-pulse">
                  NEW
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 mt-1.5">
            {item.lastDate && (
              <div className="flex items-center gap-1 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
                <Calendar size={10} />
                <span>
                  Last Date:{" "}
                  <span className="font-medium text-red-500">
                    {item.lastDate}
                  </span>
                </span>
              </div>
            )}
            {item.totalPosts > 0 && (
              <div className="flex items-center gap-1 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
                <Briefcase size={10} />
                <span>
                  Posts:{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {item.totalPosts}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
        <ChevronRight
          size={16}
          className="mt-0.5 text-gray-400 group-hover:text-gray-600 transition-transform group-hover:translate-x-0.5 shrink-0"
        />
      </div>
    </Link>
  );
};

const SectionColumn = ({
  title,
  icon: Icon,
  data,
  colorTheme,
  showTrending = false,
  postType,
  isLoading = false,
  showStateSelector = false,
  currentState,
  onStateChange,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getHeaderStyle = () => {
    switch (colorTheme) {
      case "red":
        return "bg-gradient-to-r from-rose-600 to-red-500";
      case "blue":
        return "bg-gradient-to-r from-blue-600 to-indigo-500";
      case "green":
        return "bg-gradient-to-r from-emerald-600 to-green-500";
      case "orange":
        return "bg-gradient-to-r from-orange-600 to-amber-500";
      case "pink":
        return "bg-gradient-to-r from-pink-600 to-rose-500";
      case "purple":
        return "bg-gradient-to-r from-purple-600 to-violet-500";
      default:
        return "bg-gray-600";
    }
  };

  const STATES = [
    "ALL",
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
      <div
        className={`${getHeaderStyle()} p-3 sm:p-4 text-white flex justify-between items-center shadow-md z-10`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 sm:p-1.5 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
            <Icon size={16} className="sm:w-4.5 sm:h-4.5" />
          </div>
          <h2 className="font-bold text-sm sm:text-lg tracking-wide truncate dark:text-gray-100">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {showStateSelector && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2 sm:px-3 py-1 sm:py-1.5 rounded text-[10px] sm:text-xs font-semibold transition-colors whitespace-nowrap"
              >
                <MapPin size={12} className="shrink-0" />
                <span className="hidden xs:inline line-clamp-1 max-w-[80px] sm:max-w-full">
                  {currentState}
                </span>
                <span className="xs:hidden">
                  {currentState.split(" ")[0]}
                </span>
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 shrink-0 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-44 sm:w-48 max-h-48 sm:max-h-80 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-xl z-50">
                  {STATES.map((state) => (
                    <button
                      key={state}
                      onClick={() => {
                        onStateChange(state);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2 sm:px-4 py-1.5 sm:py-2.5 text-[11px] sm:text-sm font-medium transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 ${
                        currentState === state
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-semibold"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      {state}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <span className="text-[10px] sm:text-xs font-bold bg-white/20 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
            {data.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="h-32 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data.length > 0 ? (
          data
            .slice(0, 11)
            .map((item) => (
              <ListItem
                key={item.id}
                item={item}
                colorTheme={colorTheme}
                showTrending={showTrending}
              />
            ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-4 sm:p-6 text-center">
            <Icon size={28} className="mb-2 opacity-20 sm:w-8 sm:h-8" />
            <p className="text-xs sm:text-sm font-medium">No updates yet</p>
          </div>
        )}
      </div>

      <Link
        to={`/view-all?type=${postType}`}
        className="block p-2 sm:p-3 text-center text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-100 dark:border-gray-700 uppercase tracking-wider transition-colors"
      >
        View All {title}
      </Link>
    </div>
  );
};

const QuickCard = ({ icon: Icon, title, color }) => {
  const colorMap = {
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    pink: "bg-pink-50 text-pink-600 border-pink-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
  };

  return (
    <Link
      to={`/view-all?type=${title.replace(/\s+/g, "_").toUpperCase()}`}
      className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg sm:rounded-xl border ${colorMap[color]} hover:shadow-md dark:hover:shadow-lg transition-all`}
      aria-label={title}
    >
      <Icon size={20} className="mb-1 sm:mb-2 sm:w-6 sm:h-6" />
      <span className="font-bold text-xs sm:text-sm text-center">{title}</span>
    </Link>
  );
};

const PrivateJobCard = ({ job }) => {
  return (
    <Link
      to={`/post?_id=${job.id}`}
      onClick={() => incrementVisitCount(job.id)}
      className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg transition-shadow p-3 sm:p-4"
    >
      <div className="flex flex-col gap-2 sm:gap-3">
        <div>
          <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight line-clamp-2">
            {job.title}
          </h3>
          {job.organization && (
            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
              {job.organization}
            </p>
          )}
        </div>
        <div className="text-[10px] sm:text-[12px] text-gray-600 dark:text-gray-400 flex items-center gap-2">
          <Calendar size={12} className="shrink-0" />
          <span>
            Last: <span className="font-medium text-red-600 dark:text-red-400">{job.lastDate || "Check"}</span>
          </span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
            {job.postType || "Job"}
          </span>
          <button className="px-2 sm:px-3 py-0.5 sm:py-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded text-[9px] sm:text-xs font-medium transition-colors">
            Apply
          </button>
        </div>
      </div>
    </Link>
  );
};

const UrgentReminderSection = ({ expiresToday, expiringSoon, isLoading }) => {
  const allUrgent = [...(expiresToday || []), ...(expiringSoon || [])];

  if (isLoading) {
    return (    <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg sm:rounded-xl border-2 border-red-200 dark:border-red-700 overflow-hidden shadow-md p-4 sm:p-6 flex items-center justify-center gap-3">
      <Loader size={18} className="text-red-600 dark:text-red-400 animate-spin sm:w-5 sm:h-5" />
      <p className="text-red-700 dark:text-red-300 font-semibold text-xs sm:text-base">
          Loading urgent reminders...
        </p>
      </div>
    );
  }

  if (allUrgent.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg sm:rounded-xl border-2 border-red-200 dark:border-red-700 overflow-hidden shadow-md">
      <div className="bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-700 dark:to-orange-700 text-white p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
        <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
          <AlertCircle size={18} className="sm:w-6 sm:h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-sm sm:text-lg tracking-wide dark:text-white">⚡ Urgent</h2>
          <p className="text-[10px] sm:text-xs text-red-100 dark:text-red-200 mt-0.5">
            Deadline within 5 days
          </p>
        </div>
        <span className="text-[9px] sm:text-xs font-bold bg-white/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shrink-0">
          {allUrgent.length}
        </span>
      </div>

      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 max-h-96 overflow-y-auto dark:bg-gray-800">
        {expiresToday && expiresToday.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] sm:text-xs font-bold text-red-700 dark:text-red-300 px-2">
              🔴 EXPIRING TODAY ({expiresToday.length})
            </p>
            {expiresToday.map((item) => (
              <Link
                key={item._id}
                to={`/post?_id=${item._id}`}
                onClick={() => incrementVisitCount(item._id)}
                className="block p-2 sm:p-3 rounded border-l-4 border-l-red-700 bg-red-100 dark:bg-red-900/40 hover:shadow-md dark:hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2">
                      {item.title}
                    </h4>
                  </div>
                  <span className="inline-flex items-center gap-0.5 bg-red-700 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full animate-pulse shrink-0 whitespace-nowrap">
                    <Clock size={9} /> TODAY!
                  </span>
                </div>
                <div className="mt-1.5 sm:mt-2 flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-red-700 dark:text-red-300">
                  <Calendar size={10} />
                  {item.lastDate}
                </div>
              </Link>
            ))}
          </div>
        )}

        {expiringSoon && expiringSoon.length > 0 && (
          <div className="space-y-2">
            <p className="text-[10px] sm:text-xs font-bold text-orange-700 dark:text-orange-300 px-2 mt-2">
              🟠 EXPIRING SOON ({expiringSoon.length})
            </p>
            {expiringSoon.map((item) => {
              const urgencyColor =
                item.daysLeft <= 1
                  ? "border-l-red-600 bg-red-50 dark:bg-red-900/30"
                  : item.daysLeft <= 3
                  ? "border-l-orange-600 bg-orange-50 dark:bg-orange-900/30"
                  : "border-l-yellow-600 bg-yellow-50 dark:bg-yellow-900/30";

              return (
                <Link
                  key={item._id}
                  to={`/post?_id=${item._id}`}
                  onClick={() => incrementVisitCount(item._id)}
                  className={`block p-2 sm:p-3 rounded border-l-4 ${urgencyColor} hover:shadow-md dark:hover:shadow-lg transition-all`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2">
                        {item.title}
                      </h4>
                    </div>
                    <span className="inline-flex items-center gap-0.5 bg-red-600 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full animate-pulse shrink-0 whitespace-nowrap">
                      <Clock size={9} /> {item.daysLeft}d
                    </span>
                  </div>
                  <div className="mt-1.5 sm:mt-2 flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-red-600 dark:text-red-400">
                    <Calendar size={10} />
                    {item.lastDate}
                  </div>
                </Link>
              );
            })}
          </div>
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
              Welcome to JobAddah - India's No.1 Job Portal
            </span>
          )}
        </div>
      </div>

      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-7xl space-y-6 sm:space-y-8">
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
              className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg sm:rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs sm:text-sm bg-white"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            <QuickCard icon={BookOpen} title="Syllabus" color="orange" />
            <QuickCard icon={FileText} title="Answer Key" color="pink" />
            <QuickCard icon={Award} title="Scholarship" color="purple" />
            <QuickCard icon={ExternalLink} title="Admission" color="blue" />
          </div>
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
            <UrgentReminderSection
              expiresToday={reminders.expiresToday}
              expiringSoon={reminders.expiringSoon}
              isLoading={reminders.isLoading}
            />

            {topVisited.length > 0 && (
              <div className="grid grid-cols-1 gap-6 sm:gap-8">
                <SectionColumn
                  title="Recent Visits"
                  icon={TrendingUp}
                  data={topVisited}
                  colorTheme="orange"
                  showTrending
                  postType="ALL"
                />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
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

            <div
              id="private-jobs"
              className="bg-white rounded-lg sm:rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
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
      `}</style>
    </div>
  );
}