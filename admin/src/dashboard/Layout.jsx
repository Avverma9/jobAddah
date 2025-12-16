import React, { useState, useEffect, useMemo } from "react";
import {
  Menu,
  Search,
  Bell,
  Plus,
  Briefcase
} from "lucide-react";
import Sidebar from "./Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { fetchSidebarItems } from "../../redux/slices/sidebar";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { logout } from "../../redux/slices/user";
import Loader from "../../util/loader"; // Import the Loader

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.ui); // Get loading state
  const { stats } = useSelector((state) => state.job);

  const dispatch = useDispatch();
  const sidebarState = useSelector((state) => state.sidebar?.data);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    dispatch(fetchSidebarItems());
  }, [dispatch]);

  const buildSidebarTree = (items) => {
    if (!items) return [];
    let list = [];
    if (Array.isArray(items)) list = items;
    else if (items.items && Array.isArray(items.items)) list = items.items;
    else if (items.item) list = [items.item];
    else if (items._id) list = [items];

    list = list.slice().sort((a, b) => (a.order || 0) - (b.order || 0));

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
          map[pid].children.push(map[id]);
        } else {
          roots.push(map[id]);
        }
      } else {
        roots.push(map[id]);
      }
    });

    return roots;
  };

  const sidebarItems = useMemo(
    () => buildSidebarTree(sidebarState),
    [sidebarState]
  );

  const location = useLocation();

  useEffect(() => {
    if (!sidebarItems || sidebarItems.length === 0) return;
    const newExpanded = {};
    const checkItem = (it) => {
      if (it.route && it.route === location.pathname) return true;
      if (it.children && it.children.length) {
        const childActive = it.children.some((c) => checkItem(c));
        if (childActive) newExpanded[it._id || it.key] = true;
        return childActive;
      }
      return false;
    };
    sidebarItems.forEach((it) => checkItem(it));

    setExpandedItems((prev) => {
      const merged = { ...prev, ...newExpanded };
      const prevKeys = Object.keys(prev);
      const mergedKeys = Object.keys(merged);
      if (
        prevKeys.length === mergedKeys.length &&
        prevKeys.every((k) => prev[k] === merged[k])
      ) {
        return prev;
      }
      return merged;
    });
  }, [location.pathname, sidebarItems]);

  const handleCreatePost = () => {
    navigate('/create-job');
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-800">
      {isLoading && <Loader />}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      <Sidebar
        sidebarOpen={sidebarOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <div className="flex flex-1 flex-col overflow-hidden transition-all duration-300">
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm transition-all duration-300">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:block text-slate-500 hover:text-slate-800 transition-colors"
            >
              <Menu size={24} />
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-800 transition-colors"
            >
              <Menu size={24} />
            </button>

            <div className="hidden md:flex items-center rounded-lg bg-slate-100 px-3 py-2 transition-all">
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search jobs, results..."
                className="ml-2 w-64 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative text-slate-500 hover:text-slate-800 transition-transform hover:scale-105">
              <Bell size={22} />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </button>
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold shadow cursor-pointer transition-transform hover:scale-105">
              A
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 transition-all duration-300">
         
          <Outlet />
        </main>
      </div>
    </div>
  );
}
