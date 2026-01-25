"use client";

export default function Loader({
  message = "Gathering intelligence...",
}) {
  return (
    // Outer Overlay: No color, just a subtle blur to focus attention
    <div className="fixed inset-0 z-50 grid place-items-center bg-transparent backdrop-blur-[3px]">
      
      {/* Inner Container: Completely transparent (No background, No border) */}
      <div className="flex flex-col items-center justify-center p-4">
        
        {/* Spinner Section */}
        <div className="relative h-20 w-20">
          {/* Outer Ring - Indigo */}
          <div className="absolute inset-0 animate-[spin_3s_linear_infinite] rounded-full border-[3px] border-transparent border-t-indigo-500 border-r-indigo-500/30" />
          
          {/* Middle Ring - Cyan */}
          <div className="absolute inset-2 animate-[spin_2s_linear_infinite_reverse] rounded-full border-[3px] border-transparent border-b-cyan-500 border-l-cyan-500/30" />
          
          {/* Inner Ring - Purple */}
          <div className="absolute inset-5 animate-[spin_1.5s_linear_infinite] rounded-full border-2 border-transparent border-t-purple-500" />

          {/* Center Glow */}
          <div className="absolute inset-0 grid place-items-center">
             <div className="h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.8)] animate-pulse" />
          </div>
        </div>

        {/* Text Section */}
        <div className="mt-8 flex flex-col items-center gap-2 text-center">
          <h3 className="text-sm font-bold tracking-widest text-indigo-500 uppercase drop-shadow-sm">
            JOBSADDAH
          </h3>
          <p className="max-w-[200px] text-xs font-medium text-slate-500 dark:text-slate-300">
            {message}
          </p>
          
          {/* Minimal Dots */}
          <div className="mt-2 flex gap-1">
             <span className="h-1 w-1 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
             <span className="h-1 w-1 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
             <span className="h-1 w-1 rounded-full bg-indigo-500 animate-bounce" />
          </div>
        </div>

      </div>
    </div>
  );
}