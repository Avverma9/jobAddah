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
    console.error(`❌ ${method.toUpperCase()} ${endpoint}:`);
    console.error(error.response?.data || error.message);
    return null;
  }
};

// Test functions for new endpoints
const testInitializeAdSlots = () => apiCall('POST', '/slots/initialize', {
  publisherId: PUBLISHER_ID,
  adSlots: {
    banner: {
      enabled: true,
      priority: 1,
      adSlotId: "1234567890",
      format: "horizontal",
      description: "Top banner ads"
    },
    rectangle: {
      enabled: true,
      priority: 2,
      adSlotId: "4567890123",
      format: "rectangle",
      description: "Content rectangle ads"
    },
    inFeed: {
      enabled: true,
      priority: 3,
      adSlotId: "9012345678",
      format: "fluid",
      description: "In-feed native ads"
    },
    inArticle: {
      enabled: true,
      priority: 4,
      adSlotId: "3456789012",
      format: "fluid",
      description: "In-article content ads"
    },
    sidebar: {
      enabled: true,
      priority: 5,
      adSlotId: "5678901234",
      format: "vertical",
      description: "Sidebar ads for desktop"
    },
    footer: {
      enabled: true,
      priority: 6,
      adSlotId: "6789012345",
      format: "horizontal",
      description: "Footer banner ads"
    },
    mobileBanner: {
      enabled: true,
      priority: 7,
      adSlotId: "7890123456",
      format: "horizontal",
      description: "Mobile banner ads"
    },
    mobileRectangle: {
      enabled: true,
      priority: 8,
      adSlotId: "8901234567",
      format: "rectangle",
      description: "Mobile rectangle ads"
    }
  }
});

const testBulkUpdateSlots = (operation = 'disable', slotTypes = ['rectangle', 'sidebar']) => 
  apiCall('POST', '/slots/bulk-update', {
    publisherId: PUBLISHER_ID,
    operation,
    slotTypes,
    reason: `Testing bulk ${operation} operation`
  });

const testAdPlacement = (placement = 'banner', pageType = 'homepage') => 
  apiCall('POST', '/test-placement', {
    publisherId: PUBLISHER_ID,
    placement,
    pageType
  });

const testGetSlotMapping = () => apiCall('GET', '/slot-mapping');

const testEnhancedStatus = (pageType = 'homepage', slotType = 'banner') => 
  apiCall('GET', `/enhanced-status?pageType=${pageType}&slotType=${slotType}`);

const testUpdateSlotWithDetails = (slotType = 'banner') => 
  apiCall('POST', `/slot/${slotType}`, {
    publisherId: PUBLISHER_ID,
    enabled: true,
    priority: 1,
    adSlotId: "NEW_SLOT_ID_123",
    format: "auto",
    description: "Updated banner slot for testing"
  });

// Test new page types
const testNewPageTypes = async () => {
  const newPages = [
    { name: 'categoryPages', maxAds: 3 },
    { name: 'staticPages', maxAds: 2 },
    { name: 'blogPages', maxAds: 3 },
    { name: 'footer', maxAds: 1 }
  ];

  for (const page of newPages) {
    await apiCall('POST', `/page/${page.name}`, {
      publisherId: PUBLISHER_ID,
      enabled: true,
      maxAds: page.maxAds
    });
  }
};

// Comprehensive test suite
const runEnhancedTests = async () => {
  try {
    // Test 1: Initialize all ad slots
    await testInitializeAdSlots();

    // Test 2: Get slot mapping
    await testGetSlotMapping();

    // Test 3: Test enhanced status
    await testEnhancedStatus('homepage', 'banner');
    await testEnhancedStatus('jobDetail', 'inArticle');
    await testEnhancedStatus('categoryPages', 'inFeed');

    // Test 4: Test ad placement
    await testAdPlacement('banner', 'homepage');
    await testAdPlacement('rectangle', 'jobDetail');
    await testAdPlacement('inFeed', 'categoryPages');

    // Test 5: Update slot with detailed info
    await testUpdateSlotWithDetails('banner');

    // Test 6: Add new page types
    await testNewPageTypes();

    // Test 7: Bulk disable some slots
    await testBulkUpdateSlots('disable', ['rectangle', 'sidebar']);

    // Test 8: Test placement after bulk disable
    await testAdPlacement('rectangle', 'homepage');
    await testAdPlacement('sidebar', 'homepage');

    // Test 9: Bulk enable slots back
    await testBulkUpdateSlots('enable', ['rectangle', 'sidebar']);

    // Test 10: Final configuration check
    await apiCall('GET', '/');

  } catch (error) {
    console.error('❌ Enhanced tests failed:', error.message);
  }
};

// Individual test functions for manual testing
const manualTests = {
  // Test specific page and slot combinations
  testHomepageBanner: () => testEnhancedStatus('homepage', 'banner'),
  testJobDetailInArticle: () => testEnhancedStatus('jobDetail', 'inArticle'),
  testCategoryInFeed: () => testEnhancedStatus('categoryPages', 'inFeed'),
  testMobileBanner: () => testEnhancedStatus('homepage', 'mobileBanner'),
  
  // Test bulk operations
  disableAllRectangles: () => testBulkUpdateSlots('disable', ['rectangle', 'mobileRectangle']),
  enableAllBanners: () => testBulkUpdateSlots('enable', ['banner', 'mobileBanner', 'footer']),
  
  // Test new slot creation
  createCustomSlot: () => apiCall('POST', '/slot/customSlot', {
    publisherId: PUBLISHER_ID,
    enabled: true,
    priority: 10,
    adSlotId: "CUSTOM_SLOT_999",
    format: "responsive",
    description: "Custom slot for special pages"
  }),
  
  // Test placement validation
  testInvalidPlacement: () => testAdPlacement('invalidSlot', 'homepage'),
  testInvalidPageType: () => testAdPlacement('banner', 'invalidPage')
};

// Export for use in other scripts
module.exports = {
  runEnhancedTests,
  testInitializeAdSlots,
  testBulkUpdateSlots,
  testAdPlacement,
  testGetSlotMapping,
  testEnhancedStatus,
  testUpdateSlotWithDetails,
  testNewPageTypes,
  manualTests,
  apiCall
};

// Run tests if this file is executed directly
if (require.main === module) {
  const testType = process.argv[2];
  
  if (testType === 'manual') {
    Object.keys(manualTests).forEach(test => {
    });
  } else if (testType && manualTests[testType]) {
    manualTests[testType]().catch(console.error);
  } else {
    runEnhancedTests().catch(console.error);
  }
}