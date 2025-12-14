const mongoose = require('mongoose');

// AdSense Configuration Schema
const AdConfigSchema = new mongoose.Schema({
  publisherId: {
    type: String,
    required: true,
    unique: true
  },
  domain: {
    type: String,
    required: true
  },
  siteName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['under_review', 'approved', 'rejected'],
    default: 'under_review'
  },
  apiKey: {
    type: String,
    required: true
  },
  adsEnabled: {
    type: Boolean,
    default: true
  },
  globalSettings: {
    showAds: {
      type: Boolean,
      default: true
    },
    maxAdsPerPage: {
      type: Number,
      default: 6
    }
  },
  pageSettings: {
    homepage: {
      enabled: { type: Boolean, default: true },
      maxAds: { type: Number, default: 4 }
    },
    jobDetail: {
      enabled: { type: Boolean, default: true },
      maxAds: { type: Number, default: 4 }
    },
    jobList: {
      enabled: { type: Boolean, default: true },
      maxAds: { type: Number, default: 3 }
    },
    govtPost: {
      enabled: { type: Boolean, default: true },
      maxAds: { type: Number, default: 3 }
    },
    categoryPages: {
      enabled: { type: Boolean, default: true },
      maxAds: { type: Number, default: 3 }
    },
    staticPages: {
      enabled: { type: Boolean, default: true },
      maxAds: { type: Number, default: 2 }
    },
    footer: {
      enabled: { type: Boolean, default: true },
      maxAds: { type: Number, default: 1 }
    },
    blogPages: {
      enabled: { type: Boolean, default: true },
      maxAds: { type: Number, default: 3 }
    }
  },
  adSlots: {
    banner: {
      enabled: { type: Boolean, default: true },
      priority: { type: Number, default: 1 },
      adSlotId: { type: String, default: "1234567890" },
      format: { type: String, default: "horizontal" },
      description: { type: String, default: "Top banner ads" }
    },
    rectangle: {
      enabled: { type: Boolean, default: true },
      priority: { type: Number, default: 2 },
      adSlotId: { type: String, default: "4567890123" },
      format: { type: String, default: "rectangle" },
      description: { type: String, default: "Content rectangle ads" }
    },
    inFeed: {
      enabled: { type: Boolean, default: true },
      priority: { type: Number, default: 3 },
      adSlotId: { type: String, default: "9012345678" },
      format: { type: String, default: "fluid" },
      description: { type: String, default: "In-feed native ads" }
    },
    inArticle: {
      enabled: { type: Boolean, default: true },
      priority: { type: Number, default: 4 },
      adSlotId: { type: String, default: "3456789012" },
      format: { type: String, default: "fluid" },
      description: { type: String, default: "In-article content ads" }
    },
    sidebar: {
      enabled: { type: Boolean, default: true },
      priority: { type: Number, default: 5 },
      adSlotId: { type: String, default: "5678901234" },
      format: { type: String, default: "vertical" },
      description: { type: String, default: "Sidebar ads for desktop" }
    },
    footer: {
      enabled: { type: Boolean, default: true },
      priority: { type: Number, default: 6 },
      adSlotId: { type: String, default: "6789012345" },
      format: { type: String, default: "horizontal" },
      description: { type: String, default: "Footer banner ads" }
    },
    mobileBanner: {
      enabled: { type: Boolean, default: true },
      priority: { type: Number, default: 7 },
      adSlotId: { type: String, default: "7890123456" },
      format: { type: String, default: "horizontal" },
      description: { type: String, default: "Mobile banner ads" }
    },
    mobileRectangle: {
      enabled: { type: Boolean, default: true },
      priority: { type: Number, default: 8 },
      adSlotId: { type: String, default: "8901234567" },
      format: { type: String, default: "rectangle" },
      description: { type: String, default: "Mobile rectangle ads" }
    }
  },
  emergencyDisabled: {
    type: Boolean,
    default: false
  },
  disabledReason: String,
  disabledBy: String,
  disabledAt: Date,
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const AdConfig = mongoose.model('AdConfig', AdConfigSchema);

// Middleware to validate publisher ID
const validatePublisher = async (req, res, next) => {
  try {
    const publisherId = req.headers['x-publisher-id'];
    
    if (!publisherId) {
      return res.status(400).json({
        success: false,
        error: 'Publisher ID required in X-Publisher-ID header'
      });
    }

    const config = await AdConfig.findOne({ publisherId });
    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'Publisher not found. Please initialize first.'
      });
    }

    req.adConfig = config;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error validating publisher'
    });
  }
};

