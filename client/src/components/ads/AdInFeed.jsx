// src/components/ads/AdInFeed.jsx
import React from 'react';
import AdSense from '../../util/AdSense';
import { AD_SLOTS, AD_FORMATS } from '../../util/AdConfig';

const AdInFeed = ({ 
  className = '',
  style = {},
  index = 0 // Position in feed for tracking
}) => {
  return (
    <div className={`w-full my-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`} style={style}>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">
        Advertisement
      </div>
      <AdSense
        dataAdSlot={AD_SLOTS.FEED_AD}
        dataAdFormat={AD_FORMATS.FLUID}
        className="w-full"
        style={{ minHeight: '200px' }}
      />
    </div>
  );
};

export default AdInFeed;