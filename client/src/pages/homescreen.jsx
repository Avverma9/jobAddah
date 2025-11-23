import React, { useState, useEffect, useMemo } from 'react';
import { Search, Menu, X, Moon, Sun, ChevronRight, ChevronDown, ChevronUp, Bell, ExternalLink, FileText, Award, Briefcase, Download, Home, Info, Phone, Calendar, DollarSign, User, BookOpen, TrendingUp, Clock } from 'lucide-react';
import { baseUrl } from '../../util/baseUrl';

// ============================
// SMART DATA HELPERS
// ============================

const isActualDate = (value) => {
  if (!value || typeof value !== 'string') return false;
  const trimmedValue = value.trim().toLowerCase();
  if (trimmedValue === '') return false;
  
  const placeholderKeywords = [
    'before exam', 'not available', 'n/a', 'na', 'awaited', 
    'will be announced', 'to be announced', 'tba', 'coming soon', 
    'not released', 'not yet', 'soon', 'shortly', 'later', 'after', 'update'
  ];
  
  if (placeholderKeywords.some(keyword => trimmedValue.includes(keyword))) {
    return false;
  }
  
  const datePatterns = [
    /\d{1,2}[-\/\s](jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
    /\d{1,2}[-\/\s]\d{1,2}[-\/\s]\d{2,4}/,
    /\d{4}[-\/\s]\d{1,2}[-\/\s]\d{1,2}/,
    /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2}/i,
    /\d{1,2}(st|nd|rd|th)?\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
    /\d{1,2}\s+(january|february|march|april|may|june|july|august|september|october|november|december)/i
  ];
  
  return datePatterns.some(pattern => pattern.test(trimmedValue));
};

const hasAdmitCard = (job) => {
  if (!job.data?.importantDates) return false;
  const admitCardDate = job.data.importantDates.find(date => {
    const label = date.label?.toLowerCase() || '';
    return (
      label.includes('admit card') ||
      label.includes('hall ticket') ||
      label.includes('call letter') ||
      label.includes('e-admit')
    );
  });
  if (!admitCardDate || !admitCardDate.value) return false;
  return isActualDate(admitCardDate.value);
};

const hasResult = (job) => {
  if (!job.data?.importantDates) return false;
  const resultDate = job.data.importantDates.find(date => {
    const label = date.label?.toLowerCase() || '';
    return (
      label.includes('result') ||
      label.includes('score') ||
      label.includes('merit list') ||
      label.includes('final result') ||
      label.includes('selection list')
    );
  });
  if (!resultDate || !resultDate.value) return false;
  return isActualDate(resultDate.value);
};

const isNewJob = (createdAt) => {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  return (now - created) <= 7 * 24 * 60 * 60 * 1000; // 7 days
};

const extractDates = (job) => {
  const dates = job.data?.importantDates || [];
  
  const findDate = (keywords) => {
    const found = dates.find(d => {
      const label = d.label?.toLowerCase() || '';
      return keywords.some(k => label.includes(k));
    });
    return found?.value || null;
  };

  return {
    postDate: findDate(['notification date', 'post date']),
    lastDate: findDate(['last date', 'closing date']),
    examDate: findDate(['exam date', 'test date', 'cbt date']),
    admitCardDate: findDate(['admit card', 'hall ticket']),
    resultDate: findDate(['result', 'merit list'])
  };
};

// ============================
// LIST ITEM COMPONENT
// ============================

