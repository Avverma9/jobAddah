// React import removed - not needed
import SEO from '@/lib/SEO';
import { AlertTriangle, Ban, CheckCircle, Eye, FileText, Gavel, Scale, Shield } from "lucide-react";

export default function Terms() {
  const sections = [
    {
      icon: CheckCircle,
      title: "1. Acceptance of Terms",
      subtitle: "Agreement",
      content: `
        By accessing and using Jobsaddah, you accept and agree to be bound by the terms and provision of this agreement. 
        
        If you do not agree to abide by the above, please do not use this service. Your continued use of the site signifies your acceptance of these terms.
      `,
    },
    {
      icon: FileText,
      title: "2. Use License",
      subtitle: "Permitted Use",
      content: `
        Permission is granted to temporarily download one copy of the materials (information or software) on Jobsaddah for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.

        Under this license you may **NOT**:
        • Modify or copy the materials.
        • Use the materials for any commercial purpose or for any public display.
        • Attempt to decompile, reverse engineer, disassemble, or decode any information.
        • Remove any copyright, trademark, or other proprietary notations.
        • Transfer the materials to another person or 'mirror' the materials on any other server.
        • Use any manual process to monitor or copy our web pages.
      `,
    },
    {
      icon: AlertTriangle,
      title: "3. Disclaimer",
      subtitle: "As Is Basis",
      content: `
        The materials on Jobsaddah are provided on an 'as is' basis. Jobsaddah makes no warranties, expressed or implied, and hereby disclaims all other warranties including merchantability or fitness for a particular purpose.

        • **Job Listings:** All job listings are aggregated from public sources. Jobsaddah is not responsible for the accuracy, completeness, or legitimacy of job postings.
        • **Verification:** Candidates are strongly advised to verify information directly with the recruiting organization before applying or paying any fees.
      `,
    },
    {
      icon: Ban,
      title: "4. Limitations of Liability",
      subtitle: "Damages",
      content: `
        In no event shall Jobsaddah or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Jobsaddah.
        
        This applies even if Jobsaddah or an authorized representative has been notified orally or in writing of the possibility of such damage.
      `,
    },
    {
      icon: Eye,
      title: "5. Accuracy of Materials",
      subtitle: "Errors & Omissions",
      content: `
        The materials appearing on Jobsaddah could include technical, typographical, or photographic errors. 
        
        Jobsaddah does not warrant that any of the materials on its website are accurate, complete, or current. We may make changes to the materials contained on its website at any time without notice.
      `,
    },
    {
      icon: Shield,
      title: "6. Prohibited Activities",
      subtitle: "User Conduct",
      content: `
        You agree not to engage in any of the following activities while using our platform:

        • Uploading viruses, malware, or malicious code.
        • Harassing or causing distress or inconvenience to any person.
        • Creating fraudulent job applications or fake profiles.
        • Posting misleading, false, or scam-related information.
        • Attempting unauthorized access to our systems or servers.
        • Spamming or executing excessive automated requests (DDoS).
      `,
    },
    {
      icon: Ban,
      title: "7. Termination of Access",
      subtitle: "Suspension",
      content: `
        Jobsaddah reserves the right to terminate or suspend any user's access to the website immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
        
        All provisions of the Terms which by their nature should survive termination shall survive termination.
      `,
    },
    {
      icon: Gavel,
      title: "8. Governing Law",
      subtitle: "Jurisdiction",
      content: `
        These terms and conditions are governed by and construed in accordance with the laws of India.
        
        You irrevocably consent to the exclusive jurisdiction of the courts in that location for any disputes arising out of or relating to the use of this website.
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
      <SEO title="Terms of Service — JobsAddah" />
      
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
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
             </span>
             <span className="text-blue-200 text-xs font-semibold uppercase tracking-widest">Legal Agreement</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-none text-white">
            Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">Service</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed mx-auto md:mx-0">
            Please read these terms carefully before using our platform. By accessing Jobsaddah, you agree to these conditions.
          </p>
        </div>
      </div>

      <div className="relative z-20 max-w-6xl mx-auto px-6 -mt-20">
        
       
        
        {/* Last Updated Card */}
        <div className="bg-white/80 backdrop-blur-md border border-white/20 p-1 rounded-2xl shadow-xl mb-16">
          <div className="bg-white rounded-xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-start border border-slate-100">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center border border-blue-100 shadow-inner">
               <Scale className="text-blue-600" size={28} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-bold text-slate-900 mb-1">User Agreement</h3>
              <p className="text-slate-600 leading-relaxed">
                This document governs your relationship with Jobsaddah. Accessing or using our services indicates your acceptance of these Terms.
                <span className="block mt-1 text-sm text-slate-400 font-medium">Last updated: December 13, 2025</span>
              </p>
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
                    Have questions about these terms?
                </h2>
                <p className="text-slate-400 mb-10 max-w-2xl mx-auto text-lg">
                    If you need clarification on any part of our Terms of Service, please contact our support team.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <a href="mailto:av95766@gmail.com" className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg shadow-white/10">
                        Email Legal Team
                    </a>
                    <a href="mailto:av95766@gmail.com" className="inline-flex items-center justify-center px-8 py-4 bg-slate-800 text-white border border-slate-700 rounded-xl font-semibold hover:bg-slate-700 transition-colors">
                        Contact Support
                    </a>
                </div>

                <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} Jobsaddah. All Rights Reserved.</p>
                    <div className="flex gap-6">
                        <span className="cursor-pointer hover:text-white transition-colors">Privacy Policy</span>
                        <span className="cursor-pointer hover:text-white transition-colors">Sitemap</span>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}