"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Briefcase,
  FileText,
  Award,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight,
  GripHorizontal,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getCleanPostUrl } from "@/lib/job-url";

// Clean, professional color accents for top borders
const CATEGORY_THEME = {
  "Latest Job": {
    color: "text-blue-700",
    border: "border-t-blue-600",
    icon: Briefcase,
  },
  "Admit Card": {
    color: "text-emerald-700",
    border: "border-t-emerald-600",
    icon: FileText,
  },
  Result: {
    color: "text-violet-700",
    border: "border-t-violet-600",
    icon: Award,
  },
  "Answer Key": {
    color: "text-amber-700",
    border: "border-t-amber-600",
    icon: BookOpen,
  },
  Admission: {
    color: "text-rose-700",
    border: "border-t-rose-600",
    icon: Calendar,
  },
  Syllabus: {
    color: "text-slate-700",
    border: "border-t-slate-600",
    icon: Layers,
  },
};

const ORDER_STORAGE_KEY = "gov-job-sections-order-v3";

const buildJobKey = (job) => {
  if (!job) return "job:empty";
  const id = job._id || job.id || "";
  if (id) return `job:id:${id}`;
  const title = (job.title || "").trim().toLowerCase();
  const link = (job.link || job.url || "").trim().toLowerCase();
  if (title || link) return `job:tl:${title}|${link}`;
  try {
    return `job:raw:${JSON.stringify(job)}`;
  } catch {
    return "job:unknown";
  }
};

