"use client";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Bookmark,
  Briefcase,
  ChevronRight,
  GripHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { resolveJobDetailHref } from "@/lib/job-url";

// Memoized JobRow - prevents re-renders when parent updates
const JobRow = memo(function JobRow({ job }) {
  const [isSaved, setIsSaved] = useState(false);

  const jobHref = useMemo(
    () => resolveJobDetailHref({ url: job.link || job.url, id: job._id || job.id }),
    [job.link, job.url, job._id, job.id]
  );

  const handleSaveClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(prev => !prev);
  }, []);

  return (
    <li className="group/item flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50/50 transition-all border border-transparent hover:border-indigo-100">
      <Link
        href={jobHref}
        className="flex items-center gap-3 grow min-w-0"
      >
        <div className="p-1.5 bg-gray-100 group-hover/item:bg-indigo-100 rounded-md transition-colors">
          <ChevronRight
            size={14}
            className="text-gray-400 group-hover/item:text-indigo-600"
          />
        </div>
        <p className="text-[13px] font-medium text-gray-700 group-hover/item:text-indigo-700 truncate">
          {job.title}
        </p>
      </Link>
      <div className="flex items-center gap-2 pl-2">
        <button
          onClick={handleSaveClick}
          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          title={isSaved ? "Unsave" : "Save Job"}
        >
          <Bookmark
            size={16}
            className={`transition-all ${
              isSaved
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 hover:text-gray-500"
            }`}
          />
        </button>
      </div>
    </li>
  );
});

