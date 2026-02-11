"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getCleanPostUrl } from "@/lib/job-url";
import {
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  FileText,
  Image as ImageIcon,
  Briefcase,
  Settings,
  Heart,
  LayoutGrid,
  Loader2,
  Clock,
  Bell,
  Bookmark,
  TrendingUp,
  Keyboard,
} from "lucide-react";

const Link = ({ href, children, className, onClick }) => {
  const router = useRouter();

  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) onClick();
    router.push(href);
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};

const TOOLS_CONFIG = [
  {
    name: "Resume Builder",
    path: "/tools/resume",
    icon: "FileText",
    desc: "AI-powered resume templates",
    color: "blue",
  },
  {
    name: "Image Resizer",
    path: "/tools/image",
    icon: "Image",
    desc: "Optimize photos for forms",
    color: "purple",
  },
  {
    name: "Typing Master",
    path: "/tools/typing",
    icon: "Keyboard",
    desc: "Test your typing speed",
    color: "indigo",
  },
  {
    name: "Mock Test",
    path: "/mock-test",
    icon: "LayoutGrid",
    desc: "Timed practice sets",
    color: "green",
  },
 
];

const INFO_LINKS = [
  { label: "About Us", href: "/about", desc: "Our story and mission" },
  { label: "Contact", href: "/contact", desc: "Get in touch with us" },
  { label: "Terms & Conditions", href: "/terms", desc: "Legal agreements" },
  {
    label: "Privacy Policy",
    href: "/policy",
    desc: "How we protect your data",
  },
];

const ICON_MAP = {
  FileText,
  Image: ImageIcon,
  Briefcase,
  Keyboard,
  LayoutGrid,
};

const COLOR_MAP = {
  blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
  purple:
    "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
  green:
    "bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white",
  indigo:
    "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white",
};

const SEARCH_DEBOUNCE_DELAY = 800;
const MIN_SEARCH_LENGTH = 2;

// const getRelativeTime = (dateString) => {
//   const date = new Date(dateString);
//   const now = new Date();
//   const diffMs = now - date;
//   const diffMins = Math.floor(diffMs / 60000);
//   const diffHours = Math.floor(diffMs / 3600000);
//   const diffDays = Math.floor(diffMs / 86400000);

