"use client";
import React, { useEffect, useState, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileHeader from "@/components/mobile/MobileHeader";
import BottomNav from "@/components/mobile/BottomNav";
import ToolsView from "@/components/mobile/ToolsView";
import PrivateJobsView from "@/components/mobile/PrivateJobsView";
import DeadlinesView from "@/components/mobile/DeadlinesView";
import { X, Search as SearchIcon } from "lucide-react"; // Using lucide for better icons in overlay
import { resolveJobDetailHref } from "@/lib/job-url";

export default function ResponsiveShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const normalizedPath = pathname || "";
  const skipGlobalSidebar =
    normalizedPath.includes("/pdf-tool") ||
    normalizedPath.includes("/image-tool") ||
    normalizedPath.includes("/resume-maker");

  // State
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [activeView, setActiveView] = useState("govt");
  const [overlayMounted, setOverlayMounted] = useState(false);
  const [reminders, setReminders] = useState({});
  const [remLoading, setRemLoading] = useState(false);

  // Private jobs data (lightweight category fetch so inline view can show tabs/hero)
  const [pvtCategories, setPvtCategories] = useState([]);
  const [pvtCatLoading, setPvtCatLoading] = useState(false);
  const [pvtSectionsByLink, setPvtSectionsByLink] = useState({});


  // Refs
  const searchAbort = useRef(null);
  const inputRef = useRef(null);



  // Handle Search Query
  useEffect(() => {
    const q = (searchQuery || "").trim();
    if (q.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    if (searchAbort.current) searchAbort.current.abort();
    const controller = new AbortController();
    searchAbort.current = controller;

    const id = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/gov/search?title=${encodeURIComponent(q)}`,
          { signal: controller.signal }
        );
        if (!res.ok) {
          setSearchResults([]);
          return;
        }
        const data = await res.json();
        const docs = data?.data || [];

        const normalized = docs
          .map((doc) => {
            let jobs = [];
            if (Array.isArray(doc.jobs)) jobs = doc.jobs;
            else if (Array.isArray(doc.recruitment)) jobs = doc.recruitment;
            else if (doc.recruitment && typeof doc.recruitment === "object") {
              jobs = [
                {
                  title:
                    doc.recruitment.title || doc.recruitment.name || "Untitled",
                  link: doc.url || "",
                  createdAt: doc.updatedAt || doc.createdAt,
                },
              ];
            }
            return { ...doc, jobs };
          })
          .filter((d) => d.jobs && d.jobs.length > 0);

        setSearchResults(normalized);
      } catch (err) {
        if (err.name !== "AbortError") setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => {
      clearTimeout(id);
      controller.abort();
    };
  }, [searchQuery]);

  // Handle Overlay Animation & Body Scroll Lock
  useEffect(() => {
    if (showSearch) {
      document.body.style.overflow = "hidden"; // Prevent background scrolling
      // Small delay to trigger CSS transition
      setTimeout(() => setOverlayMounted(true), 20);
    } else {
      document.body.style.overflow = "";
      setOverlayMounted(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showSearch]);

  // Keep --site-header-height in sync with whichever header is visible
  useEffect(() => {
    const setHeaderHeight = () => {
      try {
        let h = 0;
        const mobileEl = document.querySelector(".site-mobile-header");
        const desktopEl = document.querySelector(".site-desktop-header");

        const isVisible = (el) => !!el && el.offsetParent !== null;

        if (isVisible(mobileEl)) {
          h = mobileEl.offsetHeight || 0;
        } else if (isVisible(desktopEl)) {
          h = desktopEl.offsetHeight || 0;
        }

        document.documentElement.style.setProperty(
          "--site-header-height",
          `${h}px`
        );
      } catch (e) {
        // ignore
      }
    };

    setHeaderHeight();

    const handleResize = () => window.requestAnimationFrame(setHeaderHeight);
    window.addEventListener("resize", handleResize);

    // Observe DOM mutations (e.g., header appearing/disappearing) to recalc height
    const observer = new MutationObserver(() => setHeaderHeight());
    observer.observe(document.body, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, [showSearch, pathname]);

  // Keep activeView in sync with the current pathname or the
  // optional `?activeView=` query parameter so BottomNav links
  // like `/?activeView=tools` work without changing pathname.
  const searchParams = useSearchParams();

  useEffect(() => {
    // If query param explicitly requests a view, prefer it
    try {
      const q = searchParams?.get("activeView")?.toLowerCase();
      if (q) {
        if (q === "pvt" || q === "private" || q === "private-jobs") {
          setActiveView("pvt");
          return;
        }
        if (q === "tools") {
          setActiveView("tools");
          return;
        }
        if (q === "deadlines" || q === "deadline") {
          setActiveView("deadlines");
          return;
        }
        if (q === "govt" || q === "home") {
          setActiveView("govt");
          return;
        }
      }
    } catch (e) {
      // ignore search parsing errors and fallback to pathname-based logic
    }

    if (!pathname) return;
    if (pathname === "/private-jobs") {
      setActiveView("pvt");
      return;
    }

    if (
      pathname.includes("tools") ||
      pathname.includes("/pdf-tool") ||
      pathname.includes("/image-tool") ||
      pathname.includes("/resume-maker") ||
      pathname.includes("/typing-test") ||
      pathname.includes("/quiz-and-earn")
    ) {
      setActiveView("tools");
      return;
    }

    if (pathname.includes("deadline") || pathname.includes("reminder")) {
      setActiveView("deadlines");
      return;
    }

    setActiveView("govt");
  }, [pathname, searchParams]);

  // Removed ad layout effect and contentMaxWidth usage

  // Fetch reminders when user opens deadlines in mobile
  useEffect(() => {
    if (activeView !== "deadlines") return;
    let mounted = true;
    setRemLoading(true);
    (async () => {
      try {
        const res = await fetch(`/api/gov/reminders?days=7`);
        if (!mounted) return;
        const data = await res.json().catch(() => null);

        // If API failed, set an empty grouped shape expected by DeadlinesView
        if (!res.ok || !data) {
          return setReminders({ expiresToday: [], expiringSoon: [], count: 0, message: '' });
        }

        // API returns { success, count, reminders: [...] }
        // Convert flat reminders array into grouped shape used by DeadlinesView
        const flat = Array.isArray(data.reminders) ? data.reminders : [];
        const expiresToday = flat.filter((r) => Number(r.daysLeft) <= 0);
        const expiringSoon = flat.filter((r) => Number(r.daysLeft) > 0);

        if (mounted) {
          setReminders({ expiresToday, expiringSoon, count: data.count ?? flat.length, message: data.message || '' });
        }
      } catch (e) {
        // ignore
        if (mounted) setReminders({ expiresToday: [], expiringSoon: [], count: 0, message: '' });
      } finally {
        if (mounted) setRemLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [activeView]);

  // Fetch private-job categories when user opens private jobs in mobile
  useEffect(() => {
    if (activeView !== "pvt") return;
    const api = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_CLIENT || null;
    if (!api) return; // can't fetch without configured API

    let mounted = true;
    setPvtCatLoading(true);
    (async () => {
      try {
        const resp = await fetch(`${api}/pvt-scrapper/get-categories`, { method: "POST" });
        if (!mounted) return;
        if (!resp.ok) {
          setPvtCategories([]);
          return;
        }
        const data = await resp.json();
        const cats = Array.isArray(data)
          ? data
          : data?.categories || data?.data || data?.sections || [];
        if (mounted) setPvtCategories(cats || []);
      } catch (e) {
        // ignore
      } finally {
        if (mounted) setPvtCatLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [activeView]);

  // When categories are available, fetch per-category job listings from the pvt-scrapper API
  useEffect(() => {
    if (!pvtCategories || pvtCategories.length === 0) return;
    const api = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_CLIENT || null;
    if (!api) return;

    let cancelled = false;
    const links = pvtCategories.map((c) => c.link).filter(Boolean);
    if (links.length === 0) return;

    // Concurrency-controlled worker (similar to desktop private-jobs page)
    const concurrency = 3;
    let idx = 0;

    const worker = async () => {
      while (!cancelled) {
        if (idx >= links.length) break;
        const current = idx++;
        const categoryUrl = links[current];
        if (!categoryUrl) continue;

        try {
          // mark loading for this category
          setPvtSectionsByLink((prev) => ({
            ...prev,
            [categoryUrl]: { ...(prev[categoryUrl] || {}), loading: true },
          }));

          const resp = await fetch(`${api}/pvt-scrapper/scrape-category`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: categoryUrl }),
          });

          const data = await resp.json().catch(() => null);

          let jobs = [];
          if (Array.isArray(data)) jobs = data;
          else if (Array.isArray(data?.jobs)) jobs = data.jobs;
          else if (Array.isArray(data?.data)) jobs = data.data;
          else if (Array.isArray(data?.sections)) jobs = data.sections;

          if (cancelled) return;

          setPvtSectionsByLink((prev) => ({
            ...prev,
            [categoryUrl]: { loading: false, jobs: jobs || [] },
          }));
        } catch (e) {
          if (!cancelled) {
            setPvtSectionsByLink((prev) => ({
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

    const runners = Array.from({ length: Math.min(concurrency, links.length) }).map(() => worker());

    return () => {
      cancelled = true;
    };
  }, [pvtCategories]);

  const closeSearch = () => {
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header & Search */}
      <div className="md:hidden">
        <MobileHeader
          onSearchToggle={() => setShowSearch((s) => !s)}
          isSearchActive={showSearch}
        />

        {showSearch && (
          <div className="fixed inset-0 z-100 bg-white flex flex-col">
            {/* Header part of overlay */}
            <div
              className={`flex items-center px-4 py-3 border-b transition-all duration-200 ${
                overlayMounted ? "bg-white shadow-sm" : "bg-gray-50"
              }`}
            >
              <button
                type="button"
                onClick={closeSearch}
                className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full"
              >
                <X size={22} />
              </button>

              <div className="flex-1 mx-3 relative">
                <input
                  ref={inputRef}
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search jobs, admit cards..."
                  className="w-full bg-gray-100 text-gray-900 px-4 py-2.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500/50 text-base"
                />
              </div>

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    inputRef.current?.focus();
                  }}
                  className="text-sm font-medium text-blue-600 px-2"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Results Area */}
            <div className="flex-1 overflow-y-auto bg-white">
              {isSearching && (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              )}

              {!isSearching && searchResults.length === 0 && searchQuery && (
                <div className="p-8 text-center text-gray-500">
                  No results found for &ldquo;{searchQuery}&rdquo;
                </div>
              )}

              {/* Initial State Hint */}
              {!isSearching && !searchQuery && (
                <div className="p-8 text-center text-gray-400">
                  <SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">
                    Type to search for latest government jobs
                  </p>
                </div>
              )}

              <ul className="divide-y divide-gray-100">
                {searchResults.map((doc, i) => {
                  const jobs = doc.jobs || [];
                  const title = jobs[0]?.title || "Untitled";

                  return (
                    <li key={doc._id || i}>
                      <button
                        onClick={() => {
                          const dest = resolveJobDetailHref({
                            url: jobs[0]?.link || doc.url,
                            id: doc._id || doc.id,
                          });
                          closeSearch();
                          if (dest && dest !== "#") router.push(dest);
                        }}
                        className="w-full text-left px-5 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                      >
                        <div className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">
                          {title}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                            {doc.category || "Latest"}
                          </span>
                          {jobs.length > 1 && (
                            <span className="text-xs text-gray-400">
                              + {jobs.length - 1} more
                            </span>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header />
      </div>

      <main className="pb-20 md:pb-0">
        {/* Mobile view switch: show tools or default children */}
        <div className="md:hidden">
          {activeView === "tools" && !(
            pathname && (
              pathname.includes("/pdf-tool") ||
              pathname.includes("/image-tool") ||
              pathname.includes("/resume-maker") ||
              pathname.includes("/typing-test") ||
              pathname.includes("/quiz-and-earn")
            )
          ) ? (
            <ToolsView />
          ) : activeView === "pvt" && !(pathname === "/private-jobs") ? (
            <PrivateJobsView
              categories={pvtCategories}
              loading={pvtCatLoading}
              sectionsByLink={pvtSectionsByLink}
            />
          ) : activeView === "deadlines" && !(
            pathname && (pathname.includes("deadline") || pathname.includes("reminder"))
          ) ? (
            <DeadlinesView reminders={reminders} loading={remLoading} />
          ) : (
            children
          )}
        </div>

        {/* Desktop content */}
        <div className="hidden md:block">
          <div className="mx-auto w-full px-6 xl:px-10 2xl:px-16 max-w-[90vw] 2xl:max-w-450 3xl:max-w-none">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden">
        <BottomNav activeView={activeView} onViewChange={setActiveView} />
      </div>

      {/* Desktop Footer */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
