// src/pages/admin/JobAddahAdmin.jsx
import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

import {
  FileText,
  Briefcase,
  GraduationCap,
  CheckCircle,
  Edit2,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  RefreshCcw,
  Plus,
  XCircle,
  Loader2,
  DownloadCloud,
  RotateCw,
  Layers,
  Play,
  Square,
} from "lucide-react";

import {
  getStats,
  getPrivateJob,
  deleteJob,
  markFav,
  getSections,
  getPostlist,

} from "../../redux/slices/job";
import { getResults } from "../../redux/slices/resources";
import { baseUrl } from "../../util/url";

const ITEMS_PER_PAGE = 12;



export default function JobAddahAdmin() {
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
  const stopSyncRef = useRef(false);



  const {
    stats,
    loading,
    privateJobs,
    sections,
    postlist,
    isSettingModel,
    currentModel,
  } = useSelector((state) => state.job);

  useEffect(() => {
    dispatch(getStats());
    dispatch(getSections());
    dispatch(getPrivateJob());
    dispatch(getResults());
  
  }, [dispatch]);



  const sectionTabs = useMemo(() => {
    if (!sections?.[0]?.categories) return [];
    return sections[0].categories.map((cat) => ({
      id: cat.name,
      label: cat.name,
      link: cat.link,
    }));
  }, [sections]);

  useEffect(() => {
    if (sectionTabs.length > 0 && !activeTab) {
      const firstTab = sectionTabs[0];
      setActiveTab(firstTab.id);
      setActiveLink(firstTab.link);
      dispatch(getPostlist(`?url=${encodeURIComponent(firstTab.link)}`));
    }
  }, [sectionTabs, activeTab, dispatch]);

  const handleTabChange = (tabId, link) => {
    if (isBulkSyncing) {
      toast.error("Please stop syncing before changing tabs.");
      return;
    }
    setActiveTab(tabId);
    setActiveLink(link);
    setCurrentPage(1);
    setSearchQuery("");
    dispatch(getPostlist(`?url=${encodeURIComponent(link)}`));
  };

  const handleSyncCategories = async () => {
    setSyncingCategories(true);
    const toastId = toast.loading("Syncing all categories...");
    try {
      const res = await fetch(`${baseUrl}/scrapper/get-categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
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
      const res = await fetch(`${baseUrl}/scrapper/scrape-category`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: activeLink }),
      });

      if (res.ok) {
        toast.success(`${activeTab} posts updated!`, { id: toastId });
        dispatch(getPostlist(`?url=${encodeURIComponent(activeLink)}`));
      } else {
        throw new Error("Failed");
      }
    } catch (error) {
      toast.error("Failed to sync posts", { id: toastId });
    } finally {
      setSyncingCurrentSection(false);
    }
  };

  const filteredData = useMemo(() => {
    let jobs = [];

    if (Array.isArray(postlist) && postlist.every((item) => item.title && item.link)) {
      jobs = postlist;
    } else if (Array.isArray(postlist)) {
      const currentSection = postlist.find(
        (p) =>
          p.url &&
          sectionTabs.find((t) => t.id === activeTab)?.link.includes(p.url)
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
  }, [postlist, activeTab, sectionTabs, searchQuery]);

  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleToggleFav = useCallback(
    (e, id, fav) => {
      // Logic moved to ListItem for better local state handling,
      // but Redux dispatch remains here if needed directly.
      if (id) {
        dispatch(markFav({ id, fav: !fav }));
      }
    },
    [dispatch]
  );

  const handleDelete = (id) => {
    if (id) {
      dispatch(deleteJob(id));
      setConfirmDelete(null);
    }
  };

  const totalCount = (stats?.jobs || 0) + (privateJobs?.data?.length || 0);

  const handleStartBulkSync = async () => {
    const itemsToSync = filteredData;
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
    toast.success("Bulk Sync Started - Please wait...");

    for (let i = 0; i < itemsToSync.length; i++) {
      if (stopSyncRef.current) {
        toast("Sync stopped by user", { icon: "🛑" });
        break;
      }

      const item = itemsToSync[i];
      const linkUrl = item.link || item.url;

      if (linkUrl) {
        try {
          const res = await fetch(`${baseUrl}/scrapper/scrape-complete`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: linkUrl }),
          });
          if (res.ok) {
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
    if (!stopSyncRef.current) toast.success("Bulk Sync Completed!");
    if (activeLink) {
      dispatch(getPostlist(`?url=${encodeURIComponent(activeLink)}`));
    }
  };

  const handleStopBulkSync = () => {
    stopSyncRef.current = true;
  };


  return (
    <div className="space-y-8 font-sans text-slate-800 pb-10 min-h-screen bg-slate-50/50 p-6">
      <Toaster position="top-right" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm">
            Manage your job postings and resources
          </p>
        </div>
        <button
          onClick={() => navigate("/create-job")}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus size={18} /> New Posting
        </button>
      </div>

     

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Jobs"
          value={totalCount}
          color="bg-blue-600"
          icon={<Briefcase />}
          loading={loading}
        />
        <StatCard
          title="Admit Cards"
          value={stats?.admitCards || 0}
          color="bg-purple-600"
          icon={<FileText />}
          loading={loading}
        />
        <StatCard
          title="Results"
          value={stats?.results || 0}
          color="bg-green-600"
          icon={<CheckCircle />}
          loading={loading}
        />
        <StatCard
          title="Admissions"
          value={stats?.admissions || 0}
          color="bg-orange-500"
          icon={<GraduationCap />}
          loading={loading}
        />
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

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative w-full md:w-auto">
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
                    className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg w-full md:w-64 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>

                {isBulkSyncing ? (
                  <button
                    onClick={handleStopBulkSync}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg font-bold text-xs hover:bg-red-100 transition-colors animate-pulse"
                  >
                    <Square size={14} fill="currentColor" /> STOP
                  </button>
                ) : (
                  <button
                    onClick={handleStartBulkSync}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg font-bold text-xs hover:bg-emerald-100 transition-colors"
                    title="Sync all items one by one"
                  >
                    <Play size={14} fill="currentColor" /> Sync All
                  </button>
                )}
              </div>
            </div>

            {isBulkSyncing && (
              <div className="px-0 mt-4 space-y-2 animate-in fade-in slide-in-from-top-2">
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
              {sectionTabs.map((tab) => (
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
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <RefreshCcw className="animate-spin mb-2" size={24} />
                <span className="text-xs">Loading data...</span>
              </div>
            ) : paginatedData.length > 0 ? (
              <div
                className={`divide-y divide-slate-100 ${
                  isBulkSyncing
                    ? "opacity-50 pointer-events-none grayscale-[0.5]"
                    : ""
                }`}
              >
                {paginatedData.map((item, i) => (
                  <ListItem
                    key={item._id || item.id || item.link || item.url || i}
                    item={item}
                    onToggleFav={handleToggleFav}
                    onEdit={() =>
                      navigate(`/dashboard/job-edit/${item._id}`, {
                        state: { data: item },
                      })
                    }
                    onDelete={() =>
                      item._id && setConfirmDelete({ id: item._id })
                    }
                  />
                ))}
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
      </div>
    </div>
  );
}

const ListItem = React.memo(({ item, onEdit, onDelete, onToggleFav }) => {
  const title = item.title || item.postTitle || "Untitled";
  const linkUrl = item.link || item.url || "#";
  const initialId = item._id || item.id;
  
  // Local states to handle immediate updates even if parent list doesn't refresh
  const [fetchedId, setFetchedId] = useState(null);
  const [localFav, setLocalFav] = useState(!!item.fav);
  
  const activeId = initialId || fetchedId;
  const hasId = !!activeId;

  // Update localFav if prop changes
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

  const [dbStatus, setDbStatus] = useState("loading");

  useEffect(() => {
    let isMounted = true;
    const checkDbStatus = async () => {
      if (!linkUrl || linkUrl === "#") {
        if (isMounted) setDbStatus("idle");
        return;
      }
      try {
        const res = await fetch(
          `${baseUrl}/get-post/details?url=${encodeURIComponent(linkUrl)}`
        );
        if (isMounted) {
          if (res.ok) {
            setDbStatus("present");
            try {
              const data = await res.json();
              const foundId = data._id || data.id || data.data?._id || data.job?._id;
              if (foundId) setFetchedId(foundId);
              
              // Sync fav status from DB immediately
              if (data.fav !== undefined) setLocalFav(!!data.fav);
              else if (data.data?.fav !== undefined) setLocalFav(!!data.data.fav);
              else if (data.job?.fav !== undefined) setLocalFav(!!data.job.fav);

            } catch (err) {
              console.error(err);
            }
          } else {
            setDbStatus("missing");
          }
        }
      } catch (error) {
        if (isMounted) setDbStatus("missing");
      }
    };
    checkDbStatus();
    return () => {
      isMounted = false;
    };
  }, [linkUrl]);

  const handleScrape = async () => {
    const isUpdate = dbStatus === "present";
    setDbStatus("scraping");
    const toastId = toast.loading(isUpdate ? "Updating..." : "Syncing...");
    try {
      const res = await fetch(`${baseUrl}/scrapper/scrape-complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: linkUrl }),
      });
      if (res.ok) {
        toast.success(isUpdate ? "Updated!" : "Synced!", { id: toastId });
        setDbStatus("present");
        try {
          const data = await res.json();
          const newId = data._id || data.id || data.data?._id || data.job?._id;
          if (newId) setFetchedId(newId);
          
          // Sync fav status after scrape
          if (data.fav !== undefined) setLocalFav(!!data.fav);
          else if (data.data?.fav !== undefined) setLocalFav(!!data.data.fav);

        } catch (err) {
            console.error(err);
        }
      } else {
        throw new Error("Failed");
      }
    } catch (error) {
      toast.error("Error", { id: toastId });
      setDbStatus(isUpdate ? "present" : "missing");
    }
  };

  const handleLocalToggle = (e) => {
    e.stopPropagation();
    if (activeId) {
        setLocalFav(!localFav); // Optimistic update
        onToggleFav(e, activeId, localFav);
    }
  };

  return (
    <div className="group flex justify-between items-center px-6 py-4 hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-4 flex-1 min-w-0">
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
          disabled={!hasId}
          className="p-2 rounded-md hover:bg-yellow-50 text-slate-400 hover:text-yellow-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          title={hasId ? "Toggle favourite" : "Sync to enable favourite"}
        >
          <Star
            size={16}
            className={
              localFav
                ? "fill-yellow-400 text-yellow-400"
                : "text-slate-400"
            }
          />
        </button>

        {/* {hasId && !localFav && (
          <>
            <button
              onClick={onEdit}
              className="p-2 rounded-md hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={onDelete}
              className="p-2 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </>
        )} */}

        {!hasId && dbStatus === "missing" && (
          <button
            onClick={handleScrape}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-xs font-bold hover:bg-blue-100 transition-colors"
          >
            <DownloadCloud size={14} /> Sync
          </button>
        )}
      </div>
    </div>
  );
});

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

const StatCard = ({ title, value, color, icon, loading }) => (
  <div className="rounded-xl bg-white p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex items-center gap-4">
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg shadow-black/5 ${color}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          {title}
        </p>
        {loading ? (
          <div className="h-7 w-20 bg-slate-100 animate-pulse rounded mt-1" />
        ) : (
          <h4 className="text-2xl font-black text-slate-800">{value}</h4>
        )}
      </div>
    </div>
  </div>
);

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
  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
      <div className="flex flex-col items-center text-center">
        <div className="bg-red-50 p-4 rounded-full text-red-600 mb-5 ring-4 ring-red-50/50">
          <Trash2 size={28} />
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