// Frontend Ad Control Utilities for JobsAddah
// This file can be copied to your React/frontend project

const AD_CONFIG = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api/v1/ad-config',
  PUBLISHER_ID: 'ca-pub-7416335110977682',
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  STORAGE_KEY: 'jobsaddah_ad_config'
};

// Ad Control API Client
class AdControlAPI {
  constructor() {
    this.cache = new Map();
    this.lastFetch = 0;
  }

  async makeRequest(endpoint, options = {}) {
    try {
      const response = await fetch(`${AD_CONFIG.API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'X-Publisher-ID': AD_CONFIG.PUBLISHER_ID,
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Ad API Error:', error);
      return this.getFallbackConfig();
    }
  }

  async getAdConfig() {
    const now = Date.now();
    const cacheKey = 'ad_config';

    // Check cache first
    if (this.cache.has(cacheKey) && (now - this.lastFetch) < AD_CONFIG.CACHE_DURATION) {
      return this.cache.get(cacheKey);
    }

    try {
      const config = await this.makeRequest('/');
      
      // Cache the result
      this.cache.set(cacheKey, config);
      this.lastFetch = now;
      
      // Store in localStorage as fallback
      localStorage.setItem(AD_CONFIG.STORAGE_KEY, JSON.stringify({
        config,
        timestamp: now
      }));

      return config;
    } catch (error) {
      console.error('Failed to fetch ad config:', error);
      return this.getFallbackConfig();
    }
  }

  async getAdStatus(pageType, slotType) {
    const cacheKey = `ad_status_${pageType}_${slotType}`;
    const now = Date.now();

    // Check cache first
    if (this.cache.has(cacheKey) && (now - this.lastFetch) < AD_CONFIG.CACHE_DURATION) {
      return this.cache.get(cacheKey);
    }

    try {
      const status = await this.makeRequest(`/status?pageType=${pageType}&slotType=${slotType}`);
      
      // Cache the result
      this.cache.set(cacheKey, status);
      
      return status;
    } catch (error) {
      console.error('Failed to fetch ad status:', error);
      return { shouldShow: false, error: true };
    }
  }

  getFallbackConfig() {
    try {
      const stored = localStorage.getItem(AD_CONFIG.STORAGE_KEY);
      if (stored) {
        const { config, timestamp } = JSON.parse(stored);
        const age = Date.now() - timestamp;
        
        // Use cached config if less than 1 hour old
        if (age < 60 * 60 * 1000) {
          return config;
        }
      }
    } catch (error) {
      console.error('Failed to load cached config:', error);
    }

    // Default fallback configuration
    return {
      adsEnabled: true,
      globalSettings: { showAds: true, maxAdsPerPage: 6 },
      pageSettings: {
        homepage: { enabled: true, maxAds: 4 },
        jobDetail: { enabled: true, maxAds: 4 },
        jobList: { enabled: true, maxAds: 3 },
        govtPost: { enabled: true, maxAds: 3 }
      },
      adSlots: {
        banner: { enabled: true, priority: 1 },
        rectangle: { enabled: true, priority: 2 },
        inFeed: { enabled: true, priority: 3 },
        sidebar: { enabled: true, priority: 4 }
      },
      emergencyDisabled: false
    };
  }

  clearCache() {
    this.cache.clear();
    this.lastFetch = 0;
  }
}

// Create singleton instance
const adAPI = new AdControlAPI();

// React Hook for Ad Control
const useAdControl = (pageType, slotType) => {
  const [adStatus, setAdStatus] = React.useState({
    shouldShow: false,
    loading: true,
    error: null
  });

  React.useEffect(() => {
    let mounted = true;

    const fetchAdStatus = async () => {
      try {
        setAdStatus(prev => ({ ...prev, loading: true }));
        
        const status = await adAPI.getAdStatus(pageType, slotType);
        
        if (mounted) {
          setAdStatus({
            shouldShow: status.shouldShow || false,
            loading: false,
            error: status.error || null,
            ...status
          });
        }
      } catch (error) {
        if (mounted) {
          setAdStatus({
            shouldShow: false,
            loading: false,
            error: error.message
          });
        }
      }
    };

    fetchAdStatus();

    return () => {
      mounted = false;
    };
  }, [pageType, slotType]);

  return adStatus;
};

// Smart AdSense Component
const SmartAdSense = ({ 
  placement, 
  pageType, 
  adSlot,
  adFormat = 'auto',
  adStyle = {},
  fallbackContent = null,
  className = '',
  ...adProps 
}) => {
  const adStatus = useAdControl(pageType, placement);

  // Don't render anything while loading
  if (adStatus.loading) {
    return null;
  }

  // Don't render if ads should not show
  if (!adStatus.shouldShow) {
    return fallbackContent;
  }

  // Render AdSense component
  return React.createElement('ins', {
    className: `adsbygoogle ${className}`,
    style: {
      display: 'block',
      ...adStyle
    },
    'data-ad-client': AD_CONFIG.PUBLISHER_ID,
    'data-ad-slot': adSlot,
    'data-ad-format': adFormat,
    ...adProps
  });
};

// Ad Container Component with Smart Space Management
const AdContainer = ({ 
  placement, 
  pageType, 
  adProps = {},
  fallbackContent = null,
  containerStyle = {},
  containerClassName = ''
}) => {
  const adStatus = useAdControl(pageType, placement);

  // Don't render container if ads should not show and no fallback
  if (!adStatus.shouldShow && !fallbackContent) {
    return null;
  }

  return React.createElement('div', {
    className: `ad-container ad-container-${placement} ${containerClassName}`,
    style: containerStyle
  }, [
    adStatus.shouldShow 
      ? React.createElement(SmartAdSense, {
          key: 'ad',
          placement,
          pageType,
          ...adProps
        })
      : fallbackContent
  ]);
};

// Utility functions
const AdUtils = {
  // Check if ads should show for a specific page/slot combination
  async shouldShowAd(pageType, slotType) {
    const status = await adAPI.getAdStatus(pageType, slotType);
    return status.shouldShow;
  },

  // Get full ad configuration
  async getConfig() {
    return await adAPI.getAdConfig();
  },

  // Clear ad cache (useful for testing)
  clearCache() {
    adAPI.clearCache();
  },

  // Emergency disable check
  async isEmergencyDisabled() {
    const config = await adAPI.getAdConfig();
    return config.emergencyDisabled;
  },

  // Get max ads allowed for a page
  async getMaxAdsForPage(pageType) {
    const config = await adAPI.getAdConfig();
    return config.pageSettings[pageType]?.maxAds || config.globalSettings.maxAdsPerPage;
  }
};

// Example usage in React components:
/*
// Basic usage
<SmartAdSense 
  placement="banner" 
  pageType="homepage"
  adSlot="1234567890"
  adFormat="horizontal"
/>

// With container and fallback
<AdContainer 
  placement="rectangle" 
  pageType="jobDetail"
  adProps={{
    adSlot: "0987654321",
    adFormat: "rectangle"
  }}
  fallbackContent={<div>Alternative content</div>}
/>

// Using the hook directly
const MyComponent = () => {
  const adStatus = useAdControl('homepage', 'banner');
  
  return (
    <div>
      {adStatus.shouldShow && (
        <div>Show ads here</div>
      )}
    </div>
  );
};
*/

// Export for use in React applications
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AdControlAPI,
    useAdControl,
    SmartAdSense,
    AdContainer,
    AdUtils,
    AD_CONFIG
  };
}

// For browser environments
if (typeof window !== 'undefined') {
  window.JobsAddahAds = {
    AdControlAPI,
    useAdControl,
    SmartAdSense,
    AdContainer,
    AdUtils,
    AD_CONFIG
  };
}