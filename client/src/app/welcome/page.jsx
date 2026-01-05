"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, X } from "lucide-react";

const createPseudoRandom = (seed = 2026) => {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
};

const Snowfall = () => {
  const snowflakes = useMemo(() => {
    const rand = createPseudoRandom();
    return Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      left: `${rand() * 100}%`,
      animationDuration: `${rand() * 3 + 2}s`,
      animationDelay: `${rand() * 2}s`,
      opacity: rand() * 0.5 + 0.3,
      size: rand() * 10 + 5,
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute bg-white rounded-full animate-fall"
          style={{
            left: flake.left,
            top: "-20px",
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            opacity: flake.opacity,
            animation: `fall ${flake.animationDuration} linear infinite`,
            animationDelay: flake.animationDelay,
          }}
        />
      ))}

      <style>{`
        @keyframes fall {
          0% { transform: translateY(-20px) translateX(0px); }
          100% { transform: translateY(100vh) translateX(20px); }
        }
        .animate-hand-wave {
          animation: wave 1.5s ease-in-out infinite;
          transform-origin: bottom center;
        }
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(20deg); }
        }
        .animate-bounce-slow {
          animation: bounce 2s infinite;
        }
      `}</style>
    </div>
  );
};

const AnimatedSanta = () => (
  <svg
    viewBox="0 0 200 240"
    className="w-48 h-48 md:w-64 md:h-64 drop-shadow-2xl relative z-20"
  >
    <path
      fill="#D32F2F"
      d="M50,150 Q50,240 150,240 Q150,240 150,150 L130,120 L70,120 Z"
    />
    <path
      fill="#F5F5F5"
      d="M100,120 L100,240"
      stroke="#B71C1C"
      strokeWidth="2"
      opacity="0.1"
    />

    <circle cx="100" cy="160" r="5" fill="#FFD700" />
    <circle cx="100" cy="190" r="5" fill="#FFD700" />

    <path
      fill="#F5F5F5"
      d="M40,90 Q100,200 160,90 Q160,60 100,60 Q40,60 40,90 Z"
    />

    <circle cx="100" cy="80" r="25" fill="#FFCCBC" />
    <circle cx="90" cy="75" r="2" fill="#333" />
    <circle cx="110" cy="75" r="2" fill="#333" />
    <path
      d="M95,85 Q100,90 105,85"
      stroke="#E57373"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="85" cy="85" r="4" fill="#E57373" opacity="0.5" />
    <circle cx="115" cy="85" r="4" fill="#E57373" opacity="0.5" />

    <path fill="#D32F2F" d="M50,60 Q100,10 150,60 L140,40 Q100,-10 40,40 Z" />
    <circle cx="160" cy="60" r="10" fill="#F5F5F5" />
    <path fill="#F5F5F5" d="M45,60 Q100,50 155,60 L155,75 Q100,65 45,75 Z" />

    <g className="animate-hand-wave" style={{ transformOrigin: "150px 140px" }}>
      <path
        fill="#D32F2F"
        d="M130,130 Q160,110 180,90 L190,100 Q170,140 140,150 Z"
      />
      <circle cx="190" cy="90" r="10" fill="#FFCCBC" />
      <path fill="#F5F5F5" d="M175,95 L185,105 L195,95 Z" />
    </g>

    <path fill="#D32F2F" d="M70,130 Q40,150 20,130 L30,120 Q50,120 70,120 Z" />
    <circle cx="20" cy="130" r="10" fill="#FFCCBC" />
  </svg>
);

export default function Welcome() {
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const isClosed = localStorage.getItem("jobsaddah_welcome_closed_2026");
      if (!isClosed) {
        setShowWelcome(true);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleClose = () => {
    setShowWelcome(false);
    localStorage.setItem("jobsaddah_welcome_closed_2026", "true");
  };

  if (!showWelcome) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={handleClose}
          aria-hidden
        />

        <div className="relative max-w-6xl w-full mx-auto px-6 py-10 animate-fade-in">
          <div className="relative bg-linear-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden text-center md:text-left text-white border-4 border-yellow-400/30">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-50 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
              aria-label="Close Welcome Banner"
            >
              <X size={24} />
            </button>

            <Snowfall />

            <div className="relative z-20 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="md:w-3/5 space-y-6">
                <div className="inline-block bg-yellow-400 text-blue-900 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 shadow-lg animate-bounce-slow">
                  🎉 Truly Made in India
                </div>

                <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                  Welcome to <br />
                  <span className="text-transparent bg-clip-text bg-linear-to-r from-yellow-300 to-yellow-500 filter drop-shadow-sm">
                    JobsAddah.com
                  </span>
                </h1>

                <p className="text-xl md:text-2xl font-medium text-blue-100">
                  Sarkari aur Government Job Portal
                </p>

                <div className="space-y-2">
                  <p className="text-lg font-bold text-yellow-300 flex items-center justify-center md:justify-start gap-2">
                    ⚡ Sabse Fast, Sabse Modern
                  </p>
                  <p className="text-blue-100/90 leading-relaxed max-w-lg mx-auto md:mx-0">
                    Ham aapke liye daily kuchh na kuchh naye changes laa rahe
                    hai. Jobsaddah ke sath judne ke liye{" "}
                    <span className="font-bold text-white">Dhanyawad!</span>
                  </p>
                </div>

                <button
                  onClick={handleClose}
                  className="mt-4 bg-white text-blue-700 hover:bg-yellow-400 hover:text-blue-900 font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105 flex items-center gap-2 mx-auto md:mx-0"
                >
                  Explore Now <ArrowRight size={20} />
                </button>
              </div>

              <div className="md:w-2/5 flex flex-col items-center justify-center relative">
                <div className="absolute top-0 md:-top-10 text-[120px] md:text-[180px] font-black text-white/10 select-none z-10">
                  2026
                </div>

                <AnimatedSanta />

                <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center border border-white/30 z-20">
                  <h3 className="text-xl font-bold text-white">Happy New Year</h3>
                  <p className="text-yellow-300 font-bold text-2xl drop-shadow-md">2026</p>
                  <p className="text-xs text-blue-100 mt-1">
                    Aane wala saal aapke liye <br /> sarkari naukri laye!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

