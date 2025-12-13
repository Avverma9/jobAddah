import { AlertCircle, Calendar, Clock, ChevronRight, Sparkles, Loader } from "lucide-react";
import { Link } from "react-router-dom";

export const UrgentReminderSection = ({
  expiresToday,
  expiringSoon,
  isLoading,
}) => {
  const allUrgent = [...(expiresToday || []), ...(expiringSoon || [])];

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

  // Loading State - Minimal
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm h-48">
        <Loader className="w-6 h-6 text-rose-500 animate-spin mb-2" />
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Checking deadlines...</p>
      </div>
    );
  }

  if (allUrgent.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-rose-100 dark:border-rose-900/30 shadow-sm overflow-hidden flex flex-col max-h-[450px]">
      {/* --- Compact Header --- */}
      <div className="px-4 py-3 border-b border-rose-50 dark:border-rose-900/20 bg-gradient-to-r from-rose-50/50 to-orange-50/50 dark:from-rose-950/30 dark:to-orange-950/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-800 dark:text-gray-100 leading-tight">
              Urgent Deadlines
            </h2>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
              Action required within 2 days
            </p>
          </div>
        </div>
        <span className="bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
          {allUrgent.length}
        </span>
      </div>

      {/* --- Scrollable Content --- */}
      <div className="overflow-y-auto p-2 space-y-3 custom-scrollbar">
        
        {/* Section: Expiring Today */}
        {expiresToday && expiresToday.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 px-1 mb-1">
              <Sparkles className="w-3 h-3 text-rose-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Ends Today
              </span>
            </div>
            
            {expiresToday.map((item) => (
              <Link
                key={item._id}
                to={`/post?_id=${item.url}`}
                onClick={() => incrementVisitCount(item._id)}
                className="group flex flex-col gap-1 p-2.5 rounded-lg border border-rose-100 dark:border-rose-900/50 bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/20 dark:to-gray-900 hover:shadow-md hover:border-rose-200 transition-all duration-200 relative overflow-hidden"
              >
                {/* Visual Accent */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />
                
                <div className="flex justify-between items-start gap-2 pl-2">
                  <h4 className="text-xs font-semibold text-gray-800 dark:text-gray-200 line-clamp-2 leading-snug group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                    {item.title}
                  </h4>
                  <span className="shrink-0 flex items-center gap-1 bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded animate-pulse shadow-sm">
                    <Clock size={10} /> TODAY
                  </span>
                </div>
                
                <div className="flex items-center justify-between pl-2 mt-1">
                   <div className="flex items-center gap-1 text-[10px] text-rose-700 dark:text-rose-400 font-medium">
                    <Calendar size={10} />
                    {item.lastDate}
                  </div>
                  <ChevronRight size={12} className="text-rose-300 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Section: Expiring Soon */}
        {expiringSoon && expiringSoon.length > 0 && (
          <div className="space-y-1.5 pt-1">
             {expiresToday?.length > 0 && <div className="h-px bg-gray-100 dark:bg-gray-800 mx-2 my-2" />} 
            
            <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400 px-1 mb-1">
              Upcoming Deadlines
            </p>

            {expiringSoon.map((item) => {
              const isVeryUrgent = item.daysLeft <= 2;
              return (
                <Link
                  key={item._id}
                  to={`/post?_id=${item.url}`}
                  onClick={() => incrementVisitCount(item._id)}
                  className={`group block p-2.5 rounded-lg border bg-white dark:bg-gray-800/50 hover:shadow-sm transition-all pl-3 relative ${
                    isVeryUrgent 
                      ? "border-orange-200 dark:border-orange-900/50 hover:bg-orange-50/50" 
                      : "border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 line-clamp-1 group-hover:text-orange-600 transition-colors">
                      {item.title}
                    </h4>
                    <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                      isVeryUrgent 
                        ? "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300"
                        : "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-400"
                    }`}>
                      {item.daysLeft}d left
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-400 dark:text-gray-500">
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