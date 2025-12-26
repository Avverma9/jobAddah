// src/components/ads/AdRectangle.jsx
import React from 'react';
import AdSense from '../../util/AdSense';
import { AD_SLOTS, AD_FORMATS } from '../../util/AdConfig';

const AdRectangle = ({ 
  position = 'content', 
  className = '',
  style = {} 
}) => {
  const getAdSlot = () => {
    switch (position) {
      case 'content':
        return AD_SLOTS.CONTENT_RECTANGLE;
      case 'sidebar':
        return AD_SLOTS.SIDEBAR_RECTANGLE;
      case 'home':
        return AD_SLOTS.HOME_RECTANGLE;
      case 'post':
        return AD_SLOTS.POST_RECTANGLE;
      case 'contact':
        return AD_SLOTS.CONTACT_RECTANGLE;
      case 'mobile':
        return AD_SLOTS.MOBILE_RECTANGLE;
      default:
        return AD_SLOTS.CONTENT_RECTANGLE;
    }
  };

  return (
    <div className={`w-full flex justify-center my-6 ${className}`} style={style}>
      <AdSense
        dataAdSlot={getAdSlot()}
        dataAdFormat={AD_FORMATS.RECTANGLE}
        className="max-w-full"
        style={{ minHeight: '250px', maxWidth: '336px' }}
      />
    </div>
  );
};

export default AdRectangle;