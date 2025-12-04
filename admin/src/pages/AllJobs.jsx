import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getJobs, deleteJob } from "../../redux/slices/job";
import toast from 'react-hot-toast';
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
  ArrowUpDown,
  X,
  Eye,
  Trash2
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
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    if (jobs.length === 0) {
      dispatch(getJobs());
    }
  }, [dispatch, jobs.length]);

  const handleEditClick = (id) => {
    navigate(`/dashboard/job-edit/${id}`);
    setOpenMenuId(null);
  };

  const handleViewClick = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
    setOpenMenuId(null);
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
      return "-";
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  };

  const filteredAndSortedJobs = useMemo(() => {
    if (jobs.length === 0) return [];
    
    let filtered = jobs.filter((job) => {
      const matchesSearch = (job.title || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === "All" || 
        (job.org || "") === filterCategory;
      
      const jobStatus = job.status || "Active";
      const matchesStatus = filterStatus === "All" || 
        jobStatus === filterStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    return filtered;
  }, [jobs, searchTerm, filterCategory, filterStatus, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedJobs.length / itemsPerPage);
  
  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedJobs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedJobs, currentPage, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterStatus, sortOrder]);

  // Modal Component
  const JobDetailsModal = ({ job, isOpen, onClose }) => {
    if (!isOpen || !job) return null;

    const getFieldLabel = (key) => {
      const labels = {
        _id: "Job ID",
        title: "Job Title",
        org: "Organization",
        status: "Status",
        createdAt: "Created Date",
        updatedAt: "Updated Date",
        description: "Description",
        salary: "Salary",
        location: "Location",
        experience: "Experience",
        qualifications: "Qualifications",
        category: "Category",
        deadline: "Application Deadline",
        applicants: "Applicants",
        vacancies: "Vacancies"
      };
      return labels[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
    };

    const isValidValue = (value) => {
      return value !== null && value !== undefined && value !== '';
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Modal Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between border-b border-blue-500">
            <h2 className="text-xl font-bold text-white">{job.title || "Job Details"}</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-500/30 p-2 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-6">
            {/* Status Badge */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600">Status:</span>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                (job.status || 'Active').toLowerCase() === 'active' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : (job.status || '').toLowerCase() === 'draft'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                  (job.status || 'Active').toLowerCase() === 'active' 
                    ? 'bg-emerald-500' 
                    : (job.status || '').toLowerCase() === 'draft'
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}></span>
                {job.status || "Active"}
              </span>
            </div>

            {/* Dynamic Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(job).map(([key, value]) => {
                if (!isValidValue(value) || key === '_id') return null;
                if (typeof value === 'object') return null;

                return (
                  <div key={key} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                      {getFieldLabel(key)}
                    </label>
                    <p className="text-sm font-medium text-gray-900 break-words">
                      {key === 'createdAt' || key === 'updatedAt' 
                        ? formatDate(value) 
                        : String(value)}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Job ID Section */}
            <div className="border-t border-gray-200 pt-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                  Job ID
                </label>
                <p className="text-sm font-mono text-gray-900 break-all">{job._id || "-"}</p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 pt-4 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleEditClick(job._id);
                  onClose();
                }}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Edit2 size={16} />
                Edit Job
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Action Menu Component
  const ActionMenu = ({ jobId, job }) => {
    
    return (
      <div className="relative group">
        <button 
          onClick={() => setOpenMenuId(openMenuId === jobId ? null : jobId)}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          aria-label="More options"
        >
          <MoreVertical size={18} />
        </button>

        {openMenuId === jobId && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-40 py-1">
            <button
              onClick={() => handleViewClick(job)}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
            >
              <Eye size={16} className="text-blue-600" />
              <span>View Details</span>
            </button>
            <button
              onClick={() => handleEditClick(job._id)}
              className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors border-b border-gray-100"
            >
              <Edit2 size={16} className="text-blue-600" />
              <span>Edit</span>
            </button>
            <button
              onClick={async () => {
                setOpenMenuId(null);
                const ok = window.confirm("Are you sure you want to delete this job?");
                if (!ok) return;
                try {
                  await dispatch(deleteJob(job._id)).unwrap();
                  toast.success('Job deleted');
                } catch (err) {
                  console.error('Delete failed:', err);
                  toast.error('Failed to delete job');
                }
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  const JobRow = ({ id, title, category, date, status, fullJob }) => (
    <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="font-medium text-gray-900">{title}</div>
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
          {category || "-"}
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
          <ActionMenu jobId={id} job={fullJob} />
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
                  <option value="All">All Organizations</option>
                  <option value="BSSC">BSSC</option>
                  <option value="BTSC Bihar">BTSC Bihar</option>
                  <option value="RRB">RRB</option>
                  <option value="Bank of Baroda">Bank of Baroda</option>
                  <option value="RSSB Rajasthan">RSSB Rajasthan</option>
                  <option value="West Bengal SSC">West Bengal SSC</option>
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
                    Organization
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Upload Date
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
                      key={job._id}
                      id={job._id}
                      title={job.title || "Untitled"}
                      category={job.org || "-"}
                      date={formatDate(job.createdAt)}
                      status={job.status || "Active"}
                      fullJob={job}
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

      {/* Job Details Modal */}
      <JobDetailsModal 
        job={selectedJob} 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedJob(null);
        }} 
      />
    </div>
  );
}