import React from 'react';

const Loader = ({ fullScreen = true }) => {
  // Container: Reduced blur (sm) and slightly more transparent background
  const containerClass = fullScreen 
    ? "fixed inset-0 z-[9999] flex flex-col items-center justify-center" 
    : "flex flex-col items-center justify-center py-12";

  return (
    <div className={containerClass}>
      
      {/* --- Animation Wrapper --- */}
      <div className="relative flex items-center justify-center">
        
        {/* 1. Background Glow (Pulse) */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-pink-500/30 to-orange-500/30 blur-2xl animate-pulse scale-150"></div>

        {/* 2. Outer Ring: Slow Spinning (Pink - Matches 'Job') */}
        <div className="h-32 w-32 rounded-full border-[3px] border-slate-200 border-t-pink-500 border-l-pink-500/30 animate-[spin_3s_linear_infinite]"></div>
        
        {/* 3. Middle Ring: Reverse Spinning (Orange - Matches 'Addah') */}
        <div className="absolute h-24 w-24 rounded-full border-[3px] border-slate-200 border-b-orange-500 border-r-orange-500/30 animate-[spin_2s_linear_infinite_reverse]"></div>

        {/* 4. Inner Ring: Fast Spinning (Blue - Accent) */}
        <div className="absolute h-16 w-16 rounded-full border-[3px] border-slate-200 border-t-blue-600 border-l-blue-600/30 animate-[spin_1s_linear_infinite]"></div>

        {/* 5. Center Logo (Floating) */}
        <div className="absolute z-10">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center shadow-xl shadow-orange-500/20 animate-bounce">
            <span className="text-white font-bold text-lg tracking-tight">JA</span>
          </div>
        </div>
      </div>

      {/* --- Text Section --- */}
      <div className="mt-10 flex flex-col items-center gap-3">
        {/* Brand Name with Gradient Text */}
        <h2 className="text-2xl font-extrabold tracking-tight">
           <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-pink-500">Job</span>
           <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-orange-600">Addah</span>
        </h2>
      </div>

      {/* Keyframes for custom Tailwind animations would typically go in tailwind.config.js, 
          but standard classes (spin, bounce, pulse) work out of the box. 
          'shimmer' is simulated here with standard movement. */}
    </div>
  );
};

export default Loader;