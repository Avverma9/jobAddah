/**
 * Job List Components for Mobile
 */
import React from "react";
import { Link } from "react-router-dom";
import { Calendar, ChevronRight, Briefcase } from "lucide-react";
import { getPostLink, formatJobDate } from "../../utils/helpers";
import { JobCardSkeleton, PrivateJobCardSkeleton } from "../common/LoadingSkeleton";

// Job List Item - Shared component for both Govt and Private jobs
export const JobListItem = ({ job, isHot = false, isPvt = false }) => {
  const firstLetter = (job.title || "J").charAt(0).toUpperCase();
  const formattedDate = formatJobDate(job.createdAt);

  return (
    <Link
      to={getPostLink(job.id || job.link || job.url)}
      className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-3 items-start active:bg-gray-50 transition cursor-pointer"
    >
      <div className={`mt-1 h-10 w-10 rounded-full flex items-center justify-center shrink-0 font-bold border ${
        isPvt ? "bg-purple-50 text-purple-500 border-purple-100" : "bg-gray-50 text-gray-400 border-gray-100"
      }`}>
        {firstLetter}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h3 className="text-sm font-semibold text-gray-900 leading-snug mb-1 line-clamp-2">
            {job.title}
          </h3>
          {isHot && (
            <span className="shrink-0 bg-red-50 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded ml-2">
              HOT
            </span>
          )}
          {isPvt && (
            <span className="shrink-0 bg-purple-50 text-purple-600 text-[10px] font-bold px-1.5 py-0.5 rounded ml-2">
              PVT
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1">
          {formattedDate && (
            <span className="flex items-center text-[11px] text-gray-500">
              <Calendar size={12} className="mr-1" />
              {formattedDate}
            </span>
          )}
          <span className={`flex items-center text-[11px] font-medium ${isPvt ? "text-purple-600" : "text-blue-600"}`}>
            View Details <ChevronRight size={12} className="ml-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
};

// Job List Section (Govt Jobs)
export const JobListSection = ({ jobs, loading, isPvt = false }) => {
  if (loading) {
    return (
      <div className="px-4 py-4 min-h-[400px]">
        <JobCardSkeleton count={5} />
      </div>
    );
  }

  return (
    <div className="px-4 py-4 space-y-3 min-h-[400px]">
      {jobs.map((job, idx) => (
        <JobListItem key={job.id || idx} job={job} isHot={idx < 3} isPvt={isPvt} />
      ))}
      {jobs.length === 0 && (
        <div className="text-center text-gray-500 py-8">No jobs in this category</div>
      )}
    </div>
  );
};

// Private Jobs List Section
export const PrivateJobsList = ({ jobs, loading, categoryName }) => {
  if (loading) {
    return (
      <div className="px-4">
        <PrivateJobCardSkeleton count={5} />
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <Briefcase size={48} className="mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500 text-sm">No jobs found in this category</p>
      </div>
    );
  }

  return (
    <div className="px-4 space-y-3 pb-4">
      {jobs.map((job, idx) => (
        <a
          key={idx}
          href={job.link || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-white rounded-xl p-4 border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">
                {job.title || job.name || `Job ${idx + 1}`}
              </h3>
              {categoryName && (
                <span className="inline-block px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-medium rounded">
                  {categoryName}
                </span>
              )}
            </div>
            <ChevronRight size={18} className="text-gray-400 flex-shrink-0 mt-1" />
          </div>
        </a>
      ))}
    </div>
  );
};
