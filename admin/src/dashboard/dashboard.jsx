import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FileText,
  Award,
  BookOpen,
  GraduationCap,
  Edit2,
  Trash2,
  Filter,
  Search,
  Briefcase,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

// Redux Actions
import { getStats, getJobs, getPrivateJob, deleteJob } from "../../redux/slices/job";
import {
  getAdmitCards,
  getResults,
  getExams,
  getAnswerKeys,
} from "../../redux/slices/resources";

// Components
import { WidgetCard } from "../pages/WidgetCard";

// --- Constants ---
const FILTERS = [
  { id: "JOB", label: "Public Jobs", icon: Briefcase },
  { id: "PRIVATE_JOB", label: "Private Jobs", icon: Award },
  { id: "ADMIT_CARD", label: "Admit Cards", icon: FileText },
  { id: "RESULT", label: "Results", icon: CheckCircle },
  { id: "EXAM", label: "Exams", icon: BookOpen },
  { id: "ANSWER_KEY", label: "Answer Keys", icon: FileText },
];

const ITEMS_PER_PAGE = 6;

export default function JobAddahAdmin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // --- Local State ---
  const [activeTab, setActiveTab] = useState("JOB");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  // --- Redux State ---
  const { stats, loading, jobs, privateJobs } = useSelector((state) => state.job);
  const { admitCards, results, exams, answerKeys } = useSelector((state) => state.resource);

  // --- Initial Data Fetch ---
  useEffect(() => {
    const fetchAllData = async () => {
      await Promise.all([
        dispatch(getStats()),
        dispatch(getJobs({ postType: "JOB" })),
        dispatch(getPrivateJob()),
        dispatch(getAdmitCards()),
        dispatch(getResults()),
        dispatch(getExams()),
        dispatch(getAnswerKeys()),
      ]);
    };
    fetchAllData();
  }, [dispatch]);

  // --- Reset Pagination on Tab/Search Change ---
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery]);

  // --- Data Filtering Logic ---
  const filteredData = useMemo(() => {
    let data = [];
    switch (activeTab) {
      case "JOB": data = jobs?.data || jobs || []; break;
      case "PRIVATE_JOB": data = privateJobs?.data || []; break;
      case "ADMIT_CARD": data = admitCards?.data || []; break;
      case "RESULT": data = results?.data || []; break;
      case "EXAM": data = exams?.data || []; break;
      case "ANSWER_KEY": data = answerKeys?.data || []; break;
      default: data = [];
    }
    
    // Search Filter
    if (searchQuery) {
      return data.filter(item => 
        (item.postTitle || item.title || item.slug || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return data;
  }, [activeTab, jobs, privateJobs, admitCards, results, exams, answerKeys, searchQuery]);

  // --- Pagination Logic ---
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  // --- Handlers ---
  const handleDelete = (id) => {
    let type = "";
    if (activeTab === "PRIVATE_JOB") type = "privateJob";
    else if (activeTab === "ADMIT_CARD") type = "admitCards";
    else if (activeTab === "RESULT") type = "results";
    else if (activeTab === "EXAM") type = "exams";
    else if (activeTab === "ANSWER_KEY") type = "answerKeys";
    
    dispatch(deleteJob({ id, type: type || undefined }));
    setConfirmDelete(null);
  };

  const handleEdit = (item) => {
    let path = "";
    switch (activeTab) {
      case "JOB": path = `/dashboard/job-edit/${item._id}`; break;
      case "PRIVATE_JOB": path = `/dashboard/job-edit/${item._id}`; break;
      case "ADMIT_CARD": path = `/dashboard/job-edit/${item._id}`; break;
      case "RESULT": path = `/dashboard/job-edit/${item._id}`; break;
      case "EXAM": path = `/dashboard/job-edit/${item._id}`; break;
      case "ANSWER_KEY": path = `/dashboard/job-edit/${item._id}`; break;
      default: path = `/dashboard/job-edit/${item._id}`;
    }
    navigate(path, { state: { data: item } });
  };

  const totalCount = (stats?.jobs || 0) + (privateJobs?.data?.length || 0);

  return (
    <div className="space-y-8 font-sans text-slate-800">
      
      {/* 1. Stats Section */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Jobs" value={totalCount} color="bg-blue-600" icon={<Briefcase />} loading={loading} />
        <StatCard title="Admit Cards" value={stats?.admitCards || 0} color="bg-purple-600" icon={<FileText />} loading={loading} />
        <StatCard title="Results Released" value={stats?.results || 0} color="bg-green-600" icon={<CheckCircle />} loading={loading} />
        <StatCard title="Admissions" value={stats?.admissions || 0} color="bg-orange-500" icon={<GraduationCap />} loading={loading} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* 2. Main Content Manager (Left Column) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col h-full">
            
            {/* Header */}
            <div className="border-b border-slate-100 px-6 py-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">All Postings</h3>
                  <p className="text-sm text-slate-500">Manage all your posts in one place.</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
                  />
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 scrollbar-hide">
                {FILTERS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 
                      ${activeTab === tab.id 
                        ? "bg-slate-800 text-white shadow-md" 
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List Content */}
            <div className="divide-y divide-slate-100 flex-grow min-h-[400px]">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((item, idx) => (
                  <ListItem 
                    key={item._id || idx}
                    item={item}
                    type={activeTab}
                    onEdit={() => handleEdit(item)}
                    onDelete={() => setConfirmDelete({ id: item._id })}
                  />
                ))
              ) : (
                <EmptyState type={activeTab} />
              )}
            </div>
            
            {/* Pagination Footer */}
            {totalItems > 0 && (
               <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-xs text-slate-500 font-medium">
                     Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} entries
                  </span>
                  
                  <PaginationControls 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
               </div>
            )}
          </div>
        </div>

        {/* 3. Sidebar Widgets */}
        <div className="flex flex-col gap-6">
          <WidgetCard title="Quick Actions" icon={<Filter size={18}/>} color="text-slate-700">
             <div className="grid grid-cols-2 gap-3">
                <QuickActionBtn label="Add Job" onClick={() => navigate('/create-job')} color="blue" />
                <QuickActionBtn label="Add Result" onClick={() => navigate('/create-job')} color="green" />
                <QuickActionBtn label="Add Admit Card" onClick={() => navigate('/create-job')} color="purple" />
                <QuickActionBtn label="Add Answer Key" onClick={() => navigate('/create-job')} color="orange" />
             </div>
          </WidgetCard>

          <WidgetCard title="Recent Private Jobs" icon={<Award size={18}/>} color="text-blue-600">
             <SimpleList data={privateJobs?.data?.slice(0, 5)} />
          </WidgetCard>

          <WidgetCard title="Recent Results" icon={<CheckCircle size={18}/>} color="text-green-600">
             <SimpleList data={results?.data?.slice(0, 5)} />
          </WidgetCard>
        </div>
      </div>

      {/* Delete Modal */}
      {confirmDelete && (
        <ConfirmDeleteModal
          onConfirm={() => handleDelete(confirmDelete.id)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}

// --- Helper Components ---

const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;
  
    // Logic to show limited page numbers (e.g. 1 2 3 ... 10)
    const getPageNumbers = () => {
      const pages = [];
      if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        if (currentPage <= 3) {
            pages.push(1, 2, 3, '...', totalPages);
        } else if (currentPage >= totalPages - 2) {
            pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, '...', currentPage, '...', totalPages);
        }
      }
      return pages;
    };
  
    return (
      <div className="flex items-center gap-1">
        <button 
          onClick={() => onPageChange(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-md hover:bg-white hover:shadow-sm text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
        >
          <ChevronLeft size={16} />
        </button>
        
        <div className="flex items-center gap-1">
           {getPageNumbers().map((page, idx) => (
             <button
               key={idx}
               onClick={() => typeof page === 'number' && onPageChange(page)}
               disabled={typeof page !== 'number'}
               className={`h-8 w-8 text-xs font-semibold rounded-md transition-all duration-200 
                  ${page === currentPage 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                    : typeof page !== 'number' 
                        ? "text-slate-400 cursor-default"
                        : "text-slate-600 hover:bg-white hover:shadow-sm"
                  }`}
             >
               {page}
             </button>
           ))}
        </div>
  
        <button 
          onClick={() => onPageChange(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-md hover:bg-white hover:shadow-sm text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    );
};

const ListItem = ({ item, onEdit, onDelete, type }) => {
  const title = item.postTitle || item.title || item.slug || "Untitled Post";
  const date = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : (item.date || "-");
  
  const getBadgeColor = () => {
      switch(type) {
          case 'JOB': return 'bg-blue-100 text-blue-700';
          case 'PRIVATE_JOB': return 'bg-indigo-100 text-indigo-700';
          case 'RESULT': return 'bg-green-100 text-green-700';
          case 'ADMIT_CARD': return 'bg-purple-100 text-purple-700';
          default: return 'bg-slate-100 text-slate-700';
      }
  };

  return (
    <div className="group flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors duration-200">
      <div className="flex items-start gap-4">
        <div className={`mt-1 h-2 w-2 rounded-full ${type === 'PRIVATE_JOB' ? 'bg-indigo-500' : 'bg-blue-500'} group-hover:scale-125 transition-transform`}></div>
        <div>
          <h4 className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors cursor-pointer" onClick={onEdit}>
            {title}
          </h4>
          <div className="flex items-center gap-3 mt-1">
             <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${getBadgeColor()}`}>
                 {type.replace('_', ' ')}
             </span>
             <span className="text-xs text-slate-400 flex items-center gap-1">
                <Briefcase size={10} /> {item.organization || item.company || "N/A"}
             </span>
             <span className="text-xs text-slate-400">
                {date}
             </span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
          <Edit2 size={16} />
        </button>
        <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

const SimpleList = ({ data }) => {
  if (!data || data.length === 0) return <p className="text-xs text-slate-400 py-2">No items found.</p>;
  return (
    <ul className="space-y-2">
      {data.map((item, idx) => (
        <li key={idx} className="flex items-center gap-2 py-1">
          <div className="h-1.5 w-1.5 rounded-full bg-slate-300"></div>
          <span className="text-xs text-slate-600 truncate flex-1 hover:text-blue-600 cursor-pointer">
            {item.postTitle || item.title || item.slug}
          </span>
        </li>
      ))}
    </ul>
  );
}

const StatCard = ({ title, value, color, icon, loading }) => (
  <div className="relative overflow-hidden rounded-xl bg-white p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
    <div className="flex items-center gap-4">
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg text-white shadow-sm ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        {loading ? (
           <div className="h-6 w-16 bg-slate-100 animate-pulse rounded mt-1"></div>
        ) : (
           <h4 className="text-2xl font-bold text-slate-800">{value}</h4>
        )}
      </div>
    </div>
  </div>
);

const QuickActionBtn = ({ label, onClick, color }) => {
    const colorMap = {
        blue: "bg-blue-50 text-blue-700 hover:bg-blue-100",
        green: "bg-green-50 text-green-700 hover:bg-green-100",
        purple: "bg-purple-50 text-purple-700 hover:bg-purple-100",
        orange: "bg-orange-50 text-orange-700 hover:bg-orange-100",
    }
    return (
        <button onClick={onClick} className={`${colorMap[color]} py-2 px-3 rounded-lg text-xs font-semibold transition-colors text-center`}>
            {label}
        </button>
    )
}

const EmptyState = ({ type }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="bg-slate-50 p-4 rounded-full mb-3">
        <Filter className="text-slate-300" size={32} />
    </div>
    <h3 className="text-sm font-medium text-slate-900">No {type.toLowerCase().replace('_', ' ')}s found</h3>
    <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
      There are no items in this category yet. Click "Add New" to get started.
    </p>
  </div>
);

const ConfirmDeleteModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl transform transition-all scale-100">
      <div className="flex flex-col items-center text-center">
        <div className="bg-red-100 p-3 rounded-full text-red-600 mb-4">
            <Trash2 size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">Delete Item?</h3>
        <p className="text-sm text-slate-500 mb-6">
          Are you sure you want to delete this? This action cannot be undone.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 shadow-md shadow-red-200 transition-colors"
        >
          Yes, Delete
        </button>
      </div>
    </div>
  </div>
);