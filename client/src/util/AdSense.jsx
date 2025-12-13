// src/components/AdSense.jsx
import React, { useEffect } from 'react';

const AdSense = ({ 
  dataAdSlot, 
  dataAdFormat = 'auto',
  dataFullWidthResponsive = true,
  className = '',
  style = {}
}) => {
  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense Error:', error);
    }
  }, []);

  // Don't show ads in development
  if (process.env.NODE_ENV !== 'production') {
    return (
      <div className={`bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center ${className}`}>
        <p className="text-sm text-gray-500">Ad Placeholder (Dev Mode)</p>
      </div>
    );
  }

  return (
    <div className={`ad-container ${className}`} style={style}>
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
