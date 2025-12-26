import { Calendar } from "lucide-react";
import { Link } from "react-router-dom";

export const PrivateJobCard = ({ job }) => {
    const VISIT_STORAGE_KEY = "jobsaddah_visit_counts";

    const getVisitCounts = () => {
        try {
            const stored = localStorage.getItem(VISIT_STORAGE_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch {
            return {};
        }
    };

    const incrementVisitCount = (jobId) => {
        try {
            const counts = getVisitCounts();
            counts[jobId] = (counts[jobId] || 0) + 1;
            localStorage.setItem(VISIT_STORAGE_KEY, JSON.stringify(counts));
            return counts[jobId];
        } catch {
            return 0;
        }
    };

    return (
        <Link
            to={`/post?_id=${job.id}`}
            onClick={() => incrementVisitCount(job.id)}
            className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md dark:hover:shadow-lg transition-shadow p-3 sm:p-4"
        >
            <div className="flex flex-col gap-2 sm:gap-3">
                <div>
                    <h3 className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight line-clamp-2">
                        {job.title}
                    </h3>
                    {job.organization && (
                        <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1">
                            {job.organization}
                        </p>
                    )}
                </div>
                <div className="text-[10px] sm:text-[12px] text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Calendar size={12} className="shrink-0" />
                    <span>
                        Last: <span className="font-medium text-red-600 dark:text-red-400">{job.lastDate || "Check"}</span>
                    </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                        {job.postType || "Job"}
                    </span>
                    <button className="px-2 sm:px-3 py-0.5 sm:py-1 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded text-[9px] sm:text-xs font-medium transition-colors">
                        Apply
                    </button>
                </div>
            </div>
        </Link>
    );
};
