"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import UpdatesSection from "./home/UpdatesSection";
import DetailsModal from "./home/DetailsModal";
import { updatesData } from "./home/data";
import baseUrl from "../lib/baseUrl";

const MIN_SEARCH_LENGTH = 2;
const DEBOUNCE_MS = 400;

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function extractSearchResults(payload) {
  if (Array.isArray(payload?.results)) {
    return payload.results;
  }

  if (Array.isArray(payload?.data?.results)) {
    return payload.data.results;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return asArray(payload);
}

function isSchemeResult(item) {
  const type = String(item?.type || "").trim().toLowerCase();
  return type.includes("scheme") || type.includes("yojana");
}

export default function PortalApp() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedSearchQuery.length < MIN_SEARCH_LENGTH) {
      setSearchResults([]);
      setSearchError("");
      setSearchLoading(false);
      return;
    }

    const controller = new AbortController();
    let active = true;

    async function runSearch() {
      try {
        if (active) {
          setSearchLoading(true);
          setSearchError("");
        }

        const response = await fetch(
          `${baseUrl}/find-by-title-job-and-scheme?keyword=${encodeURIComponent(
            debouncedSearchQuery,
          )}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Search failed");
        }

        const payload = await response.json();

        if (!active) {
          return;
        }

        const jobResults = extractSearchResults(payload)
          .filter((item) => !isSchemeResult(item))
          .map((item) => ({ ...item, type: "job" }));

        setSearchResults(jobResults);
      } catch (error) {
        if (!active || error?.name === "AbortError") {
          return;
        }

        setSearchResults([]);
        setSearchError(error?.message || "Search failed");
      } finally {
        if (active) {
          setSearchLoading(false);
        }
      }
    }

    runSearch();

    return () => {
      active = false;
      controller.abort();
    };
  }, [debouncedSearchQuery]);

  const trimmedSearchQuery = searchQuery.trim();
  const filteredUpdates = useMemo(() => updatesData, []);

  const isSearchPanelActive = trimmedSearchQuery.length >= MIN_SEARCH_LENGTH;
  const isDebouncingSearch = isSearchPanelActive && debouncedSearchQuery !== trimmedSearchQuery;

  return (
    <div className="selection:bg-indigo-500 selection:text-white flex min-h-screen flex-col bg-[#f8fafc] font-sans text-slate-800">
      <Header
        scrolled={scrolled}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
        showSearchResults={isSearchPanelActive}
        searchLoading={isSearchPanelActive && (searchLoading || isDebouncingSearch)}
        searchError={isSearchPanelActive ? searchError : ""}
      />

      <main className="relative z-10 mx-auto w-full max-w-[1500px] flex-grow px-4 pt-32 pb-20 sm:px-6 lg:px-8">
        <UpdatesSection filteredUpdates={filteredUpdates} onSelectItem={setSelectedItem} />
      </main>

      <Footer />
      <DetailsModal selectedItem={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
