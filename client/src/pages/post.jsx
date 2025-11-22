import React, { useEffect, useState } from "react";
import { baseUrl } from "../../util/baseUrl";
import {
  Moon,
  Sun,
  ChevronLeft,
  ExternalLink,
  Calendar,
  Briefcase,
  GraduationCap,
  IndianRupee,
  Users,
  FileText,
  AlertCircle,
  Clock,
  Download,
  Link as LinkIcon,
  CheckCircle,
  Info,
} from "lucide-react";

export default function PostDetail({ idFromProp }) {
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const id = idFromProp || new URLSearchParams(window.location.search).get("_id");

  // -------------------------
  // THEME LOADER
  // -------------------------
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const finalTheme = savedTheme || (prefersDark ? "dark" : "light");

    document.documentElement.classList.toggle("dark", finalTheme === "dark");
    setIsDarkMode(finalTheme === "dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDarkMode ? "dark" : "light";
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
    setIsDarkMode(!isDarkMode);
  };

  // -------------------------
  // FETCH POST DATA
  // -------------------------
  useEffect(() => {
    if (!id) {
      setError("Post ID missing");
      setLoading(false);
      return;
    }

    fetch(`${baseUrl}/api/jobs/jobs/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load post");
        return r.json();
      })
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  // -------------------------
  // HELPER FUNCTIONS
  // -------------------------
  const shouldHideField = (key) => {
    const hiddenFields = ['_id', 'id', '__v', 'createdAt', 'updatedAt', 'pageAuthor', 'tag'];
    return hiddenFields.includes(key);
  };

  const formatLabel = (key) => {
    return key
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .replace(/\b\w/g, (x) => x.toUpperCase())
      .trim();
  };

  const isURL = (val) =>
    typeof val === "string" &&
    (val.startsWith("http://") || val.startsWith("https://"));

  // -------------------------
  // RENDER FUNCTIONS
  // -------------------------

  // Render Important Dates Timeline
  const renderImportantDates = (dates) => {
    if (!Array.isArray(dates) || dates.length === 0) return null;

    return (
      <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-rose-500" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Important Dates</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-200">Event</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-200">Date</th>
              </tr>
            </thead>
            <tbody>
              {dates.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors"
                >
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    {item.label || item.event || '—'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium">
                      <Clock size={14} />
                      {item.value || item.date || '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render Application Fee
  const renderApplicationFee = (fees) => {
    if (!Array.isArray(fees) || fees.length === 0) return null;

    return (
      <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <IndianRupee className="w-5 h-5 text-rose-500" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Application Fee</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-200">Category</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-200">Fee Amount</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((item, idx) => (
                <tr
                  key={idx}
                  className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors"
                >
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {item.category || '—'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm font-bold">
                      {item.amount || item.fee || '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render Vacancy Details
  const renderVacancyDetails = (vacancies) => {
    if (!Array.isArray(vacancies) || vacancies.length === 0) return null;

    return (
      <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="w-5 h-5 text-rose-500" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Vacancy Details</h2>
        </div>
        <div className="space-y-4">
          {vacancies.map((item, idx) => (
            <div
              key={idx}
              className="p-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/30 dark:to-slate-800/10 border border-slate-200 dark:border-slate-700/50 rounded-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-100">
                  {item.postName || item.post || 'Position'}
                </h3>
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-rose-500 text-white rounded-full text-sm font-bold w-fit">
                  <Briefcase size={14} />
                  {item.totalPost || item.vacancies || '0'} Posts
                </span>
              </div>
              {item.eligibility && (
                <div className="mt-2">
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Eligibility: </span>
                    {item.eligibility}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render Important Links
  const renderImportantLinks = (links) => {
    if (!Array.isArray(links) || links.length === 0) return null;

    // Group links by category
    const primaryLinks = links.filter(l => 
      l.label?.toLowerCase().includes('apply') || 
      l.label?.toLowerCase().includes('form') ||
      l.label?.toLowerCase().includes('notification')
    );
    
    const downloadLinks = links.filter(l => 
      l.label?.toLowerCase().includes('download') ||
      l.label?.toLowerCase().includes('admit') ||
      l.label?.toLowerCase().includes('result') ||
      l.label?.toLowerCase().includes('answer')
    );
    
    const otherLinks = links.filter(l => 
      !primaryLinks.includes(l) && !downloadLinks.includes(l)
    );

    return (
      <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <LinkIcon className="w-5 h-5 text-rose-500" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Important Links</h2>
        </div>

        {/* Primary Links */}
        {primaryLinks.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 uppercase tracking-wide">
              Application Links
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {primaryLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 group"
                >
                  <span className="font-medium">{link.label}</span>
                  <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Download Links */}
        {downloadLinks.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 uppercase tracking-wide">
              Download Documents
            </h3>
            <div className="space-y-2">
              {downloadLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-lg transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <Download size={16} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{link.label}</span>
                  </div>
                  <ExternalLink size={14} className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Other Links */}
        {otherLinks.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 uppercase tracking-wide">
              Other Resources
            </h3>
            <div className="space-y-2">
              {otherLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-lg transition-all duration-200 group"
                >
                  <span className="text-sm text-slate-700 dark:text-slate-300">{link.label}</span>
                  <ExternalLink size={14} className="text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render Mode of Selection
  const renderModeOfSelection = (modes) => {
    if (!Array.isArray(modes) || modes.length === 0) return null;

    return (
      <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="w-5 h-5 text-rose-500" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Selection Process</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {modes.map((mode, idx) => (
            <div
              key={idx}
              className="relative p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg"
            >
              <div className="absolute top-2 left-2 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {idx + 1}
              </div>
              <div className="mt-8 text-slate-700 dark:text-slate-300 font-medium text-sm">
                {mode}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render Age Limit
  const renderAgeLimit = (ageData) => {
    if (!ageData || typeof ageData !== 'object') return null;

    return (
      <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-rose-500" />
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Age Limit</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {ageData.minAge && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg">
              <div className="text-sm text-green-700 dark:text-green-300 font-medium mb-1">Minimum Age</div>
              <div className="text-2xl font-bold text-green-800 dark:text-green-200">{ageData.minAge}</div>
            </div>
          )}
          
          {ageData.maxAge && (
            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/30 rounded-lg">
              <div className="text-sm text-orange-700 dark:text-orange-300 font-medium mb-1">Maximum Age</div>
              {typeof ageData.maxAge === 'object' ? (
                <div className="space-y-1">
                  {Object.entries(ageData.maxAge).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="font-semibold text-orange-800 dark:text-orange-200">
                        {formatLabel(key)}:
                      </span>{' '}
                      <span className="text-orange-700 dark:text-orange-300">{value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-2xl font-bold text-orange-800 dark:text-orange-200">{ageData.maxAge}</div>
              )}
            </div>
          )}
        </div>

        {ageData.asOnDate && (
          <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg">
            <span className="text-sm text-blue-700 dark:text-blue-300">
              <span className="font-semibold">Age as on:</span> {ageData.asOnDate}
            </span>
          </div>
        )}

        {ageData.details && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{ageData.details}</p>
          </div>
        )}
      </div>
    );
  };

  // Render Info Card
  const renderInfoCard = (title, content, icon = null) => {
    if (!content) return null;

    return (
      <div className="bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          {icon || <Info className="w-5 h-5 text-rose-500" />}
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{title}</h2>
        </div>
        <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
          {content}
        </div>
      </div>
    );
  };

  // -------------------------
  // LOADING & ERROR STATES
  // -------------------------
  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-800 border-t-rose-500 dark:border-t-rose-400 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 font-medium">Loading details...</p>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-2">
          <AlertCircle size={24} />
          <span className="text-xl font-semibold">Error Loading Post</span>
        </div>
        <p className="text-slate-600 dark:text-slate-400">{error}</p>
        <button
          onClick={() => window.history.back()}
          className="mt-6 px-6 py-2.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
        >
          Go Back
        </button>
      </div>
    );

  if (!post) return null;

  // ----------------------------------------------------------
  // UI STARTS HERE
  // ----------------------------------------------------------
  return (
    <div className={`min-h-screen ${isDarkMode ? "dark bg-slate-950" : "bg-slate-50"}`}>
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => (window.location.href = "/")}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 via-rose-600 to-orange-500 text-white flex items-center justify-center font-bold shadow-lg shadow-rose-500/30 text-lg group-hover:scale-105 transition-transform">
              JA
            </div>
            <div>
              <div className="font-extrabold text-lg tracking-tight">JobAddah</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-medium">
                Smart Sarkari Updates
              </div>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <button
              onClick={() => window.history.back()}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <ChevronLeft size={16} /> Back
            </button>

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-orange-500 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                {post.postName || post.organization || "Job Notification"}
              </h1>
              {post.organization && post.postName && (
                <p className="text-rose-100 text-lg font-medium">{post.organization}</p>
              )}
              {post.notificationNumber && (
                <p className="text-white/80 text-sm mt-1">{post.notificationNumber}</p>
              )}
            </div>
            {post.totalPosts && (
              <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-6 py-4 text-center">
                <div className="text-4xl font-bold">{post.totalPosts}</div>
                <div className="text-sm text-white/90 font-medium mt-1">Total Posts</div>
              </div>
            )}
          </div>
          {post.shortInfo && (
            <p className="mt-4 text-white/95 leading-relaxed text-base">{post.shortInfo}</p>
          )}
        </div>

        {/* Vacancy Details (1) */}
        {post.vacancyDetails && renderVacancyDetails(post.vacancyDetails)}

        {/* Age Limit (2) */}
        {post.ageLimit && renderAgeLimit(post.ageLimit)}

        {/* Application Fee (3) */}
        {post.applicationFee && renderApplicationFee(post.applicationFee)}

        {/* Educational Qualification (4) */}
        {post.educationalQualification && renderInfoCard(
          "Educational Qualification",
          post.educationalQualification,
          <GraduationCap className="w-5 h-5 text-rose-500" />
        )}

        {/* Important Dates (rest) */}
        {post.importantDates && renderImportantDates(post.importantDates)}

        {/* Mode of Selection */}
        {post.modeOfSelection && renderModeOfSelection(post.modeOfSelection)}

        {/* Important Links */}
        {post.importantLinks && renderImportantLinks(post.importantLinks)}

        {/* Official Website */}
        {(post.officialWebsite || post.applyOnlineLink) && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800/30 rounded-xl p-6">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Quick Links</h3>
            <div className="flex flex-wrap gap-3">
              {post.officialWebsite && (
                <a
                  href={post.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Official Website <ExternalLink size={16} />
                </a>
              )}
              {post.applyOnlineLink && post.applyOnlineLink !== post.officialWebsite && (
                <a
                  href={post.applyOnlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Apply Online <ExternalLink size={16} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-12 p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Important Disclaimer</h3>
              <p className="text-sm text-amber-800 dark:text-amber-200/80 leading-relaxed">
                Please verify all information on the official website before applying. JobAddah is not responsible for any discrepancies or changes made by the recruiting organization. Always check the official notification for accurate and updated details.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>© 2025 JobAddah. All rights reserved. | Stay updated with latest sarkari job notifications.</p>
        </div>
      </footer>
    </div>
  );
}
