import React from "react";
import { PostSections } from "./post/JobSectionsClient";
import ReminderComponent from "./components/ReminderComponent";
import TrendingJobs from "./components/TrendingJobs";

export const metadata = {
  title: "JobsAddah - Sarkari Result 2026 | Latest Govt Jobs, Admit Card",
  description:
    "JobsAddah is the fastest portal for sarkari result 2026, latest government jobs, admit cards, and exam results. Get all job alerts for SSC, Bank, Railway, and more.",
};

const Home = () => {
  return (
    <div className="bg-[#f8f9fa] text-slate-900 min-h-screen">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-6">
        <ReminderComponent limit={4} />
        <TrendingJobs limit={8} />
      </div>
      <PostSections className="bg-transparent" />
    </div>
  );
};


export default Home;
 
