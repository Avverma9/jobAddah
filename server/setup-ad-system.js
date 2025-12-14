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
  console.log('🔧 Initializing AdSense credentials...');
  
  const result = await makeApiCall('POST', '/initialize', ADSENSE_CONFIG);
  
  if (result.success) {
    console.log('✅ AdSense credentials initialized successfully');
    console.log(`   Publisher ID: ${ADSENSE_CONFIG.publisherId}`);
    console.log(`   Domain: ${ADSENSE_CONFIG.domain}`);
    console.log(`   Site: ${ADSENSE_CONFIG.siteName}`);
  } else {
    console.log('❌ Failed to initialize AdSense credentials');
    console.log('   Error:', result.error);
  }
  
  return result;
};

const setupInitialConfig = async () => {
  console.log('⚙️ Setting up initial ad configuration...');
  
  // Global settings
  const globalResult = await makeApiCall('POST', '/global', {
    publisherId: ADSENSE_CONFIG.publisherId,
    adsEnabled: true,
    showAds: true,
    maxAdsPerPage: 6
  });

  if (globalResult.success) {
    console.log('✅ Global ad settings configured');
  } else {
    console.log('❌ Failed to configure global settings:', globalResult.error);
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
      console.log(`✅ ${page.name} page settings configured (max: ${page.maxAds} ads)`);
    } else {
      console.log(`❌ Failed to configure ${page.name}:`, pageResult.error);
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
      console.log(`✅ ${slot.name} ad slot configured (priority: ${slot.priority})`);
    } else {
      console.log(`❌ Failed to configure ${slot.name}:`, slotResult.error);
    }
  }
};

const verifySetup = async () => {
  console.log('🔍 Verifying setup...');
  
  const configResult = await makeApiCall('GET', '/');
  
  if (configResult.success) {
    console.log('✅ Ad configuration verified');
    console.log('   Configuration summary:');
    console.log(`   - Ads Enabled: ${configResult.data.adsEnabled}`);
    console.log(`   - Global Show Ads: ${configResult.data.globalSettings.showAds}`);
    console.log(`   - Max Ads Per Page: ${configResult.data.globalSettings.maxAdsPerPage}`);
    console.log(`   - Emergency Disabled: ${configResult.data.emergencyDisabled}`);
    console.log(`   - Status: ${configResult.data.status}`);
  } else {
    console.log('❌ Failed to verify setup:', configResult.error);
  }
  
  return configResult;
};

const testAdStatus = async () => {
  console.log('🧪 Testing ad status endpoints...');
  
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
      console.log(`   ${test.page}/${test.slot}: ${shouldShow}`);
    } else {
      console.log(`   ${test.page}/${test.slot}: Error - ${statusResult.error}`);
    }
  }
};

// Main setup function
const setupAdSystem = async () => {
  console.log('🚀 JobsAddah Ad Control System Setup\n');
  console.log('='.repeat(50));
  
  try {
    // Step 1: Initialize AdSense
    await initializeAdSense();
    console.log('');
    
    // Step 2: Setup initial configuration
    await setupInitialConfig();
    console.log('');
    
    // Step 3: Verify setup
    await verifySetup();
    console.log('');
    
    // Step 4: Test ad status
    await testAdStatus();
    console.log('');
    
    console.log('='.repeat(50));
    console.log('🎉 Ad Control System Setup Complete!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('1. Start your server: npm start');
    console.log('2. Test API endpoints using the test script');
    console.log('3. Integrate frontend components');
    console.log('4. Monitor ad performance');
    console.log('');
    console.log('🔗 API Endpoints Available:');
    console.log(`   Health: GET ${API_BASE_URL}/health`);
    console.log(`   Config: GET ${API_BASE_URL}/`);
    console.log(`   Status: GET ${API_BASE_URL}/status`);
    console.log(`   Emergency Disable: POST ${API_BASE_URL}/emergency-disable`);
    console.log(`   Enable: POST ${API_BASE_URL}/enable`);
    
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