import React, { useEffect, useState } from "react";
import { baseUrl } from "../../util/baseUrl";
import Header from "../components/Header";
import {
  ChevronLeft, ExternalLink, Calendar, Briefcase,
  GraduationCap, IndianRupee, Users, FileText, AlertCircle,
  Clock, Download, Link as LinkIcon, CheckCircle, Info, MapPin,
  Building2, Hash, TrendingUp
} from "lucide-react";

export default function PostDetail({ idFromProp }) {
  const [loading, set_loading] = useState(true);
  const [post, set_post] = useState(null);
  const [error, set_error] = useState(null);

  const id = idFromProp || new URLSearchParams(window.location.search).get("_id");

  useEffect(() => {
    if (!id) {
      set_error("Post ID missing");
      set_loading(false);
      return;
    }

    fetch(`${baseUrl}/posts/${id}`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load post");
        return response.json();
      })
      .then((data) => {
        set_post(data.data);
        set_loading(false);
      })
      .catch((err) => {
        set_error(err.message);
        set_loading(false);
      });
  }, [id]);

  // Update document head with dynamic meta tags and JSON-LD for SEO
  useEffect(() => {
    if (!post) return;

    const domain = "https://yourdomain.com";
    const pageUrl = `${domain}/post?_id=${post._id}`;
    const title = `${post.postTitle || 'Job Notification'} — JobAddah`;
    const description = post.shortInfo || (post.postTitle ? `${post.postTitle} | Apply online and get details` : 'Latest job notification and exam updates');

    // helper to create or update meta tags
    const upsertMeta = (attr, name, content) => {
      let el;
      if (attr === 'name') el = document.querySelector(`meta[name="${name}"]`);
      else el = document.querySelector(`meta[property="${name}"]`);
      if (el) el.setAttribute('content', content || '');
      else {
        el = document.createElement('meta');
        if (attr === 'name') el.setAttribute('name', name);
        else el.setAttribute('property', name);
        el.setAttribute('content', content || '');
        document.head.appendChild(el);
      }
      return el;
    };

    const prevTitle = document.title;
    document.title = title;

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', 'index, follow');
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:type', 'article');
    upsertMeta('property', 'og:url', pageUrl);
    upsertMeta('property', 'og:image', `${domain}/og-image.png`);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', `${domain}/og-image.png`);

    // canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', pageUrl);

    // JSON-LD JobPosting
    const ldId = 'job-posting-json-ld';
    let ld = document.getElementById(ldId);
    if (ld) ld.remove();

    const jobPosting = {
      '@context': 'https://schema.org/',
      '@type': 'JobPosting',
      title: post.postTitle || 'Job Notification',
      description: post.shortInfo || post.postTitle || '',
      datePosted: post.createdAt || undefined,
      validThrough: post.applicationLastDate || post.validThrough || undefined,
      employmentType: post.postType || undefined,
      hiringOrganization: {
        '@type': 'Organization',
        name: post.organization || 'JobAddah',
        sameAs: domain
      },
      jobLocation: post.jobLocation || (post.district && { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: post.district } }) || undefined,
      baseSalary: post.salary ? { '@type': 'MonetaryAmount', currency: 'INR', value: { '@type': 'QuantitativeValue', value: post.salary } } : undefined,
      employmentType: post.employmentType || undefined,
      identifier: post._id ? { '@type': 'PropertyValue', name: 'JobAddah', value: post._id } : undefined,
      url: pageUrl
    };

    ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.id = ldId;
    ld.text = JSON.stringify(jobPosting);
    document.head.appendChild(ld);

    return () => {
      document.title = prevTitle;
      // Note: we don't remove tags other than the JSON-LD to avoid removing site-wide tags.
      const ldEl = document.getElementById(ldId);
      if (ldEl) ldEl.remove();
    };
  }, [post]);

  const format_label = (key) => {
    return key
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .trim();
  };

  const render_value = (value) => {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value.toString();
    }
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc list-inside space-y-1">
          {value.map((item, index) => (
            <li key={index} className="text-xs">{render_value(item)}</li>
          ))}
        </ul>
      );
    }
    if (typeof value === 'object' && value !== null) {
      return (
        <div className="space-y-1 text-xs">
          {Object.entries(value).map(([key, val]) => (
            <div key={key} className="flex gap-2">
              <span className="font-semibold text-gray-600 dark:text-gray-400">{format_label(key)}:</span>
              <span className="text-gray-700 dark:text-gray-300">{render_value(val)}</span>
            </div>
          ))}
        </div>
      );
    }
    return '—';
  };

  const render_important_dates = (dates) => {
    if (!Array.isArray(dates) || dates.length === 0) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-900 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3 flex items-center gap-2 text-white">
          <Calendar size={16} />
          <h2 className="font-bold text-sm">Important Dates</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Event</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {dates.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-3 py-2 font-medium text-gray-900 dark:text-gray-100">{item.label || '—'}</td>
                  <td className="px-3 py-2 text-red-600 dark:text-red-400 font-bold">{item.value || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const render_age_limit = (age_data) => {
    if (!age_data || typeof age_data !== 'object') return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-900 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-4 py-3 flex items-center gap-2 text-white">
          <Users size={16} />
          <h2 className="font-bold text-sm">Age Limit</h2>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {age_data.minAge && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <div className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase">Min Age</div>
                <div className="text-xl font-bold text-green-600 dark:text-green-400">{age_data.minAge}</div>
              </div>
            )}
            {age_data.maxAge && (
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3">
                <div className="text-[10px] font-bold text-orange-700 dark:text-orange-400 uppercase">Max Age</div>
                <div className="text-xl font-bold text-orange-600 dark:text-orange-400">{age_data.maxAge}</div>
              </div>
            )}
          </div>
          {age_data.asOnDate && (
            <div className="text-xs bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-2">
              <span className="font-semibold text-blue-700 dark:text-blue-400">Age as on: </span>
              <span className="text-blue-600 dark:text-blue-300">{age_data.asOnDate}</span>
            </div>
          )}
          {age_data.details && (
            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{age_data.details}</p>
          )}
        </div>
      </div>
    );
  };

  const render_application_fee = (fees) => {
    if (!Array.isArray(fees) || fees.length === 0) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-900 overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 flex items-center gap-2 text-white">
          <IndianRupee size={16} />
          <h2 className="font-bold text-sm">Application Fee</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Category</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {fees.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{item.category || '—'}</td>
                  <td className="px-3 py-2 font-bold text-green-600 dark:text-green-400">₹{item.amount || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const render_vacancy_details = (vacancies) => {
    if (!Array.isArray(vacancies) || vacancies.length === 0) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-purple-200 dark:border-purple-900 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 flex items-center gap-2 text-white">
          <Briefcase size={16} />
          <h2 className="font-bold text-sm">Vacancy Details</h2>
        </div>
        <div className="p-4 space-y-4">
          {vacancies.map((item, idx) => (
            <div key={idx} className="border border-purple-200 dark:border-purple-900 rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-900 px-4 py-2.5 border-b border-purple-200 dark:border-purple-900 flex items-center justify-between">
                <h3 className="font-bold text-sm text-gray-900 dark:text-gray-100">{item.postName || 'Position'}</h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-600 text-white rounded text-xs font-bold">
                  <Briefcase size={12} /> {item.totalPost || '0'}
                </span>
              </div>

              {item.categoryBreakdown && (
                <div className="p-4 border-b border-purple-100 dark:border-purple-900">
                  <h4 className="text-[10px] font-bold text-gray-700 dark:text-gray-300 uppercase mb-2">Category-wise</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(item.categoryBreakdown).map(([category, count]) => (
                      <div key={category} className="p-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded text-center">
                        <div className="text-[9px] font-medium text-gray-600 dark:text-gray-400">{format_label(category)}</div>
                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{count}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {item.eligibility && (
                <div className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">Eligibility: </span>{item.eligibility}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const render_qualification = (qualification) => {
    if (!qualification) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-cyan-200 dark:border-cyan-900 overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3 flex items-center gap-2 text-white">
          <GraduationCap size={16} />
          <h2 className="font-bold text-sm">Educational Qualification</h2>
        </div>
        <div className="p-4 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{qualification}</div>
      </div>
    );
  };

  const render_mode_of_selection = (modes) => {
    if (!Array.isArray(modes) || modes.length === 0) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-indigo-200 dark:border-indigo-900 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-3 flex items-center gap-2 text-white">
          <CheckCircle size={16} />
          <h2 className="font-bold text-sm">Selection Process</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {modes.map((mode, idx) => (
              <div key={idx} className="relative border-2 border-indigo-200 dark:border-indigo-800 rounded-lg p-3 bg-indigo-50 dark:bg-indigo-900/20 text-center">
                <div className="absolute -top-2.5 -left-2.5 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</div>
                <div className="text-xs font-medium text-gray-900 dark:text-gray-100 mt-1">{mode}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const render_important_links = (links) => {
    if (!Array.isArray(links) || links.length === 0) return null;

    const primary_links = links.filter(l => 
      l.label?.toLowerCase().includes('apply') || 
      l.label?.toLowerCase().includes('form') ||
      l.label?.toLowerCase().includes('notification')
    );
    
    const download_links = links.filter(l => 
      l.label?.toLowerCase().includes('download') ||
      l.label?.toLowerCase().includes('admit') ||
      l.label?.toLowerCase().includes('result') ||
      l.label?.toLowerCase().includes('answer')
    );
    
    const other_links = links.filter(l => 
      !primary_links.includes(l) && !download_links.includes(l)
    );

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-900 overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-orange-500 px-4 py-3 flex items-center gap-2 text-white">
          <LinkIcon size={16} />
          <h2 className="font-bold text-sm">Important Links</h2>
        </div>
        <div className="p-4 space-y-4">
          {primary_links.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2 flex items-center gap-2">
                <div className="w-0.5 h-3 bg-red-500"></div> Application
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {primary_links.map((link, idx) => (
                  <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-lg text-xs font-bold group transition-all">
                    <span className="truncate">{link.label}</span>
                    <ExternalLink size={12} className="group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {download_links.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2 flex items-center gap-2">
                <div className="w-0.5 h-3 bg-blue-500"></div> Downloads
              </h3>
              <div className="space-y-1.5">
                {download_links.map((link, idx) => (
                  <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs group">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded flex-shrink-0">
                        <Download size={12} className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-gray-900 dark:text-gray-100 truncate font-medium">{link.label}</span>
                    </div>
                    <ExternalLink size={11} className="text-gray-400 group-hover:text-blue-600 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {other_links.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase mb-2 flex items-center gap-2">
                <div className="w-0.5 h-3 bg-gray-500"></div> Others
              </h3>
              <div className="space-y-1.5">
                {other_links.map((link, idx) => (
                  <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-xs group">
                    <span className="text-gray-700 dark:text-gray-300">{link.label}</span>
                    <ExternalLink size={11} className="text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const render_other_details = (post_data) => {
    const handled_keys = [
      'slug', 'postTitle', 'organization', 'totalVacancyCount', 'shortInfo',
      'importantDates', 'ageLimit', 'applicationFee', 'vacancyDetails',
      'educationalQualification', 'modeOfSelection', 'importantLinks',
      '_id', '__v', 'isLive', 'postType', 'createdAt', 'updatedAt','districtWiseData'
    ];
    
    const other_details = Object.entries(post_data).filter(([key, value]) => {
      if (handled_keys.includes(key)) return false;
      if (value === null || value === undefined) return false;
      if (Array.isArray(value) && value.length === 0) return false;
      if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return false;
      return true;
    });

    if (other_details.length === 0) return null;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-500 to-gray-600 px-4 py-3 flex items-center gap-2 text-white">
          <Info size={16} />
          <h2 className="font-bold text-sm">Other Information</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {other_details.map(([key, value]) => (
                <tr key={key} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-3 py-2.5 font-semibold text-gray-700 dark:text-gray-300 w-1/3">{format_label(key)}</td>
                  <td className="px-3 py-2.5 text-gray-900 dark:text-gray-100">{render_value(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-12 h-12 border-3 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 font-medium">Loading details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
          <AlertCircle size={20} />
          <span className="font-semibold">Error Loading Post</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
        <button onClick={() => window.history.back()}
          className="mt-6 px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm font-medium transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />

      <main className="max-w-6xl mx-auto px-3 py-6 space-y-4">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-xl p-5 text-white">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              {post.slug && (
                <div className="inline-flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full text-xs font-semibold mb-2 mb-2">
                  <Hash size={12} /> {post.slug}
                </div>
              )}
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 leading-tight line-clamp-3">
                {post.postTitle || "Job Notification"}
              </h1>
              {post.organization && (
                <div className="flex items-center gap-1.5 text-white/90 text-sm font-medium">
                  <Building2 size={16} /> {post.organization}
                </div>
              )}
            </div>
            {post.totalVacancyCount && (
              <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-3 text-center shadow-lg flex-shrink-0">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{post.totalVacancyCount}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 font-semibold">Posts</div>
              </div>
            )}
          </div>
          {post.shortInfo && (
            <div className="mt-3 p-3 bg-white/10 rounded-lg border border-white/20 text-xs text-white leading-relaxed">
              {post.shortInfo}
            </div>
          )}
        </div>

        {/* 2 Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>{post.importantDates && render_important_dates(post.importantDates)}</div>
          <div>{post.ageLimit && render_age_limit(post.ageLimit)}</div>
        </div>

        {/* Single Column Sections */}
        {post.applicationFee && render_application_fee(post.applicationFee)}
        {post.vacancyDetails && render_vacancy_details(post.vacancyDetails)}
        {post.educationalQualification && render_qualification(post.educationalQualification)}
        {post.modeOfSelection && render_mode_of_selection(post.modeOfSelection)}
        {post.importantLinks && render_important_links(post.importantLinks)}
        {render_other_details(post)}

        {/* Disclaimer */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-amber-900 dark:text-amber-100 mb-1 text-sm">Important Disclaimer</h3>
              <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                Verify all information on the official website before applying. JobAddah is not responsible for discrepancies or changes made by the recruiting organization. Always check the official notification for accurate details.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 mt-8 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-3 py-4 text-center text-xs text-gray-600 dark:text-gray-400 font-medium">
          © 2025 JobAddah. All rights reserved. | Stay updated with latest sarkari job notifications.
        </div>
      </footer>
    </div>
  );
}