import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  Award, 
  BookOpen, 
  GraduationCap, 
  Plus, 
  Search, 
  Bell, 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight, 
  Users,
  Settings,
  LogOut
} from 'lucide-react';

// --- Components Start ---

export default function JobAddahAdmin() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sidebar Submenu State
  const [menus, setMenus] = useState({
    jobs: true,
    results: false,
    admitCard: false,
    admission: false,
  });

  const toggleMenu = (key) => {
    setMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-800">
      
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      )}

      {/* ================= SIDEBAR ================= */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-30 flex flex-col bg-slate-900 text-slate-300 
          transition-all duration-300 ease-in-out 
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:static lg:translate-x-0 
          ${sidebarOpen ? 'w-64' : 'lg:w-20 w-64'}
        `}
      >
        {/* Logo Area */}
        <div className="flex h-20 items-center justify-start px-4 border-b border-slate-800 bg-slate-950 shadow-sm overflow-hidden whitespace-nowrap transition-all duration-300">
          {/* Logo Container */}
          <div className={`flex items-center gap-3 transition-all duration-300 ${!sidebarOpen ? 'justify-center w-full -ml-2' : ''}`}>
            
            {/* Icon - Always Visible */}
            <div className="h-10 w-10 shrink-0 rounded-lg bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center shadow-lg group cursor-pointer">
              <span className="text-white font-bold text-lg group-hover:scale-110 transition-transform">JA</span>
            </div>

            {/* Text - Hidden when collapsed */}
            <div className={`flex flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? 'opacity-100 w-auto translate-x-0' : 'opacity-0 w-0 -translate-x-10 overflow-hidden'}`}>
               <h1 className="text-2xl font-bold tracking-tight leading-none flex">
                  <span className="text-pink-500">Job</span>
                  <span className="text-orange-500">Addah</span>
               </h1>
               <span className="text-[9px] font-bold text-slate-500 tracking-[0.15em] mt-1">THE NO.1 JOB PORTAL</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-1 custom-scrollbar">
          
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            isOpen={sidebarOpen} 
            active 
          />

          {/* Collapsible: Jobs */}
          <CollapsibleItem 
            icon={<Briefcase size={20} />} 
            label="Latest Jobs" 
            isOpen={sidebarOpen}
            expanded={menus.jobs}
            onToggle={() => toggleMenu('jobs')}
          >
            <SubItem label="All Jobs" />
            <SubItem label="Add New Job" />
            <SubItem label="Expired Jobs" />
          </CollapsibleItem>

          {/* Collapsible: Admit Card */}
          <CollapsibleItem 
            icon={<FileText size={20} />} 
            label="Admit Card" 
            isOpen={sidebarOpen}
            expanded={menus.admitCard}
            onToggle={() => toggleMenu('admitCard')}
          >
            <SubItem label="All Admit Cards" />
            <SubItem label="Release New" />
          </CollapsibleItem>

          {/* Collapsible: Results */}
          <CollapsibleItem 
            icon={<Award size={20} />} 
            label="Results" 
            isOpen={sidebarOpen}
            expanded={menus.results}
            onToggle={() => toggleMenu('results')}
          >
            <SubItem label="All Results" />
            <SubItem label="Declare Result" />
          </CollapsibleItem>

           {/* Collapsible: Admission */}
           <CollapsibleItem 
            icon={<GraduationCap size={20} />} 
            label="Admission" 
            isOpen={sidebarOpen}
            expanded={menus.admission}
            onToggle={() => toggleMenu('admission')}
          >
            <SubItem label="Forms List" />
            <SubItem label="Add Admission" />
          </CollapsibleItem>

          {/* Simple Links */}
          <div className="pt-4 pb-2 overflow-hidden">
            <p className={`px-4 text-xs font-semibold uppercase text-slate-500 transition-opacity duration-300 ${!sidebarOpen ? 'opacity-0' : 'opacity-100'}`}>
              Content
            </p>
          </div>
          
          <NavItem icon={<BookOpen size={20} />} label="Syllabus" isOpen={sidebarOpen} />
          <NavItem icon={<FileText size={20} />} label="Answer Keys" isOpen={sidebarOpen} />
          
          <div className="pt-4 pb-2 overflow-hidden">
            <p className={`px-4 text-xs font-semibold uppercase text-slate-500 transition-opacity duration-300 ${!sidebarOpen ? 'opacity-0' : 'opacity-100'}`}>
              System
            </p>
          </div>
          <NavItem icon={<Users size={20} />} label="Users" isOpen={sidebarOpen} />
          <NavItem icon={<Settings size={20} />} label="Settings" isOpen={sidebarOpen} />

        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-800 p-4 overflow-hidden">
          <button className={`flex items-center gap-3 w-full text-slate-400 hover:text-white transition-all duration-300 ${!sidebarOpen ? 'justify-center' : ''}`}>
            <LogOut size={20} className="shrink-0" />
            <span className={`whitespace-nowrap transition-all duration-300 ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 overflow-hidden'}`}>
              Logout
            </span>
          </button>
        </div>
      </aside>


      {/* ================= MAIN CONTENT ================= */}
      <div className="flex flex-1 flex-col overflow-hidden transition-all duration-300">
        
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm transition-all duration-300">
          <div className="flex items-center gap-4">
            {/* Sidebar Toggle (Desktop) */}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:block text-slate-500 hover:text-slate-800 transition-colors">
              <Menu size={24} />
            </button>
             {/* Sidebar Toggle (Mobile) */}
             <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-800 transition-colors">
              <Menu size={24} />
            </button>

            {/* Search */}
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
            
            {/* CREATE NEW POST BUTTON */}
            <button className="hidden sm:flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 shadow-md transition-all hover:shadow-lg active:scale-95">
              <Plus size={18} />
              <span>Create New Post</span>
            </button>

            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold shadow cursor-pointer transition-transform hover:scale-105">
              A
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 transition-all duration-300">
          
          {/* Mobile Create Button (Visible only on small screens) */}
          <div className="mb-6 sm:hidden">
             <button className="flex w-full justify-center items-center gap-2 rounded-md bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-md active:scale-95 transition-all">
              <Plus size={18} />
              <span>Create New Post</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Total Jobs" value="1,240" color="bg-blue-500" icon={<Briefcase />} />
            <StatCard title="Live Results" value="85" color="bg-green-500" icon={<Award />} />
            <StatCard title="Admit Cards" value="342" color="bg-purple-500" icon={<FileText />} />
            <StatCard title="Admissions" value="120" color="bg-orange-500" icon={<GraduationCap />} />
          </div>

          {/* Main Layout Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            
            {/* LEFT COLUMN: Jobs Table (Wider) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Jobs Table Card */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                  <h3 className="text-lg font-semibold text-slate-800">Recent Job Posts</h3>
                  <button className="text-sm font-medium text-blue-600 hover:underline">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                      <tr>
                        <th className="px-6 py-3 font-medium">Post Name</th>
                        <th className="px-6 py-3 font-medium">Category</th>
                        <th className="px-6 py-3 font-medium">Date</th>
                        <th className="px-6 py-3 font-medium">Status</th>
                        <th className="px-6 py-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <JobRow title="SSC CGL 2025 Online Form" category="SSC" date="22 Nov" status="Active" />
                      <JobRow title="Bihar Police Constable" category="Police" date="21 Nov" status="Active" />
                      <JobRow title="UPSC IAS Pre Online" category="UPSC" date="20 Nov" status="Expired" />
                      <JobRow title="Railway NTPC Recruitment" category="Railway" date="19 Nov" status="Draft" />
                      <JobRow title="IBPS PO Mains Form" category="Bank" date="18 Nov" status="Active" />
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Result Table Card */}
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                  <h3 className="text-lg font-semibold text-slate-800">Latest Results</h3>
                  <button className="text-sm font-medium text-blue-600 hover:underline">View All</button>
                </div>
                <div className="p-0">
                  {/* Simplified list for results */}
                  <div className="divide-y divide-slate-100">
                    <ResultRow title="UPSC NDA II 2024 Result Declared" date="Today" />
                    <ResultRow title="BPSC Tre 3.0 Final Result" date="Yesterday" />
                    <ResultRow title="JEE Main Session 2 Result" date="20 Nov" />
                  </div>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN: Quick Lists & Widgets */}
            <div className="flex flex-col gap-6">
              
              {/* Admit Card Widget */}
              <WidgetCard title="Admit Cards" icon={<FileText size={18} />} color="text-purple-600">
                 <ul className="space-y-3">
                    <WidgetLink text="SSC CGL Tier I Admit Card 2025" isNew />
                    <WidgetLink text="IGNOU TEE June 2025 Hall Ticket" />
                    <WidgetLink text="CSBC Bihar Police Admit Card" isNew />
                    <WidgetLink text="Airforce Agniveer Admit Card" />
                 </ul>
                 <button className="mt-4 w-full rounded border border-slate-200 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                    Manage Admit Cards
                 </button>
              </WidgetCard>

              {/* Syllabus Widget */}
              <WidgetCard title="Syllabus" icon={<BookOpen size={18} />} color="text-blue-600">
                 <ul className="space-y-3">
                    <WidgetLink text="UP Police Constable Syllabus" />
                    <WidgetLink text="RPSC RAS 2025 Exam Pattern" />
                    <WidgetLink text="UGC NET June 2025 Syllabus" />
                 </ul>
              </WidgetCard>

              {/* Admission Forms Widget */}
              <WidgetCard title="Admission" icon={<GraduationCap size={18} />} color="text-orange-600">
                 <ul className="space-y-3">
                    <WidgetLink text="BHU UG Admission 2025 Open" isNew />
                    <WidgetLink text="NTA NEET UG 2025 Form" />
                    <WidgetLink text="Simultala Awasiya Vidyalaya Form" />
                 </ul>
              </WidgetCard>

            </div>
          </div>

        </main>
      </div>
    </div>
  );
}


