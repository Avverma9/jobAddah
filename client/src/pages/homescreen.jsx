import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, ChevronRight, Award, FileText, Briefcase, Download, BookOpen, ExternalLink, Clock, Calendar, TrendingUp } from 'lucide-react';
import { baseUrl } from '../../util/baseUrl';
import Header from '../components/Header';

// LocalStorage ke liye helper functions
const VISIT_STORAGE_KEY = 'jobAddah_visit_counts';

const getVisitCounts = () => {
  try {
    const stored = localStorage.getItem(VISIT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error reading visit counts:', error);
    return {};
  }
};

const incrementVisitCount = (jobId) => {
  try {
    const counts = getVisitCounts();
    counts[jobId] = (counts[jobId] || 0) + 1;
    localStorage.setItem(VISIT_STORAGE_KEY, JSON.stringify(counts));
    return counts[jobId];
  } catch (error) {
    console.error('Error updating visit count:', error);
    return 0;
  }
};

const getTopVisitedIds = (limit = 10) => {
  const counts = getVisitCounts();
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);
};

const extractJobData = (job) => {
  const lastDate = job.importantDates?.length 
    ? job.importantDates.find(d => d.label?.toLowerCase().includes('last'))?.value || job.importantDates[0]?.value
    : 'Check Details';

  const examDate = job.importantDates?.find(d => d.label?.toLowerCase().includes('exam'))?.value;
  const applicationFee = job.applicationFee?.[0]?.amount || 0;
  const maxAge = job.ageLimit?.maxAge || '';

  return {
    id: job._id,
    title: job.postTitle || 'Notification',
    organization: job.organization || '',
    totalPosts: job.totalVacancyCount || 0,
    lastDate,
    postType: job.postType || 'JOB',
    createdAt: job.createdAt,
    isNew: isNewJob(job.createdAt),
    allFields: [
      ...(examDate ? [{ label: 'Exam Date', value: examDate }] : []),
      ...(applicationFee > 0 ? [{ label: 'Application Fee', value: `₹${applicationFee}` }] : []),
      ...(maxAge ? [{ label: 'Max Age', value: maxAge }] : []),
      ...(job.vacancyDetails?.[0]?.postName ? [{ label: 'Posts', value: job.vacancyDetails[0].postName }] : [])
    ]
  };
};

const isNewJob = (createdAt) => {
  if (!createdAt) return false;
  const created = new Date(createdAt).getTime();
  const now = Date.now();
  return (now - created) <= 3 * 24 * 60 * 60 * 1000;
};

