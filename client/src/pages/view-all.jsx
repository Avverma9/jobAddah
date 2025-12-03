import React, { useEffect, useState } from "react";
import { baseUrl } from "../../util/baseUrl";
import Header from "../components/Header";
import { Link, useLocation } from "react-router-dom";
import { 
  ChevronRight, 
  Calendar, 
  Briefcase, 
  Building2, 
  ExternalLink, 
  Search, 
  Filter, 
  AlertCircle,
  FileText,
  Award,
  Clock
} from "lucide-react";

export default function ViewAll() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postType, setPostType] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const type = searchParams.get("type");
    setPostType(type);

    // Using existing fetch logic
    fetch(`${baseUrl}/get-all`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch posts");
        }
        return res.json();
      })
      .then((data) => {
        const allPosts = Array.isArray(data) ? data : (data.jobs || []);
        if (type && type !== "ALL") {
          let filteredPosts;
          if(type === 'RESULT'){
            filteredPosts = allPosts.filter((post) => post.postType === 'RESULT' || post.postType === 'ANSWER_KEY');
          } else {
            filteredPosts = allPosts.filter((post) => post.postType === type);
          }
          setPosts(filteredPosts);
        } else {
          setPosts(allPosts);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [location.search]);

  // Helper to format text
  const formatTitle = (type) => {
    if (!type) return "Latest Updates";
    return type.replace(/_/g, " ").replace(/\b\w/g, (x) => x.toUpperCase());
  };

  // Helper for Badge Colors
  const getBadgeStyles = (type) => {
    switch (type) {
      case 'RESULT':
      case 'ANSWER_KEY':
        return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
      case 'ADMIT_CARD':
        return "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
    }
  };

  // Helper for Icons
  const getIcon = (type) => {
     switch (type) {
      case 'RESULT': return <Award size={14} className="mr-1.5" />;
      case 'ADMIT_CARD': return <FileText size={14} className="mr-1.5" />;
      default: return <Briefcase size={14} className="mr-1.5" />;
    }
  }

  // Skeleton Loader Component
  const PostSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm animate-pulse h-full flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
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
        <div className="relative mb-12 text-center space-y-3">
            <div className="inline-flex items-center justify-center px-4 py-1.5 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 mb-2">
                <Filter className="w-4 h-4 text-blue-500 mr-2" />
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    Browsing Category
                </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {formatTitle(postType)}
            </h1>
            <p className="max-w-2xl mx-auto text-base md:text-lg text-gray-600 dark:text-gray-400">
                Explore the latest government jobs, exam results, and notifications.
            </p>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => <PostSkeleton key={n} />)}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-2xl border border-red-100 dark:border-red-900/30 text-center shadow-sm">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Unable to load posts</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
            <button 
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg"
            >
                Try Again
            </button>
          </div>
        ) : posts.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                 <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Posts Found</h3>
              <p className="text-gray-500 dark:text-gray-400">We couldn't find any active posts for this category right now.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post._id}
                to={`/post?_id=${post._id}`}
                className="group relative flex flex-col bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                {/* Colored Top Border based on Type */}
                <div className={`h-1.5 w-full ${
                    post.postType === 'RESULT' ? 'bg-emerald-500' : 
                    post.postType === 'ADMIT_CARD' ? 'bg-purple-500' : 'bg-blue-600'
                }`} />

                <div className="p-6 flex-1 flex flex-col">
                  {/* Header: Title */}
                  <div className="mb-4">
                     <h2 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                        {post.postTitle}
                     </h2>
                  </div>

                  {/* Organization Tag */}
                  {post.organization && (
                    <div className="mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-xs font-medium">
                            <Building2 size={14} className="text-gray-400" />
                            <span className="line-clamp-1">{post.organization}</span>
                        </div>
                    </div>
                  )}

                  {/* Meta Details Grid */}
                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-4">
                     {/* Vacancy */}
                     <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Vacancies</p>
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-200">
                            <Briefcase size={14} className="text-blue-500" />
                            <span>{post.totalVacancyCount > 0 ? post.totalVacancyCount : 'N/A'}</span>
                        </div>
                     </div>

                     {/* Date */}
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
                  
                  {/* Bottom Action Area */}
                  <div className="mt-5 flex items-center justify-between">
                     {/* Type Badge */}
                     <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold border uppercase tracking-wide ${getBadgeStyles(post.postType)}`}>
                        {getIcon(post.postType)}
                        {formatTitle(post.postType)}
                     </span>

                     {/* Arrow Button */}
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