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
  List,
  CheckCircle,
} from "lucide-react";
import { baseUrl } from "../../util/baseUrl";
import { PrivateJobCard } from "./sections/private";
import { UrgentReminderSection } from "./sections/remider";
import { SectionColumn } from "./sections/sections_list";
import {
  decryptResponse,
  encodeBase64Url,
  parseApiResponse,
} from "../../util/encode-decode";
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
    // Clean the ID - remove curly braces if present
    const cleanId = id.toString().replace(/[{}]/g, '');
    
    let visits = getRecentVisitIds();
    visits = visits.filter((visitId) => visitId !== cleanId);
    visits.unshift(cleanId);
    visits = visits.slice(0, 5);
    localStorage.setItem(VISIT_STORAGE_KEY, JSON.stringify(visits));
    window.dispatchEvent(new Event("recent-visits-updated"));
    
    // Log visit to server
    fetch(`${baseUrl}/log-visit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: cleanId }),
    }).catch((error) => {
      console.error("Failed to log visit on server:", error);
    });
  } catch (error) {
    console.error("Error saving recent visit:", error);
  }
};

const getPostLink = (idOrUrl) => {
  if (!idOrUrl) return "#";
  const val = idOrUrl.toString();
  if (val.startsWith("http://") || val.startsWith("https://")) {
    const encoded = encodeBase64Url(val);
    return `/post?url=${encoded}`;
  }
  return `/post?id={${val}}`.replace("{", "").replace("}", "");
};

const getCategoryConfig = (categoryName = "") => {
  if (!categoryName) {
    return {
      icon: FileText,
      color: "gray",
      postType: "JOB",
      name: "",
    };
  }

  const formattedName =
    categoryName.charAt(0).toUpperCase() + categoryName.slice(1);

  return {
    icon: FileText,
    color: "gray",
    postType: "JOB",
    name: formattedName,
  };
};

const QuickCard = ({ icon: Icon, title, id, color }) => {
  const colorMap = {
    orange:
      "bg-orange-50/50 hover:bg-orange-100 border-orange-100 text-orange-600 dark:bg-orange-900/10 dark:border-orange-900/30 dark:text-orange-400",
    pink: "bg-pink-50/50 hover:bg-pink-100 border-pink-100 text-pink-600 dark:bg-pink-900/10 dark:border-pink-900/30 dark:text-pink-400",
    purple:
      "bg-purple-50/50 hover:bg-purple-100 border-purple-100 text-purple-600 dark:bg-purple-900/10 dark:border-purple-900/30 dark:text-purple-400",
    blue: "bg-blue-50/50 hover:bg-blue-100 border-blue-100 text-blue-600 dark:bg-blue-900/10 dark:border-blue-900/30 dark:text-blue-400",
    green:
      "bg-emerald-50/50 hover:bg-emerald-100 border-emerald-100 text-emerald-600 dark:bg-emerald-900/10 dark:border-emerald-900/30 dark:text-emerald-400",
    red: "bg-red-50/50 hover:bg-red-100 border-red-100 text-red-600 dark:bg-red-900/10 dark:border-red-900/30 dark:text-red-400",
    yellow:
      "bg-yellow-50/50 hover:bg-yellow-100 border-yellow-100 text-yellow-600 dark:bg-yellow-900/10 dark:border-yellow-900/30 dark:text-yellow-400",
    gray: "bg-gray-50/50 hover:bg-gray-100 border-gray-100 text-gray-600 dark:bg-gray-800/30 dark:border-gray-700 dark:text-gray-400",
  };

  const activeClass = colorMap[color] || colorMap.gray;

  return (
    <Link
      to={getPostLink(id)}
      onClick={() => saveRecentVisit(id)}
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



const RecentVisitsSection = ({ data }) => {
  if (!data || data?.length === 0) return null;
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
        {data.map((job, index) => {
          const jobId = job.id || job._id || job.link || job.url;
          const jobTitle = job.title || job.postTitle || job.recruitment?.title || 'Untitled';
          
          return (
            <Link
              key={jobId || index}
              to={getPostLink(jobId)}
              onClick={() => saveRecentVisit(jobId)}
              className="group"
            >
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-gray-900 border border-blue-300 text-blue-600 dark:text-blue-300 dark:border-blue-700 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-all">
                <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                  {jobTitle}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [favPosts, setFavPosts] = useState([]);
  const [recentVisitIds, setRecentVisitIds] = useState([]);
  const [dynamicSections, setDynamicSections] = useState([]);
  const [isDynamicLoading, setIsDynamicLoading] = useState(true);
  const [privateJobs, setPrivateJobs] = useState([]);
  const [isPrivateLoading, setIsPrivateLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [reminders, setReminders] = useState({
    expiresToday: [],
    expiringSoon: [],
    isLoading: true,
  });
  
  const { withLoader } = useGlobalLoader();

  useEffect(() => {
    if (!searchQuery) {
      setIsTyping(false);
      setIsSearching(false);
      setSearchResults([]);
      return;
    }
    setIsTyping(true);
    const typingTimeout = setTimeout(() => {
      setIsTyping(false);
    }, 400);
    return () => clearTimeout(typingTimeout);
  }, [searchQuery]);

  useEffect(() => {
    if (!searchQuery) return;
    const delay = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await fetch(
          `${baseUrl}/find-by-title?title=${encodeURIComponent(searchQuery)}`
        );
        const payload = await parseApiResponse(res);
        const results = payload?.data ?? payload;
        const finalRes = Array.isArray(results) ? results : [];
        setSearchResults(finalRes);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 1000);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  useEffect(() => {
    const loadVisits = () => {
      setRecentVisitIds(getRecentVisitIds());
    };
    loadVisits();
    window.addEventListener("recent-visits-updated", loadVisits);
    return () =>
      window.removeEventListener("recent-visits-updated", loadVisits);
  }, []);

  useEffect(() => {
    const fetchDynamicData = async () => {
      try {
        setIsDynamicLoading(true);
        await withLoader(async () => {
          const categoryRes = await fetch(`${baseUrl}/get-sections`);
          const categoryPayload = await parseApiResponse(categoryRes);
          const sectionDocs = categoryPayload?.data ?? categoryPayload ?? [];
          const categories =
            Array.isArray(sectionDocs) && sectionDocs?.length > 0
              ? sectionDocs[0]?.categories || []
              : [];
          if (categories?.length === 0) {
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
              const payload = await parseApiResponse(res);
              const base = payload?.data ?? payload;
              let jobs = [];
              if (Array.isArray(base)) {
                const match =
                  base.find((item) => item.url === cat.link) || base[0];
                jobs = match?.jobs || [];
              } else {
                jobs = base?.jobs || [];
              }
              const processedData = (jobs || [])
                .filter(
                  (job) =>
                    job.title &&
                    !job.title.toLowerCase().includes("privacy policy") &&
                    !job.title.toLowerCase().includes("sarkari result")
                )
                .map((job) => ({ ...job, id: job.link }));
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
        }, "Loading latest job sections...", 50);
      } catch (error) {
        console.error("Error fetching dynamic sections:", error);
      } finally {
        setIsDynamicLoading(false);
      }
    };
    fetchDynamicData();
  }, [withLoader]);

  useEffect(() => {
    const fetchPrivateJobs = async () => {
      try {
        await withLoader(async () => {
          const res = await fetch(`${baseUrl}/get-jobs?postType=PRIVATE_JOB`);
          const payload = await parseApiResponse(res);
          const base = payload?.data ?? payload;
          const jobs = Array.isArray(base) ? base : base?.data || [];
          setPrivateJobs(jobs || []);
        }, "Loading private job opportunities...", 50);
      } catch (error) {
        console.error("Error fetching private jobs:", error);
      } finally {
        setIsPrivateLoading(false);
      }
    };
    fetchPrivateJobs();
  }, [withLoader]);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        await withLoader(async () => {
          const response = await fetch(`${baseUrl}/reminders/expiring-jobs`);
          const data = await parseApiResponse(response);
          if (data?.success) {
            const list = Array.isArray(data.reminders) ? data.reminders : [];
            const expiresToday = list.filter((item) => item.daysLeft === 0);
            const expiringSoon = list.filter((item) => item.daysLeft > 0);
            setReminders({
              expiresToday,
              expiringSoon,
              isLoading: false,
            });
          } else {
            setReminders((prev) => ({ ...prev, isLoading: false }));
          }
        }, "Loading job reminders and deadlines...", 50);
      } catch (error) {
        console.error("Error fetching reminders:", error);
        setReminders((prev) => ({ ...prev, isLoading: false }));
      }
    };
    fetchReminders();
    const interval = setInterval(fetchReminders, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [withLoader]);

  useEffect(() => {
    const fetchFavPosts = async () => {
      try {
        await withLoader(async () => {
          const res = await fetch(`${baseUrl}/fav-posts`);
          const payload = await parseApiResponse(res);
          let fav = [];
          if (Array.isArray(payload)) {
            fav = payload;
          } else if (Array.isArray(payload?.data)) {
            fav = payload.data;
          } else if (Array.isArray(payload?.data?.data)) {
            fav = payload.data.data;
          }
          setFavPosts(fav);
        }, "Loading featured job posts...", 50);
      } catch (error) {
        console.error("Error fetching fav posts:", error);
        setFavPosts([]);
      }
    };
    fetchFavPosts();
  }, [withLoader]);

  // IMPORTANT: Remove searchQuery dependency - sections ko filter mat karo
  const recentVisitsData = useMemo(() => {
    if (recentVisitIds?.length === 0) return [];
    
    const allJobs = [
      ...dynamicSections.flatMap((s) => s.data || []),
      ...privateJobs.map((j) => ({ ...j, id: j._id || j.id, title: j.postTitle || j.title })),
    ];
    
    // Create multiple mappings for different ID formats
    const jobMap = new Map();
    allJobs.forEach((job) => {
      if (job.id) jobMap.set(job.id, job);
      if (job._id) jobMap.set(job._id, job);
      if (job.link) jobMap.set(job.link, job);
      if (job.url) jobMap.set(job.url, job);
    });
    
    const matchedJobs = recentVisitIds
      .map((id) => {
        // Try to find job by different ID formats
        let job = jobMap.get(id);
        if (!job && typeof id === 'string') {
          // Try to match by URL or link
          job = allJobs.find(j => 
            j.link === id || 
            j.url === id || 
            j._id === id ||
            j.id === id
          );
        }
        return job;
      })
      .filter((job) => job !== undefined);
    
    // Debug logging
    if (recentVisitIds.length > 0) {
      console.log('Recent Visit IDs:', recentVisitIds);
      console.log('All Jobs Count:', allJobs.length);
      console.log('Matched Jobs:', matchedJobs);
    }
    
    return matchedJobs;
  }, [dynamicSections, privateJobs, recentVisitIds]);

  const handleGlobalClick = (e) => {
    const link = e.target.closest("a");
    if (!link || !link.href) return;
    const url = new URL(link.href);
    if (!url.pathname.includes("/post")) return;
    const urlParam = url.searchParams.get("url");
    if (urlParam) {
      saveRecentVisit(urlParam);
      return;
    }
    const scrapedUrlEncoded = url.searchParams.get("q");
    if (scrapedUrlEncoded) {
      saveRecentVisit(scrapedUrlEncoded);
      return;
    }
    const id = url.searchParams.get("id") || url.searchParams.get("_id");
    if (id) {
      saveRecentVisit(id);
    }
  };

  const showSearchSkeleton =
    searchQuery.length > 0 && (isTyping || isSearching);

  return (
    <div
      className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans"
      onClickCapture={handleGlobalClick}
    >
      <SEO
        title="JobsAddah – Your Career Gateway | Sarkari Result 2025, Latest Govt Jobs, Sarkari Naukri"
        description="JobsAddah – Your Career Gateway: India's #1 portal for sarkari result 2025, latest government jobs, sarkari naukri notifications, admit card downloads, exam results. SSC, Railway, Bank, UPSC, Defence jobs. Apply online for govt job vacancies today."
        keywords="JobsAddah, sarkari result 2025, latest govt jobs 2025, bihar sarkari naukri, up sarkari result, ssc gd constable vacancy, railway group d recruitment, ibps so result 2025, ssc cgl admit card, ssc chsl answer key, upsc exam calendar 2025, ssc admit card 2025, railway admit card download, up police si admit card, ssc cpo admit card, ctet admit card 2026, rrb ntpc admit card, ssc delhi police admit card, emrs teacher admit card, bihar bpsc admit card, afcat admit card 2026, sarkari result bihar board, up board result 2025, ssc result 2025, railway result 2025, ibps clerk result, ssc gd result 2026, up police result 2025, bihar bssc result, jpsc result 2025, bseb deled result, sarkari online form 2025, ssc online form, railway online form, up deled online form, bihar iti online form, nvs admission online form, ctet online form 2026, mppsc online form, upsc online form, afcat online form, private jobs in india, it jobs for freshers, work from home jobs, naukri.com jobs, pvtjob.in updates, latest private vacancy, digital marketing jobs, software developer jobs, android developer jobs, react native jobs, ssc gd syllabus 2025, railway exam pattern, upsc syllabus pdf, ssc cgl syllabus, ssc chsl syllabus, ctet syllabus 2026, bihar police syllabus, up police syllabus, rrb group d syllabus, ibps po syllabus, sarkari admission form, nvs class 9 admission, nvs class 11 admission, bihar deled admission, up deled admission, bcece counselling 2025, iti admission bihar, polytechnic admission 2025, clat admission form, cmat admission 2026, sarkari naukri 2025, sarkari exam 2025, sarkari job portal, sarkari vacancy 2025, sarkari yojna updates, sarkari notification, sarkari recruitment 2025, sarkari career portal, sarkari latest jobs, sarkari online apply, bihar govt jobs, up govt jobs, delhi govt jobs, jharkhand govt jobs, rajasthan govt jobs, mp govt jobs, haryana govt jobs, punjab govt jobs, maharashtra govt jobs, west bengal govt jobs, sarkari result latest update, sarkari result admit card download, sarkari result online form apply, sarkari result answer key check, sarkari result govt jobs notification, sarkari result private jobs update, sarkari result exam syllabus pdf, sarkari result admission form online, sarkari result recruitment 2025, sarkari result vacancy details"
        canonical="/"
      />
      <div className="bg-gradient-to-r from-blue-700 to-blue-600 dark:from-blue-800 dark:to-blue-700 text-white text-xs sm:text-sm py-2 shadow-md overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-blue-700 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-blue-600 to-transparent z-10" />
        <div className="animate-marquee whitespace-nowrap flex gap-8 sm:gap-10 items-center px-3 sm:px-4">
          {isDynamicLoading ? (
            <span className="text-[11px] sm:text-sm">
              Loading latest updates...
            </span>
          ) : dynamicSections?.length > 0 &&
            dynamicSections[0]?.data?.length > 0 ? (
            dynamicSections[0].data.slice(0, 5).map((job, i) => (
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
        {/* Top Banner Ad */}
        <AdContainer 
          placement="banner" 
          pageType="homepage"
          format="horizontal"
          className="mb-6"
        />
        
        <div className="space-y-4 sm:space-y-6">
          <div className="relative max-w-2xl mx-auto w-full">
            {/* Animated Gradient Border Wrapper */}
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

            {/* Search Results Dropdown */}
            {searchQuery.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 z-30 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl max-h-80 overflow-y-auto">
                <div className="p-2 sm:p-3">
                  {showSearchSkeleton ? (
                    <p className="text-gray-500 text-sm py-1.5 px-1">
                      Searching...
                    </p>
                  ) : searchResults.length === 0 ? (
                    <p className="text-gray-500 text-sm py-1.5 px-1">
                      No results found.
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {searchResults.map((item) => (
                        <Link
                          key={item._id || item.id}
                          to={getPostLink(item?.url)}
                          onClick={() => {
                            saveRecentVisit(item._id || item.id);
                            setSearchQuery(""); // Clear search on click
                          }}
                          className="block px-2 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                        >
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {item.recruitment?.title ||
                              item.title ||
                              "Untitled Post"}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.recruitment?.date || ""}
                          </p>
                        </Link>
                      ))}
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
                  key={item._id}
                  id={item.url || item._id}
                  icon={Briefcase}
                  title={
                    item.recruitment?.title ||
                    item.title ||
                    item.postTitle ||
                    "Notification"
                  }
                  color="orange"
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6 sm:space-y-8">
          {recentVisitsData?.length > 0 && (
            <RecentVisitsSection data={recentVisitsData} />
          )}

          {/* Rectangle Ad after Recent Visits */}
          <AdContainer 
            placement="rectangle" 
            pageType="homepage"
            format="rectangle"
            className="my-8"
          />

          <UrgentReminderSection
            expiresToday={reminders.expiresToday}
            expiringSoon={reminders.expiringSoon}
            isLoading={reminders.isLoading}
          />

          {/* SECTIONS - No filtering based on search */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {!isDynamicLoading && dynamicSections.map((section, idx) => {
                  // Insert ad after every 3rd section
                  const shouldShowAd = (idx + 1) % 3 === 0 && idx < dynamicSections.length - 1;
                  return (
                    <React.Fragment key={idx}>
                      <SectionColumn
                        title={section.name}
                        icon={section.icon}
                        data={section.data} // Original data without filtering
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
          
          {/* Bottom Rectangle Ad */}
          <AdContainer 
            placement="rectangle" 
            pageType="homepage"
            format="rectangle"
            className="mt-8"
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

        
        /* Animated Gradient Border */
        .gradient-border-wrapper {
          position: relative;
          padding: 2px;
          border-radius: 0.75rem; /* Matches rounded-lg */
          background: linear-gradient(90deg, 
            #ff0080, 
            #ff8c00, 
            #40e0d0, 
            #00bfff, 
            #9370db, 
            #ff0080
          );
          background-size: 300% 300%;
          animation: gradientRotate 4s linear infinite;
        }
        
        @media (min-width: 640px) {
          .gradient-border-wrapper {
            border-radius: 1rem; /* Matches rounded-xl on larger screens */
          }
        }
        
        @keyframes gradientRotate {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        
        .gradient-border-wrapper:hover {
          animation: gradientRotate 2s linear infinite; /* Faster on hover */
        }
      `}</style>

    </div>
  );
}
