import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Briefcase,
  FileText,
  Award,
  BookOpen,
  GraduationCap,
  Plus,
} from "lucide-react";
import JobCard from "./jobcard";
import { getStats } from "../../redux/slices/job";
import { WidgetCard, WidgetLink } from "../pages/WidgetCard";

// --- Components Start ---

export default function JobAddahAdmin() {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((state) => state.job);

  useEffect(() => {
    dispatch(getStats());
  }, [dispatch]);
console.log(stats)

  const handleCreatePost = () => {
    // This might be handled in the Layout now, but keeping for mobile
    navigate('/create-job');
  };

  return (
    <>
      {/* Mobile Create Button (Visible only on small screens) */}
      <div className="mb-6 sm:hidden">
      
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Live Results"
          value={stats?.resultJobs || 0}
          color="bg-green-500"
          icon={<Award />}
        />
        <StatCard
          title="Admit Cards"
          value={stats?.admitCardJobs || 0}
          color="bg-purple-500"
          icon={<FileText />}
        />
        <StatCard
          title="Admissions"
          value={stats?.admissionJobs || 0}
          color="bg-orange-500"
          icon={<GraduationCap />}
        />
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT COLUMN: Jobs Table (Wider) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Jobs Table Card */}

          <JobCard />
          {/* Result Table Card */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Latest Results
              </h3>
              <button className="text-sm font-medium text-blue-600 hover:underline">
                View All
              </button>
            </div>
            <div className="p-0">
              {/* Simplified list for results */}
              <div className="divide-y divide-slate-100">
                <ResultRow
                  title="UPSC NDA II 2024 Result Declared"
                  date="Today"
                />
                <ResultRow
                  title="BPSC Tre 3.0 Final Result"
                  date="Yesterday"
                />
                <ResultRow
                  title="JEE Main Session 2 Result"
                  date="20 Nov"
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Quick Lists & Widgets */}
        <div className="flex flex-col gap-6">
          {/* Admit Card Widget */}
          <WidgetCard
            title="Admit Cards"
            icon={<FileText size={18} />}
            color="text-purple-600"
          >
            <ul className="space-y-3">
              <WidgetLink text="SSC CGL Tier I Admit Card 2025" isNew />
              <WidgetLink text="IGNOU TEE June 2025 Hall Ticket" />
              <WidgetLink text="CSBC Bihar Police Admit Card" isNew />
              <WidgetLink text="Airforce Agniveer Admit Card" />
            </ul>
            <button className="mt-4 w-full rounded border border-slate-200 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              Manage Admit Cards
            </button>
          </WidgetCard>

          {/* Syllabus Widget */}
          <WidgetCard
            title="Syllabus"
            icon={<BookOpen size={18} />}
            color="text-blue-600"
          >
            <ul className="space-y-3">
              <WidgetLink text="UP Police Constable Syllabus" />
              <WidgetLink text="RPSC RAS 2025 Exam Pattern" />
              <WidgetLink text="UGC NET June 2025 Syllabus" />
            </ul>
          </WidgetCard>

          {/* Admission Forms Widget */}
        
        </div>
      </div>
    </>
  );
}

// --- Helper Components for Cleaner Code ---

// Sidebar helpers moved to src/dashboard/Sidebar.jsx

const StatCard = ({ title, value, color, icon }) => (
  <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
    <div
      className={`flex h-12 w-12 items-center justify-center rounded-lg text-white shadow-md ${color}`}
    >
      {icon}
    </div>
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
        {title}
      </p>
      <h4 className="text-2xl font-bold text-slate-800">{value}</h4>
    </div>
  </div>
);



const ResultRow = ({ title, date }) => (
  <div className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors duration-200 group">
    <div className="flex items-center gap-3">
      <div className="h-2 w-2 rounded-full bg-green-500 group-hover:scale-125 transition-transform"></div>
      <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors cursor-pointer">
        {title}
      </span>
    </div>
    <span className="text-xs text-slate-400">{date}</span>
  </div>
);

