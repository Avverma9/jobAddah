// src/components/ads/AdBanner.jsx
import React from 'react';
import AdSense from '../../util/AdSense';
import { AD_SLOTS, AD_FORMATS } from '../../util/AdConfig';

const AdBanner = ({ 
  position = 'top', 
  className = '',
  style = {} 
}) => {
  const getAdSlot = () => {
    switch (position) {
      case 'top':
        return AD_SLOTS.TOP_LEADERBOARD;
      case 'header':
        return AD_SLOTS.HEADER_BANNER;
      case 'footer':
        return AD_SLOTS.FOOTER_BANNER;
      case 'mobile':
        return AD_SLOTS.MOBILE_BANNER;
      default:
        return AD_SLOTS.TOP_LEADERBOARD;
    }
  };

  const getAdFormat = () => {
    return position === 'mobile' ? AD_FORMATS.HORIZONTAL : AD_FORMATS.AUTO;
  };

  return (
    <div className={`w-full flex justify-center my-4 ${className}`} style={style}>
      <AdSense
        dataAdSlot={getAdSlot()}
        dataAdFormat={getAdFormat()}
        className="max-w-full"
        style={{ minHeight: '90px' }}
      />
    </div>
  );
};

export default AdBanner;