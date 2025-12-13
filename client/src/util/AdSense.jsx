// src/util/AdSense.jsx
import React, { useEffect, useRef } from 'react';

const AdSense = ({ 
  dataAdSlot, 
  dataAdFormat = 'auto',
  dataFullWidthResponsive = true,
  className = '',
  style = {},
  adTest = false // For testing purposes
}) => {
  const adRef = useRef(null);
  const isLoaded = useRef(false);

  // Automatic mode detection
  const isProduction = import.meta.env.PROD; // Automatically true in production build
  const isDevelopment = import.meta.env.DEV; // Automatically true in development
  
  // Manual override (optional) - only use if you want to force enable ads in development
  const forceAdsEnabled = import.meta.env.VITE_ADSENSE_ENABLED === 'true';

  useEffect(() => {
    const loadAd = () => {
      try {
        if (window.adsbygoogle && !isLoaded.current && (isProduction || forceAdsEnabled)) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          isLoaded.current = true;
        }
      } catch (error) {
        console.error('AdSense Error:', error);
      }
    };

    // Load ads in production OR when manually enabled in development
    if (isProduction || forceAdsEnabled) {
      const timer = setTimeout(loadAd, 100);
      return () => clearTimeout(timer);
    }
  }, [isProduction, forceAdsEnabled]);

  // SIMPLE RULE: Hide ads in development, show in production
  if (isDevelopment && !forceAdsEnabled && !adTest) {
    return null; // No ads in development = no blank spaces
  }

  // Show test placeholder only when adTest is true
  if (adTest && isDevelopment) {
    return (
      <div className={`bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 text-center ${className}`} style={style}>
        <p className="text-xs text-blue-600 dark:text-blue-400">
          🧪 Ad Test - Slot: {dataAdSlot}
        </p>
        <p className="text-xs text-blue-500 dark:text-blue-300 mt-1">
          Mode: {isProduction ? 'Production' : 'Development'}
        </p>
      </div>
    );
  }

  return (
    <div className={`ad-container ${className}`} style={style} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client="ca-pub-7416335110977682"
        data-ad-slot={dataAdSlot}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive}
      />
    </div>
  );
};

export default AdSense;
