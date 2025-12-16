const axios = require('axios');

// JobsAddah AdSense Configuration
const ADSENSE_CONFIG = {
  publisherId: 'ca-pub-7416335110977682',
  domain: 'jobsaddah.com',
  siteName: 'JobsAddah - Sarkari Result 2025',
  apiKey: 'jobsaddah-secure-key-2025'
};

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api/v1/ad-config';

// Helper function for API calls
const makeApiCall = async (method, endpoint, data = null) => {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'X-Publisher-ID': ADSENSE_CONFIG.publisherId
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message 
    };
  }
};

// Setup functions
const initializeAdSense = async () => {
  const result = await makeApiCall('POST', '/initialize', ADSENSE_CONFIG);
  
  if (result.success) {
  } else {
  }
  
  return result;
};

const setupInitialConfig = async () => {
  // Global settings
  const globalResult = await makeApiCall('POST', '/global', {
    publisherId: ADSENSE_CONFIG.publisherId,
    adsEnabled: true,
    showAds: true,
    maxAdsPerPage: 6
  });

  if (globalResult.success) {
  } else {
  }

  // Page settings
  const pages = [
    { name: 'homepage', maxAds: 4 },
    { name: 'jobDetail', maxAds: 4 },
    { name: 'jobList', maxAds: 3 },
    { name: 'govtPost', maxAds: 3 }
  ];

  for (const page of pages) {
    const pageResult = await makeApiCall('POST', `/page/${page.name}`, {
      publisherId: ADSENSE_CONFIG.publisherId,
      enabled: true,
      maxAds: page.maxAds
    });

    if (pageResult.success) {
    } else {
    }
  }

  // Ad slot settings
  const slots = [
    { name: 'banner', priority: 1 },
    { name: 'rectangle', priority: 2 },
    { name: 'inFeed', priority: 3 },
    { name: 'sidebar', priority: 4 }
  ];

  for (const slot of slots) {
    const slotResult = await makeApiCall('POST', `/slot/${slot.name}`, {
      publisherId: ADSENSE_CONFIG.publisherId,
      enabled: true,
      priority: slot.priority
    });

    if (slotResult.success) {
    } else {
    }
  }
};

const verifySetup = async () => {
  const configResult = await makeApiCall('GET', '/');
  
  if (configResult.success) {
  } else {
  }
  
  return configResult;
};

const testAdStatus = async () => {
  const testCases = [
    { page: 'homepage', slot: 'banner' },
    { page: 'jobDetail', slot: 'rectangle' },
    { page: 'jobList', slot: 'inFeed' },
    { page: 'govtPost', slot: 'sidebar' }
  ];

  for (const test of testCases) {
    const statusResult = await makeApiCall('GET', `/status?pageType=${test.page}&slotType=${test.slot}`);
    
    if (statusResult.success) {
      const shouldShow = statusResult.data.shouldShow ? '✅ SHOW' : '❌ HIDE';
    } else {
    }
  }
};

// Main setup function
const setupAdSystem = async () => {
  try {
    // Step 1: Initialize AdSense
    await initializeAdSense();
    
    // Step 2: Setup initial configuration
    await setupInitialConfig();
    
    // Step 3: Verify setup
    await verifySetup();
    
    // Step 4: Test ad status
    await testAdStatus();
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
};

// Export for use in other scripts
module.exports = {
  setupAdSystem,
  initializeAdSense,
  setupInitialConfig,
  verifySetup,
  testAdStatus,
  ADSENSE_CONFIG
};

// Run setup if this file is executed directly
if (require.main === module) {
  setupAdSystem().catch(console.error);
}