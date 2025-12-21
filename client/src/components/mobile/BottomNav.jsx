/**
 * Bottom Navigation Component for Mobile
 */
import React from "react";
import { Building2, Briefcase, Wrench, Clock } from "lucide-react";

const ICON_MAP = {
  Building2: Building2,
  Briefcase: Briefcase,
  Wrench: Wrench,
  Clock: Clock,
};

const NAV_ITEMS = [
  { id: "govt", icon: "Building2", label: "Govt Job" },
  { id: "pvt", icon: "Briefcase", label: "Pvt Job" },
  { id: "tools", icon: "Wrench", label: "Tools" },
  { id: "deadlines", icon: "Clock", label: "Deadlines" },
];

const BottomNav = ({ activeView, onViewChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 px-2 z-50 pb-safe max-w-[480px] mx-auto">
      {NAV_ITEMS.map((item) => {
        const isActive = activeView === item.id;
        const IconComponent = ICON_MAP[item.icon];
        
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`flex flex-col items-center gap-1 w-full transition ${
              isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <IconComponent size={24} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
