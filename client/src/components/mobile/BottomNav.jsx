/**
 * Bottom Navigation Component for Mobile
 */
"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Building2, Briefcase, Wrench, Clock } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ICON_MAP = {
  Building2: Building2,
  Briefcase: Briefcase,
  Wrench: Wrench,
  Clock: Clock,
};

const NAV_ITEMS = [
  { id: "govt", icon: "Building2", label: "Govt Job", path: "/" },
  { id: "pvt", icon: "Briefcase", label: "Pvt Job", path: "/private-jobs" },
  { id: "tools", icon: "Wrench", label: "Tools", path: "/?activeView=tools" },
  { id: "deadlines", icon: "Clock", label: "Deadlines", path: "/?activeView=deadlines" },
];

const BottomNav = ({ activeView, onViewChange }) => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 px-2 z-50 pb-safe max-w-[480px] mx-auto">
      {NAV_ITEMS.map((item) => {
        const isActive = activeView === item.id;
        const IconComponent = ICON_MAP[item.icon];

        // Preserve the original inline behavior for private jobs: when the
        // user taps the 'Pvt Job' tab we want the shell to render the inline
        // PrivateJobsView (so don't perform a full route navigation here).
        if (item.id === "pvt") {
          return (
            <button
              key={item.id}
              onClick={() => onViewChange && onViewChange(item.id)}
              className={`flex flex-col items-center gap-1 w-full transition ${
                isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <IconComponent size={24} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        }

        return (
          <Link
            key={item.id}
            href={item.path}
            className={`flex flex-col items-center gap-1 w-full transition ${
              isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <IconComponent size={24} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;