import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSidebarItems } from "../../redux/slices/sidebar";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, LogOut } from "lucide-react";
import { logout } from "../../redux/slices/user";

export default function Sidebar({
  sidebarOpen,
  mobileMenuOpen,
  setMobileMenuOpen,
}) {
  const dispatch = useDispatch();
  const sidebarData = useSelector((state) => state.sidebar?.data);
  const [expandedItems, setExpandedItems] = useState({});
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchSidebarItems());
  }, [dispatch]);

  const buildSidebarTree = (state) => {
    if (!state) return [];

    let list = [];
    if (Array.isArray(state)) list = state;
    else if (state.items && Array.isArray(state.items)) list = state.items;
    else if (state.item) list = [state.item];
    else if (state._id) list = [state];

    list = list.slice().sort((a, b) => (a.order || 0) - (b.order || 0));

    const hasNestedChildren = list.some(
      (it) => Array.isArray(it.children) && it.children.length > 0
    );
    if (hasNestedChildren) {
      return list.map((it) => ({
        ...it,
        children: (it.children || [])
          .slice()
          .sort((a, b) => (a.order || 0) - (b.order || 0)),
      }));
    }

    const map = {};
    list.forEach((it) => (map[it._id || it.key] = { ...it, children: [] }));
    const roots = [];

    list.forEach((it) => {
      const id = it._id || it.key;
      const parent = it.parent;

      if (parent) {
        const parentEntry = list.find(
          (x) => x._id === parent || x.key === parent
        );
        if (parentEntry) {
          const pid = parentEntry._id || parentEntry.key;
          if (map[pid]) {
            map[pid].children.push(map[id]);
          }
        } else {
          roots.push(map[id]);
        }
      } else {
        roots.push(map[id]);
      }
    });

    return roots;
  };

  const sidebarItems = useMemo(() => buildSidebarTree(sidebarData), [sidebarData]);

  useEffect(() => {
    if (!sidebarItems?.length) return;

    const newExpanded = {};

    const checkActive = (item) => {
      if (item.route === location.pathname) return true;

      if (item.children?.length) {
        const childActive = item.children.some((c) => checkActive(c));
        if (childActive) newExpanded[item._id || item.key] = true;
        return childActive;
      }
      return false;
    };

    sidebarItems.forEach((i) => checkActive(i));

    const keysA = Object.keys(expandedItems).sort();
    const keysB = Object.keys(newExpanded).sort();
    const isSame =
      keysA.length === keysB.length &&
      keysA.every((k) => newExpanded[k] === expandedItems[k]);

    if (!isSame) {
      setExpandedItems(newExpanded);
    }
  }, [location.pathname, sidebarItems]);

  const handleToggle = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderIcon = (item) => {
    let iconClass = item.icon || "";

    if (item.iconType === "font" && iconClass) {
      if (iconClass.startsWith("ri-")) {
        return <i className={iconClass} style={{ fontSize: "20px" }} />;
      }

      if (iconClass.startsWith("fa fa-")) {
        iconClass = iconClass.replace("fa fa-", "fa-solid fa-");
      } else if (iconClass.startsWith("fas fa-")) {
        iconClass = iconClass.replace("fas fa-", "fa-solid fa-");
      } else if (iconClass.startsWith("far fa-")) {
        iconClass = iconClass.replace("far fa-", "fa-regular fa-");
      } else if (iconClass.startsWith("fab fa-")) {
        iconClass = iconClass.replace("fab fa-", "fa-brands fa-");
      } else if (!iconClass.startsWith("fa-")) {
        iconClass = `fa-solid ${iconClass}`;
      }

      return <i className={iconClass} />;
    }

    return (
      <span className="text-sm font-semibold">
        {item.label?.charAt(0)?.toUpperCase() || "?"}
      </span>
    );
  };

  const NavItem = ({ item, isOpen, onClick }) => {
    const active = item.route === location.pathname;
    const base = `group flex items-center rounded-lg px-3 py-2.5 transition-all duration-200 ${
      !isOpen ? "justify-center" : ""
    }`;
    const state = active
      ? "bg-blue-600 text-white"
      : "text-slate-400 hover:bg-slate-800 hover:text-white";

    const content = (
      <>
        <div className="shrink-0 h-5 w-5 flex items-center justify-center">
          {renderIcon(item)}
        </div>
        <span
          className={`ml-3 text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${
            isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 ml-0"
          }`}
        >
          {item.label}
        </span>
      </>
    );

    return item.route ? (
      <Link to={item.route} onClick={onClick} className={`${base} ${state}`}>
        {content}
      </Link>
    ) : (
      <div onClick={onClick} className={`${base} ${state} cursor-pointer`}>
        {content}
      </div>
    );
  };

  const CollapsibleItem = ({ item, isOpen, expanded, onToggle, children }) => {
    return (
      <div className="mb-1">
        <div
          onClick={onToggle}
          className={`group flex items-center justify-between cursor-pointer rounded-lg px-3 py-2.5 transition-all duration-200 text-slate-400 hover:bg-slate-800 hover:text-white ${
            expanded ? "bg-slate-800 text-white" : ""
          } ${!isOpen ? "justify-center" : ""}`}
        >
          <div className="flex items-center min-w-0">
            <div className="shrink-0 h-5 w-5 flex items-center justify-center">
              {renderIcon(item)}
            </div>
            <span
              className={`ml-3 text-sm font-medium whitespace-nowrap overflow-hidden transition-all duration-300 ${
                isOpen ? "opacity-100 w-auto" : "opacity-0 w-0 ml-0"
              }`}
            >
              {item.label}
            </span>
          </div>

          {isOpen && (
            <div className="shrink-0 transition-transform duration-200 ml-2">
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </div>
          )}
        </div>

        <div
          className={`overflow-hidden transition-all duration-300 ${
            expanded && isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="mt-1 ml-4 border-l border-slate-700 pl-3 space-y-1">
            {children}
          </div>
        </div>
      </div>
    );
  };

  const SubItem = ({ item, onClick }) => {
    const isActive = item.route === location.pathname;
    const base =
      "flex items-center gap-2 cursor-pointer rounded px-2 py-2 text-sm transition-colors";
    const state = isActive
      ? "bg-slate-800 text-white"
      : "text-slate-500 hover:bg-slate-800 hover:text-blue-400";

    const content = (
      <>
        <div className="h-4 w-4 flex items-center justify-center shrink-0">
          {renderIcon(item)}
        </div>
        <span className="truncate">{item.label}</span>
      </>
    );

    return item.route ? (
      <Link to={item.route} onClick={onClick} className={`${base} ${state}`}>
        {content}
      </Link>
    ) : (
      <div onClick={onClick} className={`${base} ${state}`}>
        {content}
      </div>
    );
  };

  const renderNode = (item, level = 0) => {
    const key = item._id || item.key;

    if (item.children?.length > 0) {
      return (
        <CollapsibleItem
          key={key}
          item={item}
          isOpen={sidebarOpen}
          expanded={expandedItems[key]}
          onToggle={() => handleToggle(key)}
        >
          {item.children.map((child) => renderNode(child, level + 1))}
        </CollapsibleItem>
      );
    }

    if (level === 0) {
      return (
        <NavItem
          key={key}
          item={item}
          isOpen={sidebarOpen}
          onClick={() => setMobileMenuOpen(false)}
        />
      );
    }

    return (
      <SubItem
        key={key}
        item={item}
        onClick={() => setMobileMenuOpen(false)}
      />
    );
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-slate-900 text-slate-300 transition-all duration-300 ${
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      } lg:static lg:translate-x-0 ${
        sidebarOpen ? "w-64" : "lg:w-20 w-64"
      }`}
    >
      <div className="flex h-20 items-center justify-start px-4 border-b border-slate-800 bg-slate-950 shadow-sm">
        <div
          className={`flex items-center gap-3 transition-all ${
            !sidebarOpen ? "justify-center w-full -ml-2" : ""
          }`}
        >
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">JA</span>
          </div>

          <div
            className={`flex flex-col transition-all ${
              sidebarOpen
                ? "opacity-100 w-auto"
                : "opacity-0 w-0 -translate-x-10 overflow-hidden"
            }`}
          >
            <h1 className="text-2xl font-bold flex">
              <span className="text-pink-500">Job</span>
              <span className="text-orange-500">Addah</span>
            </h1>
            <span className="text-[9px] text-slate-500 tracking-widest">
              THE NO.1 JOB PORTAL
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {sidebarItems.length === 0 && !sidebarData && (
          <div className="text-center py-8 text-slate-500 text-sm">
            No menu items available
          </div>
        )}

        {sidebarItems.map((item) => renderNode(item, 0))}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <button
          className={`flex items-center gap-3 w-full text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg px-3 py-2.5 transition-all ${
            !sidebarOpen ? "justify-center" : ""
          }`}
          onClick={async () => {
            await dispatch(logout());
            navigate("/");
          }}
        >
          <LogOut size={20} className="shrink-0" />
          <span
            className={`text-sm font-medium transition-all ${
              sidebarOpen ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
            }`}
          >
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}