// --- Helper Components for Cleaner Code ---

const NavItem = ({ icon, label, active, isOpen }) => (
  <div className={`
    group flex cursor-pointer items-center rounded-lg px-3 py-2.5 transition-all duration-200
    ${active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
    ${!isOpen ? 'justify-center' : ''}
  `}>
    <div className="shrink-0 transition-transform duration-300 group-hover:scale-110">{icon}</div>
    <span className={`whitespace-nowrap text-sm font-medium ml-3 transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 ml-0'}`}>
      {label}
    </span>
  </div>
);

const CollapsibleItem = ({ icon, label, isOpen, expanded, onToggle, children }) => (
  <div className="mb-1">
    <div 
      onClick={onToggle}
      className={`
        group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 transition-all duration-200 text-slate-400 hover:bg-slate-800 hover:text-white
        ${expanded ? 'bg-slate-800 text-white' : ''}
        ${!isOpen ? 'justify-center' : ''}
      `}
    >
      <div className="flex items-center">
        <div className="shrink-0 transition-transform duration-300 group-hover:scale-110">{icon}</div>
        <span className={`whitespace-nowrap text-sm font-medium ml-3 transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 ml-0'}`}>
          {label}
        </span>
      </div>
      {isOpen && (
        <div className="shrink-0 transition-transform duration-300">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
      )}
    </div>
    
    {/* Submenu */}
    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expanded && isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
      <div className="mt-1 ml-4 border-l border-slate-700 pl-3 space-y-1">
        {children}
      </div>
    </div>
  </div>
);

