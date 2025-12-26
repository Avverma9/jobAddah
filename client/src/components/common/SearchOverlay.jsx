/**
 * Search Overlay Component for Mobile
 */
import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getPostLink } from "@/lib/helpers";

const SearchOverlay = ({ 
  isOpen, 
  onClose, 
  searchQuery, 
  setSearchQuery, 
  results, 
  isSearching 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Search Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <button onClick={onClose} className="p-2 -ml-2">
          <ChevronRight size={20} className="rotate-180 text-gray-600" />
        </button>
        <input
          type="text"
          placeholder="Search jobs, results, admit cards..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
          className="flex-1 text-sm outline-none"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery("")} className="text-gray-400 text-sm">
            Clear
          </button>
        )}
      </div>

      {/* Search Results */}
      <div className="overflow-y-auto h-[calc(100vh-60px)]">
        {isSearching ? (
          <div className="p-4 text-center text-gray-500">Searching...</div>
        ) : results.length === 0 && searchQuery ? (
          <div className="p-4 text-center text-gray-500">No results found</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {results.map((item, idx) => (
              <Link
                key={idx}
                href={getPostLink(item.linkTarget)}
                onClick={onClose}
                className="block px-4 py-3 hover:bg-gray-50"
              >
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2">
                  {item.title}
                </h3>
                {item.secondaryLine && (
                  <p className="text-xs text-gray-500 mt-1">{item.secondaryLine}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchOverlay;