// Initialize AdSense Credentials (First Time Setup)
const initializeAdSense = async (req, res) => {
  try {
    const { publisherId, domain, siteName, apiKey } = req.body;

    if (!publisherId || !domain || !siteName || !apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: publisherId, domain, siteName, apiKey'
      });
    }

    // Check if already exists
    const existing = await AdConfig.findOne({ publisherId });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Publisher already initialized',
        publisherId,
        existingSince: existing.createdAt
      });
    }

    // Create new configuration
    const adConfig = new AdConfig({
      publisherId,
      domain,
      siteName,
      apiKey,
      adsEnabled: true,
      globalSettings: {
        showAds: true,
        maxAdsPerPage: 6
      }
    });

    await adConfig.save();

    res.status(201).json({
      success: true,
      message: 'AdSense credentials initialized successfully',
      publisherId,
      domain,
      siteName,
      credentialsStored: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Initialize AdSense Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize AdSense credentials'
    });
  }
};

// Get Ad Configuration
const  getAdConfig = async (req, res) => {
  try {
    const config = req.adConfig;

    // Return clean configuration
    const response = {
      publisherId: config.publisherId,
      domain: config.domain,
      siteName: config.siteName,
      status: config.status,
      adsEnabled: config.adsEnabled && !config.emergencyDisabled,
      globalSettings: config.globalSettings,
      pageSettings: config.pageSettings,
      adSlots: config.adSlots,
      emergencyDisabled: config.emergencyDisabled,
      lastUpdated: config.lastUpdated
    };

    res.json(response);

  } catch (error) {
    console.error('Get Ad Config Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get ad configuration'
    });
  }
};

// Update Global Ad Settings
const updateGlobalSettings = async (req, res) => {
  try {
    const { adsEnabled, showAds, maxAdsPerPage } = req.body;
    const config = req.adConfig;

    // Update global settings
    if (typeof adsEnabled === 'boolean') {
      config.adsEnabled = adsEnabled;
    }
    
    if (typeof showAds === 'boolean') {
      config.globalSettings.showAds = showAds;
    }
    
    if (typeof maxAdsPerPage === 'number') {
      config.globalSettings.maxAdsPerPage = maxAdsPerPage;
    }

    config.lastUpdated = new Date();
    await config.save();

    res.json({
      success: true,
      message: 'Global ad settings updated',
      adsEnabled: config.adsEnabled,
      globalSettings: config.globalSettings,
      lastUpdated: config.lastUpdated
    });

  } catch (error) {
    console.error('Update Global Settings Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update global settings'
    });
  }
};

