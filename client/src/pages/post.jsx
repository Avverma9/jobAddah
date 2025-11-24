import React, { useEffect, useState } from "react";
import { baseUrl } from "../../util/baseUrl";
import Header from "../components/Header";
import {
  ChevronLeft, ExternalLink, Calendar, Briefcase,
  GraduationCap, IndianRupee, Users, FileText, AlertCircle,
  Clock, Download, Link as LinkIcon, CheckCircle, Info, MapPin,
  Building2, Hash
} from "lucide-react";

export default function PostDetail({ idFromProp }) {
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);

  const id = idFromProp || new URLSearchParams(window.location.search).get("_id");

  // Fetch post data
  useEffect(() => {
    if (!id) {
      setError("Post ID missing");
      setLoading(false);
      return;
    }

    fetch(`${baseUrl}/jobs/${id}`)
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

  // Helper functions
  const formatLabel = (key) => {
    return key
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .replace(/\b\w/g, (x) => x.toUpperCase())
      .trim();
  };

  // ============================
  // RENDER FUNCTIONS
  // ============================

  // Render Important Dates - Compact Table
  const renderImportantDates = (dates) => {
    if (!Array.isArray(dates) || dates.length === 0) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-full">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <Calendar className="w-5 h-5" />
            <h2 className="text-lg font-bold">Important Dates</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {dates.map((item, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.label || item.event || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400 font-semibold">
                    {item.value || item.date || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Render Age Limit - Compact Box
  const renderAgeLimit = (ageData) => {
    if (!ageData || typeof ageData !== 'object') return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden h-full">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <Users className="w-5 h-5" />
            <h2 className="text-lg font-bold">Age Limit</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 mb-4">
            {ageData.minAge && (
              <div className="border-2 border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                <div className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase mb-1">
                  Minimum Age
                </div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {ageData.minAge}
                </div>
              </div>
            )}
            
            {ageData.maxAge && (
              <div className="border-2 border-orange-200 dark:border-orange-800 rounded-lg p-4 bg-orange-50 dark:bg-orange-900/20">
                <div className="text-xs font-semibold text-orange-700 dark:text-orange-300 uppercase mb-1">
                  Maximum Age
                </div>
                {typeof ageData.maxAge === 'object' ? (
                  <div className="space-y-1">
                    {Object.entries(ageData.maxAge).map(([key, value]) => (
                      <div key={key} className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-semibold">{formatLabel(key)}:</span>{' '}
                        <span className="text-orange-600 dark:text-orange-400 font-bold">{value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {ageData.maxAge}
                  </div>
                )}
              </div>
            )}
          </div>

          {ageData.asOnDate && (
            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold">Age as on:</span>{' '}
                <span className="text-blue-600 dark:text-blue-400 font-bold">{ageData.asOnDate}</span>
              </span>
            </div>
          )}

          {ageData.details && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                {ageData.details}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Application Fee
  const renderApplicationFee = (fees) => {
    if (!Array.isArray(fees) || fees.length === 0) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <IndianRupee className="w-5 h-5" />
            <h2 className="text-lg font-bold">Application Fee</h2>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-2/3">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider w-1/3">
                  Fee Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {fees.map((item, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                    {item.category || '—'}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-green-600 dark:text-green-400">
                    {item.amount || item.fee || '—'}
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <Briefcase className="w-5 h-5" />
            <h2 className="text-lg font-bold">Vacancy Details</h2>
          </div>
        </div>
        <div className="p-6 space-y-6">
          {vacancies.map((item, idx) => (
            <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-900 px-6 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                    {item.postName || item.post || 'Position'}
                  </h3>
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold w-fit">
                    <Briefcase size={16} />
                    {item.totalPost || item.vacancies || '0'} Posts
                  </span>
                </div>
              </div>
              
              {item.categoryBreakup && (
                <div className="p-6">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-3">
                    Category-wise Breakup
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {Object.entries(item.categoryBreakup).map(([category, count]) => (
                      <div
                        key={category}
                        className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg text-center"
                      >
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          {formatLabel(category)}
                        </div>
                        <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                          {count}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {item.eligibility && (
                <div className="px-6 pb-6">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    <span className="font-semibold">Eligibility: </span>
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

  // Render Educational Qualification
  const renderQualification = (qualification) => {
    if (!qualification) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <GraduationCap className="w-5 h-5" />
            <h2 className="text-lg font-bold">Educational Qualification</h2>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {qualification}
          </p>
        </div>
      </div>
    );
  };

  // Render Selection Process
  const renderModeOfSelection = (modes) => {
    if (!Array.isArray(modes) || modes.length === 0) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <CheckCircle className="w-5 h-5" />
            <h2 className="text-lg font-bold">Selection Process</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {modes.map((mode, idx) => (
              <div
                key={idx}
                className="relative border-2 border-indigo-200 dark:border-indigo-800 rounded-lg p-4 bg-indigo-50 dark:bg-indigo-900/20 hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors"
              >
                <div className="absolute -top-3 -left-3 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
                  {idx + 1}
                </div>
                <div className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100 text-center">
                  {mode}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render Important Links
  const renderImportantLinks = (links) => {
    if (!Array.isArray(links) || links.length === 0) return null;

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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 px-6 py-4">
          <div className="flex items-center gap-2 text-white">
            <LinkIcon className="w-5 h-5" />
            <h2 className="text-lg font-bold">Important Links</h2>
          </div>
        </div>
        <div className="p-6 space-y-6">
          {primaryLinks.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase mb-3 flex items-center gap-2">
                <div className="w-1 h-4 bg-red-500 rounded"></div>
                Application Links
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {primaryLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 group"
                  >
                    <span className="font-semibold text-sm">{link.label}</span>
                    <ExternalLink size={16} className="group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {downloadLinks.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase mb-3 flex items-center gap-2">
                <div className="w-1 h-4 bg-blue-500 rounded"></div>
                Download Documents
              </h3>
              <div className="space-y-2">
                {downloadLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Download size={16} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {link.label}
                      </span>
                    </div>
                    <ExternalLink size={14} className="text-gray-400 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {otherLinks.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase mb-3 flex items-center gap-2">
                <div className="w-1 h-4 bg-gray-500 rounded"></div>
                Other Resources
              </h3>
              <div className="space-y-2">
                {otherLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200 group"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {link.label}
                    </span>
                    <ExternalLink size={14} className="text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============================
  // LOADING & ERROR STATES
  // ============================

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-800 border-t-red-500 dark:border-t-red-400 rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 font-medium">Loading details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <div className="flex items-center gap-3 text-red-600 dark:text-red-400 mb-2">
          <AlertCircle size={24} />
          <span className="text-xl font-semibold">Error Loading Post</span>
        </div>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
        <button
          onClick={() => window.history.back()}
          className="mt-6 px-6 py-2.5 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!post) return null;

  const jobData = post.data || post;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-8 text-white shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-3">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold mb-3">
                <Hash size={14} />
                {jobData.notificationNumber || 'Official Notification'}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 leading-tight">
                {post.postName || jobData.organization || "Job Notification"}
              </h1>
              {jobData.organization && post.postName && (
                <div className="flex items-center gap-2 text-white/90 text-lg font-medium">
                  <Building2 size={18} />
                  {jobData.organization}
                </div>
              )}
            </div>
            {jobData.totalPosts && (
              <div className="bg-white dark:bg-gray-800 rounded-xl px-6 py-4 text-center shadow-lg border-4 border-white/20">
                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                  {jobData.totalPosts}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold mt-1">
                  Total Posts
                </div>
              </div>
            )}
          </div>
          {jobData.shortInfo && (
            <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <p className="text-white leading-relaxed">{jobData.shortInfo}</p>
            </div>
          )}
        </div>

        {/* 🎯 SIDE BY SIDE: Important Dates (Left) + Age Limit (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT: Important Dates */}
          <div>
            {jobData.importantDates && renderImportantDates(jobData.importantDates)}
          </div>

          {/* RIGHT: Age Limit */}
          <div>
            {jobData.ageLimit && renderAgeLimit(jobData.ageLimit)}
          </div>
        </div>

        {/* Application Fee (Below Important Dates & Age Limit) */}
        {jobData.applicationFee && renderApplicationFee(jobData.applicationFee)}

        {/* Vacancy Details */}
        {jobData.vacancyDetails && renderVacancyDetails(jobData.vacancyDetails)}

        {/* Educational Qualification */}
        {jobData.educationalQualification && renderQualification(jobData.educationalQualification)}

        {/* Selection Process */}
        {jobData.modeOfSelection && renderModeOfSelection(jobData.modeOfSelection)}

        {/* Important Links */}
        {jobData.importantLinks && renderImportantLinks(jobData.importantLinks)}

        {/* Quick Links */}
        {(jobData.officialWebsite || jobData.applyOnlineLink) && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4 text-lg">
              Official Links
            </h3>
            <div className="flex flex-wrap gap-3">
              {jobData.officialWebsite && (
                <a
                  href={jobData.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  <Building2 size={18} />
                  Official Website
                  <ExternalLink size={16} />
                </a>
              )}
              {jobData.applyOnlineLink && jobData.applyOnlineLink !== jobData.officialWebsite && (
                <a
                  href={jobData.applyOnlineLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all"
                >
                  <FileText size={18} />
                  Apply Online
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-2 text-lg">
                Important Disclaimer
              </h3>
              <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
                Please verify all information on the official website before applying. JobAddah is not responsible for any discrepancies or changes made by the recruiting organization. Always check the official notification for accurate and updated details.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 mt-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p className="font-medium">
            © 2025 JobAddah. All rights reserved. | Stay updated with latest sarkari job notifications.
          </p>
        </div>
      </footer>
    </div>
  );
}
