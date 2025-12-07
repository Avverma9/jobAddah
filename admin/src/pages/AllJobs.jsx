import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getJobs, deleteJob, markFav } from "../../redux/slices/job";
import toast from 'react-hot-toast';
import { 
  Briefcase,
  Search,
  Loader2,
  Trash2,
  Pencil,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Star,
} from "lucide-react";

export default function AllJobs() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { jobs, loading, error } = useSelector((state) => state.job);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [localJobs, setLocalJobs] = useState([]); // NEW: Local state for instant UI updates
  const itemsPerPage = 10;

  // NEW: Optimistic update function for instant star toggle
  const updateLocalJobFav = useCallback((jobId, newFavValue) => {
    setLocalJobs(prevJobs => 
      prevJobs.map(job => 
        (job._id || job.id) === jobId 
          ? { ...job, fav: newFavValue }
          : job
      )
    );
  }, []);

  useEffect(() => {
    if (jobs.length === 0) {
      dispatch(getJobs());
    }
  }, [dispatch, jobs.length]);

  // NEW: Sync localJobs with redux jobs when redux data changes
  useEffect(() => {
    if (Array.isArray(jobs)) {
      setLocalJobs(jobs);
    }
  }, [jobs]);

  // UPDATED: mapApiJobToUI with fav from localJobs
  const mapApiJobToUI = (job) => {
    const title = job.postTitle || job.title || "Untitled";
    const org = job.organization || job.org || "-";

    let displayDate = job.createdAt || "";
    if (!displayDate && Array.isArray(job.importantDates)) {
      const datePriority = [
        "Application Start", "Online Apply Start Date", "Application Start Date",
        "Batch Start", "Result Declared", "Result Date", "Merit List Released",
        "Certificate Issued", "Exam Date"
      ];
      
      for (const label of datePriority) {
        const found = job.importantDates.find(d => 
          (d.label || "").toLowerCase().includes(label.toLowerCase())
        );
        if (found?.value) {
          displayDate = found.value;
          break;
        }
      }
    }

    let status = "Active";
    const postType = (job.postType || "").toUpperCase();
    
    if (postType === "RESULT") {
      status = "Expired";
    } else if (["JOB", "PRIVATEJOB"].includes(postType)) {
      status = job.isLive === false ? "Expired" : "Active";
    } else {
      status = job.status || "Active";
    }

    return {
      ...job,
      title,
      org,
      createdAt: displayDate,
      status,
      fav: job.fav || false
    };
  };

  const handleEditClick = (id) => {
    navigate(`/dashboard/job-edit/${id}`);
  };

  // UPDATED: toggleFavorite with INSTANT optimistic update
  const toggleFavorite = async (id, currentFav) => {
    const newFavValue = !currentFav;
    
    // OPTIMISTIC UPDATE - Instant UI change
    updateLocalJobFav(id, newFavValue);
    
    try {
      await dispatch(markFav({ id, fav: newFavValue })).unwrap();
      toast.success(
        newFavValue 
          ? 'Added to favorites' 
          : 'Removed from favorites',
        { duration: 2000 }
      );
    } catch (err) {
      // REVERT on error
      updateLocalJobFav(id, currentFav);
      console.error('Favorite toggle failed:', err);
      toast.error('Failed to update favorite status');
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await toast(
      (t) => (
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-900">
              Delete this job post?
            </p>
            <p className="mt-1 text-xs text-slate-500">
              This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await dispatch(deleteJob(id)).unwrap();
                  toast.success('Job deleted successfully');
                } catch (err) {
                  console.error('Delete failed:', err);
                  toast.error('Failed to delete job');
                }
              }}
              className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: 'top-right',
        style: {
          maxWidth: '400px',
          padding: '16px',
        }
      }
    );
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      if (dateString.includes("Dec") || dateString.includes("Jan") || dateString.includes("Nov")) {
        return dateString;
      }
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString || "-";
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  };

  // UPDATED: Use localJobs instead of redux jobs for instant updates
  const filteredAndSortedJobs = useMemo(() => {
    if (!Array.isArray(localJobs) || localJobs.length === 0) return [];

    const normalizedJobs = localJobs.map(mapApiJobToUI);

    let filtered = normalizedJobs.filter((job) => {
      const matchesSearch = (job.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === "All" || 
        (job.org || "").toLowerCase() === filterCategory.toLowerCase();
      
      const jobStatus = job.status || "Active";
      const matchesStatus = filterStatus === "All" || 
        jobStatus.toLowerCase() === filterStatus.toLowerCase();
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    return filtered;
  }, [localJobs, searchTerm, filterCategory, filterStatus, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPageJobs = filteredAndSortedJobs.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterStatus, sortOrder]);

  const statsData = useMemo(() => {
    if (!Array.isArray(filteredAndSortedJobs)) {
      return { total: 0, active: 0, draft: 0, expired: 0 };
    }
    
    return {
      total: filteredAndSortedJobs.length,
      active: filteredAndSortedJobs.filter(j => 
        (j.status || 'Active').toLowerCase() === 'active'
      ).length,
      draft: filteredAndSortedJobs.filter(j => 
        (j.status || '').toLowerCase() === 'draft'
      ).length,
      expired: filteredAndSortedJobs.filter(j => 
        (j.status || '').toLowerCase() === 'expired'
      ).length,
    };
  }, [filteredAndSortedJobs]);

  const orgOptions = useMemo(() => {
    if (!Array.isArray(localJobs)) return [];
    const normalized = localJobs.map(mapApiJobToUI);
    const uniqueOrgs = new Set();
    normalized.forEach(job => {
      if (job.org && job.org !== '-') uniqueOrgs.add(job.org);
    });
    return Array.from(uniqueOrgs).sort();
  }, [localJobs]);

  const getStatusBadge = (status) => {
    const statusLower = (status || 'Active').toLowerCase();
    const badges = {
      active: { label: "Active", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      draft: { label: "Draft", className: "bg-amber-50 text-amber-700 border-amber-200" },
      expired: { label: "Expired", className: "bg-red-50 text-red-700 border-red-200" }
    };
    return badges[statusLower] || badges.active;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-400">
            <Briefcase className="h-4 w-4" />
            <span>Job Management</span>
          </div>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">
            All Jobs
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage and monitor all recruitment posts efficiently.
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2">
          <button
            onClick={handleGoBack}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </button>
          <span className="hidden text-xs text-slate-400 sm:inline">
            Total: {localJobs.length}
          </span>
        </div>
      </div>

      {/* Search + Filters */}
      <div className={`${loading ? 'opacity-50 pointer-events-none' : ''} bg-white rounded-xl border border-slate-200 shadow-sm p-4`}>
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by job title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            <div className="relative w-full sm:w-48">
              <select 
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white pl-3 pr-10 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
              >
                <option value="All">All Organizations</option>
                {orgOptions.map((org) => (
                  <option key={org} value={org}>{org}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>

            <div className="relative w-full sm:w-40">
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white pl-3 pr-10 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Expired">Expired</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>

            <button
              onClick={toggleSortOrder}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50"
            >
              Date
              <ChevronLeft className={`h-3.5 w-3.5 transition-transform ${sortOrder === 'asc' ? 'rotate-90' : '-rotate-90'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="text-3xl font-bold text-slate-900">{statsData.total}</div>
            <div className="text-sm text-slate-500 mt-1">Total Jobs</div>
          </div>
          <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-5 shadow-sm">
            <div className="text-3xl font-bold text-emerald-600">{statsData.active}</div>
            <div className="text-sm text-emerald-700 mt-1">Active</div>
          </div>
          <div className="bg-amber-50 rounded-xl border border-amber-200 p-5 shadow-sm">
            <div className="text-3xl font-bold text-amber-600">{statsData.draft}</div>
            <div className="text-sm text-amber-700 mt-1">Draft</div>
          </div>
          <div className="bg-red-50 rounded-xl border border-red-200 p-5 shadow-sm">
            <div className="text-3xl font-bold text-red-600">{statsData.expired}</div>
            <div className="text-sm text-red-700 mt-1">Expired</div>
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-4 py-2.5">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span className="inline-flex h-6 min-w-[1.75rem] items-center justify-center rounded-full bg-slate-900 text-[11px] font-semibold text-white">
              JB
            </span>
            <span>Jobs table</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Edit any entry to view & update full details.
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Fetching jobs…
          </div>
        )}

        {error && !loading && (
          <div className="px-4 py-10 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-400">
              <X className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-700">Failed to load jobs</p>
            <p className="mt-1 text-xs text-slate-400">{error}</p>
          </div>
        )}

        {!loading && !error && filteredAndSortedJobs.length === 0 && (
          <div className="px-4 py-10 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Briefcase className="h-5 w-5" />
            </div>
            <p className="mt-3 text-sm font-medium text-slate-700">
              {searchTerm || filterCategory !== "All" || filterStatus !== "All" 
                ? "No jobs match your filters" 
                : "No jobs available"}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Try adjusting your search keywords or filters.
            </p>
          </div>
        )}

        {!loading && !error && filteredAndSortedJobs.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border-t border-slate-100 text-left text-sm">
                <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Job Title</th>
                    <th className="px-4 py-3 font-medium">Organization</th>
                    <th className="px-4 py-3 font-medium">Upload Date</th>
                    <th className="px-4 py-3 font-medium text-center">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {currentPageJobs.map((job) => {
                    const status = getStatusBadge(job.status);
                    return (
                      <tr key={job._id || job.id} className="transition-colors hover:bg-slate-50/60">
                        <td className="px-4 py-3 align-middle">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                                <Briefcase className="h-3.5 w-3.5" />
                              </span>
                              <span className="line-clamp-2 text-sm font-medium text-slate-900">
                                {job.title}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-middle text-xs text-slate-600">
                          {job.org}
                        </td>
                        <td className="px-4 py-3 align-middle text-xs text-slate-600">
                          {formatDate(job.createdAt)}
                        </td>
                        <td className="px-4 py-3 align-middle text-center text-xs">
                          <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${status.className}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-middle text-right">
                          <div className="inline-flex items-center gap-1.5">
                            {/* ✨ INSTANT Star Toggle - NO reload needed ✨ */}
                            <button
                              onClick={() => toggleFavorite(job._id || job.id, job.fav)}
                              className="p-1.5 rounded-lg hover:bg-yellow-50 transition-all group"
                              title={job.fav ? "Remove from favorites" : "Add to favorites"}
                            >
                              <Star className={`h-4 w-4 transition-colors ${
                                job.fav 
                                  ? "text-yellow-400 group-hover:text-yellow-500" 
                                  : "text-slate-400 group-hover:text-yellow-400"
                              }`} />
                            </button>
                            
                            <button
                              onClick={() => handleEditClick(job._id || job.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-medium text-white shadow-sm hover:bg-indigo-700"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              View & Edit
                            </button>
                            <button
                              onClick={() => handleDelete(job._id || job.id)}
                              className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-[11px] font-medium text-red-600 hover:bg-red-100"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 text-xs text-slate-500 sm:flex-row">
              <div>
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-slate-700">
                  {Math.min(startIndex + itemsPerPage, filteredAndSortedJobs.length)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {filteredAndSortedJobs.length}
                </span>{" "}
                jobs
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium ${
                    currentPage === 1
                      ? "cursor-not-allowed border-slate-100 text-slate-300"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Prev
                </button>

                <span className="text-[11px] text-slate-500">
                  Page{" "}
                  <span className="font-semibold text-slate-700">{currentPage}</span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {totalPages}
                  </span>
                </span>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium ${
                    currentPage === totalPages
                      ? "cursor-not-allowed border-slate-100 text-slate-300"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
