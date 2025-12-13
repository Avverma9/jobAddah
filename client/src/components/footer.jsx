import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Send, PlayCircle, Apple, MapPin, Phone, Mail } from 'lucide-react';
import AdBanner from './ads/AdBanner';

const Footer = () => {
  return (
    <footer className="relative bg-white dark:bg-blue-900 text-slate-700 dark:text-slate-300">
      {/* Footer Banner Ad */}
      <AdBanner position="footer" className="py-4 bg-gray-50 dark:bg-blue-950" />

      <div className="pt-8 pb-8 container mx-auto px-6 relative z-10">
        
        {/* 🌟 Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* 1. Logo & About */}
          <div className="space-y-6">
            <h3 className="font-extrabold text-2xl tracking-tight flex items-center gap-2">
              <span className="bg-orange-500 w-1.5 h-6 rounded-full inline-block" />
              <span className="text-slate-900 dark:text-white">JobsAddah</span>
            </h3>

            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Trusted source for government and private job updates — notifications, admit cards, results and application links.
            </p>

            <div className="flex gap-3 mt-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                <a
                  key={idx}
                  href="#"
                  aria-label="social"
                  className="w-9 h-9 rounded-full bg-slate-100 dark:bg-blue-950/30 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-orange-500 hover:text-white transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* 2. Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 border-b-2 border-orange-500 inline-block pb-1 text-slate-900 dark:text-white">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {["Home", "Browse Jobs", "Admit Cards", "Results", "Sitemap"].map((link) => (
                <li key={link}>
                  <a href="#" className="flex items-center gap-2 group hover:text-orange-400 transition-colors text-slate-700 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-6 border-b-2 border-orange-500 inline-block pb-1 text-slate-900 dark:text-white">
              Contact Us
            </h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-orange-500 shrink-0 mt-1" />
                <span>123 Job Avenue, Tech Park,<br />New Delhi, India 110001</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-orange-500 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="text-orange-500 shrink-0" />
                <span>support@jobsaddah.com</span>
              </li>
            </ul>
          </div>

          {/* 4. Newsletter & App */}
          <div>
            <h4 className="font-bold text-lg mb-6 border-b-2 border-orange-500 inline-block pb-1 text-slate-900 dark:text-white">
              Stay Updated
            </h4>
            
            <div className="relative mb-8">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full bg-slate-50 dark:bg-blue-950/10 text-slate-900 dark:text-slate-200 px-4 py-3 rounded-xl border border-gray-200 dark:border-blue-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-slate-400"
              />
              <button className="absolute right-2 top-2 bg-orange-500 hover:bg-orange-600 text-white p-1.5 rounded-lg transition-colors">
                <Send size={18} />
              </button>
            </div>

            <div className="space-y-3">
                <button className="flex items-center gap-3 w-full bg-slate-100 dark:bg-blue-950/10 hover:bg-slate-200 dark:hover:bg-blue-900 p-3 rounded-xl border border-gray-200 dark:border-blue-800 transition-all group">
                  <div className="text-orange-500 group-hover:text-white transition-colors">
                    <PlayCircle size={28} />
                  </div>
                  <div className="text-left">
                   <div className="text-[10px] uppercase text-slate-500 dark:text-slate-400">Get it on</div>
                   <div className="text-sm font-bold text-slate-900 dark:text-white">Google Play</div>
                  </div>
                </button>

                <button className="flex items-center gap-3 w-full bg-slate-100 dark:bg-blue-950/10 hover:bg-slate-200 dark:hover:bg-blue-900 p-3 rounded-xl border border-gray-200 dark:border-blue-800 transition-all group">
                  <div className="text-orange-500 group-hover:text-white transition-colors">
                    <Apple size={28} />
                  </div>
                  <div className="text-left">
                   <div className="text-[10px] uppercase text-slate-500 dark:text-slate-400">Download on the</div>
                   <div className="text-sm font-bold text-slate-900 dark:text-white">App Store</div>
                  </div>
                </button>
            </div>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="border-t border-blue-800/60 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <div className="text-center md:text-left">
            © 2025 Jobs<span className="text-slate-300">Addah</span>. All Rights Reserved.
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            {["Privacy Policy", "Terms of Service", "Cookies Settings", "Disclaimer"].map((item) => (
              <a key={item} href="#" className="hover:text-orange-400 transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;