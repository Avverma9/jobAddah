// React import removed - not needed
import SEO from "@/lib/SEO";
import Link from 'next/link';
import { CheckCircle, Eye, FileText, Globe, Lock, Shield, Trash2, Zap } from "lucide-react";

export default function PrivacyPolicy() {
  const sections = [
    {
      icon: Eye,
      title: "1. Information We Process",
      subtitle: "Public & Minimal",
      content: `
        Jobsaddah is strictly an aggregator platform. We **DO NOT** collect personally identifiable information (PII) such as name, email address, phone number, or educational details.

        The only data we process is strictly minimal:
        
        • **Public Job Data:** Aggregated job postings sourced exclusively from public internet websites.
        • **Usage Data:** Anonymous metrics on pages visited and time spent, used solely for improvement.
        • **Technical Data:** IP address and browser type for security and reliable content delivery.
        • **Cookies:** Minimal cookies used strictly to maintain your session preferences.
      `,
    },
    {
      icon: Globe,
      title: "2. Source of Job Postings",
      subtitle: "Aggregation Only",
      content: `
        Our primary purpose is to gather publicly available job information from the open internet.

        • **Source Transparency:** Listings are collected from public sources, third-party boards, and career pages.
        • **No Verification:** We do not create or verify the content. We simply index what is publicly available.
        • **Redirection:** Clicking a job instantly redirects you to the original source. We do not handle applications.
      `,
    },
    {
      icon: Lock,
      title: "3. Security Measures",
      subtitle: "Data Protection",
      content: `
        We are committed to securing the minimal data we process:
        
        • **PII Exemption:** We do not store PII, significantly reducing data breach risks.
        • **Encryption:** Industry-standard SSL/TLS encryption for all data transmission.
        • **Log Security:** Logs are stored securely, accessed only for maintenance, and rotated regularly.
        • **Minimalism:** Our best defense is collecting only what is absolutely necessary.
      `,
    },
    {
      icon: FileText,
      title: "4. Third-Party Links",
      subtitle: "External Privacy",
      content: `
        Every job listing is a link to an external website.

        • **External Control:** We are not responsible for the privacy practices of external sites.
        • **User Caution:** Always review the privacy policy of the destination site before applying.
        • **Independent Entities:** Jobsaddah is not affiliated with the companies whose jobs are aggregated.
      `,
    },
    {
      icon: Zap,
      title: "5. Usage of Data",
      subtitle: "Optimization",
      content: `
        Technical and anonymous data is used exclusively to:
        
        • Optimize website speed, performance, and search relevance.
        • Detect and prevent malicious bot activity.
        • Improve our aggregation algorithms based on anonymous trends.
        • Ensure the platform remains free and accessible to all.
      `,
    },
    {
      icon: Trash2,
      title: "6. Data Retention",
      subtitle: "Compliance",
      content: `
        Our retention policy follows a strict "necessity only" rule:
        
        • **Job Data:** Deleted immediately when the source indicates expiry.
        • **Technical Logs:** Retained for a maximum of 90 days for troubleshooting, then permanently erased.
        • **No User Accounts:** No profile data exists to be retained.
      `,
    },
  ];

  // Helper to parse bold text within the content string
  const renderContent = (text) => {
    return text.trim().split('\n').map((line, idx) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return null;

      // Function to render text with **bold** support
      const processText = (str) => {
        const parts = str.split('**');
        return parts.map((part, i) => 
          i % 2 === 1 ? <strong key={i} className="text-slate-900 font-bold">{part}</strong> : part
        );
      };

      if (trimmedLine.startsWith('•')) {
        return (
          <div key={idx} className="flex items-start gap-3 mb-3 last:mb-0">
            <div className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
            <p className="flex-1 text-slate-600 leading-relaxed text-[15px]">
              {processText(trimmedLine.substring(1).trim())}
            </p>
          </div>
        );
      }

      return (
        <p key={idx} className="text-slate-600 leading-relaxed mb-4 last:mb-0 text-[15px]">
          {processText(trimmedLine)}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      <SEO title="Privacy Policy — JobsAddah" />
      
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 mix-blend-multiply"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 mix-blend-multiply"></div>
      </div>

      {/* Hero Header */}
      <div className="relative bg-slate-900 text-white pt-24 pb-32 px-6 overflow-hidden">
        {/* Abstract shapes in header */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100"></div>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-500 to-transparent opacity-20"></div>
        
        <div className="relative max-w-6xl mx-auto text-center md:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 mb-6 backdrop-blur-md">
             <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
             </span>
             <span className="text-blue-200 text-xs font-semibold uppercase tracking-widest">Transparency Report</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-none text-white">
            Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">Policy</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed mx-auto md:mx-0">
            We believe in an open internet. Jobsaddah aggregates public data <span className="text-slate-200 font-medium">without</span> compromising your personal privacy.
          </p>
        </div>
      </div>

      <div className="relative z-20 max-w-6xl mx-auto px-6 -mt-20">
     
        
        {/* Last Updated Card */}
        <div className="bg-white/80 backdrop-blur-md border border-white/20 p-1 rounded-2xl shadow-xl mb-16">
          <div className="bg-white rounded-xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-start border border-slate-100">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border border-blue-100 shadow-inner">
               <Shield className="text-blue-600" size={28} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Our Commitment to Privacy</h3>
              <p className="text-slate-600 leading-relaxed">
                Jobsaddah (&ldquo;we,&rdquo; &ldquo;us&rdquo;) operates strictly as a data aggregator. We do not collect PII. 
                <span className="block mt-1 text-sm text-slate-400 font-medium">Last updated: December 13, 2025</span>
              </p>
            </div>
            <div className="hidden md:block h-12 w-px bg-slate-200 mx-4"></div>
            <div className="flex flex-col gap-2 min-w-[140px]">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle size={16} className="text-teal-500" /> No PII Stored
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle size={16} className="text-teal-500" /> Public Data Only
                </div>
            </div>
          </div>
        </div>

     

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-24">
          {sections.map((section, idx) => (
            <div
              key={idx}
              className="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-100 transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              {/* Hover Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-slate-50 text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-blue-500/30 group-hover:scale-110">
                    <section.icon size={24} />
                  </div>
                  <div>
                      <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {section.title}
                      </h2>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-blue-400 transition-colors">
                        {section.subtitle}
                      </p>
                  </div>
                </div>
                
                <div className="pl-1">
                    {renderContent(section.content)}
                </div>
              </div>
            </div>
          ))}
        </div>

      
        {/* Contact Footer */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-2xl mb-20">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-blue-600/30 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-teal-600/20 rounded-full blur-[80px]"></div>

            <div className="relative z-10 px-8 py-16 md:p-16 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                    Transparency is our priority.
                </h2>
                <p className="text-slate-400 mb-10 max-w-2xl mx-auto text-lg">
                    If you have questions about our aggregation methods or data policies, our team is ready to answer.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <a href="mailto:av95766@gmail.com" className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg shadow-white/10">
                        Email Privacy Team
                    </a>
                    <a href="mailto:av95766@gmail.com" className="inline-flex items-center justify-center px-8 py-4 bg-slate-800 text-white border border-slate-700 rounded-xl font-semibold hover:bg-slate-700 transition-colors">
                        Contact Support
                    </a>
                </div>

                <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} Jobsaddah. Built for transparency.</p>
                    <div className="flex gap-6">
                        <Link href="/terms" className="cursor-pointer hover:text-white transition-colors">Terms</Link>
                        <span className="cursor-pointer hover:text-white transition-colors">Sitemap</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}