const ListItem = ({ item, colorTheme, showTrending = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getThemeColors = () => {
    switch (colorTheme) {
      case 'red': return { text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100', btn: 'bg-rose-600 hover:bg-rose-700' };
      case 'blue': return { text: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', btn: 'bg-blue-600 hover:bg-blue-700' };
      case 'green': return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', btn: 'bg-emerald-600 hover:bg-emerald-700' };
      case 'orange': return { text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', btn: 'bg-orange-600 hover:bg-orange-700' };
      case 'pink': return { text: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-100', btn: 'bg-pink-600 hover:bg-pink-700' };
      case 'purple': return { text: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', btn: 'bg-purple-600 hover:bg-purple-700' };
      default: return { text: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-100', btn: 'bg-gray-600 hover:bg-gray-700' };
    }
  };

  const theme = getThemeColors();

  const handleViewDetails = (e) => {
    incrementVisitCount(item.id);
  };

  return (
    <div className="group border-b border-gray-100 dark:border-gray-700 last:border-0">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex gap-3">
          <ChevronRight size={18} className={`mt-0.5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          
          <div className="flex-1">
            <div className="flex justify-between items-start gap-2">
              <h3 className={`text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:${theme.text} leading-snug`}>
                {item.title}
              </h3>
              <div className="flex items-center gap-1">
                {showTrending && (
                  <span className="text-[10px] font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                    <TrendingUp size={10} /> HOT
                  </span>
                )}
                {item.isNew && <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">NEW</span>}
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
              {item.lastDate && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar size={12} />
                  <span>Last Date: <span className="font-medium text-red-500">{item.lastDate}</span></span>
                </div>
              )}
              {item.totalPosts > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Briefcase size={12} />
                  <span>Posts: <span className="font-medium text-gray-700 dark:text-gray-300">{item.totalPosts}</span></span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pl-10 bg-gray-50/50 dark:bg-gray-800/30">
          {item.organization && (
            <p className="text-xs text-gray-500 mb-2 font-medium">{item.organization}</p>
          )}
          
          <div className="grid grid-cols-2 gap-2 mb-3">
            {item.allFields.map((field, i) => (
              <div key={i} className="text-xs bg-white dark:bg-gray-800 p-2 rounded border border-gray-100 dark:border-gray-700">
                <span className="text-gray-400 block">{field.label}</span>
                <span className="text-gray-700 dark:text-gray-200 font-medium">{field.value}</span>
              </div>
            ))}
          </div>

          <a 
            href={`/post?_id=${item.id}`}
            onClick={handleViewDetails}
            className={`inline-flex items-center gap-1.5 text-xs font-bold text-white px-4 py-2 rounded-lg shadow-sm transition-transform active:scale-95 ${theme.btn}`}
          >
            View Details <ExternalLink size={12} />
          </a>
        </div>
      )}
    </div>
  );
};

const SectionColumn = ({ title, icon: Icon, data, colorTheme, showTrending = false, postType }) => {
  const getHeaderStyle = () => {
    switch (colorTheme) {
      case 'red': return 'bg-gradient-to-r from-rose-600 to-red-500 shadow-rose-200';
      case 'blue': return 'bg-gradient-to-r from-blue-600 to-indigo-500 shadow-blue-200';
      case 'green': return 'bg-gradient-to-r from-emerald-600 to-green-500 shadow-emerald-200';
      case 'orange': return 'bg-gradient-to-r from-orange-600 to-amber-500 shadow-orange-200';
      case 'pink': return 'bg-gradient-to-r from-pink-600 to-rose-500 shadow-pink-200';
      case 'purple': return 'bg-gradient-to-r from-purple-600 to-violet-500 shadow-purple-200';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
      <div className={`${getHeaderStyle()} p-4 text-white flex justify-between items-center shadow-md z-10`}>
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm"><Icon size={18} /></div>
          <h2 className="font-bold text-lg tracking-wide">{title}</h2>
        </div>
        <span className="text-xs font-bold bg-white/20 px-2.5 py-1 rounded-full">{data.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
        {data.length > 0 ? (
          data.slice(0, 20).map(item => <ListItem key={item.id} item={item} colorTheme={colorTheme} showTrending={showTrending} />)
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
            <Icon size={32} className="mb-2 opacity-20" />
            <p className="text-sm font-medium">No updates yet</p>
          </div>
        )}
      </div>

      <Link to={`/view-all?type=${postType}`} className="block p-3 text-center text-xs font-bold text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700 border-t border-gray-100 dark:border-gray-700 uppercase tracking-wider transition-colors">
        View All {title}
      </Link>
    </div>
  );
};

const QuickCard = ({ icon: Icon, title, color }) => {
  const colorMap = {
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    pink: 'bg-pink-50 text-pink-600 border-pink-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
  };
  
  return (
    <a href="#" className={`flex flex-col items-center justify-center p-4 rounded-xl border ${colorMap[color]} hover:shadow-md transition-all cursor-pointer`}>
      <Icon size={24} className="mb-2" />
      <span className="font-bold text-sm">{title}</span>
    </a>
  );
};

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [apiData, setApiData] = useState([]);

  useEffect(() => {
    fetch(`${baseUrl}/get-all`)
      .then(res => res.json())
      .then(data => {
        const jobs = Array.isArray(data) ? data : (data.jobs || []);
        setApiData(jobs);
        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  }, []);

  const categorized = useMemo(() => {
    const results = [];
    const admitCards = [];
    const latestJobs = [];
    const answerKeys = [];
    const admissions = [];
    const scholarships = [];
    const topVisited = [];

    // Top 10 most visited job IDs
    const topVisitedIds = getTopVisitedIds(10);

    apiData.forEach(rawJob => {
      const job = extractJobData(rawJob);
      
      if (searchQuery && !job.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return; 
      }

      // Check if this job is in top visited
      if (topVisitedIds.includes(job.id)) {
        topVisited.push(job);
      }

      // Categorize by postType field
      if (job.postType === 'RESULT' || job.postType === 'ANSWER_KEY') {
        if (job.postType === 'ANSWER_KEY') {
          answerKeys.push(job);
        } else {
          results.push(job);
        }
      } else if (job.postType === 'ADMIT_CARD') {
        admitCards.push(job);
      } else if (job.postType === 'ADMISSION') {
        admissions.push(job);
      } else if (job.postType === 'SCHOLARSHIP') {
        scholarships.push(job);
      } else {
        latestJobs.push(job);
      }
    });

    // Sort topVisited by actual visit count
    const visitCounts = getVisitCounts();
    topVisited.sort((a, b) => (visitCounts[b.id] || 0) - (visitCounts[a.id] || 0));

    return { results, admitCards, latestJobs, answerKeys, admissions, scholarships, topVisited };
  }, [apiData, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans">
      <Header />

      <div className="bg-gradient-to-r from-blue-700 to-blue-600 text-white text-sm py-2 shadow-md overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-blue-700 to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-blue-600 to-transparent z-10"></div>
        <div className="animate-marquee whitespace-nowrap flex gap-10 items-center px-4">
          {categorized.latestJobs.slice(0, 5).map((job, i) => (
            <span key={i} className="flex items-center gap-2 font-medium">
              <Bell size={14} className="fill-yellow-400 text-yellow-400 animate-pulse" /> {job.title}
            </span>
          ))}
          {categorized.latestJobs.length === 0 && <span>Welcome to JobAddah - India's No.1 Job Portal</span>}
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        
        <div className="space-y-6">
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-4 rounded-2xl border-0 shadow-lg ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400 text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200"
              placeholder="Search for jobs, admit cards, results..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickCard icon={BookOpen} title="Syllabus" color="orange" />
            <QuickCard icon={FileText} title="Answer Key" color="pink" />
            <QuickCard icon={Award} title="Scholarship" color="purple" />
            <QuickCard icon={ExternalLink} title="Admission" color="blue" />
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 font-medium">Loading updates...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Visited Section - Shows only if there are visited posts */}
            {categorized.topVisited.length > 0 && (
              <div className="grid grid-cols-1 gap-6">
                <SectionColumn 
                  title="Recent visits" 
                  icon={TrendingUp} 
                  data={categorized.topVisited} 
                  colorTheme="orange"
                  showTrending={true}
                  postType="ALL"
                />
              </div>
            )}

            {/* First Row - 3 Columns: Result, Admit Card, Latest Jobs */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <SectionColumn 
                title="Result" 
                icon={Award} 
                data={categorized.results} 
                colorTheme="red" 
                postType="RESULT"
              />
              <SectionColumn 
                title="Admit Card" 
                icon={FileText} 
                data={categorized.admitCards} 
                colorTheme="blue" 
                postType="ADMIT_CARD"
              />
              <SectionColumn 
                title="Latest Jobs" 
                icon={Briefcase} 
                data={categorized.latestJobs} 
                colorTheme="green" 
                postType="JOB"
              />
            </div>

            {/* Second Row - 3 Columns: Answer Keys, Admission, Scholarships */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <SectionColumn 
                title="Answer Keys" 
                icon={FileText} 
                data={categorized.answerKeys} 
                colorTheme="pink" 
                postType="ANSWER_KEY"
              />
              <SectionColumn 
                title="Admission" 
                icon={BookOpen} 
                data={categorized.admissions} 
                colorTheme="purple" 
                postType="ADMISSION"
              />
              <SectionColumn 
                title="Scholarships" 
                icon={Award} 
                data={categorized.scholarships} 
                colorTheme="blue" 
                postType="SCHOLARSHIP"
              />
            </div>
          </div>
        )}

      </main>

      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 mt-12 py-8 text-center text-gray-500 text-sm">
        <p>© 2025 JobAddah. All rights reserved.</p>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}