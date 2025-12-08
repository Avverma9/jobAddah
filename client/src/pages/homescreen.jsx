import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Bell,
  Award,
  FileText,
  Briefcase,
  BookOpen,
  TrendingUp,
  Building2,
  List,
  CheckCircle,
} from "lucide-react";
import { baseUrl } from "../../util/baseUrl";
import Header from "../components/Header";
import { PrivateJobCard } from "./sections/private";
import { UrgentReminderSection } from "./sections/remider";
import { SectionColumn } from "./sections/sections_list";

const VISIT_STORAGE_KEY = "jobAddah_recent_visits_v2";

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
    visits = visits.slice(0, 10);
    localStorage.setItem(VISIT_STORAGE_KEY, JSON.stringify(visits));
    window.dispatchEvent(new Event("recent-visits-updated"));
  } catch (error) {
    console.error(error);
  }
};

const getPostLink = (idOrUrl) => {
  if (!idOrUrl) return "#";
  const val = idOrUrl.toString();

  // If it's a URL, route with ?url= param
  if (val.includes("http") || val.includes("https")) {
    return `/post?url=${encodeURIComponent(val)}`;
  }

  // Otherwise route with ?id= param
  return `/post?id=${val}`;
};

const getCategoryConfig = (categoryName) => {
  if (!categoryName) return { icon: FileText, color: "gray", postType: "JOB" };
  const name = categoryName.toLowerCase();
  if (name.includes("latest job")) return { icon: Bell, color: "green", postType: "JOB" };
  if (name.includes("admit card")) return { icon: FileText, color: "blue", postType: "ADMIT_CARD" };
  if (name.includes("result")) return { icon: Award, color: "red", postType: "RESULT" };
  if (name.includes("answer key")) return { icon: CheckCircle, color: "pink", postType: "ANSWER_KEY" };
  if (name.includes("admission")) return { icon: BookOpen, color: "purple", postType: "ADMISSION" };
  if (name.includes("syllabus")) return { icon: List, color: "orange", postType: "SYLLABUS" };
  if (name.includes("scholarship")) return { icon: Award, color: "yellow", postType: "SCHOLARSHIP" };
  return { icon: FileText, color: "gray", postType: "JOB" };
};