//   if (diffMins < 1) return 'Just now';
//   if (diffMins < 60) return `${diffMins}m ago`;
//   if (diffHours < 24) return `${diffHours}h ago`;
//   if (diffDays < 30) return `${diffDays}d ago`;
//   return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
// };

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const user = {
    name: "Rahul Kumar",
    email: "rahul@example.com",
    avatar: null,
    notifications: 3,
    savedJobs: 12,
  };
  const router = useRouter();

  const toolsRef = useRef(null);
  const infoRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const searchDebounceRef = useRef(null);
  const abortControllerRef = useRef(null);

  const closeAllDropdowns = useCallback(() => {
    setIsToolsOpen(false);
    setIsInfoOpen(false);
    setIsProfileOpen(false);
    setShowSearchDropdown(false);
  }, []);

  const fetchSearchResults = useCallback(async (query) => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < MIN_SEARCH_LENGTH) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      setIsSearching(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setIsSearching(true);

      const res = await fetch(
        `/api/gov-post/find-by-title?title=${encodeURIComponent(trimmedQuery)}&limit=8`,
        { signal: abortControllerRef.current.signal },
      );

      const payload = await res.json();

      if (payload?.data && Array.isArray(payload.data)) {
        setSearchResults(payload.data);
        setShowSearchDropdown(payload.data.length > 0);
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Search error:", err);
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchChange = useCallback(
    (value) => {
      setSearchQuery(value);

      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      if (value.trim().length < MIN_SEARCH_LENGTH) {
        setSearchResults([]);
        setShowSearchDropdown(false);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);

      searchDebounceRef.current = setTimeout(() => {
        fetchSearchResults(value);
      }, SEARCH_DEBOUNCE_DELAY);
    },
    [fetchSearchResults],
  );

  const handleSearchSubmit = useCallback(() => {
    const q = searchQuery.trim();
    if (q.length < MIN_SEARCH_LENGTH) return;

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setShowSearchDropdown(false);
    setIsSearching(false);

    router.push(`/search?q=${encodeURIComponent(q)}`);
    setIsMobileSearchOpen(false);
  }, [searchQuery, router]);

  const handleResultClick = useCallback(
    (result) => {
      setShowSearchDropdown(false);
      setSearchQuery("");
      setSearchResults([]);

      // Use optimized clean URLs
      const rawLink = result.url || result.link || "";
      const cleanUrl = getCleanPostUrl(rawLink);

      if (cleanUrl) {
        router.push(cleanUrl);
      } else if (result.url) {
        router.push(result.url);
      }
    },
    [router],
  );

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (toolsRef.current && !toolsRef.current.contains(event.target))
        setIsToolsOpen(false);
      if (infoRef.current && !infoRef.current.contains(event.target))
        setIsInfoOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target))
        setIsProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target))
        setShowSearchDropdown(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 py-2"
          : "bg-white/95 backdrop-blur-md py-3 border-b border-gray-100"
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl blur-md opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-blue-700 text-white px-3 py-2 rounded-xl shadow-lg group-hover:shadow-xl transition-all transform group-hover:scale-105">
                  <span className="text-lg font-black tracking-wide">JA</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900 bg-clip-text text-transparent leading-none tracking-tight">
                  Jobs
                  <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text">
                    Addah
                  </span>
                </span>
                <span className="text-[9px] text-gray-500 font-semibold tracking-wider uppercase mt-0.5 opacity-80">
                  Your success, our mission
                </span>
              </div>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8" ref={searchRef}>
            <div className="relative w-full">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search
                    className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors"
                    strokeWidth={2}
                  />
                </div>
                <input
                  type="text"
                  className="block w-full pl-11 pr-11 py-2.5 border border-gray-200 rounded-2xl leading-5 bg-gray-50/50 text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all shadow-sm hover:shadow-md"
                  placeholder="Search government jobs, exams, results..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearchSubmit();
                    }
                  }}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowSearchDropdown(true);
                  }}
                />
                {isSearching && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <Loader2
                      className="h-5 w-5 text-blue-600 animate-spin"
                      strokeWidth={2.5}
                    />
                  </div>
                )}
              </div>

              {/* Search Dropdown */}
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute top-full mt-3 w-full bg-white rounded-2xl shadow-2xl ring-1 ring-gray-900/5 overflow-hidden z-50 max-h-[28rem] flex flex-col">
                  {/* Header */}
                  <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                          {searchResults.length} Results Found
                        </p>
                      </div>
                      <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono text-gray-500 bg-white rounded border border-gray-200">
                        ESC
                      </kbd>
                    </div>
                  </div>

                  {/* Results */}
                  <div className="p-2 overflow-y-auto flex-1">
                    {searchResults.map((result, index) => (
                      <button
                        key={`${result._id}-${index}`}
                        onClick={() => handleResultClick(result)}
                        className="w-full text-left px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all group border border-transparent hover:border-blue-100"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 group-hover:text-blue-700 line-clamp-2 leading-snug mb-2">
                              {result.title || "Untitled Post"}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              {result.organization && (
                                <span className="inline-flex items-center text-xs font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-lg">
                                  {result.organization}
                                </span>
                              )}
                              {result.status && (
                                <span
                                  className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-lg ${
                                    result.status === "Active"
                                      ? "bg-green-100 text-green-700 ring-1 ring-green-600/20"
                                      : result.status === "Closed"
                                        ? "bg-red-100 text-red-700 ring-1 ring-red-600/20"
                                        : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {result.status}
                                </span>
                              )}
                              {/* {result.updatedAt && (
                                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                  <Clock className="w-3.5 h-3.5" />
                                  {getRelativeTime(result.updatedAt)}
                                </span>
                              )} */}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Footer */}
                  {/* <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                    <button
                      onClick={handleSearchSubmit}
                      className="w-full text-center text-sm font-semibold text-blue-600 hover:text-blue-700 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      View all results ->
                    </button>
                  </div> */}
                </div>
              )}
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center gap-1">
            <NavLink href="/">Home</NavLink>
            {/* <NavLink href="/private-jobs">Private Jobs</NavLink> */}

            {/* Tools Dropdown */}
            <Dropdown
              ref={toolsRef}
              isOpen={isToolsOpen}
              onToggle={() => {
                setIsToolsOpen(!isToolsOpen);
                setIsInfoOpen(false);
                setIsProfileOpen(false);
              }}
              label="Tools"
            >
              <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Free Utilities
                </p>
              </div>
              <div className="p-2">
                {TOOLS_CONFIG.map((tool) => (
                  <DropdownItem
                    key={tool.path}
                    href={tool.path}
                    icon={tool.icon}
                    title={tool.name}
                    desc={tool.desc}
                    color={tool.color}
                    onClick={closeAllDropdowns}
                  />
                ))}
              </div>
            </Dropdown>

            {/* Info Dropdown */}
            <Dropdown
              ref={infoRef}
              isOpen={isInfoOpen}
              onToggle={() => {
                setIsInfoOpen(!isInfoOpen);
                setIsToolsOpen(false);
                setIsProfileOpen(false);
              }}
              label="Info"
              width="w-64"
            >
              <div className="p-2">
                {INFO_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 rounded-xl transition-all border border-transparent hover:border-blue-100"
                    onClick={closeAllDropdowns}
                  >
                    <div className="font-semibold">{link.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {link.desc}
                    </div>
                  </Link>
                ))}
              </div>
            </Dropdown>

            <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent mx-2"></div>

            {/* User Section (Hidden) */}
            {/* <div className="pl-1 flex items-center gap-2">
              {isSignedIn ? (
                <>
                  <button className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                    <Bell className="w-5 h-5" strokeWidth={2} />
                    {user.notifications > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                    )}
                  </button>

                  <Link href="/saved" className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                    <Bookmark className="w-5 h-5" strokeWidth={2} />
                  </Link>

                  <div className="relative" ref={profileRef}>
                    <button 
                      onClick={() => {
                        setIsProfileOpen(!isProfileOpen);
                        setIsToolsOpen(false);
                        setIsInfoOpen(false);
                      }}
                      className="flex items-center gap-2 focus:outline-none pl-2 pr-1 py-1 rounded-xl hover:bg-gray-100 transition-all"
                      aria-label="User menu"
                    >
                      <div className="relative">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
                          {user.name.charAt(0)}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></div>
                      </div>
                    </button>

                    <DropdownMenu isOpen={isProfileOpen} width="w-72">
                      <div className="px-4 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                              {user.name.charAt(0)}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full ring-2 ring-white"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                            <p className="text-xs text-gray-600 truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <DropdownSimpleItem href="/profile" icon={<Settings className="w-4 h-4"/>} label="Settings" onClick={closeAllDropdowns} />
                        <DropdownSimpleItem href="/saved" icon={<Heart className="w-4 h-4"/>} label={`Saved Jobs (${user.savedJobs})`} onClick={closeAllDropdowns} />
                        <div className="h-px bg-gray-200 my-2"></div>
                        <button 
                          onClick={() => {
                            setIsSignedIn(false);
                            closeAllDropdowns();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </DropdownMenu>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsSignedIn(true)}
                    className="px-4 py-2 text-sm font-semibold text-blue-700 border-2 border-blue-200 rounded-xl hover:bg-blue-50 hover:border-blue-300 transition-all"
                  >
                    Login
                  </button>
                  <button className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all">
                    Register
                  </button>
                </div>
              )}
            </div> */}
          </nav>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-3">
            <button
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
              onClick={() => setIsMobileSearchOpen(true)}
              aria-label="Search"
            >
              <Search className="w-5 h-5" strokeWidth={2} />
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-gray-600 hover:text-blue-700 hover:bg-blue-50 transition-all"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" strokeWidth={2.5} />
              ) : (
                <Menu className="w-6 h-6" strokeWidth={2.5} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
        <MobileSearchOverlay
          searchQuery={searchQuery}
          setSearchQuery={handleSearchChange}
          isSearching={isSearching}
          searchResults={searchResults}
          onResultClick={(result) => {
            handleResultClick(result);
            setIsMobileSearchOpen(false);
          }}
          onSearch={handleSearchSubmit}
          onClose={() => {
            setIsMobileSearchOpen(false);
            setSearchQuery("");
            setSearchResults([]);
            setShowSearchDropdown(false);
            if (searchDebounceRef.current) {
              clearTimeout(searchDebounceRef.current);
            }
            if (abortControllerRef.current) {
              abortControllerRef.current.abort();
            }
          }}
        />
      )}

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isSignedIn={isSignedIn}
        user={user}
        onSignOut={() => setIsSignedIn(false)}
        onSignIn={() => {
          setIsSignedIn(true);
          setIsMobileMenuOpen(false);
        }}
      />
    </header>
  );
}

