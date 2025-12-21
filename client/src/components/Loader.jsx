import React, { useState, useEffect, useRef, useCallback } from 'react';

const Loader = ({ 
  isVisible = true, 
  message = "Loading...", 
  onTimeout, 
  countdownSeconds = 50 
}) => {
  const [countdown, setCountdown] = useState(countdownSeconds);
  const [isActive, setIsActive] = useState(isVisible);
  const intervalRef = useRef(null);

  const startTimer = useCallback(() => {
    setCountdown(countdownSeconds);
    setIsActive(true);
  }, [countdownSeconds]);

  useEffect(() => {
    if (isVisible) startTimer();
    else setIsActive(false);
  }, [isVisible, startTimer]);

  useEffect(() => {
    if (!isActive || countdown <= 0) return;

    intervalRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          setIsActive(false);
          onTimeout?.();
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isActive, countdown, onTimeout]);

  if (!isActive) return null;

  const progress = ((countdownSeconds - countdown) / countdownSeconds) * 100;

  return (
    <div className="fixed inset-0 z-[9999] bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center space-y-6 p-8 max-w-sm mx-auto">
        <div className="relative mx-auto w-24 h-24">
          <img 
            src="/logo.png" 
            alt="JobsAddah" 
            className="w-20 h-20 mx-auto object-contain drop-shadow-lg animate-pulse absolute inset-0 m-auto"
          />
          <div className="w-24 h-24 border-4 border-teal-200 dark:border-teal-800 border-t-teal-500 dark:border-t-teal-400 rounded-full animate-spin absolute inset-0"></div>
        </div>

        <div className="space-y-1">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 bg-clip-text text-transparent dark:from-teal-400 dark:via-cyan-400 dark:to-blue-500">
            JobsAddah
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">{message}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-1">
            <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
              {countdown}s
            </span>
          </div>
        </div>

        <div className="w-full max-w-xs mx-auto">
          <div className="bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all duration-1000 ease-linear"
              style={{width: `${progress}%`}}
            />
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">Fetching latest data...</p>
      </div>
    </div>
  );
};

export default Loader;
