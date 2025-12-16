const axios = require('axios');

// Configuration
const API_BASE_URL = 'http://localhost:5000/api/v1/ad-config';
const PUBLISHER_ID = 'ca-pub-7416335110977682';
const DOMAIN = 'jobsaddah.com';
const API_KEY = 'jobsaddah-secure-key-2025';

// Helper function to make API calls
const apiCall = async (method, endpoint, data = null, headers = {}) => {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'X-Publisher-ID': PUBLISHER_ID,
        ...headers
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ ${method.toUpperCase()} ${endpoint}:`, 
      error.response?.data || error.message);
    return null;
  }
};

// Test functions
const testHealthCheck = () => apiCall('GET', '/health');

const testInitialize = () => apiCall('POST', '/initialize', {
  publisherId: PUBLISHER_ID,
  domain: DOMAIN,
  siteName: 'JobsAddah - Sarkari Result 2025',
  apiKey: API_KEY
});

const testGetConfig = () => apiCall('GET', '/');

const testGetStatus = (pageType = 'homepage', slotType = 'banner') => 
  apiCall('GET', `/status?pageType=${pageType}&slotType=${slotType}`);

const testUpdateGlobal = (adsEnabled = true, showAds = true, maxAdsPerPage = 6) => 
  apiCall('POST', '/global', {
    publisherId: PUBLISHER_ID,
    adsEnabled,
    showAds,
    maxAdsPerPage
  });

const testUpdatePage = (pageType = 'homepage', enabled = true, maxAds = 4) => 
  apiCall('POST', `/page/${pageType}`, {
    publisherId: PUBLISHER_ID,
    enabled,
    maxAds
  });

const testUpdateSlot = (slotType = 'banner', enabled = true, priority = 1) => 
  apiCall('POST', `/slot/${slotType}`, {
    publisherId: PUBLISHER_ID,
    enabled,
    priority
  });

const testEmergencyDisable = () => apiCall('POST', '/emergency-disable', {
  publisherId: PUBLISHER_ID,
  reason: 'Testing emergency disable',
  disabledBy: 'test-script'
});

const testEnable = () => apiCall('POST', '/enable', {
  publisherId: PUBLISHER_ID,
  reason: 'Testing re-enable',
  enabledBy: 'test-script'
});

// Main test function
const runTests = async () => {
  // Test 1: Health Check
  await testHealthCheck();

  // Test 2: Initialize (First time only)
  await testInitialize();

  // Test 3: Get Configuration
  await testGetConfig();

  // Test 4: Get Ad Status
  await testGetStatus('homepage', 'banner');

  // Test 5: Update Global Settings
  await testUpdateGlobal(true, true, 6);

  // Test 6: Update Page Settings
  await testUpdatePage('homepage', true, 4);

  // Test 7: Update Slot Settings
  await testUpdateSlot('banner', true, 1);

  // Test 8: Emergency Disable
  await testEmergencyDisable();

  // Test 9: Check Status After Disable
  await testGetStatus('homepage', 'banner');

  // Test 10: Re-enable Ads
  await testEnable();

  // Test 11: Final Status Check
  await testGetStatus('homepage', 'banner');
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testHealthCheck,
  testInitialize,
  testGetConfig,
  testGetStatus,
  testUpdateGlobal,
  testUpdatePage,
  testUpdateSlot,
  testEmergencyDisable,
  testEnable,
  runTests
};