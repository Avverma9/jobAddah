"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { FileText, Image, Award, Type, Briefcase } from "lucide-react";
import { TOOLS_CONFIG } from '@/lib/constants';

const ICON_MAP = {
  FileText,
  Image,
  Award,
  Type,
  Briefcase,
};

const ToolsView = () => {
  const router = useRouter();

  return (
    <div className="px-4 py-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Free Tools</h2>
      <div className="grid grid-cols-2 gap-3">
        {TOOLS_CONFIG.map((tool) => {
          const IconComponent = ICON_MAP[tool.icon] || Briefcase;
          return (
            <button
              key={tool.path}
              onClick={() => router.push(tool.path)}
              className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center gap-2 active:scale-95 transition"
            >
              <div className="p-3 bg-blue-50 rounded-full text-blue-600">
                <IconComponent size={24} />
              </div>
              <span className="text-sm font-medium text-gray-700">{tool.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ToolsView;
