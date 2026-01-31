import React from "react";
import Link from "next/link"; // Standard Next.js Link
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Mail, 
  ShieldAlert,
  MapPin,
  ExternalLink
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 border-t border-slate-200 pt-16 pb-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- Top Section: Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* --- Col 1: Brand & Mission (SEO Rich) --- */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="bg-blue-700 text-white p-2 rounded-lg shadow-sm group-hover:bg-blue-800 transition-colors">
                 <span className="font-bold text-xl tracking-tighter">JA</span>
              </div>
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Jobs<span className="text-blue-700">Addah</span>
              </span>
            </Link>
            <p className="text-slate-600 text-sm leading-relaxed">
              India's most trusted portal for <strong>Sarkari Naukri</strong>, Competitive Exam Results, Admit Cards, and Private Job vacancies. We provide fast, accurate, and verified recruitment updates.
            </p>
            <div className="flex gap-4 pt-2">
              <SocialLink href="#" icon={<Twitter size={18} />} label="Twitter" />
              <SocialLink href="#" icon={<Facebook size={18} />} label="Facebook" />
              <SocialLink href="#" icon={<Instagram size={18} />} label="Instagram" />
              <SocialLink href="https://t.me/yourtelegram" icon={<ExternalLink size={18} />} label="Telegram" />
            </div>
          </div>

          {/* --- Col 2: Job Categories (Internal Linking) --- */}
          <div>
            <h3 className="font-bold text-slate-900 mb-6 uppercase text-sm tracking-wider">Browse Jobs</h3>
            <ul className="space-y-3">
              <FooterLink href="/post">Sarkari Result Sections</FooterLink>
              <FooterLink href="/view-all">View All Notifications</FooterLink>
              <FooterLink href="/search">Search Jobs</FooterLink>
              <FooterLink href="/tools/typing">Typing Test Practice</FooterLink>
              <FooterLink href="/tools/resume">Resume Builder</FooterLink>
            </ul>
          </div>

          {/* --- Col 3: Student Resources (High Value) --- */}
          <div>
            <h3 className="font-bold text-slate-900 mb-6 uppercase text-sm tracking-wider">Student Corner</h3>
            <ul className="space-y-3">
              <FooterLink href="/tools/image">Passport Photo Tools</FooterLink>
              <FooterLink href="/tools/resume">AI Resume Builder</FooterLink>
              <FooterLink href="/tools/typing">Typing Speed Test</FooterLink>
              <FooterLink href="/about">About JobsAddah</FooterLink>
              <FooterLink href="/contact">Support & Corrections</FooterLink>
            </ul>
          </div>

          {/* --- Col 4: Legal & Support (AdSense Mandatory) --- */}
          <div>
            <h3 className="font-bold text-slate-900 mb-6 uppercase text-sm tracking-wider">Legal & Contact</h3>
            <ul className="space-y-3">
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/contact">Contact Support</FooterLink>
              <FooterLink href="/policy">Privacy Policy</FooterLink>
              <FooterLink href="/terms">Terms & Conditions</FooterLink>
            </ul>
            
            <div className="mt-6 pt-6 border-t border-slate-200">
               <div className="flex items-start gap-3 text-sm text-slate-600 mb-2">
                  <MapPin className="w-4 h-4 mt-1 text-blue-600 shrink-0" />
                  <span>Bakhtiyarpur, Patna, Bihar - 803212</span>
               </div>
               <a href="mailto:support@jobsaddah.com" className="flex items-center gap-3 text-sm text-slate-600 hover:text-blue-700 transition-colors">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>support@jobsaddah.com</span>
               </a>
            </div>
          </div>
        </div>

        {/* --- Bottom: Disclaimer & Copyright --- */}
        <div className="border-t border-slate-200 pt-8 mt-8">
          
          {/* VITAL DISCLAIMER for Job Sites */}
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-8 text-xs text-amber-800 leading-relaxed flex gap-3 items-start">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <p>
              <strong>Disclaimer:</strong> JobsAddah is an informational website. We are <strong>not associated</strong> with the Government of India or any State Government. 
              While we strive to provide accurate information extracted from official notifications, users are strongly advised to verify details from the official government websites before making any payments or applying.
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <p>&copy; 2024-{currentYear} JobsAddah.com. All rights reserved.</p>
            <div className="flex items-center gap-6">
               <Link href="/sitemap.xml" className="hover:text-slate-800">
                 Sitemap
               </Link>
               <span>Made with love in Bihar, India</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}

// --- Optimized Helper Components ---

function FooterLink({ href, children }) {
  return (
    <li>
      <Link 
        href={href} 
        className="text-sm text-slate-600 hover:text-blue-700 hover:pl-1 transition-all duration-200 inline-block"
      >
        {children}
      </Link>
    </li>
  );
}

function SocialLink({ href, icon, label }) {
  return (
    <a 
      href={href} 
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-500 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all shadow-sm"
    >
      {icon}
    </a>
  );
}