const QuickCard = ({ icon: Icon, title, id, color }) => {
  const colorMap = {
    orange: "bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-900/50",
    pink: "bg-pink-50 text-pink-600 border-pink-100 hover:bg-pink-100 dark:bg-pink-900/20 dark:text-pink-400 dark:border-pink-900/50",
    purple: "bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-900/50",
    blue: "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/50",
    green: "bg-green-50 text-green-600 border-green-100 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50",
    red: "bg-red-50 text-red-600 border-red-100 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-100 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/50",
    gray: "bg-gray-50 text-gray-600 border-gray-100 hover:bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-700",
  };

  return (
    <Link
      to={getPostLink(id)}
      onClick={() => saveRecentVisit(id)}
      className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-lg sm:rounded-xl border transition-all group ${colorMap[color] || colorMap.gray}`}
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

const SkeletonSection = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm h-full">
    <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center gap-3">
      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    </div>
    <div className="divide-y divide-gray-100 dark:divide-gray-700">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="p-3 sm:p-4 flex gap-3">
          <div className="w-1.5 h-1.5 mt-2 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SkeletonPrivateJobCard = () => (
  <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse" />
      </div>
    </div>
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
    <div className="flex gap-2 pt-2">
      <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    </div>
  </div>
);

const RecentVisitsSection = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 px-1">
        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-orange-500 rounded-full flex items-center justify-center">
          <TrendingUp size={14} className="text-white sm:w-4 sm:h-4" />
        </div>
        <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
          Recent Visits
        </h3>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-3">
        {data.map((job) => (
          <Link
            key={job.id}
            to={getPostLink(job.id)}
            onClick={() => saveRecentVisit(job.id)}
            className="group"
          >
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-gray-900 border border-blue-300 text-blue-600 dark:text-blue-300 dark:border-blue-700 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-all">
              <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                {job.title}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [favPosts, setFavPosts] = useState([]);
  const [recentVisitIds, setRecentVisitIds] = useState([]);
  const [dynamicSections, setDynamicSections] = useState([]);
  const [isDynamicLoading, setIsDynamicLoading] = useState(true);
  const [privateJobs, setPrivateJobs] = useState([]);
  const [isPrivateLoading, setIsPrivateLoading] = useState(true);

  const [reminders, setReminders] = useState({
    expiresToday: [],
    expiringSoon: [],
    isLoading: true,
  });

  useEffect(() => {
    const loadVisits = () => {
      setRecentVisitIds(getRecentVisitIds());
    };
    loadVisits();
    window.addEventListener("recent-visits-updated", loadVisits);
    return () => window.removeEventListener("recent-visits-updated", loadVisits);
  }, []);

  useEffect(() => {
    const fetchDynamicData = async () => {
      try {
        setIsDynamicLoading(true);

        const categoryRes = await fetch(`${baseUrl}/get-sections`);
        const categoryData = await categoryRes.json();
        
        const categories = Array.isArray(categoryData) && categoryData.length > 0 
            ? categoryData[0].categories 
            : [];

        if (categories.length === 0) {
           setDynamicSections([]);
           return;
        }

        const sectionPromises = categories.map(async (cat) => {
            try {
                const res = await fetch(`${baseUrl}/get-postlist`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ url: cat.link }),
                });
                const data = await res.json();

                let jobs = [];
                if (Array.isArray(data)) {
                    const match = data.find(item => item.url === cat.link) || data[0];
                    jobs = match?.jobs || [];
                } else {
                    jobs = data?.jobs || [];
                }

                const processedData = jobs
                    .filter(job => 
                        job.title &&
                        !job.title.toLowerCase().includes("privacy policy") && 
                        !job.title.toLowerCase().includes("sarkari result")
                    )
                    .map(job => ({ ...job, id: job.link }));

                return {
                    name: cat.name,
                    data: processedData,
                    ...getCategoryConfig(cat.name),
                };

            } catch (err) {
                console.error(`Error fetching section ${cat.name}:`, err);
                return {
                    name: cat.name,
                    data: [],
                    ...getCategoryConfig(cat.name),
                };
            }
        });

        const sections = await Promise.all(sectionPromises);
        setDynamicSections(sections);

      } catch (error) {
        console.error("Error fetching dynamic sections:", error);
      } finally {
        setIsDynamicLoading(false);
      }
    };

    fetchDynamicData();
  }, []);

  useEffect(() => {
    const fetchPrivateJobs = async () => {
      try {
        const res = await fetch(`${baseUrl}/get-jobs?postType=PRIVATE_JOB`);
        const data = await res.json();
        const jobs = Array.isArray(data) ? data : data.data || [];
        setPrivateJobs(jobs);
      } catch (error) {
        console.error("Error fetching private jobs:", error);
      } finally {
        setIsPrivateLoading(false);
      }
    };

    fetchPrivateJobs();
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
        setReminders((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchReminders();
    const interval = setInterval(fetchReminders, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch(`${baseUrl}/fav-posts`)
      .then((res) => res.json())
      .then((data) => setFavPosts(data?.data || []));
  }, []);

  const filteredSections = useMemo(() => {
    if (!searchQuery) return dynamicSections;
    return dynamicSections.map((section) => ({
      ...section,
      data: section.data.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }));
  }, [dynamicSections, searchQuery]);

  const recentVisitsData = useMemo(() => {
    if (recentVisitIds.length === 0) return [];
    
    // Combine data from dynamic sections and private jobs for lookup
    const allJobs = [
        ...dynamicSections.flatMap(s => s.data), 
        ...privateJobs.map(j => ({...j, id: j._id, title: j.postTitle}))
    ];

    const jobMap = new Map(allJobs.map((job) => [job.id, job]));

    return recentVisitIds
      .map((id) => jobMap.get(id))
      .filter((job) => job !== undefined);
  }, [dynamicSections, privateJobs, recentVisitIds]);

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

        const scrapedUrlEncoded = url.searchParams.get("q");
        if (scrapedUrlEncoded) {
          try {
             const decodedUrl = atob(scrapedUrlEncoded);
             saveRecentVisit(decodedUrl);
          } catch(e) {}
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

  return (
    <div 
        className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans"
        onClickCapture={handleGlobalClick}
    >
      <Header />

      <div className="bg-gradient-to-r from-blue-700 to-blue-600 dark:from-blue-800 dark:to-blue-700 text-white text-xs sm:text-sm py-2 shadow-md overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-blue-700 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-blue-600 to-transparent z-10" />
        <div className="animate-marquee whitespace-nowrap flex gap-8 sm:gap-10 items-center px-3 sm:px-4">
          {isDynamicLoading ? (
            <span className="text-[11px] sm:text-sm">Loading latest updates...</span>
          ) : filteredSections.length > 0 && filteredSections[0]?.data?.length > 0 ? (
            filteredSections[0].data.slice(0, 5).map((job, i) => (
              <Link
                key={i}
                to={getPostLink(job.id)}
                onClick={() => saveRecentVisit(job.id)} 
                className="flex items-center gap-1 sm:gap-2 font-medium whitespace-nowrap text-[11px] sm:text-sm hover:text-yellow-200 transition-colors"
              >
                <Bell
                  size={12}
                  className="fill-yellow-400 text-yellow-400 animate-pulse sm:w-3.5 sm:h-3.5"
                />
                {job.title}
              </Link>
            ))
          ) : (
            <span className="text-[11px] sm:text-sm">
              Welcome to JobsAddah - India's No.1 Job Portal
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
              className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-xs sm:text-sm bg-white dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* FAV POSTS SECTION FIXED */}
          {favPosts.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {favPosts.map((item) => (
                <QuickCard
                  key={item._id}
                  // We prioritize item.url so getPostLink generates a ?url= link (like sections),
                  // otherwise fallback to item._id
                  id={item.url || item._id}
                  icon={Briefcase}
                  // Title is nested inside recruitment object, fallback to other options just in case
                  title={item.recruitment?.title || item.title || item.postTitle || "Notification"}
                  color="orange"
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6 sm:space-y-8">
          {recentVisitsData.length > 0 && (
            <RecentVisitsSection data={recentVisitsData} />
          )}

          <UrgentReminderSection
            expiresToday={reminders.expiresToday}
            expiringSoon={reminders.expiringSoon}
            isLoading={reminders.isLoading}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {isDynamicLoading
              ? [1, 2, 3, 4, 5, 6].map((i) => <SkeletonSection key={i} />)
              : filteredSections.map((section, idx) => (
                  <SectionColumn
                    key={idx}
                    title={section.name}
                    icon={section.icon}
                    data={section.data}
                    colorTheme={section.color}
                    postType={section.postType}
                    isLoading={false}
                  />
                ))}
          </div>

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
              {isPrivateLoading ? (
                <>
                  <SkeletonPrivateJobCard />
                  <SkeletonPrivateJobCard />
                  <SkeletonPrivateJobCard />
                  <SkeletonPrivateJobCard />
                </>
              ) : privateJobs.length > 0 ? (
                privateJobs.map((job) => (
                  <PrivateJobCard key={job._id} job={job} />
                ))
              ) : (
                <div className="col-span-1 sm:col-span-2 lg:col-span-4 text-center p-6 sm:p-8 text-gray-400 dark:text-gray-500 text-xs sm:text-sm">
                  No private jobs available
                </div>
              )}
            </div>
          </div>
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
      `}</style>
    </div>
  );
}