const dedupeJobs = (jobs) => {
  if (!Array.isArray(jobs)) return [];
  const seen = new Set();
  return jobs.filter((job) => {
    const key = buildJobKey(job);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const CardSkeleton = () => (
  <div className="bg-white rounded-lg flex flex-col h-full border border-slate-200 border-t-[3px] border-t-slate-200 animate-pulse">
    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 bg-slate-200 rounded"></div>
        <div className="w-24 h-4 bg-slate-200 rounded"></div>
        <div className="w-8 h-4 bg-slate-100 rounded-full"></div>
      </div>
      <div className="w-4 h-4 bg-slate-100 rounded"></div>
    </div>
    <div className="flex-1 py-3 px-4 space-y-4">
      {[...Array(32)].map((_, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-100 shrink-0"></div>
          <div className="flex-1 h-3 bg-slate-100 rounded w-full"></div>
        </div>
      ))}
    </div>
    <div className="px-4 py-3 border-t border-slate-100">
      <div className="h-4 bg-slate-100 rounded w-1/3 mx-auto"></div>
    </div>
  </div>
);

const JobSectionsClient = ({ initialData = null, className = "" }) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [selectedCategory] = useState("all");
  const [searchQuery] = useState("");
  const [categoryOrder, setCategoryOrder] = useState([]);
  const [draggingCategory, setDraggingCategory] = useState(null);
  const [dragOverCategory, setDragOverCategory] = useState(null);
  const router = useRouter();

  const getRecentTag = (isoDate) => {
    if (!isoDate) return null;
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return null;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diffDays = Math.floor((startOfToday - startOfDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleJobSelect = useCallback(
    (job) => {
      const url = getCleanPostUrl(job.link);
      router.push(url);
    },
    [router],
  );

  useEffect(() => {
    if (initialData) return;
    let isMounted = true;
    fetch("/api/gov-post/job-section")
      .then((res) => res.json())
      .then((payload) => {
        if (isMounted) {
          if (payload.success && payload.data.length > 0) {
            setData(payload.data[0]);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [initialData]);

  useEffect(() => {
    if (!data?.categories?.length) return;
    const names = data.categories.map((category) => category.name);

    const initializeOrder = () => {
      if (typeof window === "undefined") {
        setCategoryOrder(names);
        return;
      }
      try {
        const saved = window.localStorage.getItem(ORDER_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const filtered = parsed.filter((name) => names.includes(name));
          const missing = names.filter((name) => !filtered.includes(name));
          setCategoryOrder([...filtered, ...missing]);
        } else {
          setCategoryOrder(names);
        }
      } catch (error) {
        setCategoryOrder(names);
      }
    };

    // Use a timer to avoid synchronous state update warning
    const timer = setTimeout(initializeOrder, 0);
    return () => clearTimeout(timer);
  }, [data]);

  const persistOrder = (newOrder) => {
    setCategoryOrder(newOrder);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(newOrder));
    }
  };

  const handleDragStart = (categoryName) => (event) => {
    event.dataTransfer?.setData("text/plain", categoryName);
    // Set effectAllowed to move
    event.dataTransfer.effectAllowed = "move";
    setDraggingCategory(categoryName);
  };

  const handleDragOver = (categoryName) => (event) => {
    event.preventDefault();
    // Only set drag over if we are over a different item
    if (categoryName !== draggingCategory) {
      setDragOverCategory(categoryName);
    }
  };

  const handleDrop = (targetCategoryName) => (event) => {
    event.preventDefault();
    const sourceCategoryName =
      draggingCategory || event.dataTransfer?.getData("text/plain");

    // Reset drag states immediately
    setDragOverCategory(null);
    setDraggingCategory(null);

    if (!sourceCategoryName || sourceCategoryName === targetCategoryName) {
      return;
    }

    const currentList = categoryOrder.length
      ? categoryOrder
      : (data?.categories || []).map((cat) => cat.name);

    const sourceIndex = currentList.indexOf(sourceCategoryName);
    const targetIndex = currentList.indexOf(targetCategoryName);

    if (sourceIndex === -1 || targetIndex === -1) return;

    // Create a new array copy
    const newList = [...currentList];

    // 1. Remove the item from the source index
    const [removedItem] = newList.splice(sourceIndex, 1);

    // 2. Insert the item at the target index
    // This logic works for both L->R and R->L directions
    newList.splice(targetIndex, 0, removedItem);

    persistOrder(newList);
  };

  if (loading) {
    return (
      <div className={`max-w-[1600px] mx-auto px-4 sm:px-6 py-6 ${className}`}>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`max-w-[1600px] mx-auto px-4 sm:px-6 py-12 ${className}`}>
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center text-slate-500">
          No job sections available yet. Please check back soon.
        </div>
      </div>
    );
  }

  const categories = data.categories || [];
  const baseCategories =
    selectedCategory === "all"
      ? categories
      : categories.filter((cat) => cat.name === selectedCategory);

  const baseNames = baseCategories.map((cat) => cat.name);
  const currentOrder = categoryOrder.length ? categoryOrder : baseNames;
  const orderedNames = currentOrder.filter((name) => baseNames.includes(name));
  const missingNames = baseNames.filter((name) => !orderedNames.includes(name));
  const sortedCategories = [...orderedNames, ...missingNames]
    .map((name) => baseCategories.find((category) => category.name === name))
    .filter(Boolean);

  return (
    <div
      className={`bg-[#f8f9fa] min-h-screen pb-16 ${className} font-sans text-slate-900 w-full`}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 items-start">
          {sortedCategories.map((category) => {
            const theme =
              CATEGORY_THEME[category.name] || CATEGORY_THEME["Latest Job"];
            const Icon = theme.icon;
            const jobs = dedupeJobs(category.data?.[0]?.jobs || []);
            const filteredJobs = searchQuery
              ? jobs.filter((job) =>
                  (job.title || "")
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()),
                )
              : jobs;

            const isDragging = draggingCategory === category.name;
            const isDragOver =
              dragOverCategory === category.name && !isDragging;

            return (
              <div
                key={category.name}
                draggable
                onDragStart={handleDragStart(category.name)}
                onDragOver={handleDragOver(category.name)}
                onDrop={handleDrop(category.name)}
                onDragEnd={() => {
                  setDragOverCategory(null);
                  setDraggingCategory(null);
                }}
                className={`
                  bg-white rounded-lg flex flex-col h-full
                  border border-slate-200 shadow-[0_1px_3px_rgba(0,0,0,0.02)]
                  ${theme.border} border-t-[3px]
                  hover:shadow-md transition-shadow duration-200
                  ${isDragging ? "opacity-50" : ""}
                  ${isDragOver ? "ring-2 ring-blue-500 ring-offset-2 scale-[1.02] transition-transform" : ""}
                `}
              >
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between group cursor-move">
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-5 h-5 ${theme.color}`} />
                    <h2 className="text-[15px] font-bold text-slate-800">
                      {category.name}
                    </h2>
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {filteredJobs.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GripHorizontal className="w-4 h-4 text-slate-300" />
                  </div>
                </div>

                <ul className="flex-1 py-1">
                  {filteredJobs.slice(0, 20).map((job, index) => (
                    <li key={index}>
                      <button
                        type="button"
                        onClick={() => handleJobSelect(job)}
                        onMouseDown={(e) => e.stopPropagation()}
                        onDragStart={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="group flex items-start gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors border-l-2 border-transparent hover:border-blue-500 w-full text-left"
                        aria-label={`View details for ${job.title}`}
                      >
                        <div className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-500 transition-colors flex-shrink-0"></div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-[13px] leading-5 font-medium text-slate-700 group-hover:text-blue-700 transition-colors">
                            {job.title}
                          </h3>
                        </div>

                        {getRecentTag(job.createdAt) && (
                          <span className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {getRecentTag(job.createdAt)}
                          </span>
                        )}

                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
                      </button>
                    </li>
                  ))}

                  {filteredJobs.length === 0 && (
                    <li className="py-8 text-center text-sm text-slate-400">
                      No posts found.
                    </li>
                  )}
                </ul>

                {filteredJobs.length >= 15 && category.link && (
                  <div className="px-4 py-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof window !== "undefined") {
                          try {
                            window.sessionStorage.setItem(
                              `view-all:link:${category.name}`,
                              category.link,
                            );
                          } catch {
                            // ignore storage errors
                          }
                        }
                        const linkParam = category.link
                          ? `&link=${encodeURIComponent(category.link)}`
                          : "";
                        router.push(
                          `/view-all?name=${encodeURIComponent(category.name)}${linkParam}`,
                        );
                      }}
                      onDragStart={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="block w-full text-center py-2 text-xs font-bold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all uppercase tracking-wider"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      View More {category.name}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export function PostSections(props) {
  return <JobSectionsClient {...props} />;
}

export default JobSectionsClient;
