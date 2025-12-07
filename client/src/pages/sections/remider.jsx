import { Calendar, Clock, Loader } from "lucide-react";
import { Link } from "react-router-dom";

export const UrgentReminderSection = ({ expiresToday, expiringSoon, isLoading }) => {
    const allUrgent = [...(expiresToday || []), ...(expiringSoon || [])];

    const VISIT_STORAGE_KEY = "jobAddah_visit_counts";

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

    if (isLoading) {
        return (<div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg sm:rounded-xl border-2 border-red-200 dark:border-red-700 overflow-hidden shadow-md p-4 sm:p-6 flex items-center justify-center gap-3">
            <Loader size={18} className="text-red-600 dark:text-red-400 animate-spin sm:w-5 sm:h-5" />
            <p className="text-red-700 dark:text-red-300 font-semibold text-xs sm:text-base">
                Loading urgent reminders...
            </p>
        </div>
        );
    }

    if (allUrgent.length === 0) return null;

    return (
        <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg sm:rounded-xl border-2 border-red-200 dark:border-red-700 overflow-hidden shadow-md">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-700 dark:to-orange-700 text-white p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
                    <AlertCircle size={18} className="sm:w-6 sm:h-6" />
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-sm sm:text-lg tracking-wide dark:text-white">⚡ Urgent</h2>
                    <p className="text-[10px] sm:text-xs text-red-100 dark:text-red-200 mt-0.5">
                        Deadline within 5 days
                    </p>
                </div>
                <span className="text-[9px] sm:text-xs font-bold bg-white/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shrink-0">
                    {allUrgent.length}
                </span>
            </div>

            <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 max-h-96 overflow-y-auto dark:bg-gray-800">
                {expiresToday && expiresToday.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-[10px] sm:text-xs font-bold text-red-700 dark:text-red-300 px-2">
                            🔴 EXPIRING TODAY ({expiresToday.length})
                        </p>
                        {expiresToday.map((item) => (
                            <Link
                                key={item._id}
                                to={`/post?_id=${item._id}`}
                                onClick={() => incrementVisitCount(item._id)}
                                className="block p-2 sm:p-3 rounded border-l-4 border-l-red-700 bg-red-100 dark:bg-red-900/40 hover:shadow-md dark:hover:shadow-lg transition-all"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2">
                                            {item.title}
                                        </h4>
                                    </div>
                                    <span className="inline-flex items-center gap-0.5 bg-red-700 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full animate-pulse shrink-0 whitespace-nowrap">
                                        <Clock size={9} /> TODAY!
                                    </span>
                                </div>
                                <div className="mt-1.5 sm:mt-2 flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-red-700 dark:text-red-300">
                                    <Calendar size={10} />
                                    {item.lastDate}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {expiringSoon && expiringSoon.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-[10px] sm:text-xs font-bold text-orange-700 dark:text-orange-300 px-2 mt-2">
                            🟠 EXPIRING SOON ({expiringSoon.length})
                        </p>
                        {expiringSoon.map((item) => {
                            const urgencyColor =
                                item.daysLeft <= 1
                                    ? "border-l-red-600 bg-red-50 dark:bg-red-900/30"
                                    : item.daysLeft <= 3
                                        ? "border-l-orange-600 bg-orange-50 dark:bg-orange-900/30"
                                        : "border-l-yellow-600 bg-yellow-50 dark:bg-yellow-900/30";

                            return (
                                <Link
                                    key={item._id}
                                    to={`/post?_id=${item._id}`}
                                    onClick={() => incrementVisitCount(item._id)}
                                    className={`block p-2 sm:p-3 rounded border-l-4 ${urgencyColor} hover:shadow-md dark:hover:shadow-lg transition-all`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2">
                                                {item.title}
                                            </h4>
                                        </div>
                                        <span className="inline-flex items-center gap-0.5 bg-red-600 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full animate-pulse shrink-0 whitespace-nowrap">
                                            <Clock size={9} /> {item.daysLeft}d
                                        </span>
                                    </div>
                                    <div className="mt-1.5 sm:mt-2 flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-red-600 dark:text-red-400">
                                        <Calendar size={10} />
                                        {item.lastDate}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};