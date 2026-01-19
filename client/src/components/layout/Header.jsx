"use client";

import AuthModal from "@/components/AuthModal";
import Link from "next/link";
import { TOOLS_CONFIG } from "@/lib/constants";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Search from "../features/search/search";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  // --- 1. Responsive & Path Logic ---
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  useEffect(() => {
    let frame;
    const check = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        setIsSmallScreen(
          typeof window !== "undefined" && window.innerWidth <= 768,
        ),
      );
    };
    check();
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("resize", check);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Hide global header on mobile post detail pages
  const hideHeader = pathname && pathname.startsWith("/post") && isSmallScreen;
  const headerRef = useRef(null);

  // --- 2. State Management ---
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false); // Restore Info State
  const [authOpen, setAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // --- 3. Refs ---
  const toolsRef = useRef(null);
  const infoRef = useRef(null);
  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // --- 4. Navigation Handling ---
  const handleHeaderNav = (e) => {
    try {
      if (e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (e.button && e.button !== 0) return;

      const anchor = e.target.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      if (
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#")
      )
        return;

      const destUrl = new URL(
        href,
        typeof window !== "undefined" ? window.location.href : "",
      );
      if (destUrl.origin !== window.location.origin) return;

      e.preventDefault();
      // Close all menus on nav
      setIsMobileMenuOpen(false);
      setIsToolsOpen(false);
      setIsInfoOpen(false);
      setIsProfileOpen(false);
      router.push(`${destUrl.pathname}${destUrl.search}${destUrl.hash}`);
    } catch (err) {
      // fallback
    }
  };

  // --- 5. Click Outside & CSS Height ---
  useEffect(() => {
    function handleClickOutside(event) {
      if (toolsRef.current && !toolsRef.current.contains(event.target))
        setIsToolsOpen(false);
      if (infoRef.current && !infoRef.current.contains(event.target))
        setIsInfoOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target))
        setIsProfileOpen(false);
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
    const setHeaderHeightVar = () => {
      try {
        let h = 0;
        if (!hideHeader && headerRef.current)
          h = headerRef.current.offsetHeight || 0;
        document.documentElement.style.setProperty(
          "--site-header-height",
          `${h}px`,
        );
      } catch (e) {}
    };
    setHeaderHeightVar();
    window.addEventListener("resize", setHeaderHeightVar);
    return () => window.removeEventListener("resize", setHeaderHeightVar);
  }, [isMobileMenuOpen, hideHeader]);

  // --- 6. Auth Check ---
  useEffect(() => {
    let frame;
    frame = requestAnimationFrame(() => {
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
    });
    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const handleSignedIn = (u) => {
    setIsSignedIn(true);
    setUser(u);
    setAuthOpen(false);
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
      ev && ev.preventDefault();
      setAuthOpen(true);
      return;
    }
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <>
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSignedIn={handleSignedIn}
      />

      {!hideHeader && (
        <header
          ref={headerRef}
          onClick={handleHeaderNav}
          className="site-desktop-header sticky top-0 inset-x-0 z-40 bg-white shadow-sm border-b border-gray-200"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-17.5 md:h-20">
              {/* --- LEFT: LOGO (Updated Design) --- */}
              <div className="shrink-0 flex items-center">
                <Link href="/" className="flex items-center gap-2 group">
                  {/* Icon Placeholder if needed */}
                  {/* <img src="/logo.png" alt="Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain" /> */}

                  <div className="flex flex-col">
                    <span className="text-2xl md:text-3xl font-bold text-blue-700 leading-tight tracking-tight">
                      JobsAddah
                      <span className="text-gray-500 text-lg">.com</span>
                    </span>
                    <span className="text-[10px] md:text-xs text-gray-500 font-medium tracking-wide -mt-0.5">
                      आपकी सफलता, हमारा लक्ष्य
                    </span>
                  </div>
                </Link>
              </div>

              <Search />
              {/* --- CENTER: DESKTOP NAV (Original Links, New Design) --- */}
              <nav className="hidden md:flex items-center space-x-1 lg:space-x-6">
                {/* 1. Home */}
                <Link
                  href="/"
                  className={`px-3 py-2 rounded-md text-[15px] font-medium transition-colors ${
                    pathname === "/"
                      ? "text-blue-700 bg-blue-50"
                      : "text-gray-700 hover:text-blue-700 hover:bg-gray-50"
                  }`}
                >
                  Home
                </Link>

                {/* 2. Private Jobs */}
                <Link
                  href="/private-jobs"
                  className={`px-3 py-2 rounded-md text-[15px] font-medium transition-colors whitespace-nowrap ${
                    pathname === "/private-jobs"
                      ? "text-blue-700 bg-blue-50"
                      : "text-gray-700 hover:text-blue-700 hover:bg-gray-50"
                  }`}
                >
                  Private Jobs
                </Link>

                {/* 3. Tools Dropdown */}
                <div className="relative" ref={toolsRef}>
                  <button
                    onClick={() => {
                      setIsToolsOpen(!isToolsOpen);
                      setIsInfoOpen(false);
                    }}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-[15px] font-medium transition-colors outline-none ${
                      isToolsOpen || pathname?.startsWith("/tools")
                        ? "text-blue-700 bg-blue-50"
                        : "text-gray-700 hover:text-blue-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>Tools</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${isToolsOpen ? "rotate-180" : ""}`}
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
                    className={`absolute left-1/2 -translate-x-1/2 mt-2 w-64 bg-white rounded-xl shadow-xl ring-1 ring-black/5 py-2 transform transition-all duration-200 origin-top z-50 ${
                      isToolsOpen
                        ? "opacity-100 translate-y-0 visible"
                        : "opacity-0 translate-y-2 invisible"
                    }`}
                  >
                    <div className="relative bg-white rounded-xl overflow-hidden">
                      {TOOLS_CONFIG.map((tool) => {
                        const mapIcon = (n) => {
                          if (n === "FileText") return "pdf";
                          if (n === "Image") return "image";
                          if (n === "Briefcase") return "currency";
                          return "document";
                        };
                        return (
                          <DropdownLink
                            key={tool.path}
                            href={tool.path}
                            icon={mapIcon(tool.icon)}
                            color="gray"
                            title={tool.name}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 4. Info Dropdown */}
                <div className="relative" ref={infoRef}>
                  <button
                    onClick={() => {
                      setIsInfoOpen(!isInfoOpen);
                      setIsToolsOpen(false);
                    }}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-[15px] font-medium transition-colors outline-none ${
                      isInfoOpen
                        ? "text-blue-700 bg-blue-50"
                        : "text-gray-700 hover:text-blue-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>Info</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${isInfoOpen ? "rotate-180" : ""}`}
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
                    className={`absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl ring-1 ring-black/5 py-1 transform transition-all duration-200 origin-top z-50 ${
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
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </nav>

              {/* --- RIGHT: AUTH BUTTONS (Updated Design) --- */}
              <div className="hidden md:flex items-center gap-3 pl-4">
                {isSignedIn ? (
                  // Logged In: Profile Circle
                  <div className="relative" ref={profileRef}>
                    <button
                      onClick={handleProfileClick}
                      className="group flex items-center gap-2 focus:outline-none"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border-2 border-transparent group-hover:border-blue-200 transition-all">
                        {user && user.name
                          ? user.name
                              .split(" ")
                              .map((s) => s[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()
                          : "JD"}
                      </div>
                    </button>
                    {isProfileOpen && (
                      <div className="absolute right-0 mt-3 w-60 bg-white rounded-xl shadow-xl ring-1 ring-black/5 py-1 origin-top-right z-50">
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {user?.name || "Guest"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user?.email}
                          </p>
                        </div>
                        <div className="p-1">
                          <Link
                            href="/saved-jobs"
                            className="block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md"
                          >
                            Saved Jobs
                          </Link>
                          <Link
                            href="/profile"
                            className="block px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-md"
                          >
                            Profile Settings
                          </Link>
                        </div>
                        <div className="border-t border-gray-100 p-1">
                          <button
                            onClick={signOut}
                            className="flex w-full items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                          >
                            Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Logged Out: New Button Styles
                  <>
                    <button
                      onClick={() => setAuthOpen(true)}
                      className="px-5 py-2 text-[15px] font-medium text-blue-700 border border-blue-700 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      Login
                    </button>
                    {/* <button
                      onClick={() => setAuthOpen(true)}
                      className="px-5 py-2 text-[15px] font-medium text-white bg-blue-700 border border-transparent rounded-md hover:bg-blue-800 transition-colors shadow-sm"
                    >
                      Register
                    </button> */}
                  </>
                )}
              </div>

              {/* --- MOBILE TOGGLE --- */}
              <div className="flex items-center md:hidden">
                <button
                  id="mobile-menu-toggle"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-2 rounded-md text-gray-600 hover:text-blue-700 hover:bg-blue-50 focus:outline-none"
                >
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {isMobileMenuOpen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* --- MOBILE MENU DRAWER --- */}
          {isMobileMenuOpen && (
            <div className="md:hidden">
              <div
                className="fixed inset-0 z-40 bg-black/30"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              <div
                ref={mobileMenuRef}
                className="fixed top-(--site-header-height,70px) left-0 right-0 z-50 bg-white shadow-xl border-t border-gray-100 max-h-[calc(100vh-70px)] overflow-y-auto"
              >
                <div className="px-4 py-4 space-y-2">
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  >
                    Home
                  </Link>
                  <Link
                    href="/private-jobs"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                  >
                    Private Jobs
                  </Link>

                  {/* Mobile Tools */}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                      Tools
                    </p>
                    {TOOLS_CONFIG.map((tool) => (
                      <Link
                        key={tool.path}
                        href={tool.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 pl-6"
                      >
                        {tool.name}
                      </Link>
                    ))}
                  </div>

                  {/* Mobile Info */}
                  <div className="pt-2 border-t border-gray-100">
                    <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                      Info
                    </p>
                    {[
                      { label: "About", href: "/about" },
                      { label: "Contact", href: "/contact" },
                      { label: "Terms and Conditions", href: "/terms" },
                      { label: "Policy", href: "/policy" },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 pl-6"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>

                  {/* Mobile Auth */}
                  <div className="pt-4 border-t border-gray-100">
                    {!isSignedIn ? (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            setAuthOpen(true);
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex justify-center items-center px-4 py-2.5 border border-blue-700 rounded-lg text-base font-medium text-blue-700 hover:bg-blue-50"
                        >
                          Login
                        </button>
                        <button
                          onClick={() => {
                            setAuthOpen(true);
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex justify-center items-center px-4 py-2.5 border border-transparent rounded-lg text-base font-medium text-white bg-blue-700 hover:bg-blue-800"
                        >
                          Register
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Link
                          href="/saved-jobs"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                        >
                          Saved Jobs
                        </Link>
                        <Link
                          href="/profile"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700"
                        >
                          Profile Settings
                        </Link>
                        <button
                          onClick={() => {
                            signOut();
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full text-left block px-3 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50"
                        >
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </header>
      )}
    </>
  );
}

// --- Helper for Dropdowns (Using Gray/Blue Theme) ---
function DropdownLink({ href, icon, color, title }) {
  const colors = {
    indigo: "bg-blue-100 text-blue-600",
    gray: "bg-gray-100 text-gray-600",
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
      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors gap-3"
    >
      <span className={`${colors[color] || colors.gray} p-1.5 rounded-lg`}>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {icons[icon] || icons.document}
        </svg>
      </span>
      {title}
    </Link>
  );
}
