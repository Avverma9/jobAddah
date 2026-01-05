"use client";
/**
 * Mobile Header Component - JobsAddah (Improved Design)
 */
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, Bell } from "lucide-react";

const MobileHeader = ({ onSearchToggle, isSearchActive }) => {
  const pathname = usePathname();
  const [notificationCount, setNotificationCount] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const frame = requestAnimationFrame(() => setNotificationCount(3));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Ensure consistent class names for buttons
  const searchButtonClass = isSearchActive
    ? "relative p-3 rounded-2xl transition-all duration-200 group bg-linear-to-br from-indigo-500/10 to-purple-500/10 ring-4 ring-indigo-500/30 shadow-2xl shadow-indigo-500/20 animate-pulse active:scale-[0.97] active:shadow-md"
    : "relative p-3 rounded-2xl transition-all duration-200 group hover:bg-linear-to-br hover:from-gray-50/80 hover:to-white/90 hover:shadow-xl hover:shadow-gray-100/50 bg-white/70 backdrop-blur-sm active:scale-[0.97] active:shadow-md";

  const notificationButtonClass = "p-3 rounded-2xl transition-all duration-200 group hover:bg-linear-to-br hover:from-orange-50/80 hover:to-red-50/90 hover:shadow-xl hover:shadow-orange-100/50 bg-white/70 backdrop-blur-sm active:scale-[0.97] active:shadow-md relative";

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-white/20 shadow-sm">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between">
        {/* Logo - Improved with better spacing & gradient text */}
        <Link
          href="/"
          aria-label="JobsAddah home"
          className="group inline-flex items-center gap-2 p-1 -m-1 rounded-xl hover:bg-gray-100/50 transition-all duration-200 hover:shadow-md"
        >
          <Image
            src="/logo.png"
            alt="JobsAddah"
            width={36}
            height={36}
            className="object-contain rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
            priority
          />
          <span className="text-xl font-bold bg-linear-to-r from-indigo-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
            JobsAddah
          </span>
        </Link>

        {/* Actions - Glassmorphic buttons with better touch targets */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            style={{ touchAction: "manipulation" }}
            className={searchButtonClass}
            onClick={onSearchToggle}
            aria-label="Toggle search"
          >
            <Search
              size={22}
              className={`transition-all duration-200 ${
                isSearchActive
                  ? "text-indigo-600 drop-shadow-lg"
                  : "text-gray-700 group-hover:text-gray-900"
              }`}
            />
            {isSearchActive && (
              <div className="absolute -inset-1 bg-indigo-500/20 rounded-2xl blur animate-ping" />
            )}
          </button>

          <button
            type="button"
            style={{ touchAction: "manipulation" }}
            className={notificationButtonClass}
            onClick={() => {
              /* placeholder */
            }}
            aria-label="Notifications"
          >
            <Bell
              size={22}
              className="text-gray-700 group-hover:text-gray-900 transition-colors"
            />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg">
              {notificationCount}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;