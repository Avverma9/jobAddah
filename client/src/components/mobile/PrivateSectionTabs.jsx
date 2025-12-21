/**
 * Private Jobs Section Tabs Component
 */
import React from "react";

const PrivateSectionTabs = ({ sections, activeTab, onTabChange, loading }) => {
  if (loading || !sections || sections.length === 0) return null;

  return (
    <div className="px-4 mb-3">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {sections.map((section, idx) => (
          <button
            key={idx}
            onClick={() => onTabChange(idx)}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === idx
                ? "bg-purple-600 text-white shadow-md"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            {section.name || section.title || section.text || `Category ${idx + 1}`}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PrivateSectionTabs;
