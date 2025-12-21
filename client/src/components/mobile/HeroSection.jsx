/**
 * Hero Section Component for Mobile
 */
import React from "react";

// Govt Jobs Hero
export const GovtHeroSection = () => (
  <div className="px-4 py-4">
    <div className="relative rounded-2xl overflow-hidden shadow-md h-40">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-blue-600" />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-transparent flex flex-col justify-center px-6">
        <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-1">
          Career Goals
        </span>
        <h2 className="text-white text-xl font-bold leading-tight">
          Track Your <br />Sarkari Success
        </h2>
      </div>
    </div>
  </div>
);

// Private Jobs Hero
export const PrivateHeroSection = ({ categoryCount = 0, loading = false }) => (
  <div className="px-4 py-4">
    <div className="relative rounded-2xl overflow-hidden shadow-md h-32">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-purple-600" />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 to-transparent flex flex-col justify-center px-6">
        <span className="text-yellow-400 text-xs font-bold uppercase tracking-wider mb-1">
          Private Sector
        </span>
        <h2 className="text-white text-xl font-bold leading-tight">
          Latest Private Jobs
        </h2>
        {!loading && categoryCount > 0 && (
          <p className="text-purple-200 text-xs mt-1">{categoryCount} Active Categories</p>
        )}
      </div>
    </div>
  </div>
);

export default GovtHeroSection;
