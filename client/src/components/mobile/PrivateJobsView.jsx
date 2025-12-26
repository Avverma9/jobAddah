/**
 * Private Jobs View Component for Mobile
 */
import React, { useState } from "react";
import PrivateSectionTabs from "./PrivateSectionTabs";
import { PrivateHeroSection } from "./HeroSection";
import { PrivateJobsList } from "./JobList";

const PrivateJobsView = ({ categories, loading, sectionsByLink }) => {
  const [activeTab, setActiveTab] = useState(0);
  
  // Get current category and its jobs
  const currentCategory = categories?.[activeTab];
  const categoryLink = currentCategory?.link;
  const categoryState = categoryLink ? sectionsByLink[categoryLink] : null;
  const currentJobs = categoryState?.jobs || [];
  const jobsLoading = categoryState?.loading || false;

  return (
    <>
      {/* Hero Banner */}
      <PrivateHeroSection 
        categoryCount={categories?.length || 0} 
        loading={loading} 
      />

      {/* Section Tabs */}
      <PrivateSectionTabs 
        sections={categories} 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        loading={loading}
      />

      {/* Jobs List */}
      <PrivateJobsList 
        jobs={currentJobs} 
        loading={jobsLoading}
        categoryName={currentCategory?.name || currentCategory?.title}
      />
    </>
  );
};

export default PrivateJobsView;
