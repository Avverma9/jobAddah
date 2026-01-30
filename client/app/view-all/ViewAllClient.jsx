"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { getCleanPostUrl } from "@/lib/job-url";
import { ChevronLeft, Search, Briefcase, ExternalLink } from "lucide-react";

const buildPostDetailParams = (job) => {
  return getCleanPostUrl(job.link);
};

const ViewAllClient = ({ initialJobs = [], sectionName = "All Posts" }) => {
  const router = useRouter();
  const [jobs] = useState(initialJobs);
  const [searchQuery, setSearchQuery] = useState("");

  const handleJobSelect = (job) => {
    const url = buildPostDetailParams(job);
    router.push(url);
  };

  const filteredJobs = searchQuery
    ? jobs.filter((job) =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : jobs;

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12">
      <div className="bg-white border-b border-slate-200 shadow-sm mb-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h1 className="text-lg font-bold text-slate-800 truncate">
              {sectionName}
            </h1>
          </div>

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search in this section..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {!filteredJobs.length ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
            <div className="mb-4 inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-full text-slate-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">
              No posts found
            </h3>
            <p className="text-slate-500 text-sm">
              We couldn&apos;t find any posts matching your criteria.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <ul className="divide-y divide-slate-100">
              {filteredJobs.map((job, index) => (
                <li key={index} className="group">
                  <button
                    onClick={() => handleJobSelect(job)}
                    className="w-full text-left px-5 py-4 hover:bg-blue-50/50 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1 w-8 h-8 flex-shrink-0 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-semibold text-slate-800 group-hover:text-blue-700 leading-snug">
                          {job.title}
                        </h3>
                        {job.updatedAt && (
                          <p className="text-[12px] text-slate-400 mt-1 uppercase tracking-wide">
                            Updated:{" "}
                            {new Date(job.updatedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-blue-400 flex-shrink-0 transition-colors" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAllClient;
