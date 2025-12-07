import React, { useEffect, useState, useMemo } from "react";
import { baseUrl } from "../../util/baseUrl";
import Header from "../components/Header";
import { Link, useLocation } from "react-router-dom";
import { 
  ChevronRight, 
  Calendar, 
  Briefcase, 
  Building2, 
  Search, 
  Filter, 
  AlertCircle,
  FileText,
  Award,
  Clock,
  X,
  ArrowUpDown
} from "lucide-react";

export default function ViewAll() {
  // --- Data State ---
  const [allPosts, setAllPosts] = useState([]); // Store Original Data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postType, setPostType] = useState(null);
  
  // --- Filter State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // 'newest' | 'oldest'

  const location = useLocation();

  // 1. Fetch Data
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const type = searchParams.get("type");
    setPostType(type);
    setLoading(true);

    fetch(`${baseUrl}/get-all`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch posts");
        return res.json();
      })
      .then((data) => {
        const rawPosts = Array.isArray(data) ? data : (data.jobs || []);
        
        // Initial Type Filtering
        let initialFiltered = rawPosts;
        if (type && type !== "ALL") {
           if(type === 'RESULT'){
             initialFiltered = rawPosts.filter((post) => post.postType === 'RESULT' || post.postType === 'ANSWER_KEY');
           } else {
             initialFiltered = rawPosts.filter((post) => post.postType === type);
           }
        }

        setAllPosts(initialFiltered);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [location.search]);

  // 2. Client-Side Filtering & Sorting Logic
  const processedPosts = useMemo(() => {
    let result = [...allPosts];

    // A. Search Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(post => 
        (post.postTitle?.toLowerCase() || "").includes(query) ||
        (post.organization?.toLowerCase() || "").includes(query)
      );
    }

    // B. Date Sorting
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0);
      const dateB = new Date(b.createdAt || 0);
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [allPosts, searchQuery, sortOrder]);


  // Helper: Formatters
  const formatTitle = (type) => type ? type.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) : "Latest Updates";

  const getBadgeStyles = (type) => {
    switch (type) {
      case 'RESULT':
      case 'ANSWER_KEY': return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
      case 'ADMIT_CARD': return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800";
      default: return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
    }
  };

  const getIcon = (type) => {
     if(type === 'RESULT') return <Award size={14} className="mr-1.5" />;
     if(type === 'ADMIT_CARD') return <FileText size={14} className="mr-1.5" />;
     return <Briefcase size={14} className="mr-1.5" />;
  }

  // Loader
  const PostSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm animate-pulse h-full flex flex-col">
      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded w-1/3 mb-8"></div>
      <div className="mt-auto grid grid-cols-2 gap-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans selection:bg-blue-100 dark:selection:bg-blue-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Page Header */}
        <div className="relative mb-10 text-center space-y-3">
            <div className="inline-flex items-center justify-center px-4 py-1.5 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 mb-2">
                <Filter className="w-4 h-4 text-blue-500 mr-2" />
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    Browsing Category
                </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {formatTitle(postType)}
            </h1>
        </div>

        {/* 🔍 Search & Filter Toolbar */}
        <div className="sticky top-4 z-30 mb-8 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 p-2 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row gap-2">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search jobs, organizations..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700/50 rounded-xl transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative sm:w-48">
               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <ArrowUpDown size={16} />
               </div>
               <select 
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full pl-10 pr-8 py-3 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200 rounded-xl border-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none font-medium"
               >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
               </select>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronRight className="rotate-90 text-gray-400 w-4 h-4" />
               </div>
            </div>

          </div>
        </div>

        {/* Results Info */}
        {!loading && !error && (
            <div className="mb-6 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 px-2">
               <span>Showing <strong>{processedPosts.length}</strong> results</span>
               {(searchQuery || sortOrder !== 'newest') && (
                  <button 
                    onClick={() => { setSearchQuery(""); setSortOrder("newest"); }}
                    className="text-blue-600 hover:underline flex items-center gap-1"
                  >
                    Reset Filters
                  </button>
               )}
            </div>
        )}

        {/* Content Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => <PostSkeleton key={n} />)}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-2xl border border-red-100 dark:border-red-900/30 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Posts</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200">Retry</button>
          </div>
        ) : processedPosts.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                 <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No matches found</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                We couldn't find any posts matching "{searchQuery}". Try adjusting your search or filters.
              </p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedPosts.map((post) => (
              <Link
                key={post._id}
                to={`/post?_id=${post._id}`}
                className="group relative flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className={`h-1.5 w-full ${
                    post.postType === 'RESULT' ? 'bg-emerald-500' : 
                    post.postType === 'ADMIT_CARD' ? 'bg-purple-500' : 'bg-blue-600'
                }`} />

                <div className="p-6 flex-1 flex flex-col">
                  <div className="mb-4">
                     <h2 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                        {post.postTitle}
                     </h2>
                  </div>

                  {post.organization && (
                    <div className="mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-xs font-medium">
                            <Building2 size={14} className="text-gray-400" />
                            <span className="line-clamp-1">{post.organization}</span>
                        </div>
                    </div>
                  )}

                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-4">
                     <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Vacancies</p>
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200">
                            <Briefcase size={14} className="text-blue-500" />
                            <span>{post.totalVacancyCount > 0 ? post.totalVacancyCount : 'N/A'}</span>
                        </div>
                     </div>
                     <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Last Date</p>
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200">
                            <Clock size={14} className="text-orange-500" />
                            <span className="truncate">
                                {post.importantDates?.find(d => d.label.toLowerCase().includes('last'))?.value || 'Notify Soon'}
                            </span>
                        </div>
                     </div>
                  </div>
                  
                  <div className="mt-5 flex items-center justify-between">
                     <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border uppercase tracking-wide ${getBadgeStyles(post.postType)}`}>
                        {getIcon(post.postType)}
                        {formatTitle(post.postType)}
                     </span>
                     <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 transform group-hover:scale-105">
                        <ChevronRight size={18} />
                     </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}