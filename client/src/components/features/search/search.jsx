"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { resolveJobDetailHref } from "@/lib/job-url";

function inferType(linkOrTitle) {
  if (!linkOrTitle) return "Info";
  const s = String(linkOrTitle).toLowerCase();
  if (s.includes("admit")) return "Admit Card";
  if (s.includes("result")) return "Result";
  if (s.includes("syllabus")) return "Syllabus";
  if (s.includes("recruit") || s.includes("vacancy") || s.includes("job") || s.includes("apply") || s.includes("career"))
    return "Job";
  if (s.includes("exam")) return "Exam";
  if (s.includes("notification")) return "Notification";
  if (s.includes("date")) return "Date";
  return "Info";
}

export default function Search() {
  // --- Search States ---
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // --- Refs ---
  const searchBoxRef = useRef(null);

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

      setTypingSpeed(isDeleting ? 40 : 100);

      if (!isDeleting && placeholderText === fullText) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && placeholderText === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [placeholderText, isDeleting, loopNum, typingSpeed]);

  async function performSearch(q, signal) {
    setIsSearching(true);
    try {
      const res = await fetch(`/api/gov/search?title=${encodeURIComponent(q)}`, { signal });
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
          sum + ((d.jobs && d.jobs.length) || 0) + ((d.recruitment && d.recruitment.length) || 0),
        0
      );

      setShowResults(total > 0);
    } catch (err) {
      if (err?.name === "AbortError") return;
      setSearchResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
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

  // Click-outside for dropdown
  useEffect(() => {
    function onDown(e) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div className="flex-1 max-w-xl mx-2 md:mx-6 transition-all duration-300" ref={searchBoxRef}>
      <form onSubmit={handleSearch} className="relative group">
        {/* --- ROTATING GRADIENT BORDER --- */}
  <div className="absolute -inset-0.5 rounded-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-75 blur-sm animate-pulse"></div>
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
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            placeholder={placeholderText}
            className="block w-full pl-10 pr-10 py-2.5 border-none rounded-full leading-5 bg-transparent text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-0 transition-all duration-300 sm:text-sm"
          />

          {searchQuery &&
            (isSearching ? (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400">
                <svg className="h-4 w-4 animate-spin text-indigo-600" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
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
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ))}
        </div>

        {/* Dropdown */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute left-0 right-0 mt-2 bg-white rounded-md shadow-lg z-50 max-h-80 overflow-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-indigo-600 [&::-webkit-scrollbar-thumb]:rounded-full">
            <div className="p-3 border-b text-sm text-gray-600">Showing results</div>

            {searchResults.map((doc, i) => {
              let jobs = [];
              if (Array.isArray(doc.jobs)) jobs = doc.jobs;
              else if (Array.isArray(doc.recruitment)) jobs = doc.recruitment;
              else if (doc.recruitment && typeof doc.recruitment === "object") {
                jobs = [
                  {
                    title: doc.recruitment.title || doc.recruitment.name || "Untitled",
                    link: doc.url || "",
                    createdAt: doc.updatedAt || doc.createdAt,
                  },
                ];
              }

              if (!jobs || jobs.length === 0) return null;

              return (
                <div key={doc._id || i} className="px-3 py-2 border-b last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <div />
                    <div className="text-xs text-gray-400">
                      {jobs.length} job{jobs.length > 1 ? "s" : ""}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {jobs.slice(0, 5).map((j, idx2) => {
                      const dest = resolveJobDetailHref({
                        url: j.link || j.url || j.postUrl || doc.url,
                        id: j._id || j.id || doc._id || doc.id,
                      });
                      return (
                        <Link
                          key={idx2}
                          href={dest || "#"}
                          onClick={() => setShowResults(false)}
                          className="block p-2 rounded-md hover:bg-indigo-50 transition-colors"
                        >
                          <div className="text-sm font-medium text-gray-900 truncate">{j.title}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {inferType(j.link || j.title || doc.url)}
                            </span>
                            <span className="text-xs text-gray-500">
                              {j.createdAt ? new Date(j.createdAt).toLocaleDateString() : ""}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="p-2 text-center text-xs text-gray-500">Press Enter to see full results</div>
          </div>
        )}
      </form>
    </div>
  );
}
