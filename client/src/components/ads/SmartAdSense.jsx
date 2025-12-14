// src/components/ads/SmartAdSense.jsx
// Smart AdSense component with API control and space management

import React, { useState, useEffect, useRef } from 'react';
import { adController } from '../../util/AdController';
import { AD_SLOTS } from '../../util/AdConfig';

const SmartAdSense = ({ 
  placement = 'banner',
  pageType = 'default',
  dataAdSlot, 
  dataAdFormat = 'auto',
  dataFullWidthResponsive = true,
  className = '',
  style = {},
  fallbackContent = null,
  spacingClass = 'my-4' // Default spacing when ad shows
}) => {
  const [shouldShowAd, setShouldShowAd] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adConfig, setAdConfig] = useState(null);
  const adRef = useRef(null);
  const isLoaded = useRef(false);

  // Check ad configuration on mount
  useEffect(() => {
    const checkAdConfig = async () => {
      try {
        setIsLoading(true);
        const config = await adController.getAdConfig(placement, pageType);
        
        setShouldShowAd(config.shouldShow);
        setAdConfig(config.config);
        
        // Log for debugging
        console.log(`Ad ${placement} on ${pageType}:`, config.shouldShow ? 'SHOW' : 'HIDE');
      } catch (error) {
        console.error('Failed to check ad config:', error);
        // Fallback to production mode check
        setShouldShowAd(import.meta.env.PROD);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdConfig();
  }, [placement, pageType]);

  // Load AdSense script when ad should show
  useEffect(() => {
    if (shouldShowAd && !isLoaded.current) {
      const loadAd = () => {
        try {
          if (window.adsbygoogle) {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            isLoaded.current = true;
          }
        } catch (error) {
          console.error('AdSense Error:', error);
        }
      };

      const timer = setTimeout(loadAd, 100);
      return () => clearTimeout(timer);
    }
  }, [shouldShowAd]);

  // Loading state
  if (isLoading) {
    return null; // No space taken during loading
  }

  // Don't show ad - return fallback or nothing
  if (!shouldShowAd) {
    // If fallback content provided, show it
    if (fallbackContent) {
      return <div className={className} style={style}>{fallbackContent}</div>;
    }
    
    // Otherwise, return null (no space taken)
    return null;
  }

  // Show ad with proper spacing
  return (
    <div className={`${spacingClass} ${className}`} style={style} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', ...style }}
        data-ad-client="ca-pub-7416335110977682"
        data-ad-slot={dataAdSlot || AD_SLOTS[placement.toUpperCase()] || '1234567890'}
        data-ad-format={dataAdFormat}
        data-full-width-responsive={dataFullWidthResponsive}
      />
    </div>
  );
};

export default SmartAdSense;