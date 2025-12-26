/**
 * Section Tabs Component for Mobile (Govt Jobs)
 */
import React from "react";
import { Briefcase, Calendar, Bell } from "lucide-react";

const ICON_MAP = {
  "Latest Jobs": Briefcase,
  "Admit Card": Calendar,
  "Results": Bell,
  "Syllabus": Briefcase,
  "Answer Key": Briefcase,
  "Admission": Briefcase,
};

const SectionTabs = ({ sections, activeTab, onTabChange }) => {
  return (
    <div className="flex overflow-x-auto hide-scrollbar px-4 py-3 gap-3">
      {sections.map((section, idx) => {
        const isActive = activeTab === idx;
        const IconComponent = ICON_MAP[section.name] || Briefcase;
        
        return (
          <button
            key={idx}
            onClick={() => onTabChange(idx)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition border ${
              isActive
                ? "bg-blue-100 text-blue-700 border-transparent shadow-sm ring-1 ring-black/5"
                : "border-gray-100 bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            <IconComponent size={16} />
            {section.name}
          </button>
        );
      })}
    </div>
  );
};

export default SectionTabs;