// Update Page-Specific Settings
const updatePageSettings = async (req, res) => {
  try {
    const { pageType } = req.params;
    const { enabled, maxAds } = req.body;
    const config = req.adConfig;

    // Validate page type
    const validPages = ['homepage', 'jobDetail', 'jobList', 'govtPost'];
    if (!validPages.includes(pageType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid page type. Valid types: ${validPages.join(', ')}`
      });
    }

    // Initialize page settings if not exists
    if (!config.pageSettings[pageType]) {
      config.pageSettings[pageType] = {};
    }

    // Update page settings
    if (typeof enabled === 'boolean') {
      config.pageSettings[pageType].enabled = enabled;
    }
    
    if (typeof maxAds === 'number') {
      config.pageSettings[pageType].maxAds = maxAds;
    }

    config.lastUpdated = new Date();
    await config.save();

    res.json({
      success: true,
      message: `Page settings updated for ${pageType}`,
      pageType,
      settings: config.pageSettings[pageType],
      lastUpdated: config.lastUpdated
    });

  } catch (error) {
    console.error('Update Page Settings Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update page settings'
    });
  }
};

// Update Ad Slot Settings
const updateAdSlotSettings = async (req, res) => {
  try {
    const { slotType } = req.params;
    const { enabled, priority, adSlotId, format, description } = req.body;
    const config = req.adConfig;

    // Validate slot type
    const validSlots = ['banner', 'rectangle', 'inFeed', 'inArticle', 'sidebar', 'footer', 'mobileBanner', 'mobileRectangle'];
    if (!validSlots.includes(slotType)) {
      return res.status(400).json({
        success: false,
        error: `Invalid slot type. Valid types: ${validSlots.join(', ')}`
      });
    }

    // Initialize slot settings if not exists
    if (!config.adSlots[slotType]) {
      config.adSlots[slotType] = {};
    }

    // Update slot settings
    if (typeof enabled === 'boolean') {
      config.adSlots[slotType].enabled = enabled;
    }
    
    if (typeof priority === 'number') {
      config.adSlots[slotType].priority = priority;
    }

    if (adSlotId) {
      config.adSlots[slotType].adSlotId = adSlotId;
    }

    if (format) {
      config.adSlots[slotType].format = format;
    }

    if (description) {
      config.adSlots[slotType].description = description;
    }

    config.lastUpdated = new Date();
    await config.save();

    res.json({
      success: true,
      message: `Ad slot settings updated for ${slotType}`,
      slotType,
      settings: config.adSlots[slotType],
      lastUpdated: config.lastUpdated
    });

  } catch (error) {
    console.error('Update Ad Slot Settings Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update ad slot settings'
    });
  }
};

// Emergency Disable All Ads
const emergencyDisable = async (req, res) => {
  try {
    const { reason, disabledBy } = req.body;
    const config = req.adConfig;

    config.emergencyDisabled = true;
    config.disabledReason = reason || 'Emergency disable';
    config.disabledBy = disabledBy || 'system';
    config.disabledAt = new Date();
    config.lastUpdated = new Date();

    await config.save();

    res.json({
      success: true,
      message: 'All ads emergency disabled',
      reason: config.disabledReason,
      disabledBy: config.disabledBy,
      disabledAt: config.disabledAt
    });

  } catch (error) {
    console.error('Emergency Disable Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to emergency disable ads'
    });
  }
};

// Re-enable Ads (After Approval)
const enableAds = async (req, res) => {
  try {
    const { reason, enabledBy } = req.body;
    const config = req.adConfig;

    config.emergencyDisabled = false;
    config.adsEnabled = true;
    config.globalSettings.showAds = true;
    config.disabledReason = null;
    config.disabledBy = null;
    config.disabledAt = null;
    config.lastUpdated = new Date();

    // Update status if provided
    if (reason && reason.includes('approved')) {
      config.status = 'approved';
    }

    await config.save();

    res.json({
      success: true,
      message: 'Ads re-enabled successfully',
      reason: reason || 'Manual enable',
      enabledBy: enabledBy || 'system',
      status: config.status,
      enabledAt: config.lastUpdated
    });

  } catch (error) {
    console.error('Enable Ads Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to enable ads'
    });
  }
};

// Health Check
const healthCheck = (req, res) => {
  res.json({
    success: true,
    message: 'Ad Control API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
};

// Get Ad Status for Frontend
const getAdStatus = async (req, res) => {
  try {
    const { pageType, slotType } = req.query;
    const config = req.adConfig;

    // Check if ads should show
    const shouldShowAds = config.adsEnabled && 
                         config.globalSettings.showAds && 
                         !config.emergencyDisabled;

    let pageEnabled = true;
    let slotEnabled = true;

    // Check page-specific settings
    if (pageType && config.pageSettings[pageType]) {
      pageEnabled = config.pageSettings[pageType].enabled;
    }

    // Check slot-specific settings
    if (slotType && config.adSlots[slotType]) {
      slotEnabled = config.adSlots[slotType].enabled;
    }

    const finalStatus = shouldShowAds && pageEnabled && slotEnabled;

    res.json({
      shouldShow: finalStatus,
      globalEnabled: shouldShowAds,
      pageEnabled,
      slotEnabled,
      publisherId: config.publisherId,
      maxAdsPerPage: config.globalSettings.maxAdsPerPage,
      lastUpdated: config.lastUpdated
    });

  } catch (error) {
    console.error('Get Ad Status Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get ad status'
    });
  }
};

// Initialize All Ad Slots
const initializeAdSlots = async (req, res) => {
  try {
    const { adSlots } = req.body;
    const config = req.adConfig;

    if (!adSlots || typeof adSlots !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'adSlots object is required'
      });
    }

    // Update all ad slots
    Object.keys(adSlots).forEach(slotType => {
      config.adSlots[slotType] = {
        ...config.adSlots[slotType],
        ...adSlots[slotType]
      };
    });

    config.lastUpdated = new Date();
    await config.save();

    res.json({
      success: true,
      message: 'All ad slots initialized successfully',
      adSlots: config.adSlots,
      lastUpdated: config.lastUpdated
    });

  } catch (error) {
    console.error('Initialize Ad Slots Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize ad slots'
    });
  }
};

// Bulk Update Ad Slots
const bulkUpdateAdSlots = async (req, res) => {
  try {
    const { operation, slotTypes, reason } = req.body;
    const config = req.adConfig;

    if (!operation || !slotTypes || !Array.isArray(slotTypes)) {
      return res.status(400).json({
        success: false,
        error: 'operation and slotTypes array are required'
      });
    }

    const validOperations = ['enable', 'disable'];
    if (!validOperations.includes(operation)) {
      return res.status(400).json({
        success: false,
        error: `Invalid operation. Valid operations: ${validOperations.join(', ')}`
      });
    }

    const updatedSlots = {};
    const enabled = operation === 'enable';

    slotTypes.forEach(slotType => {
      if (config.adSlots[slotType]) {
        config.adSlots[slotType].enabled = enabled;
        updatedSlots[slotType] = config.adSlots[slotType];
      }
    });

    config.lastUpdated = new Date();
    await config.save();

    res.json({
      success: true,
      message: `Bulk ${operation} completed for ${slotTypes.length} ad slots`,
      operation,
      slotTypes,
      reason: reason || `Bulk ${operation} operation`,
      updatedSlots,
      lastUpdated: config.lastUpdated
    });

  } catch (error) {
    console.error('Bulk Update Ad Slots Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to bulk update ad slots'
    });
  }
};

// Test Ad Placement
const testAdPlacement = async (req, res) => {
  try {
    const { placement, pageType } = req.body;
    const config = req.adConfig;

    if (!placement || !pageType) {
      return res.status(400).json({
        success: false,
        error: 'placement and pageType are required'
      });
    }

    // Check if ads should show
    const shouldShowAds = config.adsEnabled && 
                         config.globalSettings.showAds && 
                         !config.emergencyDisabled;

    let pageEnabled = true;
    let slotEnabled = true;
    let adSlotId = null;
    let format = 'auto';

    // Check page-specific settings
    if (config.pageSettings[pageType]) {
      pageEnabled = config.pageSettings[pageType].enabled;
    }

    // Check slot-specific settings
    if (config.adSlots[placement]) {
      slotEnabled = config.adSlots[placement].enabled;
      adSlotId = config.adSlots[placement].adSlotId;
      format = config.adSlots[placement].format;
    }

    const finalStatus = shouldShowAds && pageEnabled && slotEnabled;

    res.json({
      success: true,
      testResult: {
        shouldShow: finalStatus,
        placement,
        pageType,
        adSlotId,
        format,
        checks: {
          globalEnabled: shouldShowAds,
          pageEnabled,
          slotEnabled,
          emergencyDisabled: config.emergencyDisabled
        }
      },
      publisherId: config.publisherId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test Ad Placement Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to test ad placement'
    });
  }
};

// Get Ad Slot Mapping
const getAdSlotMapping = async (req, res) => {
  try {
    const config = req.adConfig;

    // Create slot mapping for frontend
    const slotMapping = {
      banner: {
        homepage: config.adSlots.banner?.adSlotId || "1234567890",
        jobDetail: config.adSlots.banner?.adSlotId || "2345678901",
        categoryPages: config.adSlots.banner?.adSlotId || "1234567890",
        staticPages: config.adSlots.banner?.adSlotId || "1234567890",
        footer: config.adSlots.footer?.adSlotId || "6789012345"
      },
      rectangle: {
        homepage: config.adSlots.rectangle?.adSlotId || "0123456789",
        jobDetail: config.adSlots.rectangle?.adSlotId || "4567890123",
        categoryPages: config.adSlots.rectangle?.adSlotId || "4567890123",
        staticPages: config.adSlots.rectangle?.adSlotId || "2345678901"
      },
      inFeed: {
        homepage: config.adSlots.inFeed?.adSlotId || "9012345678",
        categoryPages: config.adSlots.inFeed?.adSlotId || "9012345678"
      },
      inArticle: {
        jobDetail: config.adSlots.inArticle?.adSlotId || "3456789012"
      },
      sidebar: {
        homepage: config.adSlots.sidebar?.adSlotId || "5678901234",
        jobDetail: config.adSlots.sidebar?.adSlotId || "5678901234"
      },
      mobileBanner: {
        homepage: config.adSlots.mobileBanner?.adSlotId || "7890123456",
        jobDetail: config.adSlots.mobileBanner?.adSlotId || "7890123456",
        categoryPages: config.adSlots.mobileBanner?.adSlotId || "7890123456"
      },
      mobileRectangle: {
        homepage: config.adSlots.mobileRectangle?.adSlotId || "8901234567",
        jobDetail: config.adSlots.mobileRectangle?.adSlotId || "8901234567"
      }
    };

    res.json({
      success: true,
      publisherId: config.publisherId,
      slotMapping,
      adSlots: config.adSlots,
      lastUpdated: config.lastUpdated
    });

  } catch (error) {
    console.error('Get Ad Slot Mapping Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get ad slot mapping'
    });
  }
};

// Get Enhanced Ad Status with Slot ID
const getEnhancedAdStatus = async (req, res) => {
  try {
    const { pageType, slotType } = req.query;
    const config = req.adConfig;

    // Check if ads should show
    const shouldShowAds = config.adsEnabled && 
                         config.globalSettings.showAds && 
                         !config.emergencyDisabled;

    let pageEnabled = true;
    let slotEnabled = true;
    let adSlotId = null;
    let format = 'auto';
    let description = '';

    // Check page-specific settings
    if (pageType && config.pageSettings[pageType]) {
      pageEnabled = config.pageSettings[pageType].enabled;
    }

    // Check slot-specific settings and get slot ID
    if (slotType && config.adSlots[slotType]) {
      slotEnabled = config.adSlots[slotType].enabled;
      adSlotId = config.adSlots[slotType].adSlotId;
      format = config.adSlots[slotType].format;
      description = config.adSlots[slotType].description;
    }

    const finalStatus = shouldShowAds && pageEnabled && slotEnabled;

    res.json({
      shouldShow: finalStatus,
      adSlotId,
      format,
      description,
      placement: slotType,
      pageType,
      globalEnabled: shouldShowAds,
      pageEnabled,
      slotEnabled,
      publisherId: config.publisherId,
      maxAdsPerPage: config.globalSettings.maxAdsPerPage,
      emergencyDisabled: config.emergencyDisabled,
      lastUpdated: config.lastUpdated
    });

  } catch (error) {
    console.error('Get Enhanced Ad Status Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get enhanced ad status'
    });
  }
};

module.exports = {
  initializeAdSense,
  getAdConfig,
  updateGlobalSettings,
  updatePageSettings,
  updateAdSlotSettings,
  emergencyDisable,
  enableAds,
  healthCheck,
  getAdStatus,
  getEnhancedAdStatus,
  initializeAdSlots,
  bulkUpdateAdSlots,
  testAdPlacement,
  getAdSlotMapping,
  validatePublisher
};