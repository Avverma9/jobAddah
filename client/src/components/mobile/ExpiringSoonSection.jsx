/**
 * Expiring Soon Section Component
 */
import React from "react";
import Link from "next/link";
import { Timer } from "lucide-react";
import { getReminderLink } from "@/lib/helpers";
import { CardSkeleton } from "../common/LoadingSkeleton";

const ExpiringSoonSection = ({ reminders, loading }) => {
  const allReminders = [...(reminders.expiresToday || []), ...(reminders.expiringSoon || [])];

  if (loading) {
    return (
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-gray-900 font-bold text-base flex items-center gap-1">
            <Timer size={18} className="text-red-500" />
            Expiring Soon
          </h3>
        </div>
        <CardSkeleton count={3} />
      </div>
    );
  }

  if (allReminders.length === 0) return null;

  return (
    <div className="px-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-gray-900 font-bold text-base flex items-center gap-1">
          <Timer size={18} className="text-red-500" />
          Expiring Soon
        </h3>
      </div>
      <div className="flex gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory py-1">
        {allReminders.slice(0, 10).map((reminder, idx) => (
          <Link
            key={idx}
            href={getReminderLink(reminder)}
            className="snap-start shrink-0 w-[280px] bg-gradient-to-br from-white to-red-50 p-4 rounded-xl border border-red-100 shadow-sm flex flex-col justify-between h-[130px]"
          >
            <div>
              <div className="flex justify-between items-start mb-1">
                <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Closing Soon
                </span>
                <span className="text-red-500 font-bold text-xs">
                  {reminder.daysLeft === 0 ? "Today" : `${reminder.daysLeft} Days Left`}
                </span>
              </div>
              <h4 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">
                {reminder.title || reminder.postTitle}
              </h4>
            </div>
            <div className="flex justify-between items-end mt-2">
              <span className="text-[10px] text-gray-500 font-medium truncate max-w-[120px]">
                {reminder.organization || ""}
              </span>
              <span className="bg-red-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium shadow-sm">
                Apply Now
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ExpiringSoonSection;
