import {
  BarChart3,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  DownloadCloud,
  FileText,
  Layers,
  Loader2,
  Play,
  Plus,
  RefreshCcw,
  RotateCw,
  Search,
  Square,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  deleteJob,
  getPostlist,
  getSections,
  getSite,
  markFav,
  setSite,
} from "../../../redux/slices/job";
import api from "../../../util/api";

const ITEMS_PER_PAGE = 12;

const SITE_OPTIONS = [
  {
    label: "sarkariresult.com.cm",
    url: "https://sarkariresult.com.cm",
  },
  {
    label: "sarkariexam.com",
    url: "https://sarkariexam.com",
  },
  {
    label: "SarkariResult (.info Mirror)",
    url: "https://www.sarkariresult.info",
  },
];

export default function Scrapper() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("");
  const [activeLink, setActiveLink] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [syncingCategories, setSyncingCategories] = useState(false);
  const [syncingCurrentSection, setSyncingCurrentSection] = useState(false);

  const [isBulkSyncing, setIsBulkSyncing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkStats, setBulkStats] = useState({
    total: 0,
    current: 0,
    success: 0,
    failed: 0,
  });
  const [fixingUrls, setFixingUrls] = useState(false);
  const stopSyncRef = useRef(false);

  const [selectedLinks, setSelectedLinks] = useState(new Set());
  const [selectAllOnPage, setSelectAllOnPage] = useState(false);
  const [dbStatusMap, setDbStatusMap] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [siteUrl, setSiteUrl] = useState("");
  const [savingSite, setSavingSite] = useState(false);

  const [duplicatesModal, setDuplicatesModal] = useState(null);
  const [analyzingDuplicates, setAnalyzingDuplicates] = useState(false);
  const [deletingDuplicates, setDeletingDuplicates] = useState(false);

  const { sections, postlist, site } = useSelector((state) => state.job);

  useEffect(() => {
    dispatch(getSite());
    dispatch(getSections());
  }, [dispatch]);

  useEffect(() => {
    if (site?.url) {
      setSiteUrl(site.url);
    }
  }, [site]);

  const handleSaveSite = async (e) => {
    e.preventDefault();
    if (!siteUrl.trim()) {
      toast.error("Please select a site");
      return;
    }
    setSavingSite(true);
    try {
      const res = await dispatch(setSite({ url: siteUrl.trim() }));
      if (res.meta.requestStatus === "fulfilled") {
        toast.success("Site updated");
        dispatch(getSections());
      } else {
        toast.error("Failed to update site");
      }
    } catch (err) {
      toast.error("Failed to update site");
    } finally {
      setSavingSite(false);
    }
  };

  const sectionTabs = useCallback(() => {
    if (!sections?.[0]?.categories) return [];
    return sections[0].categories.map((cat) => ({
      id: cat.name,
      label: cat.name,
      link: cat.link,
    }));
  }, [sections]);

  const tabsData = sectionTabs();

  useEffect(() => {
    if (tabsData.length > 0 && !activeTab) {
      const firstTab = tabsData[0];
      setActiveTab(firstTab.id);
      setActiveLink(firstTab.link);
      dispatch(getPostlist(`?url=${encodeURIComponent(firstTab.link)}`));
    }
  }, [tabsData, activeTab, dispatch]);

  const handleTabChange = (tabId, link) => {
    if (isBulkSyncing) {
      toast.error("Please stop syncing before changing tabs.");
      return;
    }
    setActiveTab(tabId);
    setActiveLink(link);
    setCurrentPage(1);
    setSearchQuery("");
    setSelectedLinks(new Set());
    setSelectAllOnPage(false);
    dispatch(getPostlist(`?url=${encodeURIComponent(link)}`));
  };

  const handleSyncCategories = async () => {
    setSyncingCategories(true);
    const toastId = toast.loading("Syncing all categories...");
    try {
      const res = await api.post("/scrapper/get-categories");
      if (res.status >= 200 && res.status < 300) {
        toast.success("Categories list updated!", { id: toastId });
        dispatch(getSections());
      } else {
        throw new Error("Failed");
      }
    } catch (error) {
      toast.error("Failed to sync categories", { id: toastId });
    } finally {
      setSyncingCategories(false);
    }
  };

  const handleSyncCurrentSection = async () => {
    if (!activeLink) return;
    setSyncingCurrentSection(true);
    const toastId = toast.loading(`Syncing posts for ${activeTab}...`);
    try {
      const res = await api.post("/scrapper/scrape-category", {
        url: activeLink,
      });
      if (res.status >= 200 && res.status < 300) {
        toast.success(`${activeTab} posts updated!`, { id: toastId });
        dispatch(getPostlist(`?url=${encodeURIComponent(activeLink)}`));
        setRefreshTrigger((prev) => prev + 1);
      } else {
        throw new Error("Failed");
      }
    } catch (error) {
      toast.error("Failed to sync posts", { id: toastId });
    } finally {
      setSyncingCurrentSection(false);
    }
  };

  const handleAnalyzeDuplicates = async () => {
    setAnalyzingDuplicates(true);
    const toastId = toast.loading("Analyzing duplicates...");
    try {
      const res = await api.get("/scrapper/analyze-duplicates");
      if (res.status >= 200 && res.status < 300) {
        toast.success("Analysis complete!", { id: toastId });
        // Normalize response shape so UI works with both old and new API shapes.
        const raw = res.data || {};
        const normalized = {
          // carry through scannedPosts if provided
          scannedPosts: raw.scannedPosts,
          // duplicatesFound may be provided, otherwise fall back to results/analysis length
          duplicatesFound:
            raw.duplicatesFound ??
            (Array.isArray(raw.results)
              ? raw.results.length
              : Array.isArray(raw.analysis)
                ? raw.analysis.length
                : 0),
          // prefer existing `analysis`, otherwise map `results` -> `analysis` items to the expected shape
          analysis: Array.isArray(raw.analysis)
            ? raw.analysis
            : Array.isArray(raw.results)
              ? raw.results.map((r) => ({
                  similarity: r.similarity ?? r.similarityPercent ?? "",
                  // normalize decision/keep field
                  decision: r.decision ?? r.keep ?? "",
                  reason: r.reason,
                  // adapt deletedPost/keptPost to older `willDelete`/`willKeep` shape
                  willDelete: r.deletedPost
                    ? {
                        title: r.deletedPost.title || "",
                        url:
                          r.deletedPost.url ||
                          r.deletedPost.path ||
                          r.deletedPost.id ||
                          "",
                        organization: r.deletedPost.organization,
                        createdAt: r.deletedPost.createdAt,
                      }
                    : r.willDelete || {},
                  willKeep: r.keptPost
                    ? {
                        title: r.keptPost.title || "",
                        url:
                          r.keptPost.url ||
                          r.keptPost.path ||
                          r.keptPost.id ||
                          "",
                        organization: r.keptPost.organization,
                        createdAt: r.keptPost.createdAt,
                      }
                    : r.willKeep || {},
                  deleted: !!r.deleted,
                }))
              : [],
          // include raw metadata for debugging
          mode: raw.mode,
        };

        setDuplicatesModal({ type: "analysis", data: normalized });
      } else {
        throw new Error("Failed");
      }
    } catch (error) {
      toast.error("Failed to analyze duplicates", { id: toastId });
    } finally {
      setAnalyzingDuplicates(false);
    }
  };

  const handleFixAllUrls = async () => {
    setFixingUrls(true);
    const toastId = toast.loading("Normalizing URLs...");
    try {
      const res = await api.post("/fix-all-urls");
      if (res.status >= 200 && res.status < 300) {
        toast.success("URLs normalized", { id: toastId });
        setRefreshTrigger((prev) => prev + 1);
        if (activeLink) {
          dispatch(getPostlist(`?url=${encodeURIComponent(activeLink)}`));
        }
      } else {
        throw new Error("Failed");
      }
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to normalize URLs";
      toast.error(msg, { id: toastId });
    } finally {
      setFixingUrls(false);
    }
  };

  const handleDeleteDuplicates = async () => {
    setDeletingDuplicates(true);
    const toastId = toast.loading("Deleting duplicates...");
    try {
      // Delete via the analyze endpoint by passing delete=true (GET)
      const res = await api.get("/scrapper/analyze-duplicates", {
        params: { delete: true },
      });
      if (res.status >= 200 && res.status < 300) {
        const raw = res.data || {};
        // Prefer explicit counts from server
        let deletedCount = raw.deletedCount ?? raw.duplicatesDeleted;
        // If not present, infer from results array where `deleted` flag is true
        if (deletedCount === undefined && Array.isArray(raw.results)) {
          deletedCount = raw.results.reduce(
            (acc, r) => acc + (r.deleted ? 1 : 0),
            0
          );
        }
        deletedCount = deletedCount ?? 0;
        toast.success(`${deletedCount} duplicates deleted!`, { id: toastId });
        setDuplicatesModal(null);
        setRefreshTrigger((prev) => prev + 1);
      } else {
        throw new Error("Failed");
      }
    } catch (error) {
      toast.error("Failed to delete duplicates", { id: toastId });
    } finally {
      setDeletingDuplicates(false);
    }
  };

  const filteredData = useCallback(() => {
    let jobs = [];

    if (
      Array.isArray(postlist) &&
      postlist.every((item) => item.title && item.link)
    ) {
      jobs = postlist;
    } else if (Array.isArray(postlist)) {
      const currentSection = postlist.find(
        (p) =>
          p.url &&
          tabsData.find((t) => t.id === activeTab)?.link.includes(p.url)
      );
      jobs = currentSection?.jobs || postlist[0]?.jobs || [];
    } else if (postlist?.jobs) {
      jobs = postlist.jobs;
    }

    if (!searchQuery) return jobs;
    return jobs.filter((j) =>
      (j.title || j.postTitle || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  }, [postlist, activeTab, tabsData, searchQuery]);

  const data = filteredData();
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedData = data.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleToggleFav = useCallback(
    (e, id, fav) => {
      e.preventDefault();
      if (id) {
        dispatch(markFav({ id, fav: !fav }));
        toast.success(fav ? "Removed from favorites" : "Added to favorites");
      }
    },
    [dispatch]
  );

  const handleDelete = (id) => {
    if (id) {
      dispatch(deleteJob(id));
      setConfirmDelete(null);
      setRefreshTrigger((prev) => prev + 1);
      toast.success("Post deleted");
    }
  };

  const handleRefreshList = useCallback(() => {
    if (activeLink) {
      dispatch(getPostlist(`?url=${encodeURIComponent(activeLink)}`));
      setRefreshTrigger((prev) => prev + 1);
    }
  }, [activeLink, dispatch]);

  const runBulkSync = async (itemsToSync, label) => {
    if (itemsToSync.length === 0) {
      toast.error("No items to sync");
      return;
    }

    setIsBulkSyncing(true);
    stopSyncRef.current = false;
    setBulkStats({
      total: itemsToSync.length,
      current: 0,
      success: 0,
      failed: 0,
    });
    setBulkProgress(0);
    toast.success(`${label} Started - Please wait...`);

    for (let i = 0; i < itemsToSync.length; i++) {
      if (stopSyncRef.current) {
        toast("Sync stopped by user", { icon: "🛑" });
        break;
      }

      const item = itemsToSync[i];
      const linkUrl = item.link || item.url;

      if (linkUrl) {
        try {
          const res = await api.post("/scrapper/scrape-complete", {
            url: linkUrl,
          });
          if (res.status >= 200 && res.status < 300) {
            setBulkStats((prev) => ({ ...prev, success: prev.success + 1 }));
          } else {
            setBulkStats((prev) => ({ ...prev, failed: prev.failed + 1 }));
          }
        } catch (err) {
          setBulkStats((prev) => ({ ...prev, failed: prev.failed + 1 }));
        }
      } else {
        setBulkStats((prev) => ({ ...prev, failed: prev.failed + 1 }));
      }

      setBulkStats((prev) => ({ ...prev, current: i + 1 }));
      setBulkProgress(Math.round(((i + 1) / itemsToSync.length) * 100));

      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setIsBulkSyncing(false);
    if (!stopSyncRef.current) toast.success(`${label} Completed!`);

    setRefreshTrigger((prev) => prev + 1);

    if (activeLink) {
      dispatch(getPostlist(`?url=${encodeURIComponent(activeLink)}`));
    }
  };

  const handleStartBulkSyncAll = async () => {
    await runBulkSync(data, "Bulk Sync All");
  };

  const handleSyncSelected = async () => {
    const itemsToSync = data.filter((item) => {
      const linkUrl = item.link || item.url;
      return linkUrl && selectedLinks.has(linkUrl);
    });

    if (itemsToSync.length === 0) {
      toast.error("No selected items to sync");
      return;
    }
    await runBulkSync(itemsToSync, "Sync Selected");
  };

  const handleSyncMissingOnly = async () => {
    const itemsToSync = data.filter((item) => {
      const linkUrl = item.link || item.url;
      if (!linkUrl) return false;
      const status = dbStatusMap[linkUrl];
      return status === "missing";
    });

    if (itemsToSync.length === 0) {
      toast.error("No missing items to sync");
      return;
    }
    await runBulkSync(itemsToSync, "Sync Missing Only");
  };

  const handleStopBulkSync = () => {
    stopSyncRef.current = true;
  };

  const handleToggleSelectOne = (linkUrl) => {
    setSelectedLinks((prev) => {
      const next = new Set(prev);
      if (next.has(linkUrl)) next.delete(linkUrl);
      else next.add(linkUrl);
      return next;
    });
  };

  const handleToggleSelectAllOnPage = () => {
    const pageLinks = paginatedData
      .map((item) => item.link || item.url)
      .filter(Boolean);

    setSelectedLinks((prev) => {
      const next = new Set(prev);
      const allSelected = pageLinks.every((l) => next.has(l));
      if (allSelected) {
        pageLinks.forEach((l) => next.delete(l));
        setSelectAllOnPage(false);
      } else {
        pageLinks.forEach((l) => next.add(l));
        setSelectAllOnPage(true);
      }
      return next;
    });
  };

  useEffect(() => {
    const pageLinks = paginatedData
      .map((item) => item.link || item.url)
      .filter(Boolean);
    if (pageLinks.length === 0) {
      setSelectAllOnPage(false);
      return;
    }
    const allSelected = pageLinks.every((l) => selectedLinks.has(l));
    setSelectAllOnPage(allSelected);
  }, [paginatedData, selectedLinks]);

  const handleStatusChange = useCallback((linkUrl, status) => {
    if (!linkUrl) return;
    setDbStatusMap((prev) => ({
      ...prev,
      [linkUrl]: status,
    }));
  }, []);

  return (
    <div className="space-y-8 font-sans text-slate-800 pb-10 min-h-screen bg-slate-50/50 p-6">
      <Toaster position="top-right" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Scrapper</h1>
          <p className="text-slate-500 text-sm">
            Manage scraping source and sync job postings
          </p>
        </div>
        <button
          onClick={() => navigate("/create-job")}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus size={18} /> New Posting
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Scrape Source
          </p>
          <p className="text-sm text-slate-700">
            Select which site to use for scraping categories and posts.
          </p>
          {site?.url && (
            <p className="text-xs mt-1">
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                Active: {site.url}
              </span>
            </p>
          )}
        </div>
        <form
          onSubmit={handleSaveSite}
          className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center"
        >
          <select
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm min-w-[220px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="">Select site</option>
            {SITE_OPTIONS.map((opt) => (
              <option key={opt.url} value={opt.url}>
                {opt.label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={!siteUrl || savingSite}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingSite ? "Saving..." : "Set Site"}
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-6">
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col min-h-[600px]">
          <div className="border-b border-slate-100 px-6 py-5 bg-white rounded-t-xl">
            <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Postings</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {activeTab || "All"} • {totalItems} items found
                </p>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search titles..."
                    disabled={isBulkSyncing}
                    className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {isBulkSyncing ? (
                    <button
                      onClick={handleStopBulkSync}
                      className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg font-bold text-xs hover:bg-red-100 transition-colors animate-pulse"
                    >
                      <Square size={14} fill="currentColor" /> STOP
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleStartBulkSyncAll}
                        className="flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg font-bold text-xs hover:bg-emerald-100 transition-colors"
                        title="Sync all items one by one"
                      >
                        <Play size={14} fill="currentColor" /> Sync All
                      </button>

                      <button
                        onClick={handleSyncSelected}
                        disabled={selectedLinks.size === 0}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg font-bold text-xs hover:bg-blue-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Sync only selected items"
                      >
                        <Play size={14} fill="currentColor" /> Sync Selected (
                        {selectedLinks.size})
                      </button>

                      <button
                        onClick={handleSyncMissingOnly}
                        className="flex items-center gap-2 px-3 py-2 bg-yellow-50 text-yellow-700 border border-yellow-100 rounded-lg font-bold text-xs hover:bg-yellow-100 transition-colors"
                        title="Sync only items that are not present in DB"
                      >
                        <Play size={14} fill="currentColor" /> Sync Missing Only
                      </button>

                      <button
                        onClick={handleFixAllUrls}
                        disabled={fixingUrls || isBulkSyncing}
                        className="flex items-center gap-2 px-3 py-2 bg-orange-50 text-orange-700 border border-orange-100 rounded-lg font-bold text-xs hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Normalize URLs for all posts"
                      >
                        <RotateCw
                          size={14}
                          className={fixingUrls ? "animate-spin" : undefined}
                        />
                        {fixingUrls ? "Normalizing..." : "Fix URLs"}
                      </button>

                      <button
                        onClick={handleAnalyzeDuplicates}
                        disabled={analyzingDuplicates}
                        className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg font-bold text-xs hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Analyze duplicate posts"
                      >
                        <BarChart3 size={14} />{" "}
                        {analyzingDuplicates ? "Analyzing..." : "Analyze Dups"}
                      </button>

                      <button
                        onClick={handleDeleteDuplicates}
                        disabled={deletingDuplicates}
                        className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 border border-red-100 rounded-lg font-bold text-xs hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete duplicate posts (60%+ similarity)"
                      >
                        <Trash2 size={14} />{" "}
                        {deletingDuplicates ? "Deleting..." : "Delete Dups"}
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {isBulkSyncing && (
              <div className="px-0 mt-4 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Progress: {bulkProgress}%</span>
                  <span className="flex gap-3">
                    <span className="text-blue-600">
                      Total: {bulkStats.total}
                    </span>
                    <span className="text-emerald-600">
                      Success: {bulkStats.success}
                    </span>
                    <span className="text-red-500">
                      Failed: {bulkStats.failed}
                    </span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                  <div
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${bulkProgress}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400 text-center italic">
                  Processing item {bulkStats.current} of {bulkStats.total}. Do
                  not close this window.
                </p>
              </div>
            )}
          </div>

          <div className="px-6 mt-6 flex items-center gap-3">
            <button
              onClick={handleSyncCategories}
              disabled={syncingCategories || isBulkSyncing}
              className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-purple-50 hover:text-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 border border-slate-200 group"
              title="Sync Categories List"
            >
              <Layers
                size={16}
                className={
                  syncingCategories
                    ? "animate-bounce text-purple-600"
                    : "group-hover:text-purple-600"
                }
              />
            </button>

            <div className="h-6 w-px bg-slate-200 mx-1" />

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide mask-linear-fade flex-1">
              {tabsData.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id, tab.link)}
                  disabled={isBulkSyncing}
                  className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 disabled:opacity-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-slate-200 mx-1" />

            <button
              onClick={handleSyncCurrentSection}
              disabled={syncingCurrentSection || isBulkSyncing}
              className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 border border-slate-200 group"
              title={`Sync Posts in ${activeTab}`}
            >
              <RotateCw
                size={16}
                className={
                  syncingCurrentSection
                    ? "animate-spin text-blue-600"
                    : "group-hover:text-blue-600"
                }
              />
            </button>
          </div>

          <div className="flex-grow mt-4">
            {paginatedData.length > 0 ? (
              <div
                className={`divide-y divide-slate-100 ${
                  isBulkSyncing
                    ? "opacity-50 pointer-events-none grayscale-[0.5]"
                    : ""
                }`}
              >
                <div className="flex items-center px-6 py-2 bg-slate-50 border-b border-slate-100 text-xs text-slate-500">
                  <div className="w-10 flex justify-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={selectAllOnPage}
                      onChange={handleToggleSelectAllOnPage}
                    />
                  </div>
                  <div className="flex-1 pl-2">Title</div>
                  <div className="w-40 text-right pr-2">Actions</div>
                </div>

                {paginatedData.map((item, i) => {
                  const linkUrl = item.link || item.url || "";
                  const isSelected = selectedLinks.has(linkUrl);

                  return (
                    <ListItem
                      key={item._id || item.id || item.link || item.url || i}
                      item={item}
                      onToggleFav={handleToggleFav}
                      onEdit={(itemId) =>
                        itemId &&
                        navigate(`/dashboard/job-edit/${itemId}`, {
                          state: { data: item },
                        })
                      }
                      onDelete={(itemId) =>
                        itemId && setConfirmDelete({ id: itemId })
                      }
                      isSelected={isSelected}
                      onToggleSelect={() =>
                        linkUrl && handleToggleSelectOne(linkUrl)
                      }
                      onStatusChange={handleStatusChange}
                      onSyncSuccess={handleRefreshList}
                      refreshTrigger={refreshTrigger}
                    />
                  );
                })}
              </div>
            ) : (
              <EmptyState type={activeTab || "this"} />
            )}
          </div>

          {totalItems > 0 && (
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 rounded-b-xl flex justify-between items-center">
              <span className="text-xs font-medium text-slate-500">
                Page {currentPage} of {totalPages}
              </span>
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>

        {confirmDelete && (
          <ConfirmDeleteModal
            onConfirm={() => handleDelete(confirmDelete.id)}
            onCancel={() => setConfirmDelete(null)}
          />
        )}

        {duplicatesModal && (
          <DuplicatesModal
            modal={duplicatesModal}
            onClose={() => setDuplicatesModal(null)}
            onDelete={handleDeleteDuplicates}
            isDeleting={deletingDuplicates}
          />
        )}
      </div>
    </div>
  );
}

const ListItem = React.memo(
  ({
    item,
    onEdit,
    onDelete,
    onToggleFav,
    isSelected,
    onToggleSelect,
    onStatusChange,
    onSyncSuccess,
    refreshTrigger,
  }) => {
    const title = item.title || item.postTitle || "Untitled";
    const linkUrl = item.link || item.url || "#";
    const initialId = item._id || item.id;

    const [fetchedId, setFetchedId] = useState(null);
    const [localFav, setLocalFav] = useState(!!item.fav);
    const [dbStatus, setDbStatus] = useState("loading");

    const activeId = initialId || fetchedId;

    const handleEditClick = () => {
      if (!activeId) {
        toast.error("Sync this entry before editing.");
        return;
      }
      onEdit?.(activeId);
    };

    const handleDeleteClick = () => {
      if (!activeId) {
        toast.error("Sync this entry before deleting.");
        return;
      }
      onDelete?.(activeId);
    };

    useEffect(() => {
      setLocalFav(!!item.fav);
    }, [item.fav]);

    let hostname = "N/A";
    try {
      if (linkUrl && linkUrl !== "#") {
        hostname = new URL(linkUrl).hostname.replace("www.", "");
      }
    } catch (e) {
      hostname = "Invalid URL";
    }

    const fetchPostDetails = useCallback(async () => {
      if (!linkUrl || linkUrl === "#") return null;

      const variants = new Set();
      variants.add(linkUrl);

      // normalize trailing slash variants
      const stripSlash = linkUrl.endsWith("/")
        ? linkUrl.slice(0, -1)
        : linkUrl;
      const addSlash = linkUrl.endsWith("/") ? linkUrl : `${linkUrl}/`;
      variants.add(stripSlash);
      variants.add(addSlash);

      try {
        const u = new URL(linkUrl);
        variants.add(u.pathname);
        variants.add(u.pathname.endsWith("/") ? u.pathname.slice(0, -1) : `${u.pathname}/`);
      } catch {
        /* ignore URL parse errors */
      }

      const isHit = (res) => {
        if (!res) return false;
        if (!(res.status >= 200 && res.status < 300)) return false;
        const d = res.data;
        if (!d) return false;
        if (d.success === true) return true;
        if (d.action === "EXISTING_DATA") return true;
        if (d._id || d.id || d.data?._id || d.job?._id) return true;
        return false;
      };

      for (const v of variants) {
        for (const key of ["url", "link"]) {
          try {
            const res = await api.get("/get-post/details", { params: { [key]: v } });
            if (isHit(res)) return res.data;
          } catch {
            /* try next */
          }
        }
      }

      // last resort: POST with body (some servers only accept json)
      for (const v of variants) {
        try {
          const res = await api.post("/get-post/details", { url: v });
          if (isHit(res)) return res.data;
        } catch {
          /* final failure */
        }
      }
      return null;
    }, [linkUrl]);

    useEffect(() => {
      let isMounted = true;
      const checkDbStatus = async () => {
        if (!linkUrl || linkUrl === "#") {
          if (isMounted) {
            setDbStatus("idle");
            onStatusChange(linkUrl, "idle");
          }
          return;
        }

        const data = await fetchPostDetails();
        if (!isMounted) return;

        if (data) {
          setDbStatus("present");
          onStatusChange(linkUrl, "present");
          try {
            const foundId =
              data._id || data.id || data.data?._id || data.job?._id;
            if (foundId) setFetchedId(foundId);

            if (data.fav !== undefined) setLocalFav(!!data.fav);
            else if (data.data?.fav !== undefined) setLocalFav(!!data.data.fav);
            else if (data.job?.fav !== undefined) setLocalFav(!!data.job.fav);
          } catch (err) {
            console.error(err);
          }
        } else {
          setDbStatus("missing");
          onStatusChange(linkUrl, "missing");
        }
      };

      checkDbStatus();
      return () => {
        isMounted = false;
      };
    }, [fetchPostDetails, linkUrl, onStatusChange, refreshTrigger]);

    const handleScrape = async () => {
      const isUpdate = dbStatus === "present";
      setDbStatus("scraping");
      onStatusChange(linkUrl, "scraping");
      const toastId = toast.loading(isUpdate ? "Updating..." : "Syncing...");
      try {
        const res = await api.post("/scrapper/scrape-complete", { url: linkUrl });
        if (!(res.status >= 200 && res.status < 300)) throw new Error("Failed");

        const data = res.data;
        toast.success(isUpdate ? "Updated!" : "Synced!", { id: toastId });

        // Immediately mark present for UX
        setDbStatus("present");
        onStatusChange(linkUrl, "present");

        // Try to read returned id/fav first
        try {
          const newId = data?._id || data?.id || data?.data?._id || data?.job?._id;
          if (newId) setFetchedId(newId);

          const favValue =
            data?.fav ?? data?.data?.fav ?? data?.job?.fav ?? undefined;
          if (favValue !== undefined) setLocalFav(!!favValue);
        } catch (err) {
          console.error(err);
        }

        // Double-check with detail endpoint to avoid stale "not in DB" labels
        try {
          const detail = await fetchPostDetails();
          if (detail) {
            const foundId =
              detail._id || detail.id || detail.data?._id || detail.job?._id;
            if (foundId) setFetchedId(foundId);
            const favValue =
              detail?.fav ?? detail?.data?.fav ?? detail?.job?.fav ?? undefined;
            if (favValue !== undefined) setLocalFav(!!favValue);
          }
        } catch {
          /* ignore */
        }

        if (onSyncSuccess) onSyncSuccess();
      } catch (error) {
        toast.error("Error", { id: toastId });
        setDbStatus(isUpdate ? "present" : "missing");
        onStatusChange(linkUrl, isUpdate ? "present" : "missing");
      }
    };

    const handleLocalToggle = (e) => {
      e.stopPropagation();
      if (!activeId) {
        toast.error("Please sync first to mark as favorite");
        return;
      }
      setLocalFav(!localFav);
      onToggleFav(e, activeId, localFav);
    };

    return (
      <div className="group flex justify-between items-center px-6 py-4 hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 flex justify-center shrink-0">
            {linkUrl && linkUrl !== "#" && (
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                checked={!!isSelected}
                onChange={onToggleSelect}
              />
            )}
          </div>

          <div className="shrink-0">
            {dbStatus === "loading" || dbStatus === "scraping" ? (
              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-blue-600">
                <Loader2 size={20} className="animate-spin" />
              </div>
            ) : dbStatus === "present" ? (
              <button
                onClick={handleScrape}
                className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center text-green-600 border border-green-100 hover:bg-green-100 hover:scale-105 transition-all"
                title="Update"
              >
                <RefreshCcw size={20} />
              </button>
            ) : (
              <button
                onClick={handleScrape}
                className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center text-red-500 border border-red-100 hover:bg-red-100 hover:scale-105 transition-all"
                title="Sync"
              >
                <XCircle size={20} />
              </button>
            )}
          </div>

          <div className="flex flex-col min-w-0 pr-4">
            <a
              href={linkUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-slate-800 hover:text-blue-600 truncate block"
            >
              {title}
            </a>
            <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Briefcase size={10} /> {hostname}
              </span>
              {dbStatus === "missing" && (
                <span className="text-red-500 font-medium">• Not in DB</span>
              )}
              {dbStatus === "present" && (
                <span className="text-green-600 font-medium">• Synced</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleLocalToggle}
            disabled={!activeId}
            className="p-2 rounded-md hover:bg-yellow-50 text-slate-400 hover:text-yellow-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title={
              activeId
                ? "Toggle favourite"
                : "Sync post first to mark as favourite"
            }
          >
            <Star
              size={16}
              className={
                localFav ? "fill-yellow-400 text-yellow-400" : "text-slate-400"
              }
            />
          </button>

          {!activeId && dbStatus === "missing" && (
            <button
              onClick={handleScrape}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-xs font-bold hover:bg-blue-100 transition-colors"
            >
              <DownloadCloud size={14} /> Sync
            </button>
          )}

          {onEdit && (
            <button
              onClick={handleEditClick}
              disabled={!activeId}
              className="p-2 rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400"
              title={
                activeId ? "Edit" : "Sync first to enable editing"
              }
            >
              Edit
            </button>
          )}

          {onDelete && (
            <button
              onClick={handleDeleteClick}
              disabled={!activeId}
              className="p-2 rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400"
              title={
                activeId ? "Delete" : "Sync first to enable deletion"
              }
            >
              Delete
            </button>
          )}
        </div>
      </div>
    );
  }
);

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  let pages = [];
  if (totalPages <= 5) {
    pages = [...Array(totalPages).keys()].map((i) => i + 1);
  } else if (currentPage <= 3) {
    pages = [1, 2, 3, 4, "...", totalPages];
  } else if (currentPage >= totalPages - 2) {
    pages = [
      1,
      "...",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  } else {
    pages = [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  }

  return (
    <div className="flex gap-1 items-center">
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((p, i) => (
        <button
          key={i}
          onClick={() => typeof p === "number" && onPageChange(p)}
          disabled={typeof p !== "number"}
          className={`h-8 w-8 text-xs font-medium rounded-lg transition-all ${
            p === currentPage
              ? "bg-slate-900 text-white shadow-md"
              : typeof p === "number"
                ? "text-slate-600 hover:bg-slate-100"
                : "text-slate-400 cursor-default"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="p-1.5 rounded-md hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

const EmptyState = ({ type }) => (
  <div className="flex flex-col items-center justify-center py-20">
    <div className="bg-slate-50 p-6 rounded-full mb-4 ring-1 ring-slate-100">
      <FileText className="text-slate-300" size={32} />
    </div>
    <h3 className="text-sm font-bold text-slate-900">No postings found</h3>
    <p className="text-xs text-slate-500 mt-1 max-w-[200px] text-center">
      We couldn't find any data for the "{type}" section right now.
    </p>
  </div>
);

const ConfirmDeleteModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
      <div className="flex flex-col items-center text-center">
        <div className="bg-red-50 p-4 rounded-full text-red-600 mb-5 ring-4 ring-red-50/50">
          <RefreshCcw size={28} />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">
          Delete Posting?
        </h3>
        <p className="text-sm text-slate-500 mb-8 leading-relaxed px-4">
          Are you sure you want to remove this item?
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-3 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all active:scale-95"
        >
          Yes, Delete
        </button>
      </div>
    </div>
  </div>
);

const DuplicatesModal = ({ modal, onClose, onDelete, isDeleting }) => {
  if (!modal) return null;

  const isAnalysis = modal.type === "analysis";
  const data = modal.data;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {isAnalysis ? "Duplicate Analysis" : "Delete Duplicates"}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {data?.duplicatesFound || 0} duplicates found (60%+ similarity)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"
          >
            <XCircle size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {data?.analysis && data.analysis.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {data.analysis.map((dup, idx) => (
                <div key={idx} className="p-4 hover:bg-slate-50 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full border border-red-100">
                          <Trash2 size={12} /> WILL DELETE
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {dup.willDelete.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                        {dup.willDelete.url}
                      </p>

                      {(dup.willDelete.organization ||
                        dup.willDelete.createdAt) && (
                        <p className="text-[11px] text-slate-400 mb-3">
                          {dup.willDelete.organization && (
                            <span>{dup.willDelete.organization}</span>
                          )}
                          {dup.willDelete.organization &&
                            dup.willDelete.createdAt && <span> • </span>}
                          {dup.willDelete.createdAt && (
                            <span>
                              {new Date(
                                dup.willDelete.createdAt
                              ).toLocaleString()}
                            </span>
                          )}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-100">
                          <Star size={12} fill="currentColor" /> WILL KEEP
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          {dup.willKeep.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {dup.willKeep.url}
                      </p>

                      {(dup.willKeep.organization ||
                        dup.willKeep.createdAt) && (
                        <p className="text-[11px] text-slate-400">
                          {dup.willKeep.organization && (
                            <span>{dup.willKeep.organization}</span>
                          )}
                          {dup.willKeep.organization &&
                            dup.willKeep.createdAt && <span> • </span>}
                          {dup.willKeep.createdAt && (
                            <span>
                              {new Date(
                                dup.willKeep.createdAt
                              ).toLocaleString()}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-purple-600">
                        {dup.similarity}%
                      </p>
                      <p className="text-xs text-slate-500">match</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-slate-500">
                {data?.message || "No duplicates found"}
              </p>
            </div>
          )}
        </div>

        {data?.duplicatesFound > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-slate-200 font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            {isAnalysis && (
              <button
                onClick={onDelete}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Trash2 size={16} />
                {isDeleting ? "Deleting..." : `Delete ${data.duplicatesFound}`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
