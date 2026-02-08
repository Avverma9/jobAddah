"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight, BellRing } from "lucide-react";
import { useRouter } from "next/navigation";
import { getCleanPostUrl } from "@/lib/job-url";

export default function ReminderComponent({
  limit = 4,
  initialReminders = null,
}) {
  const [reminders, setReminders] = useState(
    Array.isArray(initialReminders) ? initialReminders : [],
  );
  const [loading, setLoading] = useState(!Array.isArray(initialReminders));
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (Array.isArray(initialReminders)) return;
    async function fetchReminders() {
      try {
        const res = await fetch("/api/gov-post/reminder?days=5");
        const data = await res.json().catch(() => null);
        if (data && data.success) {
          setReminders(Array.isArray(data.data) ? data.data : (data.reminders || []));
        }
      } catch (error) {
        console.error("Failed to fetch reminders:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchReminders();
  }, [initialReminders]);

  const handleReminderClick = (reminder) => {
    const rawUrl = reminder.url || reminder.link || reminder.postUrl || "";
    const cleanUrl = getCleanPostUrl(rawUrl);
    if (cleanUrl) router.push(cleanUrl);
  };

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-4 px-1">
          <div className="w-9 h-9 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-5 w-32 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 bg-white border border-slate-50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (reminders.length === 0) return null;

  const displayReminders = isExpanded ? reminders : reminders.slice(0, limit);

  return (
    <div className="mb-6 w-full animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 px-1">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-orange-50 text-orange-600 rounded-md border border-orange-100">
              <BellRing className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">Deadline Alerts</h3>
          </div>

          {reminders.length > limit && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 hover:text-blue-700 transition-colors group/link px-2.5 py-1 rounded-full bg-blue-50/50 border border-blue-100/50"
            >
              {isExpanded ? "Show Less" : "See All"}
              <ArrowRight className={`w-3 h-3 transition-transform ${isExpanded ? "-rotate-90" : "group-hover/link:translate-x-0.5"}`} />
            </button>
          )}
        </div>
      </div>

      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="flex gap-2 overflow-x-auto pb-3 px-1 snap-x snap-mandatory scrollbar-hide sm:hidden">
        {displayReminders.map((reminder, index) => (
          <ReminderCard key={reminder._id || index} reminder={reminder} onClick={() => handleReminderClick(reminder)} index={index} isMobile />
        ))}
        <div className="w-4 shrink-0" />
      </div>

      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-2">
        {displayReminders.map((reminder, index) => (
          <ReminderCard key={reminder._id || index} reminder={reminder} onClick={() => handleReminderClick(reminder)} index={index} />
        ))}
      </div>
    </div>
  );
}

function ReminderCard({ reminder, onClick, index, isMobile = false }) {
  const daysLeft = reminder.daysLeft ?? 0;
  const isUrgent = daysLeft <= 1;

  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col justify-between p-3 rounded-xl border border-slate-100 transition-all duration-300 bg-white hover:bg-white shadow-[0_2px_8px_-3px_rgba(0,0,0,0.06)] hover:-translate-y-1 border-b-[2px] hover:border-b-orange-500 text-left h-full ${isMobile ? 'min-w-[240px] snap-start' : ''}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-[12px] font-bold text-slate-800 leading-[1.25] line-clamp-2 group-hover:text-orange-600 transition-colors">
            {reminder.title}
          </h4>
          <p className="text-[9px] text-slate-400 font-semibold truncate mt-1">
            {reminder.organization || "Recruitment"}
          </p>
        </div>

        <div className={`shrink-0 flex flex-col items-center justify-center w-7 h-7 rounded-md border ${isUrgent ? 'bg-red-50 border-red-200 text-red-600' : 'bg-orange-50 border-orange-200 text-orange-600'}`}>
          <span className={`text-[11px] font-black leading-none ${isUrgent ? 'text-red-600' : 'text-orange-600'}`}>
            {daysLeft <= 0 ? "!" : daysLeft}
          </span>
          <span className="text-[6px] uppercase font-black tracking-wider opacity-80 mt-0.5">{daysLeft <= 0 ? "Now" : "Days"}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-auto w-full">
        <div className="space-y-0.5">
          <p className="text-[7px] uppercase tracking-[0.1em] text-slate-300 font-black">Final Date</p>
          <div className={`text-[11px] font-black tracking-tight ${isUrgent ? 'text-red-600' : 'text-slate-700'}`}>
            {reminder.applicationLastDate ? new Date(reminder.applicationLastDate).toLocaleDateString(undefined, { day: "2-digit", month: "short" }) : "Soon"}
          </div>
        </div>
        <div className={`w-7 h-7 rounded-md border flex items-center justify-center transition-all duration-300 ${isUrgent ? 'border-red-200 text-red-600' : 'border-slate-200 text-slate-600'} group-hover:bg-slate-900 group-hover:text-white shadow-sm`}>
          <ArrowRight className="w-3 h-3" />
        </div>
      </div>
    </button>
  );
}
