import React, { useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
  Moon,
  Sun,
  ChevronDown,
  Shield,
  Mail,
  FileText,
  Info,
  Briefcase,
  Award,
  BookOpen,
  Key,
  Settings,
  Image,
  TypeIcon,
  Printer
} from "lucide-react";

// Icons mapping for visual appeal in Nav
const NAV_ITEMS = [
  { label: "Jobs", path: "/view-all?type=JOB", icon: Briefcase },
  { label: "Private Jobs", path: "/not-available", icon: Award },
  { label: "Answer Key", path: "/view-all?type=ANSWER_KEY", icon: Key },
];

const TOOLS_LINKS = [
  { label: "Image Master", path: "/jobsaddah-image-tools", icon: Image },
  { label: "Typing Test", path: "/jobsaddah-typing-tools", icon: TypeIcon },
  { label: "Pdf Tools", path: "/jobsaddah-pdf-tools", icon: Printer },


];

const INFO_LINKS = [
  { label: "About Us", path: "/about-us", icon: Info },
  { label: "Contact Us", path: "/contact-us", icon: Mail },
  { label: "Privacy Policy", path: "/privacy-policy", icon: Shield },
  { label: "Terms of Service", path: "/terms", icon: FileText },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const infoRef = useRef(null);
  const toolsRef = useRef(null);

  // Theme Init
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark =
      saved === "dark" ||
      (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);

    document.documentElement.classList.toggle("dark", isDark);
    setDarkMode(isDark);
  }, []);

  // Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Outside Click Handler
  useEffect(() => {
    const handler = (e) => {
      if (infoRef.current && !infoRef.current.contains(e.target)) {
        setInfoOpen(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(e.target)) {
        setToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    // Adding a temporary class for smooth transition if needed globally, 
    // but the transition on the header container handles most of it.
    document.documentElement.classList.add('theme-transition');
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
    }, 300);
  };

  return (
    // UPDATED: Added 'ease-in-out' for smoother theme transition
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ease-in-out border-b ${
        scrolled
          ? "bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-gray-200 dark:border-slate-800 shadow-sm"
          : "bg-white dark:bg-slate-900 border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* UPDATED: Reduced height from h-20 to h-16 */}
        <div className="flex items-center h-16">
          
          {/* --- Brand Logo Area --- */}
          <a href="/" className="flex items-center gap-3 group mr-8">
            <div className="relative flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
             {/* Replace this src with your actual Koala image path */}
              <img 
                src="/logo.png" 
                alt="JobsAddah Koala" 
                className="w-10 h-10 object-contain drop-shadow-md" // Slightly smaller logo for tighter header
              />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 dark:from-teal-400 dark:via-cyan-400 dark:to-blue-500">
              JobsAddah
            </span>
          </a>

          {/* --- Desktop Navigation --- */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.path}
                className="relative px-3 py-2 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300 transition-all duration-200 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-800/50 group"
              >
                {item.label}
              </a>
            ))}

            {/* Tools Dropdown */}
            <div className="relative ml-2" ref={toolsRef}>
              <button
                onClick={() => setToolsOpen((p) => !p)}
                className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                  toolsOpen 
                    ? "bg-teal-50 text-teal-700 border-teal-200 dark:bg-slate-800 dark:text-teal-400 dark:border-slate-700" 
                    : "text-slate-600 border-transparent hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                Tools <ChevronDown size={14} className={`transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Animated Dropdown Menu */}
              <div
                className={`absolute top-full right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden transform transition-all duration-200 origin-top-right z-50 ${
                  toolsOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                }`}
              >
                <div className="p-2 space-y-1">
                  {TOOLS_LINKS.map((link) => {
                    const Icon = link.icon;
                    return (
                      <a
                        key={link.path}
                        href={link.path}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
                      >
                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                            <Icon size={16} />
                        </div>
                        {link.label}
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Info Dropdown */}
            <div className="relative ml-2" ref={infoRef}>
              <button
                onClick={() => setInfoOpen((p) => !p)}
                className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                  infoOpen 
                    ? "bg-teal-50 text-teal-700 border-teal-200 dark:bg-slate-800 dark:text-teal-400 dark:border-slate-700" 
                    : "text-slate-600 border-transparent hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                More <ChevronDown size={14} className={`transition-transform duration-200 ${infoOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Animated Dropdown Menu */}
              <div
                className={`absolute top-full right-0 mt-3 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl ring-1 ring-black/5 dark:ring-white/10 overflow-hidden transform transition-all duration-200 origin-top-right z-50 ${
                  infoOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                }`}
              >
                <div className="p-2 space-y-1">
                  {INFO_LINKS.map((link) => {
                    const Icon = link.icon;
                    return (
                      <a
                        key={link.path}
                        href={link.path}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
                      >
                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                            <Icon size={16} />
                        </div>
                        {link.label}
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="ml-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400 transition-all duration-300 transform active:scale-95"
                aria-label="Toggle Theme"
                >
                {darkMode ? <Sun size={18} strokeWidth={2} /> : <Moon size={18} strokeWidth={2} />}
                </button>
            </div>
          </nav>

          {/* --- Mobile Controls --- */}
          <div className="md:hidden flex items-center gap-2 ml-auto">
             <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <button
              onClick={() => setMobileOpen((p) => !p)}
              className="p-2 rounded-full text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- Mobile Menu Overlay --- */}
      {/* UPDATED: Removed backdrop-blur-sm, made it darker (bg-black/50) for clarity on small screens */}
      <div 
        className={`md:hidden fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ease-in-out ${mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* --- Mobile Menu Drawer --- */}
      {/* UPDATED: Added ease-in-out for smooth theme transition on the drawer background */}
      <div className={`md:hidden absolute top-full left-0 w-full bg-white dark:bg-slate-900 border-b dark:border-slate-800 shadow-xl transition-all duration-300 ease-in-out origin-top ${mobileOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"}`}>
        <div className="px-4 py-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
             {NAV_ITEMS.map((item) => {
                 const Icon = item.icon;
                 return (
                    <a
                        key={item.label}
                        href={item.path}
                        onClick={() => setMobileOpen(false)}
                        className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-600 dark:hover:text-teal-400 transition-all border border-slate-100 dark:border-slate-800"
                    >
                        <Icon size={24} className="mb-2 opacity-70" />
                        <span className="text-sm font-semibold">{item.label}</span>
                    </a>
                 )
             })}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Tools</h3>
            {TOOLS_LINKS.map((link) => {
               const Icon = link.icon;
               return (
                <a
                    key={link.path}
                    href={link.path}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-teal-600 transition-colors"
                >
                    <Icon size={18} />
                    {link.label}
                </a>
               )
            })}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Information</h3>
            {INFO_LINKS.map((link) => {
               const Icon = link.icon;
               return (
                <a
                    key={link.path}
                    href={link.path}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-teal-600 transition-colors"
                >
                    <Icon size={18} />
                    {link.label}
                </a>
               )
            })}
          </div>
        </div>
      </div>
    </header>
  );
}