const SubItem = ({ label }) => (
  <div className="cursor-pointer rounded px-2 py-2 text-sm text-slate-500 hover:bg-slate-800 hover:text-blue-400 transition-colors duration-200">
    {label}
  </div>
);

const StatCard = ({ title, value, color, icon }) => (
  <div className="flex items-center gap-4 rounded-xl bg-white p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
    <div className={`flex h-12 w-12 items-center justify-center rounded-lg text-white shadow-md ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
      <h4 className="text-2xl font-bold text-slate-800">{value}</h4>
    </div>
  </div>
);

const JobRow = ({ title, category, date, status }) => (
  <tr className="group hover:bg-slate-50 transition-colors duration-200">
    <td className="px-6 py-4 font-medium text-slate-700 group-hover:text-blue-600 transition-colors">{title}</td>
    <td className="px-6 py-4">
      <span className="inline-flex items-center rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
        {category}
      </span>
    </td>
    <td className="px-6 py-4 text-slate-500">{date}</td>
    <td className="px-6 py-4">
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
        ${status === 'Active' ? 'bg-green-100 text-green-800' : 
          status === 'Expired' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}
      `}>
        {status}
      </span>
    </td>
    <td className="px-6 py-4">
      <button className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">Edit</button>
    </td>
  </tr>
);

const ResultRow = ({ title, date }) => (
    <div className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 transition-colors duration-200 group">
        <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500 group-hover:scale-125 transition-transform"></div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors cursor-pointer">{title}</span>
        </div>
        <span className="text-xs text-slate-400">{date}</span>
    </div>
);

const WidgetCard = ({ title, icon, color, children }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300">
    <div className="mb-4 flex items-center justify-between">
      <h4 className={`flex items-center gap-2 font-semibold text-slate-800`}>
        <span className={color}>{icon}</span>
        {title}
      </h4>
    </div>
    {children}
  </div>
);

const WidgetLink = ({ text, isNew }) => (
  <li className="flex cursor-pointer items-start justify-between group transition-all duration-200 hover:translate-x-1">
    <span className="text-sm text-slate-600 group-hover:text-blue-600 line-clamp-1 transition-colors">{text}</span>
    {isNew && <span className="ml-2 rounded bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white animate-pulse">NEW</span>}
  </li>
);