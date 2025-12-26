/**
 * Mobile Header Component
 */
import React from "react";
import { Search, Bell, Briefcase } from "lucide-react";

const MobileHeader = ({ onSearchToggle }) => (
  <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="bg-blue-600 text-white p-1.5 rounded-lg">
        <Briefcase size={20} />
      </div>
      <h1 className="text-xl font-bold tracking-tight text-blue-900">
        Jobs<span className="text-blue-600">Addah</span>
      </h1>
    </div>
    <div className="flex gap-3">
      <button
        className="p-2 hover:bg-gray-100 rounded-full transition"
        onClick={onSearchToggle}
      >
        <Search size={20} className="text-gray-600" />
      </button>
      <button className="p-2 hover:bg-gray-100 rounded-full transition">
        <Bell size={20} className="text-gray-600" />
      </button>
    </div>
  </header>
);

export default MobileHeader;
