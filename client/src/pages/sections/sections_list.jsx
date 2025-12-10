import {
  AlertCircle,
  Briefcase,
  Calendar,
  ChevronDown,
  ChevronRight,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// --- Helper Function to Strip Domain ---
const stripDomain = (url) => {
  if (!url) return "";
  try {
    const stringUrl = url.toString();
    // Only attempt to parse if it looks like a full URL
    if (stringUrl.startsWith("http")) {
      const urlObj = new URL(stringUrl);
      return urlObj.pathname; // Returns "/railway-rrc..."
    }
    return url;
  } catch (e) {
    return url;
  }
};

// --- ListItem Component ---
const ListItem = ({
  item,
  colorTheme,
  showTrending = false,
  showUrgent = false,
}) => {
  // Theme logic
  const getThemeColors = () => {
    switch (colorTheme) {
      case "red":
        return {
          text: "text-rose-600",
          bg: "bg-rose-50",
          border: "border-rose-100",
          btn: "bg-rose-600 hover:bg-rose-700",
        };
      case "blue":
        return {
          text: "text-blue-600",
          bg: "bg-blue-50",
          border: "border-blue-100",
          btn: "bg-blue-600 hover:bg-blue-700",
        };
      case "green":
        return {
          text: "text-emerald-600",
          bg: "bg-emerald-50",
          border: "border-emerald-100",
          btn: "bg-emerald-600 hover:bg-emerald-700",
        };
      case "orange":
        return {
          text: "text-orange-600",
          bg: "bg-orange-50",
          border: "border-orange-100",
          btn: "bg-orange-600 hover:bg-orange-700",
        };
      case "pink":
        return {
          text: "text-pink-600",
          bg: "bg-pink-50",
          border: "border-pink-100",
          btn: "bg-pink-600 hover:bg-pink-700",
        };
      case "purple":
        return {
          text: "text-purple-600",
          bg: "bg-purple-50",
          border: "border-purple-100",
          btn: "bg-purple-600 hover:bg-purple-700",
        };
      default:
        return {
          text: "text-gray-600",
          bg: "bg-gray-50",
          border: "border-gray-100",
          btn: "bg-gray-600 hover:bg-gray-700",
        };
    }
  };

  const theme = getThemeColors();

  // Clean the ID (remove domain)
  const cleanId = stripDomain(item.id);

  const handleViewDetails = () => {
    // Assuming incrementVisitCount is available globally or imported context
    // If it's passed as a prop, make sure to add it to ListItem props
    if (typeof incrementVisitCount === "function") {
      incrementVisitCount(item.id);
    }
  };

  return (
    <Link
      to={`/post?_id=${cleanId}`} // FIX: Using cleanId here
      onClick={handleViewDetails}
      className="group block border-b border-gray-100 dark:border-gray-700 last:border-0 p-3 sm:p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 leading-snug line-clamp-2">
              {item.title}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              {showUrgent && (
                <span className="text-[9px] sm:text-[10px] font-bold bg-red-600 text-white px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-0.5 animate-pulse">
                  <AlertCircle size={8} /> URGENT
                </span>
              )}
              {showTrending && (
                <span className="text-[9px] sm:text-[10px] font-bold bg-orange-500 text-white px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <TrendingUp size={8} /> HOT
                </span>
              )}
              {item.isNew && (
                <span className="text-[9px] sm:text-[10px] font-bold bg-red-500 text-white px-1.5 sm:px-2 py-0.5 rounded-full animate-pulse">
                  NEW
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 mt-1.5">
            {item.lastDate && (
              <div className="flex items-center gap-1 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
                <Calendar size={10} />
                <span>
                  Last Date:{" "}
                  <span className="font-medium text-red-500">
                    {item.lastDate}
                  </span>
                </span>
              </div>
            )}
            {item.totalPosts > 0 && (
              <div className="flex items-center gap-1 text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">
                <Briefcase size={10} />
                <span>
                  Posts:{" "}
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {item.totalPosts}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>
        <ChevronRight
          size={16}
          className="mt-0.5 text-gray-400 group-hover:text-gray-600 transition-transform group-hover:translate-x-0.5 shrink-0"
        />
      </div>
    </Link>
  );
};

// --- SectionColumn Component ---
export const SectionColumn = ({
  title,
  icon: Icon,
  data,
  colorTheme,
  showTrending = false,
  postType,
  isLoading = false,
  showStateSelector = false,
  currentState,
  onStateChange,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getHeaderStyle = () => {
    switch (colorTheme) {
      case "red":
        return "bg-gradient-to-r from-rose-600 to-red-500";
      case "blue":
        return "bg-gradient-to-r from-blue-600 to-indigo-500";
      case "green":
        return "bg-gradient-to-r from-emerald-600 to-green-500";
      case "orange":
        return "bg-gradient-to-r from-orange-600 to-amber-500";
      case "pink":
        return "bg-gradient-to-r from-pink-600 to-rose-500";
      case "purple":
        return "bg-gradient-to-r from-purple-600 to-violet-500";
      default:
        return "bg-gray-600";
    }
  };

  const STATES = [
    "ALL",
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
      <div
        className={`${getHeaderStyle()} p-3 sm:p-4 text-white flex justify-between items-center shadow-md z-10`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 sm:p-1.5 bg-white/20 rounded-lg backdrop-blur-sm shrink-0">
            <Icon size={16} className="sm:w-4.5 sm:h-4.5" />
          </div>
          <h2 className="font-bold text-sm sm:text-lg tracking-wide truncate dark:text-gray-100">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {showStateSelector && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2 sm:px-3 py-1 sm:py-1.5 rounded text-[10px] sm:text-xs font-semibold transition-colors whitespace-nowrap"
              >
                <MapPin size={12} className="shrink-0" />
                <span className="hidden xs:inline line-clamp-1 max-w-[80px] sm:max-w-full">
                  {currentState}
                </span>
                <span className="xs:hidden">
                  {currentState.split(" ")[0]}
                </span>
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 shrink-0 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-44 sm:w-48 max-h-48 sm:max-h-80 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-xl z-50">
                  {STATES.map((state) => (
                    <button
                      key={state}
                      onClick={() => {
                        onStateChange(state);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2 sm:px-4 py-1.5 sm:py-2.5 text-[11px] sm:text-sm font-medium transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0 ${
                        currentState === state
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-semibold"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      {state}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <span className="text-[10px] sm:text-xs font-bold bg-white/20 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
            {data.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="h-32 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data.length > 0 ? (
          data
            .slice(0, 11)
            .map((item) => (
              <ListItem
                key={item.id}
                item={item}
                colorTheme={colorTheme}
                showTrending={showTrending}
              />
            ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-4 sm:p-6 text-center">
            <Icon size={28} className="mb-2 opacity-20 sm:w-8 sm:h-8" />
            <p className="text-xs sm:text-sm font-medium">No updates yet</p>
          </div>
        )}
      </div>

      <Link
        to={`/view-all?type=${postType}`}
        className="block p-2 sm:p-3 text-center text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border-t border-gray-100 dark:border-gray-700 uppercase tracking-wider transition-colors"
      >
        View All {title}
      </Link>
    </div>
  );
};