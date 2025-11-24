import React, { useEffect, useState } from "react";
import { baseUrl } from "../../util/baseUrl";
import Header from "../components/Header";
import { Link } from "react-router-dom";
import { ChevronRight, Calendar, Briefcase, Building2, ExternalLink } from "lucide-react";

export default function ViewAll() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postType, setPostType] = useState(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const type = searchParams.get("type");
    setPostType(type);

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
          }else{
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
  }, []);

  const formatTitle = (type) => {
    if (!type) return "All Posts";
    return type.replace(/_/g, " ").replace(/\b\w/g, (x) => x.toUpperCase());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-800 border-t-red-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {formatTitle(postType)}
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Browse all available posts and notifications.
          </p>
        </div>

        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post._id}
              to={`/post?_id=${post._id}`}
              className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {post.postTitle}
                    </h2>
                    {post.organization && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-3">
                        <Building2 size={16} />
                        <span>{post.organization}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                      {formatTitle(post.postType)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 text-sm">
                  {post.totalVacancyCount > 0 && (
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <Briefcase size={16} className="text-blue-500" />
                      <strong>{post.totalVacancyCount} Vacancies</strong>
                    </div>
                  )}

                  {post.importantDates && post.importantDates.length > 0 && (
                     <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <Calendar size={16} className="text-green-500"/>
                        <strong>Last Date:</strong> {post.importantDates.find(d => d.label.toLowerCase().includes('last'))?.value || 'N/A'}
                     </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end">
                    <div className="flex items-center gap-2 text-red-500 dark:text-red-400 font-semibold text-sm group">
                        <span>View Details</span>
                        <ExternalLink size={14} className="group-hover:translate-x-1 transition-transform"/>
                    </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}