function NavLink({ href, children }) {
  return (
    <Link
      href={href}
      className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all"
    >
      {children}
    </Link>
  );
}

const Dropdown = React.forwardRef(
  ({ isOpen, onToggle, label, children, width = "w-80" }, ref) => (
    <div className="relative" ref={ref}>
      <button
        onClick={onToggle}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
          isOpen
            ? "text-blue-700 bg-gradient-to-r from-blue-50 to-indigo-50"
            : "text-gray-700 hover:text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
        }`}
      >
        <span>{label}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          strokeWidth={2.5}
        />
      </button>

      <DropdownMenu isOpen={isOpen} width={width}>
        {children}
      </DropdownMenu>
    </div>
  ),
);

Dropdown.displayName = "Dropdown";

function DropdownMenu({ isOpen, children, width = "w-80" }) {
  return (
    <div
      className={`absolute right-0 mt-2 ${width} bg-white rounded-2xl shadow-2xl ring-1 ring-gray-900/5 origin-top-right transition-all duration-200 z-50 overflow-hidden ${
        isOpen
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
      }`}
    >
      {children}
    </div>
  );
}

function DropdownItem({ href, icon, title, desc, color, onClick }) {
  const IconComponent = ICON_MAP[icon] || FileText;

  return (
    <Link
      href={href}
      className="flex items-start gap-3 p-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all group border border-transparent hover:border-blue-100"
      onClick={onClick}
    >
      <div
        className={`flex-shrink-0 p-2 rounded-xl ${COLOR_MAP[color] || COLOR_MAP.blue} transition-all shadow-sm`}
      >
        <IconComponent className="w-5 h-5" strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 group-hover:text-blue-700">
          {title}
        </p>
        <p className="text-xs text-gray-600 mt-0.5">{desc}</p>
      </div>
    </Link>
  );
}

function DropdownSimpleItem({ href, icon, label, onClick }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 rounded-xl transition-all border border-transparent hover:border-blue-100"
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function MobileSearchOverlay({
  searchQuery,
  setSearchQuery,
  isSearching,
  searchResults,
  onResultClick,
  onSearch,
  onClose,
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex flex-col pt-16 px-4 lg:hidden animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-auto animate-in slide-in-from-top duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" strokeWidth={2} />
          </div>
          <input
            autoFocus
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSearch();
            }}
            className="block w-full pl-11 pr-28 py-3.5 border-2 border-gray-200 rounded-2xl bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 shadow-xl"
            placeholder="Search government jobs..."
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isSearching ? (
              <Loader2
                className="h-5 w-5 text-blue-600 animate-spin"
                strokeWidth={2.5}
              />
            ) : (
              <>
                <button
                  onClick={onSearch}
                  disabled={searchQuery.trim().length < MIN_SEARCH_LENGTH}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  Search
                </button>
                <button
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-xl bg-gray-100 text-sm font-semibold text-gray-700 hover:bg-gray-200"
                >
                  x
                </button>
              </>
            )}
          </div>
        </div>

        {searchResults.length > 0 && (
          <div className="mt-4 bg-white rounded-2xl shadow-2xl max-h-[70vh] overflow-hidden flex flex-col">
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                {searchResults.length} Results
              </p>
            </div>
            <div className="p-2 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={`${result._id}-${index}`}
                  onClick={() => onResultClick(result)}
                  className="w-full text-left px-3 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all border border-transparent hover:border-blue-100"
                >
                  <p className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug mb-2">
                    {result.title || "Untitled Post"}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {result.organization && (
                      <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">
                        {result.organization}
                      </span>
                    )}
                    {result.status && (
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                          result.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {result.status}
                      </span>
                    )}
                    {/* {result.updatedAt && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getRelativeTime(result.updatedAt)}
                      </span>
                    )} */}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MobileMenu({
  isOpen,
  onClose,
  isSignedIn,
  user,
  onSignOut,
  onSignIn,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={`absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white shadow-2xl transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 flex items-center justify-between">
            <span className="text-xl font-bold text-gray-900">Menu</span>
            <button
              onClick={onClose}
              className="p-2 bg-white rounded-xl hover:bg-gray-100 shadow-sm"
            >
              <X className="w-5 h-5 text-gray-600" strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Navigation */}
            <div className="py-4 px-3 space-y-2">
              <MobileNavLink href="/" onClick={onClose}>
                Home
              </MobileNavLink>

              {/* Tools Section */}
              <div className="mt-6 mb-3 px-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Tools
                </p>
              </div>
              {TOOLS_CONFIG.map((tool) => {
                const IconComponent = ICON_MAP[tool.icon] || FileText;
                return (
                  <Link
                    key={tool.path}
                    href={tool.path}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 group transition-all border border-transparent hover:border-blue-100"
                    onClick={onClose}
                  >
                    <div
                      className={`p-2 rounded-xl ${COLOR_MAP[tool.color] || COLOR_MAP.blue} transition-all shadow-sm`}
                    >
                      <IconComponent className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{tool.name}</p>
                      <p className="text-xs text-gray-500">{tool.desc}</p>
                    </div>
                  </Link>
                );
              })}

              {/* Info Section */}
              <div className="mt-6 mb-3 px-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Information
                </p>
              </div>
              {INFO_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all border border-transparent hover:border-blue-100"
                  onClick={onClose}
                >
                  <div className="font-bold">{link.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {link.desc}
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Footer - User Section */}
          <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
            {!isSignedIn ? (
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onSignIn}
                  className="w-full py-3 text-sm font-bold text-blue-700 bg-white border-2 border-blue-200 rounded-xl shadow-sm hover:bg-blue-50"
                >
                  Log In
                </button>
                <button className="w-full py-3 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg hover:shadow-xl">
                  Sign Up
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold shadow-md">
                      {user.name.charAt(0)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 rounded-full ring-2 ring-white"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">
                      {user.name}
                    </span>
                    <span className="text-xs text-gray-500">View Profile</span>
                  </div>
                </div>
                <button
                  onClick={onSignOut}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  <LogOut className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MobileNavLink({ href, children, onClick }) {
  return (
    <Link
      href={href}
      className="block px-3 py-3 rounded-xl text-base font-bold text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all border border-transparent hover:border-blue-100"
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
