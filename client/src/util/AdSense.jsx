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

  useEffect(() => {
    const loadAd = () => {
      try {
        if (window.adsbygoogle && !isLoaded.current) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          isLoaded.current = true;
        }
      } catch (error) {
        console.error('AdSense Error:', error);
      }
    };

    // Load ad after a small delay to ensure DOM is ready
    const timer = setTimeout(loadAd, 100);
    return () => clearTimeout(timer);
  }, []);

  // Show placeholder in development or when adTest is true
  if (process.env.NODE_ENV !== 'production' || adTest) {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center ${className}`} style={style}>
        <p className="text-sm text-gray-500 dark:text-gray-400">Ad Placeholder</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Slot: {dataAdSlot}</p>
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
