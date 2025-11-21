import React, { useState, useEffect } from 'react';
import { Search, Menu, X, Moon, Sun, ChevronRight, ChevronDown, ChevronUp, Bell, ExternalLink, FileText, Award, Briefcase, Download, Home, Info, Phone, Calendar, DollarSign, User, BookOpen } from 'lucide-react';
import { baseUrl } from '../../util/baseUrl';

// Mock data as fallback
const mockData = {
  results: [],
  admitCards: [],
  latestJobs: [],
  important: [
    { id: 1, title: "Scholarship 2025", color: "bg-purple-100 text-purple-700" },
    { id: 2, title: "Admission 2026", color: "bg-blue-100 text-blue-700" },
    { id: 3, title: "Syllabus", color: "bg-orange-100 text-orange-700" },
    { id: 4, title: "Answer Key", color: "bg-pink-100 text-pink-700" },
  ]
};
const ListItem = ({ item, colorTheme }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getLinkColors = () => {
    switch (colorTheme) {
      case 'red': return 'group-hover:text-rose-600';
      case 'blue': return 'group-hover:text-blue-600';
      case 'green': return 'group-hover:text-emerald-600';
      default: return 'group-hover:text-gray-600';
    }
  };

  const getIconColor = () => {
    switch (colorTheme) {
      case 'red': return 'text-rose-500';
      case 'blue': return 'text-blue-500';
      case 'green': return 'text-emerald-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="border-b border-gray-100 dark:border-slate-700 last:border-0">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="group p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-750 transition-colors flex items-start gap-2"
      >
        <div className={`mt-1 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
          <ChevronRight size={16} className="text-gray-400" />
        </div>

        <div className="flex-1">
          <div className={`text-sm font-medium text-gray-700 dark:text-gray-200 ${getLinkColors()} leading-relaxed`}>
            <a href={`/post?_id=${item.id}`} className="hover:underline">{item.title}</a>
            {item.isNew && (
              <span className="ml-2 inline-block px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded animate-pulse">
                NEW
              </span>
            )}
          </div>
        </div>

        <div className="mt-1 shrink-0">
          {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </div>

      {/* Expandable Details Section */}
      {isExpanded && (
        <div className="bg-gray-50 dark:bg-slate-900/50 px-4 py-3 text-xs md:text-sm border-t border-gray-100 dark:border-slate-700 animate-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-3">
            {item.details.postDate && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar size={14} className={getIconColor()} />
                <span>Post Date: <span className="font-semibold text-gray-800 dark:text-gray-200">{item.details.postDate}</span></span>
              </div>
            )}
            {item.details.lastDate && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Calendar size={14} className={getIconColor()} />
                <span>Last Date: <span className="font-semibold text-red-500">{item.details.lastDate}</span></span>
              </div>
            )}
            {item.details.fee && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <DollarSign size={14} className={getIconColor()} />
                <span>Fee: <span className="font-semibold text-gray-800 dark:text-gray-200">{item.details.fee}</span></span>
              </div>
            )}
            {item.details.ageLimit && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <User size={14} className={getIconColor()} />
                <span>Age: <span className="font-semibold text-gray-800 dark:text-gray-200">{item.details.ageLimit}</span></span>
              </div>
            )}
            {item.details.totalPost && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 col-span-2 md:col-span-1">
                <Briefcase size={14} className={getIconColor()} />
                <span>Total Post: <span className="font-semibold text-gray-800 dark:text-gray-200">{item.details.totalPost}</span></span>
              </div>
            )}
            {item.details.examDate && (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 col-span-2 md:col-span-1">
                <Calendar size={14} className={getIconColor()} />
                <span>Exam Date: <span className="font-semibold text-gray-800 dark:text-gray-200">{item.details.examDate}</span></span>
              </div>
            )}
            {item.details.eligibility && (
              <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400 col-span-2">
                <BookOpen size={14} className={`mt-0.5 ${getIconColor()}`} />
                <span>Eligibility: <span className="font-semibold text-gray-800 dark:text-gray-200">{item.details.eligibility}</span></span>
              </div>
            )}
          </div>

          <div className="mt-3 flex justify-end">
            <button className={`text-xs font-bold px-3 py-1.5 rounded text-white shadow-sm transition-transform active:scale-95 ${colorTheme === 'red' ? 'bg-rose-600 hover:bg-rose-700' :
                colorTheme === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                  'bg-emerald-600 hover:bg-emerald-700'
              }`}>
              View Full Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SectionColumn = ({ title, icon: Icon, data, colorTheme, searchQuery }) => {
  const filteredData = data.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (searchQuery && filteredData.length === 0) return null;

  const getHeaderColors = () => {
    switch (colorTheme) {
      case 'red': return 'bg-rose-600 border-rose-700';
      case 'blue': return 'bg-blue-600 border-blue-700';
      case 'green': return 'bg-emerald-600 border-emerald-700';
      default: return 'bg-gray-600 border-gray-700';
    }
  };

  return (
    <div className="flex-1 min-w-[300px] flex flex-col rounded-lg overflow-hidden shadow-lg bg-white dark:bg-slate-800 transition-all duration-300 border border-gray-200 dark:border-slate-700">
      <div className={`${getHeaderColors()} p-4 flex items-center justify-between text-white shadow-md`}>
        <div className="flex items-center gap-2 font-bold text-lg tracking-wide">
          <Icon size={20} />
          <span>{title}</span>
        </div>
        <span className="text-xs bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
          {filteredData.length} Updates
        </span>
      </div>
      <div className="flex flex-col bg-white dark:bg-slate-800">
        {filteredData.map((item) => (
          <ListItem key={item.id} item={item} colorTheme={colorTheme} />
        ))}
        <a href="#" className="p-3 text-center text-xs font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white uppercase tracking-wider bg-gray-50 dark:bg-slate-900/50 border-t border-gray-100 dark:border-slate-700">
          View More {title}
        </a>
      </div>
    </div>
  );
};

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [postData, setPostData] = useState(mockData);
  const [loading, setLoading] = useState(true);

  // Fetch data from API
  useEffect(() => {
    fetch(`${baseUrl}/api/jobs/jobs`)
      .then(res => res.json())
    .then(data => {
  const transformedData = {
    results: data.filter(job => job.category === 'Result').map(job => ({
      id: job._id,
      title: job.organization || 'Untitled Job',
      isNew: (() => {
        const c = new Date(job.createdAt).getTime();
        return Date.now() - c <= 3 * 24 * 60 * 60 * 1000;
      })(),
      details: {
        postDate: job.post_date
          ? new Date(job.post_date).toLocaleDateString('en-GB')
          : 'N/A',

        totalPost: job.total_posts || 'N/A',

        eligibility: job.educational_qualification || 'See Notification',

        ageLimit: job.age_limit
          ? `${job.age_limit.minimum} - ${job.age_limit.maximum.general_male}`
          : 'N/A',

        examDate:
          job.important_dates?.['Exam Date'] ||
          job.important_dates?.['Exam'] ||
          'TBA'
      }
    })),

    admitCards: data.filter(job => job.category === 'Admit Card').map(job => ({
      id: job._id,
      title: job.organization || 'Untitled Admit Card',
      isNew: (() => {
        const c = new Date(job.createdAt).getTime();
        return Date.now() - c <= 3 * 24 * 60 * 60 * 1000;
      })(),
      details: {
        examDate:
          job.important_dates?.['Exam Date'] ||
          job.important_dates?.['Exam'] ||
          'TBA',

        downloadDate:
          job.important_dates?.['Admit Card'] ||
          job.important_dates?.['Download'] ||
          'TBA',

        totalPost: job.total_posts || 'N/A'
      }
    })),

    latestJobs: data.map(job => ({
      id: job._id,
      title: job.organization || 'Latest Job',
      isNew: (() => {
        const c = new Date(job.createdAt).getTime();
        return Date.now() - c <= 3 * 24 * 60 * 60 * 1000;
      })(),
      details: {
        lastDate:
          job.important_dates?.['Last Date'] ||
          job.important_dates?.['Last'] ||
          'See Notice',

        fee:
          job.application_fee?.['All Candidates'] ||
          Object.values(job.application_fee || {})[0] ||
          'N/A',

        ageLimit: job.age_limit
          ? `${job.age_limit.minimum} - ${job.age_limit.maximum.general_male}`
          : 'N/A',

        totalPost: job.total_posts || 'N/A',

        eligibility: job.educational_qualification || 'See Notification'
      }
    })),

    important: mockData.important
  };

  setPostData(transformedData);
  setLoading(false);
})

      .catch(err => {
        console.log('Error fetching jobs:', err);
        setLoading(false);
      });
  }, []);

  // On mount, set theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      // fallback: system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
        setIsDarkMode(true);
      } else {
        document.documentElement.classList.remove('dark');
        setIsDarkMode(false);
      }
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
      return next;
    });
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans ${isDarkMode ? 'dark bg-slate-900' : 'bg-gray-50'}`}>
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 shadow-md border-b border-gray-200 dark:border-slate-700 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-rose-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg transform hover:rotate-3 transition-transform">
                JA
              </div>
              <div className="leading-tight">
                <h1 className="text-lg md:text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-orange-600 dark:from-rose-400 dark:to-orange-400">
                  JobAddah
                </h1>
                <p className="text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 tracking-widest uppercase">
                  The No.1 Job Portal
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <nav className="flex space-x-1">
                {['Home', 'Latest Jobs', 'Results', 'Admit Card', 'Answer Key'].map((nav) => (
                  <a
                    key={nav}
                    href="#"
                    className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-md hover:bg-rose-50 dark:hover:bg-slate-700 hover:text-rose-600 transition-all"
                  >
                    {nav}
                  </a>
                ))}
              </nav>
              <div className="h-6 w-px bg-gray-300 dark:bg-slate-600 mx-2"></div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-yellow-400 transition-colors"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>

            <div className="flex items-center gap-3 md:hidden">
              <button onClick={toggleTheme} className="p-2 text-gray-600 dark:text-yellow-400">
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-700 dark:text-white"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-800 border-t dark:border-slate-700 animate-in slide-in-from-top-5">
            <div className="px-4 pt-2 pb-4 space-y-1">
              {['Home', 'Latest Jobs', 'Results', 'Admit Card', 'Answer Key', 'Syllabus', 'Contact'].map((nav) => (
                <a
                  key={nav}
                  href="#"
                  className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-slate-700 hover:text-rose-600"
                >
                  {nav}
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      <div className="bg-rose-600 text-white text-sm py-2 overflow-hidden relative shadow-inner">
        <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-rose-600 to-transparent z-10"></div>
        <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-rose-600 to-transparent z-10"></div>
        <div className="whitespace-nowrap animate-marquee flex gap-8 items-center px-4">
          <span className="flex items-center gap-2"><Bell size={14} className="fill-current" /> SSC CGL 2025 Notification Out</span>
          <span className="flex items-center gap-2"><Bell size={14} className="fill-current" /> Railway 1.5 Lakh Vacancy Coming Soon</span>
          <span className="flex items-center gap-2"><Bell size={14} className="fill-current" /> Bihar Police Constable Exam Date Announced</span>
          <span className="flex items-center gap-2"><Bell size={14} className="fill-current" /> UP RO/ARO 2025 Admit Card Download</span>
          <span className="flex items-center gap-2"><Bell size={14} className="fill-current" /> NEET UG 2026 Application Form</span>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-6 space-y-8">

        <div className="max-w-2xl mx-auto relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-800 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 sm:text-sm shadow-sm transition-all"
            placeholder="Search for exams, results, or jobs (e.g., SSC, UPSC)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {postData.important && postData.important.map((item) => (
            <a
              key={item.id}
              href="#"
              className={`${item.color} dark:bg-opacity-10 dark:text-gray-200 border border-transparent hover:border-current p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2 transition-all hover:shadow-md hover:-translate-y-1 group`}
            >
              <ExternalLink size={20} className="opacity-70 group-hover:opacity-100" />
              <span className="font-bold text-sm md:text-base">{item.title}</span>
            </a>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-rose-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading job updates...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            <SectionColumn
              title="Result"
              icon={Award}
              data={postData.results || []}
              colorTheme="red"
              searchQuery={searchQuery}
            />
            <SectionColumn
              title="Admit Card"
              icon={FileText}
              data={postData.admitCards || []}
              colorTheme="blue"
              searchQuery={searchQuery}
            />
            <SectionColumn
              title="Latest Jobs"
              icon={Briefcase}
              data={postData.latestJobs || []}
              colorTheme="green"
              searchQuery={searchQuery}
            />
          </div>
        )}

        {!searchQuery && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-200 dark:border-slate-700">
            <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Download size={18} className="text-rose-500" /> Answer Key
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-rose-600 hover:underline">CTET January 2025 Answer Key</a></li>
                <li><a href="#" className="hover:text-rose-600 hover:underline">SSC GD 2025 Official Key</a></li>
                <li><a href="#" className="hover:text-rose-600 hover:underline">UP Police Constable Answer Key</a></li>
              </ul>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <FileText size={18} className="text-blue-500" /> Syllabus
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-blue-600 hover:underline">UPSC CSE 2026 Detailed Syllabus</a></li>
                <li><a href="#" className="hover:text-blue-600 hover:underline">SSC CGL New Pattern 2025</a></li>
                <li><a href="#" className="hover:text-blue-600 hover:underline">RRB NTPC Syllabus PDF</a></li>
              </ul>
            </div>
            <div className="bg-white dark:bg-slate-800 p-5 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Award size={18} className="text-purple-500" /> Admission
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a href="#" className="hover:text-purple-600 hover:underline">NTA CUET UG 2026 Online Form</a></li>
                <li><a href="#" className="hover:text-purple-600 hover:underline">UP B.Ed JE 2025 Admission</a></li>
                <li><a href="#" className="hover:text-purple-600 hover:underline">BHU PET 2026 Registration</a></li>
              </ul>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-gray-900 text-white pt-12 pb-6 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 border-b border-gray-800 pb-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-orange-500 rounded flex items-center justify-center font-bold">JA</div>
                <span className="text-xl font-bold">JobAddah</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                India's #1 Education Portal for Sarkari Result, Sarkari Naukri, Admit Cards, and Competitive Exams.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4 text-gray-200">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-rose-400 transition-colors">Latest Jobs</a></li>
                <li><a href="#" className="hover:text-rose-400 transition-colors">Results</a></li>
                <li><a href="#" className="hover:text-rose-400 transition-colors">Admit Card</a></li>
                <li><a href="#" className="hover:text-rose-400 transition-colors">Answer Key</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4 text-gray-200">Apps</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2"><Home size={14} /> Android App</li>
                <li className="flex items-center gap-2"><Home size={14} /> iOS App</li>
                <li className="flex items-center gap-2"><ExternalLink size={14} /> Windows App</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4 text-gray-200">Contact</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2"><Info size={14} /> About Us</li>
                <li className="flex items-center gap-2"><Phone size={14} /> Contact Support</li>
                <li className="flex items-center gap-2"><FileText size={14} /> Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; 2025 Design and Developed by Avverma, All Rights Reserved.</p>
            <p className="mt-2 text-xs opacity-60">Disclaimer: This is a concept for educational purposes.</p>
          </div>
        </div>
      </footer>
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}