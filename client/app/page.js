import React from "react";
import { PostSections } from "./post/page";
import ReminderComponent from "./components/ReminderComponent";
import TrendingJobs from "./components/TrendingJobs";
import SEO from "@/lib/SEO";

const Home = () => {
  return (
    <div className="bg-[#f8f9fa] text-slate-900 min-h-screen">
      <SEO 
        title="JobsAddah - Sarkari Result 2026 | Latest Govt Jobs, Admit Card"
        description="JobsAddah is the fastest portal for sarkari result 2026, latest government jobs, admit cards, and exam results. Get all job alerts for SSC, Bank, Railway, and more."
      />
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-6">
        <ReminderComponent limit={4} />
        <TrendingJobs limit={8} />
      </div>
      <PostSections className="bg-transparent" />
    </div>
  );
};


export default Home;
 