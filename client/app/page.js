import React from "react";
import { PostSections } from "./post/JobSectionsClient";
import ReminderComponent from "./components/ReminderComponent";
import TrendingJobs from "./components/TrendingJobs";
import FloatingSubscribe from "./components/FloatingSubscribe";

export const metadata = {
  title: "JobsAddah - Govt & Private Job Portal 2026 | Latest Govt Jobs, Admit Card",
  description:
    "JobsAddah is the fastest portal for sarkari result 2026, latest government jobs, admit cards, and exam results. Get all job alerts for SSC, Bank, Railway, and more.",
};

const Home = () => {
  return (
    <div className="bg-[#f8f9fa] text-slate-900 min-h-screen">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 pt-6">
        <ReminderComponent limit={4} />
        <TrendingJobs limit={8} />
        <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm mt-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3">
            JobsAddah: Sarkari Result 2026 and Verified Job Updates
          </h1>
          <p className="text-sm md:text-base text-slate-600 mb-4">
            JobsAddah helps candidates track government job notifications,
            admit cards, results, and answer keys in one clean dashboard. We
            simplify official notices into easy summaries and keep links to the
            original sources so you can verify every detail.
          </p>
          <div className="grid gap-3 md:grid-cols-3 text-sm text-slate-700">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <div className="font-bold text-slate-900 mb-1">Verified Links</div>
              <div>Every post points to the official notification or portal.</div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <div className="font-bold text-slate-900 mb-1">Fast Updates</div>
              <div>Daily tracking of SSC, Bank, Railway, and State exams.</div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <div className="font-bold text-slate-900 mb-1">Student Tools</div>
              <div>Resume builder, image tools, and typing practice for exams.</div>
            </div>
          </div>
        </section>
      </div>
      <PostSections className="bg-transparent" />
      <FloatingSubscribe />
    </div>
  );
};


export default Home;
 
