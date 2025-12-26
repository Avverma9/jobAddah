"use client";

import AuthModal from "@/components/AuthModal";
import Link from "next/link";
import { TOOLS_CONFIG } from "@/lib/constants";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Trim a full URL to pathname + search + hash (keeps relative paths as-is)
function trimUrl(fullUrl) {
  if (!fullUrl) return "";
  try {
    const u = new URL(fullUrl);
    return `${u.pathname}${u.search}${u.hash}`;
  } catch (e) {
    return String(fullUrl);
  }
}

function buildPostLink(rawUrl, fallbackId) {
  const urlStr = String(rawUrl || "").trim();
  if (!urlStr && !fallbackId) return "#";
  let trimmed = urlStr;
  try {
    if (urlStr.startsWith("http")) {
      const u = new URL(urlStr);
      trimmed = `${u.pathname}${u.search}${u.hash}`;
    } else if (!urlStr.startsWith("/")) {
      trimmed = urlStr.startsWith("/") ? urlStr : `/${urlStr}`;
    }
  } catch (e) {
    // ignore
  }
  if (
    !trimmed ||
    trimmed === "/" ||
    trimmed === "null" ||
    trimmed === "undefined"
  ) {
    return fallbackId
      ? `/post?id=${encodeURIComponent(String(fallbackId))}`
      : "#";
  }
  trimmed = trimmed.replace(/\/+/g, "/");
  return `/post?url=${encodeURIComponent(trimmed)}`;
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  // Detect small screens on client to avoid SSR mismatch. When on a post detail
  // page and on mobile, we hide the global Header so the mobile-specific
  // `MobilePostHeader` can render and provide a back button / share UI.
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  useEffect(() => {
    const check = () =>
      setIsSmallScreen(
        typeof window !== "undefined" && window.innerWidth <= 640
      );
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // If we're on the post route and on a small screen, hide the global header
  // visually so the mobile-specific post header can be used instead. We avoid
  // returning early because AuthModal and state should still be available.
  const hideHeader = pathname && pathname.startsWith("/post") && isSmallScreen;
  const headerRef = useRef(null);

  // Intercept header link clicks and route via Next router for same-origin internal links
  // This prevents full page reloads when someone clicks a plain <a href="/..."> inside the header
  const handleHeaderNav = (e) => {
    try {
      if (e.defaultPrevented) return; // already handled
      // Allow modified clicks / non-left clicks to behave normally (open in new tab etc)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (e.button && e.button !== 0) return;

      const anchor = e.target.closest && e.target.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href) return;

      // Ignore anchors that are mailto/tel or hash-only
      if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return;

      // Resolve relative hrefs using current location
      const destUrl = new URL(href, typeof window !== 'undefined' ? window.location.href : '');

      // Only intercept same-origin internal navigation
      if (destUrl.origin !== window.location.origin) return;

      // Let Next handle client navigation
      e.preventDefault();
      setIsMobileMenuOpen(false);
      router.push(`${destUrl.pathname}${destUrl.search}${destUrl.hash}`);
    } catch (err) {
      // swallow - fall back to native navigation
    }
  };

  // --- UI States ---
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  // --- Search States ---
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // --- Refs ---
  const toolsRef = useRef(null);
  const infoRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // --- TYPEWRITER EFFECT LOGIC ---
  const [placeholderText, setPlaceholderText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100);

  const placeholders = [
    "Search Latest Jobs...",
    "Search Admit Cards...",
    "Search Results...",
    "Search Answer Keys...",
    "Search Syllabus...",
    "Search Admission Forms...",
  ];

  useEffect(() => {
    const i = loopNum % placeholders.length;
    const fullText = placeholders[i];

    const handleTyping = () => {
      setPlaceholderText(
        isDeleting
          ? fullText.substring(0, placeholderText.length - 1)
          : fullText.substring(0, placeholderText.length + 1)
      );

      // Speed Adjustments
      setTypingSpeed(isDeleting ? 40 : 100);

      if (!isDeleting && placeholderText === fullText) {
        // Word Complete - Pause before deleting
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && placeholderText === "") {
        // Word Deleted - Move to next word
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [placeholderText, isDeleting, loopNum, typingSpeed]);

  // --- SEARCH LOGIC ---
  async function performSearch(q, signal) {
    setIsSearching(true);
    try {
      const res = await fetch(
        `/api/gov/search?title=${encodeURIComponent(q)}`,
        { signal }
      );
      if (!res.ok) {
        setSearchResults([]);
        setShowResults(false);
        return;
      }
      const data = await res.json();
      const docs = data?.data || [];
      setSearchResults(docs);
      const total = docs.reduce(
        (sum, d) =>
          sum +
          ((d.jobs && d.jobs.length) || 0) +
          ((d.recruitment && d.recruitment.length) || 0),
        0
      );
      setShowResults(total > 0);
    } catch (err) {
      if (err.name === "AbortError") return;
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  }

  function inferType(linkOrTitle) {
    if (!linkOrTitle) return "Info";
    const s = String(linkOrTitle).toLowerCase();
    if (s.includes("admit")) return "Admit Card";
    if (s.includes("result")) return "Result";
    if (s.includes("syllabus")) return "Syllabus";
    if (
      s.includes("recruit") ||
      s.includes("vacancy") ||
      s.includes("job") ||
      s.includes("apply") ||
      s.includes("career")
    )
      return "Job";
    if (s.includes("exam")) return "Exam";
    if (s.includes("notification")) return "Notification";
    if (s.includes("date")) return "Date";
    return "Info";
  }

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    const controller = new AbortController();
    performSearch(q, controller.signal);
  };

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    const controller = new AbortController();
    const id = setTimeout(() => {
      performSearch(q, controller.signal);
    }, 350);
    return () => {
      clearTimeout(id);
      controller.abort();
    };
  }, [searchQuery]);

  // --- CLICK OUTSIDE & AUTH LOGIC ---
  useEffect(() => {
    function handleClickOutside(event) {
      if (toolsRef.current && !toolsRef.current.contains(event.target))
        setIsToolsOpen(false);
      if (infoRef.current && !infoRef.current.contains(event.target))
        setIsInfoOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target))
        setIsProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target))
        setShowResults(false);

      // Close mobile menu when clicking outside of it (no dependency on isMobileMenuOpen
      // so the effect's dependency array can remain stable across renders)
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        const toggleBtn = document.getElementById("mobile-menu-toggle");
        if (toggleBtn && toggleBtn.contains(event.target)) return;
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
    // update CSS variable for header height so pages can offset content accordingly
    const setHeaderHeightVar = () => {
      try {
        let h = 0;
        if (!hideHeader && headerRef.current) {
          h = headerRef.current.offsetHeight || 0;
        }
        // default to 0 when header is hidden
        document.documentElement.style.setProperty(
          "--site-header-height",
          `${h}px`
        );
      } catch (e) {
        // ignore
      }
    };
    setHeaderHeightVar();
    window.addEventListener("resize", setHeaderHeightVar);
    return () => window.removeEventListener("resize", setHeaderHeightVar);
  }, [isMobileMenuOpen]);

  useEffect(() => {
    try {
      const v = localStorage.getItem("isSignedIn");
      const u = localStorage.getItem("user");
      if (v === "true" && u) {
        setIsSignedIn(true);
        setUser(JSON.parse(u));
      } else {
        setIsSignedIn(false);
        setUser(null);
      }
    } catch (e) {
      setIsSignedIn(false);
      setUser(null);
    }
  }, []);

  const handleSignedIn = (u) => {
    setIsSignedIn(true);
    setUser(u);
  };

  const signOut = () => {
    localStorage.removeItem("isSignedIn");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setIsSignedIn(false);
    setUser(null);
    setIsProfileOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleProfileClick = (ev) => {
    if (!isSignedIn) {
      ev && ev.preventDefault && ev.preventDefault();
      setAuthOpen(true);
      return;
    }
    setIsProfileOpen(!isProfileOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSignedIn={handleSignedIn}
      />
      {!hideHeader && (
        // Use sticky instead of fixed so the header occupies layout space and
        // does not overlap content. This is a safer global fix than relying
        // on JS-calculated padding which can be brittle across pages.
        <header
          ref={headerRef}
          onClick={handleHeaderNav}
          className="site-desktop-header sticky top-0 inset-x-0 z-40 bg-white/90 backdrop-blur-md shadow-sm"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 md:h-20 gap-4">
              <div className="shrink-0 flex items-center">
                <Link href="/" className="flex items-center gap-2.5 group">
                  <div className="relative w-8 h-8 md:w-10 md:h-10 transition-transform group-hover:scale-105">
                    <img
                      src="/logo.png"
                      alt="JobsAddah"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="hidden sm:block text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tight">
                    JobsAddah
                  </span>
                </Link>
              </div>

              <div className="flex-1 max-w-xl mx-2 md:mx-6 transition-all duration-300">
                <form onSubmit={handleSearch} className="relative group">
                  {/* --- ROTATING GRADIENT BORDER --- */}
                  <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-75 blur-sm animate-pulse"></div>
                  <div className="absolute -inset-px rounded-full overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(99,102,241,1)_360_deg)] animate-[spin_3s_linear_infinite] opacity-100"></div>
                  </div>

                  {/* Inner White Container */}
                  <div className="relative bg-white rounded-full flex items-center">
                    <div
                      className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-300 ${
                        isSearchFocused ? "text-indigo-600" : "text-gray-400"
                      }`}
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      // UPDATED: Using animated placeholderText state
                      placeholder={placeholderText}
                      className={`block w-full pl-10 pr-10 py-2.5 border-none rounded-full leading-5 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 transition-all duration-300 sm:text-sm`}
                    />
                    {searchQuery &&
                      (isSearching ? (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                          <svg
                            className="h-4 w-4 animate-spin text-indigo-600"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            ></path>
                          </svg>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setShowResults(false);
                          }}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      ))}
                  </div>

                  {/* Inline search results dropdown */}
                  {showResults && searchResults.length > 0 && (
                    <div
                      className="absolute left-0 right-0 mt-2 bg-white rounded-md shadow-lg z-50 max-h-80 overflow-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-indigo-600 [&::-webkit-scrollbar-thumb]:rounded-full"
                      ref={searchRef}
                    >
                      <div className="p-3 border-b text-sm text-gray-600">
                        Showing results
                      </div>
                      {searchResults.map((doc, i) => {
                        // Normalize jobs into an array. Search can return different shapes:
                        // - govPostList aggregate: { jobs: [...] }
                        // - Post documents: { recruitment: {...} } or { recruitment: [...] }
                        let jobs = [];
                        if (Array.isArray(doc.jobs)) jobs = doc.jobs;
                        else if (Array.isArray(doc.recruitment))
                          jobs = doc.recruitment;
                        else if (
                          doc.recruitment &&
                          typeof doc.recruitment === "object"
                        ) {
                          // wrap recruitment object as a single job-like item
                          jobs = [
                            {
                              title:
                                doc.recruitment.title ||
                                doc.recruitment.name ||
                                "Untitled",
                              link: doc.url || "",
                              createdAt: doc.updatedAt || doc.createdAt,
                            },
                          ];
                        }

                        if (!jobs || jobs.length === 0) return null;

                        return (
                          <div
                            key={doc._id || i}
                            className="px-3 py-2 border-b last:border-b-0"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div />
                              <div className="text-xs text-gray-400">
                                {jobs.length} job{jobs.length > 1 ? "s" : ""}
                              </div>
                            </div>

                            <div className="space-y-2">
                              {jobs.slice(0, 5).map((j, idx2) => {
                                const dest = buildPostLink(
                                  j.link || j.url || j.postUrl || "",
                                  j._id || j.id
                                );
                                return (
                                  <Link
                                    key={idx2}
                                    href={dest || "#"}
                                    onClick={() => setShowResults(false)}
                                    className="block p-2 rounded-md hover:bg-indigo-50 transition-colors"
                                  >
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                      {j.title}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                        {inferType(
                                          j.link || j.title || doc.url
                                        )}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        {j.createdAt
                                          ? new Date(
                                              j.createdAt
                                            ).toLocaleDateString()
                                          : ""}
                                      </span>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                      <div className="p-2 text-center text-xs text-gray-500">
                        Press Enter to see full results
                      </div>
                    </div>
                  )}
                </form>
              </div>

              <nav className="hidden md:flex items-center space-x-8">
                <Link
                  href="/"
                  className="text-gray-600 hover:text-indigo-600 font-medium transition-colors text-sm lg:text-base"
                >
                  Home
                </Link>
                <Link
                  href="/private-jobs"
                  className="text-gray-600 hover:text-indigo-600 font-medium transition-colors text-sm lg:text-base whitespace-nowrap"
                >
                  Private Jobs
                </Link>

                <div className="relative" ref={toolsRef}>
                  <button
                    onClick={() => setIsToolsOpen(!isToolsOpen)}
                    className={`flex items-center space-x-1 font-medium transition-colors outline-none py-2 ${
                      isToolsOpen
                        ? "text-indigo-600"
                        : "text-gray-600 hover:text-indigo-600"
                    }`}
                  >
                    <span>Tools</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isToolsOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  <div
                    className={`absolute left-1/2 -translate-x-1/2 mt-3 w-64 bg-white rounded-2xl shadow-xl ring-1 ring-black/5 py-2 transform transition-all duration-200 origin-top z-50 ${
                      isToolsOpen
                        ? "opacity-100 translate-y-0 visible"
                        : "opacity-0 translate-y-2 invisible"
                    }`}
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-l border-t border-gray-100"></div>

                    <div className="relative bg-white rounded-2xl overflow-hidden">
                      {TOOLS_CONFIG.map((tool) => {
                        const mapIcon = (iconName) => {
                          switch (iconName) {
                            case "FileText":
                              return "pdf";
                            case "Image":
                              return "image";
                            case "Award":
                              return "document";
                            case "Type":
                              return "document";
                            case "Briefcase":
                              return "currency";
                            default:
                              return "document";
                          }
                        };

                        const isActiveTool =
                          pathname === tool.path ||
                          (tool.path !== "/" &&
                            pathname?.startsWith(tool.path));

                        return (
                          <DropdownLink
                            key={tool.path}
                            href={tool.path}
                            icon={mapIcon(tool.icon)}
                            color={isActiveTool ? "indigo" : "gray"}
                            title={tool.name}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="relative" ref={infoRef}>
                  <button
                    onClick={() => setIsInfoOpen(!isInfoOpen)}
                    className={`flex items-center space-x-1 font-medium transition-colors outline-none py-2 ${
                      isInfoOpen
                        ? "text-indigo-600"
                        : "text-gray-600 hover:text-indigo-600"
                    }`}
                  >
                    <span>Info</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isInfoOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <div
                    className={`absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl ring-1 ring-black/5 py-1 transform transition-all duration-200 origin-top z-50 ${
                      isInfoOpen
                        ? "opacity-100 translate-y-0 visible"
                        : "opacity-0 translate-y-2 invisible"
                    }`}
                  >
                    {[
                      { label: "About", href: "/about" },
                      { label: "Contact", href: "/contact" },
                      { label: "Terms and Conditions", href: "/terms" },
                      { label: "Policy", href: "/policy" },
                    ].map((item) => {
                      const isActive =
                        pathname === item.href ||
                        (item.href !== "/" && pathname?.startsWith(item.href));
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`block px-4 py-2 text-sm transition-colors ${
                            isActive
                              ? "bg-indigo-50 text-indigo-600"
                              : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                          }`}
                        >
                          {item.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </nav>

              <div className="hidden md:flex items-center pl-6 border-l border-gray-200 ml-2">
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={handleProfileClick}
                    className="group flex items-center gap-2 focus:outline-none"
                  >
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border-2 border-transparent group-hover:border-indigo-200 transition-all">
                      {user && user.name
                        ? user.name
                            .split(" ")
                            .map((s) => s[0])
                            .slice(0, 2)
                            .join("")
                        : "JD"}
                    </div>
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 mt-3 w-60 bg-white rounded-xl shadow-xl ring-1 ring-black/5 py-1 origin-top-right transform transition-all duration-200 animate-in fade-in slide-in-from-top-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                        <p className="text-sm font-semibold text-gray-900">
                          {user?.name || "Guest"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email || "Not signed in"}
                        </p>
                      </div>
                      <div className="p-1">
                        <Link
                          href="/saved-jobs"
                          className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors"
                        >
                          Saved Jobs
                        </Link>
                        <Link
                          href="/profile"
                          onClick={(e) => {
                            if (!isSignedIn) {
                              e.preventDefault();
                              setAuthOpen(true);
                            }
                          }}
                          className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md transition-colors"
                        >
                          Profile Settings
                        </Link>
                      </div>
                      <div className="border-t border-gray-100 p-1">
                        <button
                          onClick={signOut}
                          className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors"
                        >
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center md:hidden">
                <button
                  id="mobile-menu-toggle"
                  aria-label="Toggle mobile menu"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-xl text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors focus:outline-none"
                >
                  {isMobileMenuOpen ? (
                    <svg
                      className="block w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="block w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </header>
      )}
    </>
  );
}

function DropdownLink({ href, icon, color, title }) {
  const colors = {
    indigo: "bg-indigo-100 text-indigo-600",
    red: "bg-red-100 text-red-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
  };

  const icons = {
    document: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    ),
    pdf: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    ),
    currency: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    image: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    ),
  };

  return (
    <Link
      href={href}
      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors gap-3"
    >
      <span className={`${colors[color]} p-1.5 rounded-lg`}>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {icons[icon]}
        </svg>
      </span>
      {title}
    </Link>
  );
}
