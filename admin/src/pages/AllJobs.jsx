import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getJobs } from "../../redux/slices/job";
import { 
  ArrowLeft, 
  Briefcase, 
  Download, 
  Search, 
  Filter, 
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit2,
  MoreVertical,
  ArrowUpDown
} from "lucide-react";

export default function AllJobs() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { jobs: jobData, loading, error } = useSelector((state) => state.job);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(getJobs());
  }, [dispatch]);

  const handleEditClick = (id) => {
    navigate(`/dashboard/job-edit/${id}`);
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return "-";
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  };

  const filteredAndSortedJobs = useMemo(() => {
    if (!Array.isArray(jobData)) return [];
    
    let filtered = jobData.filter((job) => {
      const matchesSearch = (job.postName || job.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === "All" || 
        (job?.data?.tag || job?.data?.category) === filterCategory;
      
      const matchesStatus = filterStatus === "All" || 
        (job.status || "Active") === filterStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    return filtered;
  }, [jobData, searchTerm, filterCategory, filterStatus, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedJobs.length / itemsPerPage);
  
  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedJobs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedJobs, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterStatus, sortOrder]);

  const JobRow = ({ id, title, category, date, status }) => (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="font-medium text-gray-900">{title}</div>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
          {category}
        </span>
      </td>
      <td className="px-6 py-4 text-gray-700 font-medium">{date}</td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
          {status}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEditClick(id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md border border-blue-200 transition-colors"
            aria-label={`Edit ${title}`}
          >
            <Edit2 size={14} />
            Edit
          </button>
          <button 
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
            aria-label="More options"
          >
            <MoreVertical size={18} />
          </button>
        </div>
      </td>
    </tr>
  );

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`min-w-[32px] h-8 px-2 rounded-md text-sm font-medium transition-colors ${
            currentPage === i 
              ? 'bg-blue-600 text-white' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }
    
    return pages;
  };

  const statsData = useMemo(() => {
    if (!Array.isArray(filteredAndSortedJobs)) return { total: 0, active: 0, draft: 0, expired: 0 };
    
    return {
      total: filteredAndSortedJobs.length,
      active: filteredAndSortedJobs.filter(j => (j.status || 'Active').toLowerCase() === 'active').length,
      draft: filteredAndSortedJobs.filter(j => (j.status || '').toLowerCase() === 'draft').length,
      expired: filteredAndSortedJobs.filter(j => (j.status || '').toLowerCase() === 'expired').length,
    };
  }, [filteredAndSortedJobs]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50 px-4 sm:px-6 lg:px-8 py-6">
      <div className="w-full max-w-[1600px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-3">
            <button 
              onClick={handleGoBack}
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
                <Briefcase size={28} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Job Management
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Manage and organize all recruitment posts efficiently
                </p>
              </div>
            </div>
          </div>
          
          <button 
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium shadow-sm transition-all"
            onClick={() => alert("Export feature coming soon!")}
          >
            <Download size={18} />
            Export Data
          </button>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-3">
            
            {/* Search */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input 
                type="text"
                placeholder="Search by job title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap sm:flex-nowrap gap-3">
              {/* Category */}
              <div className="relative w-full sm:w-48">
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 pl-3 pr-10 py-2.5 outline-none cursor-pointer transition-all"
                >
                  <option value="All">All Categories</option>
                  <option value="Post Graduate Job">Post Graduate Job</option>
                  <option value="Graduate Job">Graduate Job</option>
                  <option value="10th Pass Job">10th Pass Job</option>
                  <option value="12th Pass Job">12th Pass Job</option>
                  <option value="SSC">SSC</option>
                  <option value="Bank">Bank</option>
                  <option value="Railway">Railway</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-500">
                  <Filter size={14} />
                </div>
              </div>

              {/* Status */}
              <div className="relative w-full sm:w-40">
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full appearance-none bg-white border border-gray-300 text-gray-700 text-sm rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 pl-3 pr-10 py-2.5 outline-none cursor-pointer transition-all"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Expired">Expired</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-gray-500">
                  <ChevronDown size={14} />
                </div>
              </div>

              {/* Date Sort */}
              <button
                onClick={toggleSortOrder}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition-all whitespace-nowrap"
              >
                <ArrowUpDown size={16} />
                Date
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {!loading && !error && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="text-3xl font-bold text-gray-900">{statsData.total}</div>
              <div className="text-sm text-gray-600 mt-1">Total Jobs</div>
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

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Post Name
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-20">
                      <div className="flex flex-col items-center justify-center gap-3 text-gray-400">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm font-medium">Loading jobs...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center">
                      <div className="text-red-600 font-semibold mb-2">Failed to load data</div>
                      <div className="text-gray-400 text-sm">{error}</div>
                    </td>
                  </tr>
                ) : paginatedJobs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-gray-500">
                      {searchTerm || filterCategory !== "All" || filterStatus !== "All" 
                        ? "No jobs match your filters" 
                        : "No jobs available"}
                    </td>
                  </tr>
                ) : (
                  paginatedJobs.map((job) => (
                    <JobRow
                      key={job._id || job.id}
                      id={job._id || job.id}
                      title={job.postName || job.name || "Untitled"}
                      category={job?.data?.tag || job?.data?.category || "-"}
                      date={formatDate(job.createdAt)}
                      status={job.status || "Active"}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {!loading && !error && filteredAndSortedJobs.length > 0 && (
            <div className="bg-white border-t border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to{" "}
                <span className="font-semibold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredAndSortedJobs.length)}</span> of{" "}
                <span className="font-semibold text-gray-900">{filteredAndSortedJobs.length}</span> results
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft size={18} />
                </button>
                
                <div className="hidden sm:flex items-center gap-1">
                  {renderPageNumbers()}
                </div>

                <div className="sm:hidden text-sm text-gray-700 font-medium px-3">
                  {currentPage} / {totalPages}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
