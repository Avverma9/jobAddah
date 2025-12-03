import React, { useState, useEffect, useMemo } from "react";
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

const ListItem = ({ item, colorTheme, showTrending = false }) => {
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

  return (
    <Link
      to={`/post?_id=${item.id}`}
      onClick={handleViewDetails}
      className="group block border-b border-gray-100 last:border-0 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex justify-between items-start gap-2">
            <h3
              className={`text-sm font-semibold text-gray-800 group-hover:${theme.text} leading-snug`}
            >
              {item.title}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              {showTrending && (
                <span className="text-[10px] font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                  <TrendingUp size={10} /> HOT
                </span>
              )}
              {item.isNew && (
                <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">
                  NEW
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
            {item.lastDate && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar size={12} />
                <span>
                  Last Date:{" "}
                  <span className="font-medium text-red-500">
                    {item.lastDate}
                  </span>
                </span>
              </div>
            )}
            {item.totalPosts > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Briefcase size={12} />
                <span>
                  Posts:{" "}
                  <span className="font-medium text-gray-700">
                    {item.totalPosts}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
        <ChevronRight
          size={18}
          className="mt-0.5 text-gray-400 group-hover:text-gray-600 transition-transform group-hover:translate-x-0.5"
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
}) => {
  const getHeaderStyle = () => {
    switch (colorTheme) {
      case "red":
        return "bg-gradient-to-r from-rose-600 to-red-500 shadow-rose-200";
      case "blue":
        return "bg-gradient-to-r from-blue-600 to-indigo-500 shadow-blue-200";
      case "green":
        return "bg-gradient-to-r from-emerald-600 to-green-500 shadow-emerald-200";
      case "orange":
        return "bg-gradient-to-r from-orange-600 to-amber-500 shadow-orange-200";
      case "pink":
        return "bg-gradient-to-r from-pink-600 to-rose-500 shadow-pink-200";
      case "purple":
        return "bg-gradient-to-r from-purple-600 to-violet-500 shadow-purple-200";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col">
      <div
        className={`${getHeaderStyle()} p-4 text-white flex justify-between items-center shadow-md z-10`}
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
            <Icon size={18} />
          </div>
          <h2 className="font-bold text-lg tracking-wide">{title}</h2>
        </div>
        <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full">
          {data.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {data.length > 0 ? (
          data
            .slice(0, 15)
            .map((item) => (
              <ListItem
                key={item.id}
                item={item}
                colorTheme={colorTheme}
                showTrending={showTrending}
              />
            ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
            <Icon size={32} className="mb-2 opacity-20" />
            <p className="text-sm font-medium">No updates yet</p>
          </div>
        )}
      </div>

      <Link
        to={`/view-all?type=${postType}`}
        className="block p-3 text-center text-xs font-bold text-gray-500 hover:bg-gray-50 border-t border-gray-100 uppercase tracking-wider transition-colors"
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
      className={`flex flex-col items-center justify-center p-4 rounded-xl border ${
        colorMap[color]
      } hover:shadow-md transition-all`}
      aria-label={title}
    >
      <Icon size={24} className="mb-2" />
      <span className="font-bold text-sm">{title}</span>
    </Link>
  );
};

const PrivateJobCard = ({ job }) => {
  return (
    <Link
      to={`/post?_id=${job.id}`}
      onClick={() => incrementVisitCount(job.id)}
      className="block bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow p-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 leading-tight line-clamp-2">
            {job.title}
          </h3>
          {job.organization && (
            <p className="text-xs text-gray-500 mt-1">{job.organization}</p>
          )}
          <div className="mt-3 text-[12px] text-gray-600 flex items-center gap-3">
            <Calendar size={14} />
            <span>
              Last Date:{" "}
              <span className="font-medium text-red-600">
                {job.lastDate || "Check details"}
              </span>
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
            {job.postType || "Job"}
          </span>
          <button className="mt-2 px-3 py-1 bg-indigo-600 text-white rounded text-xs font-medium">
            Apply
          </button>
        </div>
      </div>
    </Link>
  );
};

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiData, setApiData] = useState([]);

  useEffect(() => {
    fetch(`${baseUrl}/get-all`)
      .then((res) => res.json())
      .then((data) => {
        const jobs = Array.isArray(data) ? data : data.jobs || [];
        setApiData(jobs);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const categorized = useMemo(() => {
    const results = [];
    const admitCards = [];
    const latestJobs = [];
    const answerKeys = [];
    const admissions = [];
    const scholarships = [];
    const topVisited = [];
    const privateJobs = [];

    const topVisitedIds = getTopVisitedIds(10);
    const visitCounts = getVisitCounts();

    apiData.forEach((raw) => {
      const job = extractJobData(raw);

      if (
        searchQuery &&
        !job.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return;
      }

      if (topVisitedIds.includes(job.id)) {
        topVisited.push(job);
      }

      switch (job.postType) {
        case "RESULT":
          results.push(job);
          break;
        case "ANSWER_KEY":
          answerKeys.push(job);
          break;
        case "ADMIT_CARD":
          admitCards.push(job);
          break;
        case "ADMISSION":
          admissions.push(job);
          break;
        case "SCHOLARSHIP":
          scholarships.push(job);
          break;
        case "PRIVATE_JOB":
          privateJobs.push(job);
          break;
        default:
          latestJobs.push(job);
      }
    });

    topVisited.sort(
      (a, b) => (visitCounts[b.id] || 0) - (visitCounts[a.id] || 0)
    );

    return {
      results,
      admitCards,
      latestJobs,
      answerKeys,
      admissions,
      scholarships,
      topVisited,
      privateJobs,
    };
  }, [apiData, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header />

      <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white text-sm py-2 shadow-md overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-blue-700 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-blue-600 to-transparent z-10" />
        <div className="animate-marquee whitespace-nowrap flex gap-10 items-center px-4">
          {categorized.latestJobs.slice(0, 5).map((job, i) => (
            <span
              key={i}
              className="flex items-center gap-2 font-medium whitespace-nowrap"
            >
              <Bell
                size={14}
                className="fill-yellow-400 text-yellow-400 animate-pulse"
              />{" "}
              {job.title}
            </span>
          ))}
          {categorized.latestJobs.length === 0 && (
            <span>Welcome to JobAddah - India&apos;s No.1 Job Portal</span>
          )}
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div className="space-y-6">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for jobs, admit cards, results..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white"
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickCard icon={BookOpen} title="Syllabus" color="orange" />
            <QuickCard icon={FileText} title="Answer Key" color="pink" />
            <QuickCard icon={Award} title="Scholarship" color="purple" />
            <QuickCard icon={ExternalLink} title="Admission" color="blue" />
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-500 font-medium">Loading updates...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {categorized.topVisited.length > 0 && (
              <div className="grid grid-cols-1 gap-6">
                <SectionColumn
                  title="Recent visits"
                  icon={TrendingUp}
                  data={categorized.topVisited}
                  colorTheme="orange"
                  showTrending
                  postType="ALL"
                />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <SectionColumn
                title="Result"
                icon={Award}
                data={categorized.results}
                colorTheme="red"
                postType="RESULT"
              />
              <SectionColumn
                title="Admit Card"
                icon={FileText}
                data={categorized.admitCards}
                colorTheme="blue"
                postType="ADMIT_CARD"
              />
              <SectionColumn
                title="Latest Jobs"
                icon={Briefcase}
                data={categorized.latestJobs}
                colorTheme="green"
                postType="JOB"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <SectionColumn
                title="Answer Keys"
                icon={FileText}
                data={categorized.answerKeys}
                colorTheme="pink"
                postType="ANSWER_KEY"
              />
              <SectionColumn
                title="Admission"
                icon={BookOpen}
                data={categorized.admissions}
                colorTheme="purple"
                postType="ADMISSION"
              />
              <SectionColumn
                title="Scholarships"
                icon={Award}
                data={categorized.scholarships}
                colorTheme="blue"
                postType="SCHOLARSHIP"
              />
            </div>

            <div
              id="private-jobs"
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-900 text-white p-6 gap-4">
                <div>
                  <div className="flex items-center gap-3 font-bold text-2xl mb-1">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Building2 size={24} />
                    </div>
                    MNC &amp; Private Jobs
                  </div>
                  <p className="text-slate-400 text-sm">
                    Top private companies hiring now. Apply directly.
                  </p>
                </div>
                  <Link to="/private-jobs" className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors border border-white/10 inline-block">
                    View All Vacancies
                  </Link>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 bg-gradient-to-b from-slate-50 to-white">
                {categorized.privateJobs.length > 0 ? (
                  categorized.privateJobs.map((job) => (
                    <PrivateJobCard key={job.id} job={job} />
                  ))
                ) : (
                  <div className="col-span-4 text-center p-8 text-gray-400">
                    Loading private jobs...
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
