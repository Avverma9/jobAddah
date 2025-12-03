import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Send, PlayCircle, Apple, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative bg-blue-900 text-slate-300 mt-32">
      
      {/* 🌊 SOLID WAVY TOP SHAPE */}
      {/* This SVG sits directly above the footer using negative translation */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-[0] transform -translate-y-full">
        <svg
          className="relative block w-[calc(100%+1.3px)] h-[80px] md:h-[120px]"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          {/* Matches footer background color */}
          <path
            d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
            className="fill-blue-900"
            style={{ transform: 'scaleY(-1)' }} 
          ></path>
        </svg>
      </div>

      <div className="pt-10 pb-10 container mx-auto px-6 relative z-10">
        
        {/* 🌟 Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* 1. Logo & About */}
          <div className="space-y-6">
            <h3 className="text-white font-extrabold text-4xl tracking-tight flex items-center gap-2">
              <span className="bg-orange-500 w-2 h-8 rounded-full"></span>
              Jobs<span className="text-orange-500">Addah</span>
            </h3>

            <p className="text-slate-400 text-sm leading-relaxed pr-4">
              Your trusted companion for Government & Private job updates. 
              Connecting talent with opportunity across the nation. Fast, Accurate & Free.
            </p>

            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, idx) => (
                <button
                  key={idx}
                  className="w-10 h-10 rounded-full bg-blue-950/50 flex items-center justify-center text-slate-400 hover:bg-orange-500 hover:text-white hover:-translate-y-1 transition-all duration-300 shadow-lg border border-blue-800/30"
                >
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>

          {/* 2. Quick Links */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 border-b-2 border-orange-500 inline-block pb-1">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {["Home", "Browse Jobs", "Admit Cards", "Results", "Sitemap"].map((link) => (
                <li key={link}>
                  <a href="#" className="flex items-center gap-2 group hover:text-orange-400 transition-colors">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Contact Info */}
          <div>
            <h4 className="text-white font-bold text-lg mb-6 border-b-2 border-orange-500 inline-block pb-1">
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
            <h4 className="text-white font-bold text-lg mb-6 border-b-2 border-orange-500 inline-block pb-1">
              Stay Updated
            </h4>
            
            <div className="relative mb-8">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full bg-blue-950/50 text-white px-4 py-3 rounded-xl border border-blue-800 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-slate-500"
              />
              <button className="absolute right-2 top-2 bg-orange-500 hover:bg-orange-600 text-white p-1.5 rounded-lg transition-colors">
                <Send size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <button className="flex items-center gap-3 w-full bg-blue-950 hover:bg-blue-900 p-3 rounded-xl border border-blue-800 transition-all group">
                 <div className="text-orange-500 group-hover:text-white transition-colors">
                    <PlayCircle size={28} />
                 </div>
                 <div className="text-left">
                   <div className="text-[10px] uppercase text-slate-400">Get it on</div>
                   <div className="text-sm font-bold text-white">Google Play</div>
                 </div>
              </button>

              <button className="flex items-center gap-3 w-full bg-blue-950 hover:bg-blue-900 p-3 rounded-xl border border-blue-800 transition-all group">
                 <div className="text-orange-500 group-hover:text-white transition-colors">
                    <Apple size={28} />
                 </div>
                 <div className="text-left">
                   <div className="text-[10px] uppercase text-slate-400">Download on the</div>
                   <div className="text-sm font-bold text-white">App Store</div>
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