const ListItem = ({ item, colorTheme }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getThemeColors = () => {
    switch (colorTheme) {
      case 'red': return {
        hover: 'group-hover:text-rose-600 dark:group-hover:text-rose-400',
        icon: 'text-rose-500',
        button: 'bg-rose-600 hover:bg-rose-700'
      };
      case 'blue': return {
        hover: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
        icon: 'text-blue-500',
        button: 'bg-blue-600 hover:bg-blue-700'
      };
      case 'green': return {
        hover: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
        icon: 'text-emerald-500',
        button: 'bg-emerald-600 hover:bg-emerald-700'
      };
      default: return {
        hover: 'group-hover:text-gray-600',
        icon: 'text-gray-500',
        button: 'bg-gray-600 hover:bg-gray-700'
      };
    }
  };

  const colors = getThemeColors();

  return (
    <div className="border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div className="group p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
        <div 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-start gap-3"
        >
          <div className={`mt-1 shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
            <ChevronRight size={16} className="text-gray-400 dark:text-gray-500" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-1">
              <h3 className={`text-sm font-semibold text-gray-900 dark:text-gray-100 ${colors.hover} leading-snug line-clamp-2 flex-1`}>
                {item.title}
              </h3>
              {item.isNew && (
                <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded-full animate-pulse shrink-0">
                  NEW
                </span>
              )}
            </div>

            {item.organization && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">
                {item.organization}
              </p>
            )}

            <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
              {item.details.lastDate && (
                <span className="flex items-center gap-1">
                  <Clock size={12} className={colors.icon} />
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {item.details.lastDate}
                  </span>
                </span>
              )}
              {item.details.totalPost && (
                <span className="flex items-center gap-1">
                  <Briefcase size={12} className={colors.icon} />
                  {item.details.totalPost}
                </span>
              )}
            </div>
          </div>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="mt-1 shrink-0 p-1"
          >
            {isExpanded ? 
              <ChevronUp size={16} className="text-gray-400 dark:text-gray-500" /> : 
              <ChevronDown size={16} className="text-gray-400 dark:text-gray-500" />
            }
          </button>
        </div>

        {/* Expandable Details */}
        {isExpanded && (
          <div className="mt-4 ml-7 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {item.details.postDate && (
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Calendar size={14} className={colors.icon} />
                  <span>Post: <span className="font-semibold text-gray-900 dark:text-gray-100">{item.details.postDate}</span></span>
                </div>
              )}
              {item.details.lastDate && (
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Clock size={14} className={colors.icon} />
                  <span>Last: <span className="font-semibold text-red-600 dark:text-red-400">{item.details.lastDate}</span></span>
                </div>
              )}
              {item.details.examDate && (
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Calendar size={14} className={colors.icon} />
                  <span>Exam: <span className="font-semibold text-gray-900 dark:text-gray-100">{item.details.examDate}</span></span>
                </div>
              )}
              {item.details.fee && (
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <DollarSign size={14} className={colors.icon} />
                  <span>Fee: <span className="font-semibold text-gray-900 dark:text-gray-100">{item.details.fee}</span></span>
                </div>
              )}
              {item.details.ageLimit && (
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <User size={14} className={colors.icon} />
                  <span>Age: <span className="font-semibold text-gray-900 dark:text-gray-100">{item.details.ageLimit}</span></span>
                </div>
              )}
              {item.details.totalPost && (
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Briefcase size={14} className={colors.icon} />
                  <span>Posts: <span className="font-semibold text-gray-900 dark:text-gray-100">{item.details.totalPost}</span></span>
                </div>
              )}
            </div>

            {item.details.eligibility && (
              <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-2">
                  <BookOpen size={14} className={`mt-0.5 ${colors.icon} shrink-0`} />
                  <span><span className="font-semibold text-gray-900 dark:text-gray-100">Eligibility:</span> {item.details.eligibility}</span>
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <a
                href={`/post?_id=${item.id}`}
                className={`inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg text-white ${colors.button} shadow-sm hover:shadow transition-all`}
              >
                View Full Details
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================
// SECTION COLUMN COMPONENT
// ============================

const SectionColumn = ({ title, icon: Icon, data, colorTheme, searchQuery }) => {
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    return data.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.organization?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [data, searchQuery]);

  if (searchQuery && filteredData.length === 0) return null;

  const getHeaderColors = () => {
    switch (colorTheme) {
      case 'red': return 'bg-gradient-to-r from-rose-600 to-red-600';
      case 'blue': return 'bg-gradient-to-r from-blue-600 to-indigo-600';
      case 'green': return 'bg-gradient-to-r from-emerald-600 to-green-600';
      default: return 'bg-gradient-to-r from-gray-600 to-gray-700';
    }
  };

  return (
    <div className="flex flex-col rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 h-full">
      <div className={`${getHeaderColors()} p-5 flex items-center justify-between text-white shadow-md`}>
        <div className="flex items-center gap-3">
          <Icon size={22} />
          <h2 className="font-bold text-lg">{title}</h2>
        </div>
        <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
          {filteredData.length}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto max-h-[600px]">
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <ListItem key={item.id} item={item} colorTheme={colorTheme} />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Icon size={48} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm">No updates available</p>
          </div>
        )}
      </div>

      <a 
        href={`/${title.toLowerCase().replace(' ', '-')}`}
        className="p-4 text-center text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 uppercase tracking-wider bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 transition-colors"
      >
        View All {title}
      </a>
    </div>
  );
};

// ============================
// MAIN HOME COMPONENT
// ============================

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rawJobs, setRawJobs] = useState([]);

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const finalTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    document.documentElement.classList.toggle('dark', finalTheme === 'dark');
    setIsDarkMode(finalTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  // Fetch jobs data
  useEffect(() => {
    fetch(`${baseUrl}/get-jobs`)
      .then(res => res.json())
      .then(data => {
        setRawJobs(Array.isArray(data) ? data : data.jobs || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching jobs:', err);
        setLoading(false);
      });
  }, []);

  // Smart data categorization
  const categorizedData = useMemo(() => {
    const results = [];
    const admitCards = [];
    const latestJobs = [];

    rawJobs.forEach(job => {
      const jobData = job.data || job;
      const dates = extractDates(job);
      
      const baseItem = {
        id: job._id || job.id,
        title: job.postName || jobData.organization || 'Job Notification',
        organization: jobData.organization,
        isNew: isNewJob(job.createdAt),
        details: {
          postDate: dates.postDate,
          lastDate: dates.lastDate,
          examDate: dates.examDate,
          totalPost: jobData.totalPosts || 'N/A',
          ageLimit: jobData.ageLimit 
            ? `${jobData.ageLimit.minAge || ''} - ${jobData.ageLimit.maxAge || ''}`
            : 'N/A',
          fee: Array.isArray(jobData.applicationFee) && jobData.applicationFee.length
            ? jobData.applicationFee[0].amount
            : 'N/A',
          eligibility: jobData.educationalQualification || jobData.shortInfo || 'See Notification'
        }
      };

      // Categorize into Results
      if (hasResult(job)) {
        results.push({
          ...baseItem,
          details: {
            ...baseItem.details,
            resultDate: dates.resultDate
          }
        });
      }

      // Categorize into Admit Cards
      if (hasAdmitCard(job)) {
        admitCards.push({
          ...baseItem,
          details: {
            ...baseItem.details,
            admitCardDate: dates.admitCardDate
          }
        });
      }

      // All jobs go to Latest Jobs
      latestJobs.push(baseItem);
    });

    return {
      results: results.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)),
      admitCards: admitCards.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)),
      latestJobs: latestJobs.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)).slice(0, 20)
    };
  }, [rawJobs]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <a href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg hover:scale-105 transition-transform">
                JA
              </div>
              <div className="leading-tight">
                <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-orange-600 dark:from-rose-400 dark:to-orange-400">
                  JobAddah
                </h1>
                <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 tracking-widest uppercase">
                  The No.1 Job Portal
                </p>
              </div>
            </a>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-6">
              <nav className="flex space-x-1">
                {['Home', 'Latest Jobs', 'Results', 'Admit Card', 'Answer Key'].map((nav) => (
                  <a
                    key={nav}
                    href={`/${nav.toLowerCase().replace(' ', '-')}`}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-600 dark:hover:text-rose-400 transition-all"
                  >
                    {nav}
                  </a>
                ))}
              </nav>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-700"></div>
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-yellow-400 transition-colors"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>

            {/* Mobile Menu Button */}
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

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800 animate-in slide-in-from-top-5">
            <div className="px-4 pt-2 pb-4 space-y-1">
              {['Home', 'Latest Jobs', 'Results', 'Admit Card', 'Answer Key'].map((nav) => (
                <a
                  key={nav}
                  href={`/${nav.toLowerCase().replace(' ', '-')}`}
                  className="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-rose-50 dark:hover:bg-gray-800 hover:text-rose-600 dark:hover:text-rose-400"
                >
                  {nav}
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Breaking News Ticker */}
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

      {/* MAIN CONTENT */}
      <main className="flex-grow container mx-auto px-4 py-8 space-y-8">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-sm shadow-sm transition-all"
            placeholder="Search for exams, results, or jobs (e.g., SSC, UPSC, Railway)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: 'Scholarship', color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400', icon: Award },
            { title: 'Admission', color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400', icon: BookOpen },
            { title: 'Syllabus', color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400', icon: FileText },
            { title: 'Answer Key', color: 'bg-pink-100 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400', icon: Download },
          ].map((item) => (
            <a
              key={item.title}
              href={`/${item.title.toLowerCase().replace(' ', '-')}`}
              className={`${item.color} border border-transparent hover:border-current p-5 rounded-xl flex flex-col items-center justify-center text-center gap-2 transition-all hover:shadow-lg hover:-translate-y-1 group`}
            >
              <item.icon size={24} className="opacity-70 group-hover:opacity-100" />
              <span className="font-bold text-sm">{item.title}</span>
            </a>
          ))}
        </div>

        {/* Main Content Columns */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-rose-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading latest updates...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SectionColumn
              title="Result"
              icon={Award}
              data={categorizedData.results}
              colorTheme="red"
              searchQuery={searchQuery}
            />
            <SectionColumn
              title="Admit Card"
              icon={FileText}
              data={categorizedData.admitCards}
              colorTheme="blue"
              searchQuery={searchQuery}
            />
            <SectionColumn
              title="Latest Jobs"
              icon={Briefcase}
              data={categorizedData.latestJobs}
              colorTheme="green"
              searchQuery={searchQuery}
            />
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white pt-12 pb-6 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 border-b border-gray-800 pb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-orange-500 rounded flex items-center justify-center font-bold">JA</div>
                <span className="text-xl font-bold">JobAddah</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                India's #1 Education Portal for Sarkari Result, Sarkari Naukri, Admit Cards, and Competitive Exams.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="/latest-jobs" className="hover:text-rose-400 transition-colors">Latest Jobs</a></li>
                <li><a href="/results" className="hover:text-rose-400 transition-colors">Results</a></li>
                <li><a href="/admit-card" className="hover:text-rose-400 transition-colors">Admit Card</a></li>
                <li><a href="/answer-key" className="hover:text-rose-400 transition-colors">Answer Key</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Apps</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2"><Home size={14} /> Android App</li>
                <li className="flex items-center gap-2"><Home size={14} /> iOS App</li>
                <li className="flex items-center gap-2"><ExternalLink size={14} /> Windows App</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Contact</h4>
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

      {/* Animations */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
