import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FileText,
  Award,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { Link } from "react-router-dom";

import JobCard from "./jobcard";

// JOB SLICE

// RESOURCE SLICE
import {
  getAdmitCards,
  getResults,
  getExams,
  getAnswerKeys
} from "../../redux/slices/resources";

import { WidgetCard, WidgetLink } from "../pages/WidgetCard";
import { getStats } from "../../redux/slices/job";

export default function JobAddahAdmin() {
  const dispatch = useDispatch();

  // ===== JOB SLICE DATA =====
  const { stats, loading: statsLoading } = useSelector((state) => state.job);

  // ===== RESOURCE SLICE DATA =====
  const admitCards = useSelector((state) => state.resource.admitCards);
  const results = useSelector((state) => state.resource.results);
  const exams = useSelector((state) => state.resource.exams);
  const answerKeys = useSelector((state) => state.resource.answerKeys);

  // FETCH ALL DATA ON LOAD
  useEffect(() => {
    dispatch(getStats());
    dispatch(getAdmitCards());
    dispatch(getResults());
    dispatch(getExams());
    dispatch(getAnswerKeys());
  }, [dispatch]);


  return (
    <>
      {/* STATS CARDS */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          key="live-results"
          title="Live Results"
          value={stats?.jobs || 0}
          color="bg-green-500"
          icon={<Award />}
          statsLoading={statsLoading}
        />
        <StatCard
          key="admit-cards"
          title="Admit Cards"
          value={stats?.admitCards || 0}
          color="bg-purple-500"
          icon={<FileText />}
          statsLoading={statsLoading}
        />
        <StatCard
          key="admissions"
          title="Admissions"
          value={stats?.admissions || 0}
          color="bg-orange-500"
          icon={<GraduationCap />}
          statsLoading={statsLoading}
        />
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ===== LEFT SIDE (JOBS + RESULTS) ===== */}
        <div className="lg:col-span-2 space-y-6">
          {/* Jobs Table */}
          <JobCard />

          {/* Latest Results (LIVE FROM API) */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-800">
                Latest Results
              </h3>
              <Link
                to="/dashboard/results"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                View All
              </Link>
            </div>

            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {results?.data?.length > 0 ? (
                results.data.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-green-500 group-hover:scale-125 transition-transform"></div>
                      <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors cursor-pointer">
                        {item.postTitle || item.title || item.slug}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">
                      {item.date || "Today"}
                    </span>
                  </div>
                ))
              ) : (
                <p className="p-4 text-center text-slate-400">
                  No results available.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ===== RIGHT SIDE WIDGETS ===== */}
        <div className="flex flex-col gap-6">
          {/* Admit Card Widget */}
          <WidgetCard
            title="Admit Cards"
            icon={<FileText size={18} />}
            color="text-purple-600"
          >
            <ul className="space-y-3 max-h-48 overflow-y-auto">
              {admitCards?.data?.length > 0 ? (
                admitCards.data.map((item, idx) => (
                  <WidgetLink
                    key={idx}
                    text={item.postTitle || item.title || item.slug}
                    isNew={idx < 2}
                  />
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-3">
                  No admit cards available.
                </p>
              )}
            </ul>

            <Link
              to="/dashboard/admit-cards"
              className="mt-4 block w-full rounded border border-slate-200 py-2 text-center text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              View All
            </Link>
          </WidgetCard>

          {/* Exams Widget */}
          <WidgetCard
            title="Upcoming Exams"
            icon={<BookOpen size={18} />}
            color="text-blue-600"
          >
            <ul className="space-y-3 max-h-48 overflow-y-auto">
              {exams?.data?.length > 0 ? (
                exams.data.map((item, idx) => (
                  <WidgetLink
                    key={idx}
                    text={item.postTitle || item.title || item.slug}
                  />
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-3">
                  No exams found.
                </p>
              )}
            </ul>
            <Link
              to="/dashboard/exams"
              className="mt-4 block w-full rounded border border-slate-200 py-2 text-center text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              View All
            </Link>
          </WidgetCard>

          {/* Answer Keys Widget */}
          <WidgetCard
            title="Answer Keys"
            icon={<FileText size={18} />}
            color="text-green-600"
          >
            <ul className="space-y-3 max-h-48 overflow-y-auto">
              {answerKeys?.data?.length > 0 ? (
                answerKeys.data.map((item, idx) => (
                  <WidgetLink
                    key={idx}
                    text={item.postTitle || item.title || item.slug}
                  />
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-3">
                  No answer keys available.
                </p>
              )}
            </ul>
            <Link
              to="/dashboard/answer-keys"
              className="mt-4 block w-full rounded border border-slate-200 py-2 text-center text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              View All
            </Link>
          </WidgetCard>
        </div>
      </div>
    </>
  );
}

/* =============================
   SMALL COMPONENTS
============================= */

const StatCard = ({ title, value, color, icon, statsLoading }) => (
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
      {statsLoading ? (
        <p className="text-2xl font-bold text-slate-800">Loading...</p>
      ) : (
        <h4 className="text-2xl font-bold text-slate-800">{value}</h4>
      )}
    </div>
  </div>
);
