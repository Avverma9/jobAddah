import React, { useEffect, useState, useMemo } from "react";
import { baseUrl } from "../../util/baseUrl";
import Header from "../components/Header";
import AdSlot from "../components/AdSlot";
import {
  ExternalLink, Calendar, Briefcase, GraduationCap, IndianRupee, 
  Users, FileText, AlertCircle, Download, Link as LinkIcon, 
  Building2, Hash, CheckCircle, MapPin, Clock, Award
} from "lucide-react";

export default function PostDetail({ idFromProp }) {
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);

  const id = idFromProp || new URLSearchParams(window.location.search).get("_id");

  useEffect(() => {
    if (!id) {
      setError("Post ID missing");
      setLoading(false);
      return;
    }

    fetch(`${baseUrl}/posts/${id}`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load post");
        return response.json();
      })
      .then((data) => {
        setPost(cleanData(data.data || data));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  // Clean internal data (no _id showing)
  const cleanData = (data) => {
    if (!data) return data;
    const cleaned = { ...data };
    const ignoreKeys = ['_id', '__v', 'id', 'createdAt', 'updatedAt', 'isLive'];
    ignoreKeys.forEach(key => delete cleaned[key]);
    
    Object.keys(cleaned).forEach(key => {
      if (Array.isArray(cleaned[key])) {
        cleaned[key] = cleaned[key].map(cleanData);
      } else if (cleaned[key] && typeof cleaned[key] === 'object') {
        cleaned[key] = cleanData(cleaned[key]);
      }
    });
    return cleaned;
  };

  const structuredData = useMemo(() => {
    if (!post) return {};
    return {
      title: post.postTitle || post.title || post.name,
      organization: post.organization || post.org || post.company,
      totalVacancies: post.totalVacancyCount || post.totalPosts || post.vacancies,
      shortInfo: post.shortInfo || post.description || post.summary,
      importantDates: post.importantDates || post.dates || [],
      ageLimit: post.ageLimit,
      applicationFee: post.applicationFee || post.fees || [],
      vacancyDetails: post.vacancyDetails || post.vacancies || [],
      qualification: post.educationalQualification || post.qualification,
      importantLinks: post.importantLinks || post.links || [],
      postType: post.postType || post.type
    };
  }, [post]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-orange-50 to-yellow-50 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="w-20 h-20 border-4 border-orange-300 dark:border-gray-600 border-t-orange-600 dark:border-t-orange-400 rounded-full animate-spin mx-auto mb-6 shadow-xl" />
        <h2 className="text-2xl font-bold text-orange-800 dark:text-gray-200 mb-2">Loading Job Details</h2>
        <p className="text-orange-600 dark:text-gray-400">Please wait while we fetch latest information...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-red-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-8">
        <AlertCircle size={64} className="mx-auto text-red-500 dark:text-red-400 mb-6" />
        <h1 className="text-3xl font-bold text-red-800 dark:text-gray-100 mb-4">Post Not Found</h1>
        <p className="text-lg text-red-700 dark:text-gray-400 mb-8">{error || 'Unable to load job details'}</p>
        <button 
          onClick={() => window.history.back()}
          className="px-8 py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 dark:from-gray-700 dark:to-gray-600 dark:hover:from-gray-600 dark:hover:to-gray-500 text-white font-bold text-xl rounded-xl shadow-2xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200"
        >
          ← Back to Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-yellow-50 to-white dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <Header />
      
      {/* Hero Banner - SarkariResult Style */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-orange-500 text-white py-6 px-4 shadow-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 min-w-0">
              {structuredData.postType && (
                <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold mb-3">
                  📋 {structuredData.postType}
                </span>
              )}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight line-clamp-2">
                {structuredData.title}
              </h1>
              {structuredData.organization && (
                <p className="text-lg mt-2 opacity-90 flex items-center">
                  <Building2 size={20} className="inline mr-2 -ml-1 flex-shrink-0" />
                  <span className="truncate">{structuredData.organization}</span>
                </p>
              )}
            </div>
            {structuredData.totalVacancies && (
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-6 text-center shadow-2xl flex-shrink-0">
                <div className="text-4xl md:text-5xl font-black drop-shadow-2xl">
                  {structuredData.totalVacancies.toLocaleString()}
                </div>
                <div className="text-sm uppercase tracking-wider font-bold mt-1 opacity-90">Posts</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Short Info */}
        {structuredData.shortInfo && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-orange-200 dark:border-gray-700 p-6 lg:p-8 mb-8">
            <div className="text-lg text-gray-800 dark:text-gray-200 leading-relaxed">
              {structuredData.shortInfo}
            </div>
          </div>
        )}

        {/* Main Left-Right Layout - SarkariResult Style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-12">
          {/* LEFT COLUMN - Priority Info */}
          <div className="lg:pr-4 space-y-6">
            {/* Important Dates Table */}
            {structuredData.importantDates?.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4 text-white">
                  <div className="flex items-center gap-3">
                    <Calendar size={22} />
                    <h2 className="text-xl font-bold">Important Dates</h2>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider w-2/3">Event</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {structuredData.importantDates.map((item, idx) => (
                        <tr key={idx} className="hover:bg-orange-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {item.label}
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300 px-4 py-2 rounded-full text-sm font-bold inline-block">
                              {item.value}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Age Limit Cards */}
            {structuredData.ageLimit && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-3">
                  <Users size={22} /> Age Limit
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {structuredData.ageLimit.minAge && (
                    <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-700 rounded-xl hover:shadow-lg transition-all">
                      <div className="text-3xl lg:text-4xl font-black text-green-600 dark:text-green-400 mb-2">
                        {structuredData.ageLimit.minAge}
                      </div>
                      <div className="text-sm font-bold text-green-800 dark:text-green-300 uppercase tracking-wider">
                        Minimum Age
                      </div>
                    </div>
                  )}
                  {structuredData.ageLimit.maxAge && (
                    <div className="text-center p-6 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-700 rounded-xl hover:shadow-lg transition-all">
                      <div className="text-3xl lg:text-4xl font-black text-orange-600 dark:text-orange-400 mb-2">
                        {structuredData.ageLimit.maxAge}
                      </div>
                      <div className="text-sm font-bold text-orange-800 dark:text-orange-300 uppercase tracking-wider">
                        Maximum Age
                      </div>
                    </div>
                  )}
                </div>
                {structuredData.ageLimit.asOnDate && (
                  <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-blue-800 dark:text-blue-400 font-semibold flex items-center gap-2">
                      📅 Age as on: <span className="font-black text-blue-900 dark:text-blue-300">{structuredData.ageLimit.asOnDate}</span>
                    </p>
                  </div>
                )}
                {structuredData.ageLimit.details && (
                  <p className="mt-4 text-sm text-gray-700 dark:text-gray-400 italic leading-relaxed">
                    {structuredData.ageLimit.details}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - Forms & Priority Links */}
          <div className="lg:pl-4 space-y-6">
            {/* Application Fee Table */}
            {structuredData.applicationFee?.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-4 text-white">
                  <div className="flex items-center gap-3">
                    <IndianRupee size={22} />
                    <h2 className="text-xl font-bold">Application Fee</h2>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {structuredData.applicationFee.map((item, idx) => (
                        <tr key={idx} className="hover:bg-green-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.category}</div>
                            {item.note && (
                              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{item.note}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="text-2xl font-black text-green-600 dark:text-green-400">
                              ₹{item.amount?.toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Important Links - Apply Buttons First */}
            {structuredData.importantLinks?.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 lg:p-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-3">
                  <LinkIcon size={22} /> Important Links
                </h3>
                <div className="space-y-3">
                  {structuredData.importantLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-200"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                          <ExternalLink size={20} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-lg line-clamp-1">{link.label}</div>
                          <div className="text-sm opacity-90 truncate">{link.url}</div>
                        </div>
                      </div>
                      <span className="font-bold text-lg ml-4">→</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vacancy Details - Full Width Table */}
        {structuredData.vacancyDetails?.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-12">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 text-white">
              <div className="flex items-center gap-3">
                <Briefcase size={22} />
                <h2 className="text-xl font-bold">Vacancy Details</h2>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Post Name</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider w-32">Total Posts</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">Eligibility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {structuredData.vacancyDetails.slice(0, 8).map((item, idx) => (
                    <tr key={idx} className="hover:bg-purple-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-5">
                        <div className="font-bold text-gray-900 dark:text-gray-100 text-lg line-clamp-2">{item.postName}</div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 px-6 py-3 rounded-full font-bold text-xl mx-auto w-fit shadow-sm">
                          {item.totalPost}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{item.eligibility}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {structuredData.vacancyDetails.length > 8 && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 text-center text-sm text-gray-600 dark:text-gray-400 font-semibold border-t border-gray-200 dark:border-gray-700">
                  +{structuredData.vacancyDetails.length - 8} more posts →
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ad Slot */}
        <div className="max-w-4xl mx-auto mb-12">
          <AdSlot
            client={import.meta.env.VITE_ADSENSE_CLIENT}
            slot={import.meta.env.VITE_ADSENSE_SLOT}
            style={{ display: 'block', width: '100%', height: '120px' }}
            className="rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
          />
        </div>

        {/* Disclaimer */}
        <div className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-950 border-4 border-orange-200 dark:border-orange-800/50 rounded-3xl p-8 lg:p-12 text-center">
          <AlertCircle size={48} className="mx-auto text-orange-600 dark:text-orange-400 mb-6 shadow-lg" />
          <h2 className="text-2xl lg:text-3xl font-black text-orange-900 dark:text-orange-200 mb-4">
            ⚠️ Important Notice
          </h2>
          <p className="text-lg lg:text-xl text-orange-800 dark:text-orange-300 max-w-4xl mx-auto leading-relaxed font-medium">
            Always verify details from the <strong>official notification</strong> before applying. 
            JobAddah provides information for convenience and is not responsible for any changes made by recruiting organizations.
          </p>
        </div>
      </div>
    </div>
  );
}
