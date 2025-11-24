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
        icon: 'text-rose-500 dark:text-rose-400',
        button: 'bg-rose-600 hover:bg-rose-700'
      };
      case 'blue': return {
        hover: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
        icon: 'text-blue-500 dark:text-blue-400',
        button: 'bg-blue-600 hover:bg-blue-700'
      };
      case 'green': return {
        hover: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
        icon: 'text-emerald-500 dark:text-emerald-400',
        button: 'bg-emerald-600 hover:bg-emerald-700'
      };
      default: return {
        hover: 'group-hover:text-gray-600 dark:group-hover:text-gray-300',
        icon: 'text-gray-500 dark:text-gray-400',
        button: 'bg-gray-600 hover:bg-gray-700'
      };
    }
  };

  const colors = getThemeColors();

  return (
    <div className="group" onClick={() => setIsExpanded(!isExpanded)}>
      <div className="p-4 cursor-pointer bg-white dark:bg-gray-800 group-hover:bg-gray-50 dark:group-hover:bg-gray-800/50 transition-colors duration-200">
        <div className="flex items-start gap-4">
          <div className={`mt-1.5 shrink-0 transition-transform duration-300 ease-in-out ${isExpanded ? 'rotate-90' : ''}`}>
            <ChevronRight size={16} className="text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className={`text-sm font-semibold text-gray-800 dark:text-gray-100 ${colors.hover} leading-snug line-clamp-2 flex-1 transition-colors`}>
                {item.title}
              </h3>
              {item.isNew && (
                <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded-full shrink-0">
                  NEW
                </span>
              )}
            </div>

            {item.organization && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">
                {item.organization}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-gray-400">
              {item.details.lastDate && (
                <span className="flex items-center gap-1.5">
                  <Clock size={12} className={colors.icon} />
                  <span>Last Date:</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {item.details.lastDate}
                  </span>
                </span>
              )}
              {item.details.totalPost && (
                <span className="flex items-center gap-1.5">
                  <Briefcase size={12} className={colors.icon} />
                  <span>Posts:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{item.details.totalPost}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Details */}
      {isExpanded && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 animate-in slide-in-from-top-2 duration-200">
          <div className="ml-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
              {item.details.postDate && (
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Calendar size={14} className={colors.icon} />
                  <span>Post Date:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{item.details.postDate}</span>
                </div>
              )}
              {item.details.examDate && (
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Calendar size={14} className={colors.icon} />
                  <span>Exam Date:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{item.details.examDate}</span>
                </div>
              )}
              {item.details.fee && (
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <DollarSign size={14} className={colors.icon} />
                  <span>Fee:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{item.details.fee}</span>
                </div>
              )}
              {item.details.ageLimit && (
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <User size={14} className={colors.icon} />
                  <span>Age Limit:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">{item.details.ageLimit}</span>
                </div>
              )}
            </div>

            {item.details.eligibility && (
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-2">
                  <BookOpen size={14} className={`mt-0.5 ${colors.icon} shrink-0`} />
                  <div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Eligibility:</span>
                    <span className="ml-1">{item.details.eligibility}</span>
                  </div>
                </p>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <a
                href={`/post?_id=${item.id}`}
                className={`inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg text-white ${colors.button} shadow-md hover:shadow-lg transition-all transform hover:scale-105`}
              >
                View Full Details
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
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
      case 'red': return 'bg-gradient-to-r from-rose-500 to-red-500';
      case 'blue': return 'bg-gradient-to-r from-blue-500 to-indigo-500';
      case 'green': return 'bg-gradient-to-r from-emerald-500 to-green-500';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 h-full transform hover:-translate-y-1 transition-transform duration-300">
      <div className={`${getHeaderColors()} p-5 flex items-center justify-between text-white`}>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <Icon size={20} />
          </div>
          <h2 className="font-bold text-lg">{title}</h2>
        </div>
        <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
          {filteredData.length}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto max-h-[600px] divide-y divide-gray-100 dark:divide-gray-700">
        {filteredData.length > 0 ? (
          filteredData.map((item) => (
            <ListItem key={item.id} item={item} colorTheme={colorTheme} />
          ))
        ) : (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center h-full">
            <Icon size={48} className="mx-auto mb-4 opacity-10" />
            <p className="text-sm font-semibold">No updates available</p>
            <p className="text-xs">Please check back later.</p>
          </div>
        )}
      </div>

      <a 
        href={`/${title.toLowerCase().replace(' ', '-')}`}
        className="p-4 text-center text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white uppercase tracking-wider bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        View All {title}
      </a>
    </div>
  );
};

// ============================
// MAIN HOME COMPONENT
// ============================

import Header from '../components/Header';

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [rawJobs, setRawJobs] = useState([]);

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
      <Header />

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
        <div className="max-w-3xl mx-auto p-2 bg-gradient-to-r from-rose-50 to-orange-50 dark:from-rose-900/20 dark:to-orange-900/20 rounded-2xl">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-rose-500 dark:text-rose-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-14 pr-4 py-5 border-2 border-transparent rounded-xl bg-white/80 dark:bg-gray-800/80 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-rose-500/30 focus:border-rose-500 text-base shadow-sm transition-all"
              placeholder="Search for any exam, result, or job..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { title: 'Scholarship', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800', icon: Award },
            { title: 'Admission', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800', icon: BookOpen },
            { title: 'Syllabus', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800', icon: FileText },
            { title: 'Answer Key', color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-pink-200 dark:border-pink-800', icon: Download },
          ].map((item) => (
            <a
              key={item.title}
              href={`/${item.title.toLowerCase().replace(' ', '-')}`}
              className={`${item.color} border-2 p-5 rounded-xl flex flex-col items-center justify-center text-center gap-3 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-xl group`}
            >
              <div className="p-3 bg-white/50 dark:bg-gray-900/30 rounded-full">
                <item.icon size={28} />
              </div>
              <span className="font-bold text-sm tracking-wide">{item.title}</span>
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
      <footer className="bg-gray-800 dark:bg-gray-900 text-white mt-16">
        <div className="container mx-auto px-4 pt-16 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-8">
            {/* Column 1: Brand & Social */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-500 rounded-lg flex items-center justify-center font-bold text-lg shadow-lg">
                  JA
                </div>
                <span className="text-2xl font-bold">JobAddah</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Your one-stop portal for the latest government job alerts, results, and exam resources in India.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h4 className="font-bold text-lg mb-4 tracking-wide text-gray-200">Quick Links</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="/latest-jobs" className="hover:text-rose-400 transition-colors flex items-center gap-2"><ChevronRight size={14} /> Latest Jobs</a></li>
                <li><a href="/results" className="hover:text-rose-400 transition-colors flex items-center gap-2"><ChevronRight size={14} /> Results</a></li>
                <li><a href="/admit-card" className="hover:text-rose-400 transition-colors flex items-center gap-2"><ChevronRight size={14} /> Admit Cards</a></li>
                <li><a href="/answer-key" className="hover:text-rose-400 transition-colors flex items-center gap-2"><ChevronRight size={14} /> Answer Keys</a></li>
                <li><a href="/syllabus" className="hover:text-rose-400 transition-colors flex items-center gap-2"><ChevronRight size={14} /> Syllabus</a></li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div>
              <h4 className="font-bold text-lg mb-4 tracking-wide text-gray-200">Resources</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="/admission" className="hover:text-rose-400 transition-colors flex items-center gap-2"><ChevronRight size={14} /> Admission</a></li>
                <li><a href="/scholarship" className="hover:text-rose-400 transition-colors flex items-center gap-2"><ChevronRight size={14} /> Scholarship</a></li>
              </ul>
            </div>
            
            {/* Column 4: Legal */}
            <div>
              <h4 className="font-bold text-lg mb-4 tracking-wide text-gray-200">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><a href="#" className="hover:text-rose-400 transition-colors flex items-center gap-2"><ChevronRight size={14} /> About Us</a></li>
                <li><a href="#" className="hover:text-rose-400 transition-colors flex items-center gap-2"><ChevronRight size={14} /> Contact Us</a></li>
                <li><a href="#" className="hover:text-rose-400 transition-colors flex items-center gap-2"><ChevronRight size={14} /> Privacy Policy</a></li>
                <li><a href="#" className="hover:text-rose-400 transition-colors flex items-center gap-2"><ChevronRight size={14} /> Terms of Service</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 pt-8 mt-8 text-center text-gray-500 text-sm">
            <p className="font-semibold text-gray-300">
              © 2025 JobAddah — All Rights Reserved.
            </p>
            <p className="mt-3 text-xs max-w-2xl mx-auto">
              <span className="font-bold">Disclaimer:</span> The information provided on JobAddah is for general informational purposes only. While we strive to keep the information up-to-date and correct, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability or availability with respect to the website or the information, products, services, or related graphics contained on the website for any purpose. Any reliance you place on such information is therefore strictly at your own risk.
            </p>
            <p className="mt-4 text-xs">
              Developed by <a href="https://github.com/avverma" target="_blank" rel="noopener noreferrer" className="font-semibold text-rose-400 hover:underline">Avverma</a>
            </p>
          </div>
        </div>
      </footer>

      {/* Animations */}
      <style>{`
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
