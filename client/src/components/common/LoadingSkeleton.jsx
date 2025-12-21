/**
 * Loading Skeleton Components
 */
import React from "react";

// Job card loading skeleton
export const JobCardSkeleton = ({ count = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-gray-100 p-4 rounded-xl h-20 animate-pulse" />
    ))}
  </div>
);

// Card loading skeleton (generic)
export const CardSkeleton = ({ count = 3, height = "h-[130px]", width = "w-[280px]" }) => (
  <div className="flex gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory py-1">
    {Array.from({ length: count }).map((_, i) => (
      <div 
        key={i} 
        className={`snap-start shrink-0 ${width} bg-gray-100 p-4 rounded-xl ${height} animate-pulse`} 
      />
    ))}
  </div>
);

// Simple loading skeleton
export const SimpleSkeleton = ({ className = "h-4 bg-gray-200 rounded" }) => (
  <div className={`animate-pulse ${className}`} />
);

// Private job card skeleton
export const PrivateJobCardSkeleton = ({ count = 5 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    ))}
  </div>
);

// Deadline card skeleton
export const DeadlineCardSkeleton = ({ count = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-gray-100 p-4 rounded-xl h-24 animate-pulse" />
    ))}
  </div>
);
