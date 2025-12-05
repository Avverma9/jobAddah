import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  FileText,
  Award,
  BookOpen,
  GraduationCap,
  Edit2,
  Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import JobCard from "./jobcard";

import { getStats, getPrivateJob, deleteJob } from "../../redux/slices/job";
import {
  getAdmitCards,
  getResults,
  getExams,
  getAnswerKeys,
 
} from "../../redux/slices/resources";

import { WidgetCard, WidgetLink } from "../pages/WidgetCard";

export default function JobAddahAdmin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeJobTab, setActiveJobTab] = useState("public");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { stats, loading: statsLoading, privateJobs } = useSelector(
    (state) => state.job
  );

  const admitCards = useSelector((state) => state.resource.admitCards);
  const results = useSelector((state) => state.resource.results);
  const exams = useSelector((state) => state.resource.exams);
  const answerKeys = useSelector((state) => state.resource.answerKeys);

  useEffect(() => {
    dispatch(getStats());
    dispatch(getPrivateJob());
    dispatch(getAdmitCards());
    dispatch(getResults());
    dispatch(getExams());
    dispatch(getAnswerKeys());
  }, [dispatch]);

  const totalJobs = (stats?.jobs || 0) + (privateJobs?.data?.length || 0);

  const handleDeletePrivateJob = (id) => {
    dispatch(deleteJob(id));
    setConfirmDelete(null);
  };

  const handleEditPrivateJob = (item) => {
    navigate(`/dashboard/job-edit/${item._id}`, { state: { job: item } });
  };

  const handleDeleteResult = (id) => {
    dispatch(deleteJob({ id, type: "results" }));
    setConfirmDelete(null);
  };

  const handleEditResult = (item) => {
    navigate(`/dashboard/results/edit/${item._id}`, { state: { result: item } });
  };

  const handleDeleteAdmitCard = (id) => {
    dispatch(deleteJob({ id, type: "admitCards" }));
    setConfirmDelete(null);
  };

  const handleEditAdmitCard = (item) => {
    navigate(`/dashboard/admit-cards/edit/${item._id}`, { state: { admitCard: item } });
  };

  const handleDeleteExam = (id) => {
    dispatch(deleteJob({ id, type: "exams" }));
    setConfirmDelete(null);
  };

  const handleEditExam = (item) => {
    navigate(`/dashboard/exams/edit/${item._id}`, { state: { exam: item } });
  };

  const handleDeleteAnswerKey = (id) => {
    dispatch(deleteJob({ id, type: "answerKeys" }));
    setConfirmDelete(null);
  };

  const handleEditAnswerKey = (item) => {
    navigate(`/dashboard/answer-keys/edit/${item._id}`, { state: { answerKey: item } });
  };

  return (
    <>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Jobs"
          value={totalJobs}
          color="bg-green-500"
          icon={<Award />}
          statsLoading={statsLoading}
        />
        <StatCard
          title="Admit Cards"
          value={stats?.admitCards || 0}
          color="bg-purple-500"
          icon={<FileText />}
          statsLoading={statsLoading}
        />
        <StatCard
          title="Admissions"
          value={stats?.admissions || 0}
          color="bg-orange-500"
          icon={<GraduationCap />}
          statsLoading={statsLoading}
        />
        <StatCard
          title="Private Jobs"
          value={privateJobs?.data?.length || 0}
          color="bg-blue-500"
          icon={<Award />}
          statsLoading={statsLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex gap-4">
                <button
                  onClick={() => setActiveJobTab("public")}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    activeJobTab === "public"
                      ? "bg-blue-100 text-blue-700 border-b-2 border-blue-600"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  Public Jobs
                </button>
                <button
                  onClick={() => setActiveJobTab("private")}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    activeJobTab === "private"
                      ? "bg-blue-100 text-blue-700 border-b-2 border-blue-600"
                      : "text-slate-600 hover:text-slate-800"
                  }`}
                >
                  Private Jobs
                </button>
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {activeJobTab === "public" ? (
                <PublicJobsTab />
              ) : (
                <PrivateJobsTab
                  privateJobs={privateJobs}
                  onEdit={handleEditPrivateJob}
                  onDelete={(id) => setConfirmDelete({ id, type: "privateJob" })}
                />
              )}
            </div>
          </div>

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
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">
                        {item.date || "Today"}
                      </span>
                      <button
                        onClick={() => handleEditResult(item)}
                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete({ id: item._id, type: "result" })}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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

        <div className="flex flex-col gap-6">
          <WidgetCard
            title="Admit Cards"
            icon={<FileText size={18} />}
            color="text-purple-600"
          >
            <ul className="space-y-3 max-h-48 overflow-y-auto">
              {admitCards?.data?.length > 0 ? (
                admitCards.data.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between group hover:bg-slate-50 p-2 rounded transition-colors"
                  >
                    <span className="text-xs font-medium text-slate-700 flex-1 group-hover:text-blue-600">
                      {item.postTitle || item.title || item.slug}
                    </span>
                    {idx < 2 && (
                      <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        New
                      </span>
                    )}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <button
                        onClick={() => handleEditAdmitCard(item)}
                        className="p-1 text-slate-400 hover:text-blue-600"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete({ id: item._id, type: "admitCard" })}
                        className="p-1 text-slate-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
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

          <WidgetCard
            title="Upcoming Exams"
            icon={<BookOpen size={18} />}
            color="text-blue-600"
          >
            <ul className="space-y-3 max-h-48 overflow-y-auto">
              {exams?.data?.length > 0 ? (
                exams.data.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between group hover:bg-slate-50 p-2 rounded transition-colors"
                  >
                    <span className="text-xs font-medium text-slate-700 flex-1 group-hover:text-blue-600">
                      {item.postTitle || item.title || item.slug}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <button
                        onClick={() => handleEditExam(item)}
                        className="p-1 text-slate-400 hover:text-blue-600"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete({ id: item._id, type: "exam" })}
                        className="p-1 text-slate-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
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

          <WidgetCard
            title="Answer Keys"
            icon={<FileText size={18} />}
            color="text-green-600"
          >
            <ul className="space-y-3 max-h-48 overflow-y-auto">
              {answerKeys?.data?.length > 0 ? (
                answerKeys.data.map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center justify-between group hover:bg-slate-50 p-2 rounded transition-colors"
                  >
                    <span className="text-xs font-medium text-slate-700 flex-1 group-hover:text-blue-600">
                      {item.postTitle || item.title || item.slug}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <button
                        onClick={() => handleEditAnswerKey(item)}
                        className="p-1 text-slate-400 hover:text-blue-600"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete({ id: item._id, type: "answerKey" })}
                        className="p-1 text-slate-400 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </li>
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

      {confirmDelete && (
        <ConfirmDeleteModal
          onConfirm={() => {
            if (confirmDelete.type === "privateJob") {
              handleDeletePrivateJob(confirmDelete.id);
            } else if (confirmDelete.type === "result") {
              handleDeleteResult(confirmDelete.id);
            } else if (confirmDelete.type === "admitCard") {
              handleDeleteAdmitCard(confirmDelete.id);
            } else if (confirmDelete.type === "exam") {
              handleDeleteExam(confirmDelete.id);
            } else if (confirmDelete.type === "answerKey") {
              handleDeleteAnswerKey(confirmDelete.id);
            }
          }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  );
}

const PublicJobsTab = () => {
  return <JobCard type="public" />;
};

const PrivateJobsTab = ({ privateJobs, onEdit, onDelete }) => {
  if (!privateJobs?.data || privateJobs.data.length === 0) {
    return (
      <p className="p-4 text-center text-slate-400">
        No private jobs available.
      </p>
    );
  }

  return (
    <>
      {privateJobs.data.map((item, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors duration-200 group"
        >
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-blue-500 group-hover:scale-125 transition-transform"></div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors cursor-pointer">
                {item.postTitle || item.title || item.slug}
              </span>
              {item.company && (
                <span className="text-xs text-slate-500">{item.company}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 whitespace-nowrap">
              {item.date || "Today"}
            </span>
            <button
              onClick={() => onEdit(item)}
              className="p-1 text-slate-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
              title="Edit"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => onDelete(item._id)}
              className="p-1 text-slate-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
              title="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </>
  );
};

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

const ConfirmDeleteModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg p-6 max-w-sm shadow-lg">
      <h3 className="text-lg font-semibold text-slate-800 mb-2">
        Confirm Delete
      </h3>
      <p className="text-sm text-slate-600 mb-6">
        Are you sure you want to delete this item? This action cannot be undone.
      </p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);