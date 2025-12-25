"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Briefcase, Calendar, Bell, ChevronRight } from "lucide-react";
// Assumed Helper Imports (Keep your existing paths)
import { getPostLink, formatJobDate } from "@/lib/helpers"; 
import { JobCardSkeleton, PrivateJobCardSkeleton } from "../common/LoadingSkeleton";

// --- Configuration ---
const ICON_MAP = {
  "Latest Jobs": Briefcase,
  "Admit Card": Calendar,
  "Results": Bell,
  "Syllabus": Briefcase,
  "Answer Key": Briefcase,
  "Admission": Briefcase,
};

/**
 * Sub-Component: Scrollable Section Tabs
 */
const SectionTabs = ({ sections, activeTab, onTabChange }) => {
  return (
    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="flex overflow-x-auto hide-scrollbar px-4 py-3 gap-3">
        {sections.map((section, idx) => {
          const isActive = activeTab === idx;
          const IconComponent = ICON_MAP[section.name] || Briefcase;

          return (
            <button
              key={idx}
              onClick={() => onTabChange(idx)}
              className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition border ${
                isActive
                  ? "bg-blue-100 text-blue-700 border-transparent shadow-sm ring-1 ring-black/5"
                  : "border-gray-100 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <IconComponent size={16} />
              {section.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Sub-Component: Individual Job Item (Govt / Internal Link)
 */
const JobListItem = ({ job, isHot = false }) => {
  const firstLetter = (job.title || "J").charAt(0).toUpperCase();
  const formattedDate = formatJobDate(job.createdAt);

  return (
    <Link
      href={getPostLink(job.id || job.link || job.url)}
      className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-3 items-start active:bg-gray-50 transition cursor-pointer"
    >
      <div className="mt-1 h-10 w-10 rounded-full flex items-center justify-center shrink-0 font-bold border bg-gray-50 text-gray-400 border-gray-100">
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
        </div>
        <div className="flex items-center gap-3 mt-1">
          {formattedDate && (
            <span className="flex items-center text-[11px] text-gray-500">
              <Calendar size={12} className="mr-1" />
              {formattedDate}
            </span>
          )}
          <span className="flex items-center text-[11px] font-medium text-blue-600">
            View Details <ChevronRight size={12} className="ml-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
};

/**
 * Sub-Component: Individual Private Job Item (External Link)
 */
const PrivateJobListItem = ({ job, idx }) => {
  return (
    <a
      href={job.link || "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex gap-3 items-start active:bg-gray-50 transition cursor-pointer hover:shadow-md"
    >
       <div className="mt-1 h-10 w-10 rounded-full flex items-center justify-center shrink-0 font-bold border bg-purple-50 text-purple-500 border-purple-100">
        P
      </div>
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-gray-800 text-sm mb-1 line-clamp-2">
            {job.title || job.name || `Job ${idx + 1}`}
          </h3>
          <span className="shrink-0 bg-purple-50 text-purple-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
            PVT
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1">
           <span className="flex items-center text-[11px] font-medium text-purple-600">
            Apply Now <ChevronRight size={12} className="ml-0.5" />
          </span>
        </div>
      </div>
    </a>
  );
};

// --- Convenience Wrappers / Named Exports ---
// Export a small section wrapper and a private jobs list wrapper so other modules can import them as named exports.
const JobListSection = ({ section, loading = false, isPrivate = false }) => {
  return <MobileJobList sections={[section]} loading={loading} isPrivate={isPrivate} />;
};

const PrivateJobsList = ({ jobs = [], loading = false, categoryName = "Private Jobs" }) => {
  const section = { name: categoryName, jobs };
  return <MobileJobList sections={[section]} loading={loading} isPrivate={true} />;
};

// Export JobListItem as a named export as well (useful for individual rendering)
export { JobListItem };

/**
 * Main Component: MobileJobList
 * * Props:
 * - sections: Array of objects [{ name: "Latest", jobs: [...] }, ...]
 * - loading: Boolean
 * - isPrivate: Boolean (toggles between Govt and Private list styles)
 */
const MobileJobList = ({ sections = [], loading = false, isPrivate = false }) => {
  const [activeTab, setActiveTab] = useState(0);

  // Get current section data based on active tab
  const currentSection = sections[activeTab] || { jobs: [] };
  const currentJobs = currentSection.jobs || [];

  // --- Loading State ---
  if (loading) {
    return (
      <div className="w-full">
        {/* Skeleton for Tabs */}
        <div className="flex gap-3 px-4 py-3 overflow-hidden">
           {[1,2,3].map(i => <div key={i} className="h-8 w-24 bg-gray-100 rounded-full animate-pulse" />)}
        </div>
        {/* Skeleton for List */}
        <div className="px-4 py-2">
          {isPrivate ? <PrivateJobCardSkeleton count={5} /> : <JobCardSkeleton count={5} />}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-50 min-h-screen pb-20">
      {/* 1. Scrollable Tabs */}
      <SectionTabs 
        sections={sections} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {/* 2. Job List Container */}
      <div className="px-4 py-4 space-y-3 min-h-[400px]">
        
        {/* Empty State */}
        {!loading && currentJobs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Briefcase size={48} className="text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm font-medium">
              No {currentSection.name || "jobs"} found.
            </p>
          </div>
        )}

        {/* List Rendering */}
        {currentJobs.map((job, idx) => {
          if (isPrivate) {
            return (
              <PrivateJobListItem 
                key={job.id || idx} 
                job={job} 
                idx={idx} 
              />
            );
          } else {
            return (
              <JobListItem 
                key={job.id || idx} 
                job={job} 
                isHot={idx < 3} // Highlight top 3 results
              />
            );
          }
        })}
      </div>
    </div>
  );
};

export default MobileJobList;

// Also export the wrappers as named exports
export { JobListSection, PrivateJobsList };