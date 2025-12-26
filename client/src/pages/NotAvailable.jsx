import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const NotAvailable = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#f0f9ff] text-slate-800 flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-cyan-200 selection:text-cyan-900">
      
      {/* Background Animated Blobs (Light Theme) */}
      <div className={`absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-300/40 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-pulse transition-all duration-1000 ${mounted ? 'scale-100' : 'scale-0'}`}></div>
      <div className={`absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-cyan-300/40 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-pulse delay-700 transition-all duration-1000 ${mounted ? 'scale-100' : 'scale-0'}`}></div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none mix-blend-soft-light"></div>

      {/* Main Content */}
      <div className={`relative z-10 w-full max-w-4xl mx-auto px-4 flex flex-col items-center justify-center transition-all duration-1000 transform ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
          {/* Custom Animated Koala with Magnifier - GIANT SIZE */}
          <div className="relative w-72 h-72 md:w-96 md:h-96 mb-8">
                {/* Koala Head Group */}
                <div className="absolute inset-0 flex items-center justify-center animate-bounce-slow">
                   <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
                      {/* Ears */}
                      <circle cx="60" cy="70" r="25" fill="#94a3b8" />
                      <circle cx="140" cy="70" r="25" fill="#94a3b8" />
                      <circle cx="60" cy="70" r="15" fill="#cbd5e1" />
                      <circle cx="140" cy="70" r="15" fill="#cbd5e1" />
                      
                      {/* Face */}
                      <ellipse cx="100" cy="100" rx="60" ry="50" fill="#94a3b8" />
                      
                      {/* Eyes */}
                      <circle cx="80" cy="90" r="6" fill="#1e293b" />
                      <circle cx="120" cy="90" r="6" fill="#1e293b" />
                      
                      {/* Nose */}
                      <ellipse cx="100" cy="105" rx="12" ry="16" fill="#1e293b" />
                   </svg>
                </div>

                {/* Magnifier Hand Animation - Adjusted size for bigger koala */}
                <div className="absolute bottom-10 right-10 md:bottom-16 md:right-16 animate-search">
                  <div className="relative">
                    {/* Hand holding it */}
                    <div className="absolute -left-2 top-8 w-10 h-10 bg-slate-400 rounded-full z-10 border-2 border-slate-300"></div>
                    {/* The Magnifier Icon */}
                    <Search className="w-24 h-24 md:w-32 md:h-32 text-cyan-600 drop-shadow-md transform -rotate-12 bg-white/20 rounded-full p-2 backdrop-blur-sm border-4 border-cyan-600/30" strokeWidth={2.5} />
                  </div>
                </div>
          </div>

          {/* Text Content - Simple & Clean */}
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-800 drop-shadow-sm">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-purple-600">
                This service
              </span>
              <br />
              <span className="text-slate-700 mt-2 block">is on the way</span>
            </h1>
          </div>
      </div>

      <style jsx>{`
        @keyframes search {
          0%, 100% { transform: rotate(-10deg) translateX(0); }
          50% { transform: rotate(10deg) translateX(15px) translateY(-10px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-3%); }
          50% { transform: translateY(3%); }
        }
        .animate-search {
          animation: search 4s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NotAvailable;