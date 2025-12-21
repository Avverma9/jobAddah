import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchSections } from "../../../redux/slices/sectionsSlice";
import { fetchReminders } from "../../../redux/slices/remindersSlice";
import { fetchSearchResults, clearSearch } from "../../../redux/slices/searchSlice";
import api from "../../util/apiClient";
import { 
  Search, Bell, Briefcase, Timer, Calendar, ChevronRight, 
  Building2, Wrench, Clock, Image, FileText, Type, Award 
} from "lucide-react";
import SEO from "../../util/SEO";

// Helper to extract path from URL (remove domain)
const extractPath = (url) => {
  if (!url) return "";
  try {
    // If it's a full URL, extract just the path
    if (url.startsWith("http://") || url.startsWith("https://")) {
      const urlObj = new URL(url);
      return urlObj.pathname;
    }
    // Already a path
    return url.startsWith("/") ? url : `/${url}`;
  } catch {
    return url.startsWith("/") ? url : `/${url}`;
  }
};

const getPostLink = (idOrUrl) => {
  if (!idOrUrl) return "#";
  const val = idOrUrl.toString().trim();
  
  // If it's a URL (full or path), use url parameter
  if (val.startsWith("http://") || val.startsWith("https://") || val.startsWith("/")) {
    const path = extractPath(val);
    return `/post?url=${encodeURIComponent(path)}`;
  }
  
  // For MongoDB ObjectId or other IDs, use id parameter
  return `/post?id=${val}`;
};

// Mobile Header
const MobileHeader = ({ onSearchToggle }) => (
  <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="bg-blue-600 text-white p-1.5 rounded-lg">
        <Briefcase size={20} />
      </div>
      <h1 className="text-xl font-bold tracking-tight text-blue-900">
        Jobs<span className="text-blue-600">Addah</span>
      </h1>
    </div>
    <div className="flex gap-3">
      <button
        className="p-2 hover:bg-gray-100 rounded-full transition"
        onClick={onSearchToggle}
      >
        <Search size={20} className="text-gray-600" />
      </button>
      <button className="p-2 hover:bg-gray-100 rounded-full transition">
        <Bell size={20} className="text-gray-600" />
      </button>
    </div>
  </header>
);

