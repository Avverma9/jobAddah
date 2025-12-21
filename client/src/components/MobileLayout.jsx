import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  Search, Bell, Briefcase, ChevronLeft, Building2, Wrench, Clock 
} from "lucide-react";

// Mobile Header with back button for inner pages
export const MobileHeader = ({ title, showBack = false, onSearchToggle }) => {
  const navigate = useNavigate();
  
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {showBack ? (
          <button 
            onClick={() => navigate(-1)} 
            className="p-1 -ml-1 hover:bg-gray-100 rounded-full transition"
          >
            <ChevronLeft size={24} className="text-gray-600" />
          </button>
        ) : (
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <Briefcase size={20} />
          </div>
        )}
        <h1 className="text-xl font-bold tracking-tight text-blue-900">
          {title || <>Jobs<span className="text-blue-600">Addah</span></>}
        </h1>
      </div>
      <div className="flex gap-3">
        {onSearchToggle && (
          <button
            className="p-2 hover:bg-gray-100 rounded-full transition"
            onClick={onSearchToggle}
          >
            <Search size={20} className="text-gray-600" />
          </button>
        )}
        <button className="p-2 hover:bg-gray-100 rounded-full transition">
          <Bell size={20} className="text-gray-600" />
        </button>
      </div>
    </header>
  );
};

// Bottom Navigation
export const MobileBottomNav = ({ activeView }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine active view from current path
  const getCurrentView = () => {
    const path = location.pathname;
    if (path === "/private-jobs") return "pvt";
    if (path.includes("tools") || path.includes("jobsaddah-")) return "tools";
    if (path.includes("deadline") || path.includes("reminder")) return "deadlines";
    return activeView || "govt";
  };

  const navItems = [
    { id: "govt", icon: <Building2 size={24} />, label: "Govt Job", path: "/" },
    { id: "pvt", icon: <Briefcase size={24} />, label: "Pvt Job", path: "/private-jobs" },
    { id: "tools", icon: <Wrench size={24} />, label: "Tools", path: "/#tools" },
    { id: "deadlines", icon: <Clock size={24} />, label: "Deadlines", path: "/#deadlines" },
  ];

  const currentView = getCurrentView();

  const handleNavClick = (item) => {
    if (item.id === "tools" || item.id === "deadlines") {
      // Navigate to home with state to switch view
      navigate("/", { state: { activeView: item.id } });
    } else {
      navigate(item.path);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 px-2 z-50 pb-safe max-w-[480px] mx-auto">
      {navItems.map((item) => {
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => handleNavClick(item)}
            className={`flex flex-col items-center gap-1 w-full transition ${
              isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
      <style>{`
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom, 0);
        }
      `}</style>
    </nav>
  );
};

// Mobile Layout Wrapper - wraps any page content with mobile header and bottom nav
export const MobileLayout = ({ children, title, showBack = true, showBottomNav = true }) => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MobileHeader title={title} showBack={showBack} />
      <main>{children}</main>
      {showBottomNav && <MobileBottomNav />}
    </div>
  );
};

export default MobileLayout;
