"use client";

export default function Loader({
  message = "Gathering the latest government job intelligence...",
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 backdrop-blur-md">
      <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-white/10 px-6 py-6 text-center shadow-2xl backdrop-blur-xl">
        <div className="relative mx-auto h-20 w-20">
          <style>{`
            @keyframes spin-slow { to { transform: rotate(360deg); } }
            @keyframes spin-reverse { to { transform: rotate(-360deg); } }
            @keyframes pulse-glow {
              0%,100% { transform: scale(1); opacity: .8; box-shadow: 0 0 14px 4px rgba(99,102,241,.25); }
              50% { transform: scale(1.12); opacity: 1; box-shadow: 0 0 24px 7px rgba(99,102,241,.45); }
            }
          `}</style>

          <div
            className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-purple-400 border-r-cyan-300"
            style={{ animation: "spin-slow 3s linear infinite" }}
          />
          <div
            className="absolute inset-2 rounded-full border-[3px] border-transparent border-b-pink-400 border-l-blue-300"
            style={{ animation: "spin-reverse 2s linear infinite" }}
          />
          <div
            className="absolute inset-5 rounded-full border-2 border-transparent border-t-amber-300 border-l-orange-300"
            style={{ animation: "spin-slow 1s linear infinite" }}
          />

          <div
            className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-300"
            style={{ animation: "pulse-glow 2s ease-in-out infinite" }}
          />

          <div className="absolute inset-0 animate-spin [animation-duration:4s]">
            <div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1 rounded-full bg-cyan-200 shadow-[0_0_10px_rgba(34,211,238,.55)]" />
          </div>
          <div className="absolute inset-2 animate-spin [animation-duration:3s] [animation-direction:reverse]">
            <div className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 translate-y-1 rounded-full bg-pink-200 shadow-[0_0_10px_rgba(244,114,182,.55)]" />
          </div>
        </div>
        <p className="mt-1 text-xs text-white/65">{message}</p>
        <div className="mt-4 flex items-center justify-center gap-1.5">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/70 [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/70 [animation-delay:120ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/70 [animation-delay:240ms]" />
        </div>
      </div>
    </div>
  );
}
