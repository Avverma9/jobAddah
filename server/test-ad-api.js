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
    console.log(`✅ ${method.toUpperCase()} ${endpoint}:`, response.data);
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
  console.log('🚀 Starting Ad Control API Tests...\n');

  // Test 1: Health Check
  console.log('1. Testing Health Check...');
  await testHealthCheck();
  console.log('');

  // Test 2: Initialize (First time only)
  console.log('2. Testing Initialize...');
  await testInitialize();
  console.log('');

  // Test 3: Get Configuration
  console.log('3. Testing Get Configuration...');
  await testGetConfig();
  console.log('');

  // Test 4: Get Ad Status
  console.log('4. Testing Get Ad Status...');
  await testGetStatus('homepage', 'banner');
  console.log('');

  // Test 5: Update Global Settings
  console.log('5. Testing Update Global Settings...');
  await testUpdateGlobal(true, true, 6);
  console.log('');

  // Test 6: Update Page Settings
  console.log('6. Testing Update Page Settings...');
  await testUpdatePage('homepage', true, 4);
  console.log('');

  // Test 7: Update Slot Settings
  console.log('7. Testing Update Slot Settings...');
  await testUpdateSlot('banner', true, 1);
  console.log('');

  // Test 8: Emergency Disable
  console.log('8. Testing Emergency Disable...');
  await testEmergencyDisable();
  console.log('');

  // Test 9: Check Status After Disable
  console.log('9. Testing Status After Emergency Disable...');
  await testGetStatus('homepage', 'banner');
  console.log('');

  // Test 10: Re-enable Ads
  console.log('10. Testing Re-enable Ads...');
  await testEnable();
  console.log('');

  // Test 11: Final Status Check
  console.log('11. Final Status Check...');
  await testGetStatus('homepage', 'banner');
  console.log('');

  console.log('✅ All tests completed!');
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