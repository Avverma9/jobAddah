import React, { useState, useEffect } from 'react';

const Loader = ({ 
  isVisible = true, 
  message = "Loading...", 
  onTimeout = null,
  countdownSeconds = 50 
}) => {
  const [countdown, setCountdown] = useState(countdownSeconds);
  const [isActive, setIsActive] = useState(isVisible);

  useEffect(() => {
    setIsActive(isVisible);
    if (isVisible) {
      setCountdown(countdownSeconds);
    }
  }, [isVisible, countdownSeconds]);

  useEffect(() => {
    let interval = null;
    
    if (isActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prevCount => {
          if (prevCount <= 1) {
            setIsActive(false);
            if (onTimeout) {
              onTimeout();
            }
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isActive, countdown, onTimeout]);

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center space-y-6 p-8">
        {/* Logo with Animation */}
        <div className="relative">
          <div className="animate-pulse">
            <img 
              src="/logo.png" 
              alt="JobsAddah" 
              className="w-20 h-20 mx-auto object-contain drop-shadow-lg"
            />
          </div>
          
          {/* Rotating Ring Animation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 border-4 border-teal-200 dark:border-teal-800 border-t-teal-500 dark:border-t-teal-400 rounded-full animate-spin"></div>
          </div>
        </div>

        {/* Brand Name */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 dark:from-teal-400 dark:via-cyan-400 dark:to-blue-500">
            JobsAddah
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            {message}
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          
          <div className="bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 inline-block">
            <span className="text-sm font-mono text-slate-700 dark:text-slate-300">
              Timeout in: <span className="font-bold text-teal-600 dark:text-teal-400">{countdown}s</span>
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all duration-1000 ease-linear"
              style={{ 
                width: `${((countdownSeconds - countdown) / countdownSeconds) * 100}%` 
              }}
            ></div>
          </div>
        </div>

        {/* Additional Info */}
        <p className="text-xs text-slate-500 dark:text-slate-500 max-w-sm mx-auto">
          Please wait while we fetch the latest data. This may take a few moments.
        </p>
      </div>
    </div>
  );
};

export default Loader;