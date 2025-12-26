"use client";

import {
  BrainCircuit,
  FileText,
  Heart,
  ImageIcon,
  Keyboard,
  ReceiptSwissFranc,
  Zap,
} from "lucide-react";

const tools = [
  {
    id: 1,
    title: "Image Master",
    description: "Resize & Edit",
    icon: <ImageIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />,
    href: "/image-tool",
    badge: "Hot",
    color: "fill-rose-500",
    badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
  },
  {
    id: 2,
    title: "PDF Reducer",
    description: "Compress PDF",
    icon: <FileText className="w-5 h-5 md:w-6 md:h-6 text-white" />,
    href: "/pdf-tool",
    badge: "Used",
    color: "fill-red-500",
    badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
  },
  {
    id: 3,
    title: "Typing Test",
    description: "Check Speed",
    icon: <Keyboard className="w-5 h-5 md:w-6 md:h-6 text-white" />,
    href: "/typing-test",
    badge: "Popular",
    color: "fill-orange-500",
    badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
  },
  {
    id: 4,
    title: "Resume Maker",
    description: "Build CV",
    icon: <ReceiptSwissFranc className="w-5 h-5 md:w-6 md:h-6 text-white" />,
    href: "/resume-maker",
    badge: "New",
    color: "fill-emerald-500",
    badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
  },
  {
    id: 5,
    title: "Play Quiz",
    description: "Win Cash",
    icon: <BrainCircuit className="w-5 h-5 md:w-6 md:h-6 text-white" />,
    href: "/quiz-and-earn",
    badge: "₹10",
    color: "fill-purple-500",
    badgeColor: "bg-amber-100 text-amber-700 border-amber-200",
  },
];

// FIXED LINE: Removed ": { tool: any }"
const ToolItem = ({ tool }) => (
  <a
    href={tool.href}
    className="group flex flex-col items-center gap-2 min-w-[85px] md:min-w-[100px] snap-center"
  >
    {/* Heart Shape Icon Container */}
    <div className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 mt-2">
      <Heart
        className={`absolute w-14 h-14 md:w-16 md:h-16 ${tool.color} drop-shadow-sm transition-all duration-300 group-hover:scale-105`}
        strokeWidth={0}
      />
      <div className="relative z-10">{tool.icon}</div>

      {/* Floating Badge (Top Right) */}
      {tool.badge && (
        <span
          className={`absolute -top-1 -right-2 text-[9px] px-1.5 py-0.5 rounded-md font-bold border shadow-sm z-20 ${tool.badgeColor}`}
        >
          {tool.badge}
        </span>
      )}
    </div>

    {/* Text Info */}
    <div className="text-center">
      <h3 className="text-[11px] md:text-sm font-bold text-slate-800 leading-tight group-hover:text-blue-600">
        {tool.title}
      </h3>
      <p className="text-[9px] md:text-[11px] text-slate-400 font-medium">
        {tool.description}
      </p>
    </div>
  </a>
);

export default function Tools() {
  const containerClass =
    "flex flex-row overflow-x-auto pb-4 px-4 gap-4 md:flex-wrap md:overflow-visible md:gap-8 md:justify-start scrollbar-hide snap-x";

  return (
    <div className="w-full py-4 bg-white md:bg-transparent">
      {/* Heading */}
      <div className="flex items-center gap-2 mb-4 px-4">
        <Zap className="w-5 h-5 text-blue-600 fill-blue-600" />
        <h2 className="text-base font-black uppercase tracking-wider text-slate-800">
          Quick Tools
        </h2>
      </div>

      {/* Layout Container */}
      <div
        className={containerClass}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {tools.map((tool) => (
          <ToolItem key={tool.id} tool={tool} />
        ))}
      </div>

      {/* Ad removed */}
    </div>
  );
}