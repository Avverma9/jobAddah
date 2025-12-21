/**
 * Mobile Home Screen - Main component for mobile view
 * Refactored: All UI components extracted to src/components/mobile
 */
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSections } from "../../../redux/slices/sectionsSlice";
import { fetchReminders } from "../../../redux/slices/remindersSlice";
import { fetchSearchResults, clearSearch } from "../../../redux/slices/searchSlice";
import api from "../../util/apiClient";
import SEO from "../../util/SEO";

// Mobile Components
import {
  MobileHeader,
  BottomNav,
  SectionTabs,
  GovtHeroSection,
  ExpiringSoonSection,
  JobListSection,
  ToolsView,
  DeadlinesView,
  PrivateJobsView,
} from "../../components/mobile";

// Common Components
import { SearchOverlay } from "../../components/common";

// Constants
import { SEARCH_DEBOUNCE_DELAY, REMINDERS_POLL_INTERVAL, PRIVATE_JOBS_CONCURRENCY } from "../../constants";

export default function MobileHomeScreen() {
  const dispatch = useDispatch();

  // UI State
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [activeView, setActiveView] = useState("govt");

  // Redux state - Govt Jobs (sections)
  const { sections: dynamicSections, loading: sectionsLoading } = useSelector(
    (state) => state.sections
  );
  
  // Local state for Private Jobs
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
    }, SEARCH_DEBOUNCE_DELAY);
    return () => clearTimeout(timer);
  }, [searchQuery, dispatch]);

  // Load data on mount
  useEffect(() => {
    dispatch(fetchSections());
    dispatch(fetchReminders());
    
    // Fetch private job categories
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
    
    // Refresh reminders periodically
    const interval = setInterval(() => dispatch(fetchReminders()), REMINDERS_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Auto-load jobs for private categories
  useEffect(() => {
    if (!privateCategories || privateCategories.length === 0) return;

    const links = privateCategories.map((c) => c.link).filter(Boolean);
    if (links.length === 0) return;

    let cancelled = false;
    let idx = 0;

    const worker = async () => {
      while (!cancelled && idx < links.length) {
        const current = idx++;
        const categoryUrl = links[current];

        if (!categoryUrl) continue;
        if (privateSectionsByLink[categoryUrl]?.jobs?.length > 0) continue;

        try {
          setPrivateSectionsByLink((prev) => ({
            ...prev,
            [categoryUrl]: { ...(prev[categoryUrl] || {}), loading: true },
          }));

          const res = await api.post("/pvt-scrapper/scrape-category", {
            url: categoryUrl,
          });

          let jobs = [];
          if (Array.isArray(res)) jobs = res;
          else if (Array.isArray(res?.jobs)) jobs = res.jobs;
          else if (Array.isArray(res?.data)) jobs = res.data;
          else if (Array.isArray(res?.sections)) jobs = res.sections;

          if (cancelled) return;

          setPrivateSectionsByLink((prev) => ({
            ...prev,
            [categoryUrl]: { loading: false, jobs: jobs || [] },
          }));
        } catch (err) {
          console.warn("Failed to load jobs for category:", categoryUrl, err);
          if (!cancelled) {
            setPrivateSectionsByLink((prev) => ({
              ...prev,
              [categoryUrl]: { ...(prev[categoryUrl] || {}), loading: false, jobs: [], error: true },
            }));
          }
        }
      }
    };

    // Start concurrent workers
    Array.from({ length: Math.min(PRIVATE_JOBS_CONCURRENCY, links.length) }).forEach(() => worker());

    return () => { cancelled = true; };
  }, [privateCategories]);

  // Get current section jobs for Govt view
  const currentJobs = useMemo(() => {
    if (!dynamicSections || dynamicSections.length === 0) return [];
    return dynamicSections[activeTab]?.data || [];
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
            <GovtHeroSection />
            <ExpiringSoonSection
              reminders={{ expiresToday, expiringSoon }}
              loading={remindersLoading}
            />
            {dynamicSections?.length > 0 && (
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
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 0); }
      `}</style>
    </div>
  );
}
