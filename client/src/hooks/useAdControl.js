// src/hooks/useAdControl.js
// React hook for ad control management

import { useState, useEffect } from 'react';
import { adController } from '../util/AdController';

export const useAdControl = (placement, pageType = 'default') => {
  const [adState, setAdState] = useState({
    shouldShow: false,
    isLoading: true,
    config: null,
    error: null
  });

  useEffect(() => {
    let isMounted = true;

    const loadAdConfig = async () => {
      try {
        const config = await adController.getAdConfig(placement, pageType);
        
        if (isMounted) {
          setAdState({
            shouldShow: config.shouldShow,
            isLoading: false,
            config: config.config,
            error: null
          });
        }
      } catch (error) {
        console.error('Ad config error:', error);
        
        if (isMounted) {
          setAdState({
            shouldShow: import.meta.env.PROD, // Fallback
            isLoading: false,
            config: null,
            error: error.message
          });
        }
      }
    };

    loadAdConfig();

    return () => {
      isMounted = false;
    };
  }, [placement, pageType]);

  // Manual refresh function
  const refreshAdConfig = async () => {
    setAdState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const config = await adController.getAdConfig(placement, pageType);
      setAdState({
        shouldShow: config.shouldShow,
        isLoading: false,
        config: config.config,
        error: null
      });
    } catch (error) {
      setAdState({
        shouldShow: import.meta.env.PROD,
        isLoading: false,
        config: null,
        error: error.message
      });
    }
  };

  return {
    ...adState,
    refreshAdConfig
  };
};

// Hook for global ad settings
export const useGlobalAdSettings = () => {
  const [settings, setSettings] = useState({
    adsEnabled: false,
    maxAdsPerPage: 6,
    isLoading: true
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const config = await adController.fetchAdConfig();
        setSettings({
          adsEnabled: config.adsEnabled,
          maxAdsPerPage: config.globalSettings.maxAdsPerPage,
          isLoading: false
        });
      } catch (error) {
        setSettings({
          adsEnabled: import.meta.env.PROD,
          maxAdsPerPage: 6,
          isLoading: false
        });
      }
    };

    loadSettings();
  }, []);

  return settings;
};