import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import { baseUrl } from "../util/baseUrl";
import api from '../util/apiClient';
import { Building2, Calendar, ExternalLink, Briefcase } from "lucide-react";

export default function PrivateJobs() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get('/get-all');
        const all = Array.isArray(data) ? data : data.jobs || [];
        const privateList = all
          .map((p) => ({
            _id: p._id || p.id,
            title: p.postTitle || "Notification",
            organization: p.organization || "",
            importantDates: p.importantDates || [],
            totalVacancyCount: p.totalVacancyCount || 0,
            postType: p.postType || "",
            jobType: p.jobType || "",
          }))
          .filter(
            (j) =>
              String(j.jobType).toLowerCase().includes("private") ||
              j.postType === "PRIVATE_JOB"
          );

        setPosts(privateList);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header />
        <div className="py-24 text-center text-gray-600 dark:text-gray-300 animate-pulse">
          Loading private jobs...
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header />
        <div className="py-24 text-center text-red-600">{error}</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />

      {/* Header block */}
      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-purple-600 text-white rounded-xl shadow-md">
            <Building2 size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Private Jobs
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Latest private sector openings with direct apply options.
            </p>
          </div>
        </div>

        {/* If empty */}
        {posts.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            No private job available at the moment.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post._id}
                to={`/post?_id=${post._id}`}
                className="group bg-white dark:bg-gray-800 border border-gray-200 
                  dark:border-gray-700 rounded-xl p-5 shadow-sm hover:shadow-xl 
                  hover:-translate-y-1 transition-all duration-200"
              >
                {/* Card Upper Section */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2
                      className="text-lg font-semibold text-gray-800 
                      dark:text-gray-100 group-hover:text-purple-600 
                      dark:group-hover:text-purple-400 transition"
                    >
                      {post.title}
                    </h2>

                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {post.organization}
                    </p>

                    <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mt-3">
                      <Calendar size={14} />
                      <span>
                        Last Date:{" "}
                        <strong className="text-red-600 dark:text-red-400">
                          {post.importantDates?.find((d) =>
                            d.label?.toLowerCase().includes("last")
                          )?.value || "Check details"}
                        </strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-300">
                      {post.totalVacancyCount} posts
                    </div>
                    <ExternalLink
                      size={20}
                      className="mt-3 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition"
                    />
                  </div>
                </div>

                {/* Footer Badge */}
                <div className="mt-4 flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-medium">
                  <Briefcase size={14} />
                  Private Job
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
