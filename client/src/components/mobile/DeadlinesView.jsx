/**
 * Deadlines View Component for Mobile
 */
import React from "react";
import { Link } from "react-router-dom";
import { Clock } from "lucide-react";
import { getReminderLink } from "../../utils/helpers";
import { DeadlineCardSkeleton } from "../common/LoadingSkeleton";

const DeadlinesView = ({ reminders, loading }) => {
  const allReminders = [...(reminders.expiresToday || []), ...(reminders.expiringSoon || [])];

  if (loading) {
    return (
      <div className="px-4 py-6">
        <DeadlineCardSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-3">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Clock size={20} className="text-red-500" />
        Upcoming Deadlines ({allReminders.length})
      </h2>
      {allReminders.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No upcoming deadlines</div>
      ) : (
        allReminders.map((reminder, idx) => (
          <Link
            key={idx}
            to={getReminderLink(reminder)}
            className="block bg-gradient-to-br from-white to-orange-50 p-4 rounded-xl border border-orange-100 shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {reminder.daysLeft === 0 ? "TODAY" : `${reminder.daysLeft} DAYS LEFT`}
              </span>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">
              {reminder.title || reminder.postTitle}
            </h3>
            <p className="text-xs text-gray-500 mt-1">{reminder.organization || ""}</p>
          </Link>
        ))
      )}
    </div>
  );
};

export default DeadlinesView;
