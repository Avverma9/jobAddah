// src/util/AdController.js
// Dynamic Ad Control System

import api from './apiClient';

class AdController {
  constructor() {
    this.adConfig = null;
    this.lastFetch = null;
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes cache
  }

  // Fetch ad configuration from API
  async fetchAdConfig() {
    try {
      const now = Date.now();
      
      // Use cache if available and not expired
      if (this.adConfig && this.lastFetch && (now - this.lastFetch) < this.cacheDuration) {
        return this.adConfig;
      }

      // Use shared api client (baseUrl is configured in apiClient)
      try {
        const cfg = await api.get('/ad-config');
        this.adConfig = cfg;
        this.lastFetch = now;
        
        // Store in localStorage for offline fallback
        localStorage.setItem('adConfig', JSON.stringify({
          config: this.adConfig,
          timestamp: now
        }));
        
        return this.adConfig;
      } catch (err) {
        throw err;
      }
    } catch (error) {
      console.warn('Ad config fetch failed, using fallback:', error);
      return this.getFallbackConfig();
    }
  }

  // Fallback configuration
  getFallbackConfig() {
    // Try localStorage first
    try {
      const stored = localStorage.getItem('adConfig');
      if (stored) {
        const { config, timestamp } = JSON.parse(stored);
        const age = Date.now() - timestamp;
        
        // Use stored config if less than 1 hour old
        if (age < 60 * 60 * 1000) {
          return config;
        }
      }
    } catch (error) {
      console.warn('Failed to load stored ad config:', error);
    }

    // Default fallback - ads enabled in production
    return {
      adsEnabled: import.meta.env.PROD,
      globalSettings: {
        showAds: import.meta.env.PROD,
        maxAdsPerPage: 6,
        adRefreshInterval: 30000, // 30 seconds
      },
      pageSettings: {
        homepage: { enabled: true, maxAds: 4 },
        jobDetail: { enabled: true, maxAds: 4 },
        categoryPages: { enabled: true, maxAds: 3 },
        staticPages: { enabled: true, maxAds: 2 },
      },
      adSlots: {
        banner: { enabled: true, priority: 1 },
        rectangle: { enabled: true, priority: 2 },
        inFeed: { enabled: true, priority: 3 },
        inArticle: { enabled: true, priority: 4 },
      }
    };
  }

  // Check if ads should be shown for specific placement
  async shouldShowAd(placement, pageType = 'default') {
    const config = await this.fetchAdConfig();
    
    if (!config || !config.adsEnabled || !config.globalSettings.showAds) {
      return false;
    }

    // Check page-specific settings
    const pageConfig = config.pageSettings[pageType];
    if (pageConfig && !pageConfig.enabled) {
      return false;
    }

    // Check ad slot specific settings
    const slotConfig = config.adSlots[placement];
    if (slotConfig && !slotConfig.enabled) {
      return false;
    }

    return true;
  }

  // Get ad configuration for specific placement
  async getAdConfig(placement, pageType = 'default') {
    const config = await this.fetchAdConfig();
    return {
      shouldShow: await this.shouldShowAd(placement, pageType),
      config: config,
      placement: placement,
      pageType: pageType
    };
  }

  // Manual override for testing
  setTestMode(enabled) {
    this.adConfig = {
      ...this.getFallbackConfig(),
      adsEnabled: enabled,
      globalSettings: {
        ...this.getFallbackConfig().globalSettings,
        showAds: enabled
      }
    };
    this.lastFetch = Date.now();
  }
}

// Singleton instance
export const adController = new AdController();
export default adController;