// Memoized CategoryCard - only re-renders when cat data changes
const CategoryCard = memo(function CategoryCard({ cat, dragHandleProps, isOverlay = false }) {
  const INITIAL_LIMIT = 15;

  const uniqueJobs = useMemo(() => {
    const jobs = [];
    const seen = new Set();
    
    (cat.data || []).forEach((post) => {
      if (Array.isArray(post.jobs)) {
        post.jobs.forEach((j) => {
          if (j?.title && !seen.has(j.title)) {
            seen.add(j.title);
            jobs.push({ 
              title: j.title, 
              link: j.link || post.url,
              id: `${j.title}-${j.link || post.url}` // Unique ID for key
            });
          }
        });
      } else if (post.title && !seen.has(post.title)) {
        seen.add(post.title);
        jobs.push({ 
          title: post.title, 
          link: post.url,
          id: `${post.title}-${post.url}`
        });
      }
    });
    return jobs;
  }, [cat.data]);

  const hasMore = uniqueJobs.length > INITIAL_LIMIT;
  const visibleJobs = useMemo(
    () => uniqueJobs.slice(0, INITIAL_LIMIT),
    [uniqueJobs]
  );

  const categoryUrl = cat.link || cat.url || "";

  const handlePointerDown = useCallback((e) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full ring-1 ring-gray-900/5 ${
        isOverlay
          ? "shadow-2xl scale-105 rotate-2 cursor-grabbing"
          : "hover:shadow-xl transition-shadow duration-300"
      }`}
    >
      <div
  className="bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 px-4 py-3 flex items-center gap-3 relative overflow-hidden group/header cursor-grab active:cursor-grabbing"
        {...dragHandleProps}
      >
        <div className="absolute top-0 right-0 -mt-2 -mr-2 w-20 h-20 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

        <div className="absolute left-2 text-slate-500 opacity-0 group-hover/header:opacity-100 transition-opacity">
          <GripHorizontal size={16} />
        </div>

        <div className="pl-4 flex items-center gap-3 w-full relative z-10">
          <div className="p-1.5 bg-indigo-500/20 rounded-lg backdrop-blur-sm border border-white/10">
            <Briefcase size={16} className="text-indigo-300" />
          </div>
    <div className="grow">
            <h3 className="text-white font-semibold text-sm tracking-wide leading-none mb-1">
              {cat.name}
            </h3>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
              {uniqueJobs.length} Updates
            </span>
          </div>
        </div>
      </div>

  <div className="p-2 grow bg-white min-h-50">
        <ul className="space-y-1">
          {visibleJobs.map((job) => (
            <JobRow key={job.id} job={job} />
          ))}
          {uniqueJobs.length === 0 && (
            <li className="text-sm text-gray-400 py-8 text-center">
              No posts available
            </li>
          )}
        </ul>
      </div>

      {hasMore && (
        <div className="p-2 bg-gray-50 border-t border-gray-100">
          <Link
            onPointerDown={handlePointerDown}
            href={`/view-all?url=${encodeURIComponent(categoryUrl)}`}
            className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold uppercase text-indigo-600 hover:bg-indigo-100 rounded-lg transition-all"
          >
            View All <ChevronRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
});

// Memoized SortableItem - prevents unnecessary re-renders during drag
const SortableCategoryItem = memo(function SortableCategoryItem({ cat, id }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = useMemo(() => ({
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 99 : "auto",
  }), [transform, transition, isDragging]);

  const dragHandleProps = useMemo(() => ({
    ...attributes,
    ...listeners,
  }), [attributes, listeners]);

  return (
    <div ref={setNodeRef} style={style} className="h-full">
      <CategoryCard cat={cat} dragHandleProps={dragHandleProps} />
    </div>
  );
});

// Debounced localStorage save
function useDebouncedLocalStorage(key, value, delay = 500) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value) {
        localStorage.setItem(key, JSON.stringify(value));
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [key, value, delay]);
}

function SectionWithSortableGrid({ section }) {
  const [categories, setCategories] = useState(section.categories || []);
  const [activeId, setActiveId] = useState(null);

  // Load saved order once on mount
  useEffect(() => {
    const savedOrder = localStorage.getItem(
      `jobsaddah-cat-order-${section._id}`
    );
    let frame;
    if (savedOrder && section.categories) {
      try {
        const orderIds = JSON.parse(savedOrder);
        const sorted = [...section.categories].sort((a, b) => {
          const indexA = orderIds.indexOf(a.name || a._id);
          const indexB = orderIds.indexOf(b.name || b._id);
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
        frame = requestAnimationFrame(() => setCategories(sorted));
      } catch (err) {
        console.error("Failed to parse saved order:", err);
      }
    }
    return () => {
      if (frame) cancelAnimationFrame(frame);
    };
  }, [section._id, section.categories]);

  // Debounced save to localStorage
  const categoryOrder = useMemo(
    () => categories.map((i) => i.name || i._id),
    [categories]
  );
  useDebouncedLocalStorage(
    `jobsaddah-cat-order-${section._id}`,
    categoryOrder,
    300
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex(
          (item) => (item.name || item._id) === active.id
        );
        const newIndex = items.findIndex(
          (item) => (item.name || item._id) === over.id
        );
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setActiveId(null);
  }, []);

  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
  }, []);

  // Memoize active category to avoid .find() on every render
  const activeCategory = useMemo(
    () => categories.find((c) => (c.name || c._id) === activeId),
    [categories, activeId]
  );

  const itemIds = useMemo(
    () => categories.map((c) => c.name || c._id),
    [categories]
  );

  return (
    <div className="mb-12">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={itemIds} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
            {categories.map((cat) => (
              <SortableCategoryItem
                key={cat.name || cat._id}
                id={cat.name || cat._id}
                cat={cat}
              />
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeCategory && (
            <div className="h-full">
              <CategoryCard cat={activeCategory} isOverlay />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function SectionsSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full"
          >
            <div className="bg-slate-100 px-4 py-3 flex items-center gap-3 animate-pulse h-15">
              <div className="w-8 h-8 bg-slate-200 rounded-lg"></div>
              <div className="grow space-y-2">
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                <div className="h-2 bg-slate-200 rounded w-1/4"></div>
              </div>
            </div>
            <div className="p-3 grow bg-white min-h-50 space-y-3">
              {[1, 2, 3, 4, 5].map((j) => (
                <div key={j} className="flex items-center gap-3 p-1">
                  <div className="w-5 h-5 bg-gray-100 rounded-md animate-pulse"></div>
                  <div className="h-3 bg-gray-100 rounded w-3/4 animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SectionsWithPosts({ sections }) {
  const sectionsProvided = Array.isArray(sections) && sections.length > 0;
  const [localSections, setLocalSections] = useState(
    sectionsProvided ? sections : null
  );
  const [loading, setLoading] = useState(localSections === null);
  const [error, setError] = useState(null);
  const [showEmpty, setShowEmpty] = useState(false);

  useEffect(() => {
    if (sectionsProvided) {
      const frame = requestAnimationFrame(() => {
        setLocalSections(sections);
        setLoading(false);
      });
      return () => cancelAnimationFrame(frame);
    }

    const controller = new AbortController();
    let emptyTimer = null;

    async function fetchSections() {
      setLoading(true);
      setShowEmpty(false);
      try {
        const res = await fetch("/api/gov/sections-with-posts", {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        const data = Array.isArray(json.data) ? json.data : [];
        if (data.length === 0) {
          emptyTimer = setTimeout(() => {
            setLocalSections(data);
            setShowEmpty(true);
          }, 300);
        } else {
          requestAnimationFrame(() => {
            setLocalSections(data);
            setShowEmpty(false);
          });
        }
      } catch (err) {
        if (err.name !== "AbortError")
          setError(err.message || "Failed to load sections");
      } finally {
        setLoading(false);
      }
    }

    fetchSections();

    return () => {
      controller.abort();
      if (emptyTimer) clearTimeout(emptyTimer);
    };
  }, [sectionsProvided, sections]);

  if (loading || (!Array.isArray(localSections) && !error) || (localSections?.length === 0 && !showEmpty && !error)) {
    return <SectionsSkeleton />;
  }
  
  if (error) return <p className="text-center py-12 text-red-500">{error}</p>;
  
  if (Array.isArray(localSections) && localSections.length === 0 && showEmpty) {
    return (
      <p className="text-center py-20 text-gray-500">No sections available.</p>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {localSections.map((section) => (
          <SectionWithSortableGrid key={section._id} section={section} />
        ))}
      </div>
    </div>
  );
}
