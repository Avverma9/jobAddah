// src/components/ads/AdInArticle.jsx
import React from 'react';
import AdSense from '../../util/AdSense';
import { AD_SLOTS, AD_FORMATS } from '../../util/AdConfig';

const AdInArticle = ({ 
  className = '',
  style = {} 
}) => {
  return (
    <div className={`w-full my-8 ${className}`} style={style}>
      <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 text-center">
        Advertisement
      </div>
      <AdSense
        dataAdSlot={AD_SLOTS.IN_ARTICLE}
        dataAdFormat={AD_FORMATS.FLUID}
        className="w-full"
        style={{ minHeight: '250px' }}
      />
    </div>
  );
};

export default AdInArticle;