// Search Overlay
const SearchOverlay = ({ isOpen, onClose, searchQuery, setSearchQuery, results, isSearching }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <button onClick={onClose} className="p-2 -ml-2">
          <ChevronRight size={20} className="rotate-180 text-gray-600" />
        </button>
        <input
          type="text"
          placeholder="Search jobs, results, admit cards..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
          className="flex-1 text-sm outline-none"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="text-gray-400 text-sm">
            Clear
          </button>
        )}
      </div>

      <div className="overflow-y-auto h-[calc(100vh-60px)]">
        {isSearching ? (
          <div className="p-4 text-center text-gray-500">Searching...</div>
        ) : results.length === 0 && searchQuery ? (
          <div className="p-4 text-center text-gray-500">No results found</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {results.map((item, idx) => (
              <Link
                key={idx}
                to={getPostLink(item.linkTarget)}
                onClick={onClose}
                className="block px-4 py-3 hover:bg-gray-50"
              >
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">{item.title}</h3>
                {item.secondaryLine && (
                  <p className="text-xs text-gray-500 mt-1">{item.secondaryLine}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Hero Section
const HeroSection = () => (
  <div className="px-4 py-4">
    <div className="relative rounded-2xl overflow-hidden shadow-md h-40">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-600" />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-transparent flex flex-col justify-center px-6">
        <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-1">
          Career Goals
        </span>
        <h2 className="text-white text-xl font-bold leading-tight">
          Track Your <br />Sarkari Success
        </h2>
      </div>
    </div>
  </div>
);

// Expiring Soon Section
const ExpiringSoonSection = ({ reminders, loading }) => {
  const allReminders = [...(reminders.expiresToday || []), ...(reminders.expiringSoon || [])];

  if (loading) {
    return (
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gray-900 font-bold text-base flex items-center gap-1">
            <Timer size={18} className="text-red-500" />
            Expiring Soon
          </h3>
        </div>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory py-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="snap-start shrink-0 w-[280px] bg-gray-100 p-4 rounded-xl h-[130px] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (allReminders.length === 0) return null;

  return (
    <div className="px-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-gray-900 font-bold text-base flex items-center gap-1">
          <Timer size={18} className="text-red-500" />
          Expiring Soon
        </h3>
      </div>
      <div className="flex gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory py-1">
        {allReminders.slice(0, 10).map((reminder, idx) => (
          <Link
            key={idx}
            to={getPostLink(reminder.url || reminder.link || reminder._id || reminder.id)}
            className="snap-start shrink-0 w-[280px] bg-gradient-to-br from-white to-red-50 p-4 rounded-xl border border-red-100 shadow-sm flex flex-col justify-between h-[130px]"
          >
            <div>
              <div className="flex justify-between items-start mb-1">
                <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Closing Soon
                </span>
                <span className="text-red-500 font-bold text-xs">
                  {reminder.daysLeft === 0 ? "Today" : `${reminder.daysLeft} Days Left`}
                </span>
              </div>
              <h4 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">
                {reminder.title || reminder.postTitle}
              </h4>
            </div>
            <div className="flex justify-between items-end mt-2">
              <span className="text-[10px] text-gray-500 font-medium truncate max-w-[120px]">
                {reminder.organization || ""}
              </span>
              <span className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium shadow-sm">
                Apply Now
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Section Tabs
const SectionTabs = ({ sections, activeTab, onTabChange }) => {
  const tabIcons = {
    "Latest Jobs": <Briefcase size={16} />,
    "Admit Card": <Calendar size={16} />,
    "Results": <Bell size={16} />,
    "Syllabus": <Briefcase size={16} />,
    "Answer Key": <Briefcase size={16} />,
    "Admission": <Briefcase size={16} />,
  };

  return (
    <div className="flex overflow-x-auto hide-scrollbar px-4 py-3 gap-3">
      {sections.map((section, idx) => {
        const isActive = activeTab === idx;
        return (
          <button
            key={idx}
            onClick={() => onTabChange(idx)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition border ${
              isActive
                ? "bg-blue-100 text-blue-700 border-transparent shadow-sm ring-1 ring-black/5"
                : "border-gray-100 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tabIcons[section.name] || <Briefcase size={16} />}
            {section.name}
          </button>
        );
      })}
    </div>
  );
};

// Job List Item - Shared component for both Govt and Private jobs
const JobListItem = ({ job, isHot = false, isPvt = false }) => {
  const firstLetter = (job.title || "J").charAt(0).toUpperCase();
  const formattedDate = job.createdAt
    ? new Date(job.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
    : "";

  return (
    <Link
      to={getPostLink(job.id || job.link || job.url)}
      className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-3 items-start active:bg-gray-50 transition cursor-pointer"
    >
      <div className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center shrink-0 font-bold border ${
        isPvt ? "bg-purple-50 text-purple-500 border-purple-100" : "bg-gray-50 text-gray-400 border-gray-100"
      }`}>
        {firstLetter}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h3 className="text-sm font-semibold text-gray-900 leading-snug mb-1 line-clamp-2">
            {job.title}
          </h3>
          {isHot && (
            <span className="shrink-0 bg-red-50 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded ml-2">
              HOT
            </span>
          )}
          {isPvt && (
            <span className="shrink-0 bg-purple-50 text-purple-600 text-[10px] font-bold px-1.5 py-0.5 rounded ml-2">
              PVT
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1">
          {formattedDate && (
            <span className="flex items-center text-[11px] text-gray-500">
              <Calendar size={12} className="mr-1" />
              {formattedDate}
            </span>
          )}
          <span className={`flex items-center text-[11px] font-medium ${isPvt ? "text-purple-600" : "text-blue-600"}`}>
            View Details <ChevronRight size={12} className="ml-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
};

// Job List Section
const JobListSection = ({ jobs, loading, isPvt = false }) => {
  if (loading) {
    return (
      <div className="px-4 py-4 space-y-3 min-h-[400px]">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-gray-100 p-4 rounded-xl h-20 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-3 min-h-[400px]">
      {jobs.map((job, idx) => (
        <JobListItem key={job.id || idx} job={job} isHot={idx < 3} isPvt={isPvt} />
      ))}
      {jobs.length === 0 && (
        <div className="text-center text-gray-500 py-8">No jobs in this category</div>
      )}
    </div>
  );
};

// Bottom Navigation
const BottomNav = ({ activeView, onViewChange }) => {
  const navItems = [
    { id: "govt", icon: <Building2 size={24} />, label: "Govt Job" },
    { id: "pvt", icon: <Briefcase size={24} />, label: "Pvt Job" },
    { id: "tools", icon: <Wrench size={24} />, label: "Tools" },
    { id: "deadlines", icon: <Clock size={24} />, label: "Deadlines" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 px-2 z-50 pb-safe max-w-[480px] mx-auto">
      {navItems.map((item) => {
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex flex-col items-center gap-1 w-full transition ${
              isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

// Private Jobs Section Tabs (like Govt Jobs tabs)
const PrivateSectionTabs = ({ sections, activeTab, onTabChange, loading }) => {
  if (loading || !sections || sections.length === 0) return null;

  return (
    <div className="px-4 mb-3">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {sections.map((section, idx) => (
          <button
            key={idx}
            onClick={() => onTabChange(idx)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === idx
                ? "bg-purple-600 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            {section.name || section.title || section.text || `Category ${idx + 1}`}
          </button>
        ))}
      </div>
    </div>
  );
};

// Private Jobs List Section (showing jobs from selected category)
const PrivateJobsList = ({ jobs, loading, categoryName }) => {
  if (loading) {
    return (
      <div className="px-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <Briefcase size={48} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500 text-sm">No jobs found in this category</p>
      </div>
    );
  }

  return (
    <div className="px-4 space-y-3 pb-4">
      {jobs.map((job, idx) => (
        <a
          key={idx}
          href={job.link || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">
                {job.title || job.name || `Job ${idx + 1}`}
              </h3>
              {categoryName && (
                <span className="inline-block px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-medium rounded">
                  {categoryName}
                </span>
              )}
            </div>
            <ChevronRight size={18} className="text-gray-400 flex-shrink-0 mt-1" />
          </div>
        </a>
      ))}
    </div>
  );
};

// Private Jobs View - With sections like Govt Jobs
const PrivateJobsView = ({ categories, loading, sectionsByLink }) => {
  const [activeTab, setActiveTab] = useState(0);
  
  // Get current category and its jobs
  const currentCategory = categories?.[activeTab];
  const categoryLink = currentCategory?.link;
  const categoryState = categoryLink ? sectionsByLink[categoryLink] : null;
  const currentJobs = categoryState?.jobs || [];
  const jobsLoading = categoryState?.loading || false;

  return (
    <>
      {/* Hero Banner */}
      <div className="px-4 py-4">
        <div className="relative rounded-2xl overflow-hidden shadow-md h-32">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-purple-600" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-transparent flex flex-col justify-center px-6">
            <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-1">
              Private Sector
            </span>
            <h2 className="text-white text-xl font-bold leading-tight">
              Latest Private Jobs
            </h2>
            {!loading && categories && categories.length > 0 && (
              <p className="text-purple-200 text-xs mt-1">{categories.length} Active Categories</p>
            )}
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <PrivateSectionTabs 
        sections={categories} 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        loading={loading}
      />

      {/* Jobs List */}
      <PrivateJobsList 
        jobs={currentJobs} 
        loading={jobsLoading}
        categoryName={currentCategory?.name || currentCategory?.title}
      />
    </>
  );
};

// Tools View - Fixed paths
const ToolsView = () => {
  const navigate = useNavigate();
  const tools = [
    { name: "PDF Tools", path: "/jobsaddah-pdf-tools", icon: <FileText size={24} /> },
    { name: "Image Resize", path: "/jobsaddah-image-tools", icon: <Image size={24} /> },
    { name: "Resume Maker", path: "/jobsaddah-resume-tools", icon: <Award size={24} /> },
    { name: "Typing Test", path: "/jobsaddah-typing-tools", icon: <Type size={24} /> },
    { name: "Quiz App", path: "/jobsaddah-quiz-tools", icon: <Briefcase size={24} /> },
  ];

  return (
    <div className="px-4 py-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Free Tools</h2>
      <div className="grid grid-cols-2 gap-3">
        {tools.map((tool) => (
          <button
            key={tool.path}
            onClick={() => navigate(tool.path)}
            className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition"
          >
            <div className="p-3 bg-blue-50 rounded-full text-blue-600">{tool.icon}</div>
            <span className="text-sm font-medium text-gray-700">{tool.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Deadlines View - Same data as homescreen
const DeadlinesView = ({ reminders, loading }) => {
  const allReminders = [...(reminders.expiresToday || []), ...(reminders.expiringSoon || [])];

  if (loading) {
    return (
      <div className="px-4 py-6 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-100 p-4 rounded-xl h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-3">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Clock size={20} className="text-red-500" />
        Upcoming Deadlines ({allReminders.length})
      </h2>
      {allReminders.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No upcoming deadlines</div>
      ) : (
        allReminders.map((reminder, idx) => (
          <Link
            key={idx}
            to={getPostLink(reminder.url || reminder.link || reminder._id || reminder.id)}
            className="block bg-gradient-to-br from-white to-orange-50 p-4 rounded-xl border border-orange-100 shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {reminder.daysLeft === 0 ? "TODAY" : `${reminder.daysLeft} DAYS LEFT`}
              </span>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">
              {reminder.title || reminder.postTitle}
            </h3>
            <p className="text-xs text-gray-500 mt-1">{reminder.organization || ""}</p>
          </Link>
        ))
      )}
    </div>
  );
};

// Main Mobile HomeScreen Component
export default function MobileHomeScreen() {
  const dispatch = useDispatch();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [activeView, setActiveView] = useState("govt");

  // Redux state - Govt Jobs (sections)
  const { sections: dynamicSections, loading: sectionsLoading } = useSelector(
    (state) => state.sections
  );
  
  // Local state for Private Jobs (same as private-jobs.jsx approach)
  const [privateCategories, setPrivateCategories] = useState([]);
  const [privateCatLoading, setPrivateCatLoading] = useState(true);
  const [privateSectionsByLink, setPrivateSectionsByLink] = useState({});
  
  // Redux state - Reminders/Deadlines
  const { expiresToday, expiringSoon, loading: remindersLoading } = useSelector(
    (state) => state.reminders
  );
  
  // Redux state - Search
  const { results: searchResults, loading: isSearching } = useSelector(
    (state) => state.search
  );

  // Debounced search
  useEffect(() => {
    if (!searchQuery) {
      dispatch(clearSearch());
      return;
    }
    const timer = setTimeout(() => {
      dispatch(fetchSearchResults(searchQuery));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, dispatch]);

  // Load data on mount
  useEffect(() => {
    dispatch(fetchSections());
    dispatch(fetchReminders());
    
    // Fetch private job categories (same as private-jobs.jsx)
    (async () => {
      try {
        setPrivateCatLoading(true);
        const catRes = await api.post("/pvt-scrapper/get-categories");
        const cats = Array.isArray(catRes)
          ? catRes
          : catRes.categories || catRes.data || [];
        setPrivateCategories(cats);
      } catch (err) {
        console.error("Failed to load private job categories:", err);
        setPrivateCategories([]);
      } finally {
        setPrivateCatLoading(false);
      }
    })();
    
    // Refresh reminders every 5 minutes
    const interval = setInterval(() => dispatch(fetchReminders()), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Auto-load jobs for private categories (same as private-jobs.jsx)
  useEffect(() => {
    if (!privateCategories || privateCategories.length === 0) return;

    const links = privateCategories.map((c) => c.link).filter(Boolean);
    if (links.length === 0) return;

    let cancelled = false;
    const concurrency = 2; // Concurrent requests (lower for mobile)
    let idx = 0;

    const worker = async () => {
      while (!cancelled) {
        if (idx >= links.length) break;
        const current = idx++;
        const categoryUrl = links[current];

        if (!categoryUrl) continue;

        // Skip if already loaded
        if (privateSectionsByLink[categoryUrl]?.jobs && privateSectionsByLink[categoryUrl].jobs.length > 0) {
          continue;
        }

        try {
          // Mark as loading
          setPrivateSectionsByLink((prev) => ({
            ...prev,
            [categoryUrl]: { ...(prev[categoryUrl] || {}), loading: true },
          }));

          // Fetch jobs for this category
          const res = await api.post("/pvt-scrapper/scrape-category", {
            url: categoryUrl,
          });

          // Parse response
          let jobs = [];
          if (Array.isArray(res)) {
            jobs = res;
          } else if (Array.isArray(res?.jobs)) {
            jobs = res.jobs;
          } else if (Array.isArray(res?.data)) {
            jobs = res.data;
          } else if (Array.isArray(res?.sections)) {
            jobs = res.sections;
          }

          if (cancelled) return;

          // Store jobs
          setPrivateSectionsByLink((prev) => ({
            ...prev,
            [categoryUrl]: { loading: false, jobs: jobs || [] },
          }));
        } catch (err) {
          console.warn("Failed to load jobs for category:", categoryUrl, err);
          if (!cancelled) {
            setPrivateSectionsByLink((prev) => ({
              ...prev,
              [categoryUrl]: {
                ...(prev[categoryUrl] || {}),
                loading: false,
                jobs: [],
                error: true,
              },
            }));
          }
        }
      }
    };

    // Start N concurrent workers
    const runners = Array.from({
      length: Math.min(concurrency, links.length),
    }).map(() => worker());

    // Cleanup on unmount or dependency change
    return () => {
      cancelled = true;
    };
  }, [privateCategories]); // Runs when categories change

  // Get current section jobs for Govt view
  const currentJobs = useMemo(() => {
    if (!dynamicSections || dynamicSections.length === 0) return [];
    const section = dynamicSections[activeTab];
    return section?.data || [];
  }, [dynamicSections, activeTab]);

  // Map search results
  const mappedSearchResults = useMemo(() => {
    return searchResults.map((r) => ({
      title: r?.recruitment?.title || r?.title || "Job Post",
      secondaryLine: r?.recruitment?.organization?.name || "",
      linkTarget: r?.url || r?._id || r?.id,
    }));
  }, [searchResults]);

  // Render content based on active bottom nav view
  const renderContent = () => {
    switch (activeView) {
      case "pvt":
        return (
          <PrivateJobsView 
            categories={privateCategories} 
            loading={privateCatLoading}
            sectionsByLink={privateSectionsByLink}
          />
        );
      case "tools":
        return <ToolsView />;
      case "deadlines":
        return (
          <DeadlinesView
            reminders={{ expiresToday, expiringSoon }}
            loading={remindersLoading}
          />
        );
      case "govt":
      default:
        return (
          <>
            <HeroSection />
            <ExpiringSoonSection
              reminders={{ expiresToday, expiringSoon }}
              loading={remindersLoading}
            />
            {dynamicSections && dynamicSections.length > 0 && (
              <SectionTabs
                sections={dynamicSections}
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            )}
            <JobListSection jobs={currentJobs} loading={sectionsLoading} />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <SEO
        title="JobsAddah – Sarkari Result 2025 | Latest Govt Jobs"
        description="India's #1 Sarkari Result portal for latest government jobs 2025"
        canonical="/"
        section="Home"
      />

      <MobileHeader onSearchToggle={() => setSearchOpen(true)} />

      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => {
          setSearchOpen(false);
          setSearchQuery("");
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        results={mappedSearchResults}
        isSearching={isSearching}
      />

      <main>{renderContent()}</main>

      <BottomNav activeView={activeView} onViewChange={setActiveView} />

      {/* CSS for hide-scrollbar and pb-safe */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
      `}</style>
    </div>
  );
}
