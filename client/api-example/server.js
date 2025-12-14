// api-example/server.js
// Simple Node.js API for Ad Control

const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory ad configuration (use database in production)
let adConfig = {
  adsEnabled: true,
  globalSettings: {
    showAds: true,
    maxAdsPerPage: 6,
    adRefreshInterval: 30000,
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
  },
  lastUpdated: new Date().toISOString()
};

// Routes

// Get ad configuration
app.get('/api/ad-config', (req, res) => {
  try {
    res.json(adConfig);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get ad config' });
  }
});

// Update global ad settings
app.post('/api/ad-config/global', (req, res) => {
  try {
    const { adsEnabled, showAds, maxAdsPerPage } = req.body;
    
    if (typeof adsEnabled !== 'undefined') {
      adConfig.adsEnabled = adsEnabled;
    }
    
    if (typeof showAds !== 'undefined') {
      adConfig.globalSettings.showAds = showAds;
    }
    
    if (typeof maxAdsPerPage !== 'undefined') {
      adConfig.globalSettings.maxAdsPerPage = maxAdsPerPage;
    }
    
    adConfig.lastUpdated = new Date().toISOString();
    
    res.json({ 
      success: true, 
      message: 'Global ad settings updated',
      config: adConfig 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update global settings' });
  }
});

// Update page-specific settings
app.post('/api/ad-config/page/:pageType', (req, res) => {
  try {
    const { pageType } = req.params;
    const { enabled, maxAds } = req.body;
    
    if (!adConfig.pageSettings[pageType]) {
      adConfig.pageSettings[pageType] = {};
    }
    
    if (typeof enabled !== 'undefined') {
      adConfig.pageSettings[pageType].enabled = enabled;
    }
    
    if (typeof maxAds !== 'undefined') {
      adConfig.pageSettings[pageType].maxAds = maxAds;
    }
    
    adConfig.lastUpdated = new Date().toISOString();
    
    res.json({ 
      success: true, 
      message: `Page settings updated for ${pageType}`,
      config: adConfig 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update page settings' });
  }
});

// Update ad slot settings
app.post('/api/ad-config/slot/:slotType', (req, res) => {
  try {
    const { slotType } = req.params;
    const { enabled, priority } = req.body;
    
    if (!adConfig.adSlots[slotType]) {
      adConfig.adSlots[slotType] = {};
    }
    
    if (typeof enabled !== 'undefined') {
      adConfig.adSlots[slotType].enabled = enabled;
    }
    
    if (typeof priority !== 'undefined') {
      adConfig.adSlots[slotType].priority = priority;
    }
    
    adConfig.lastUpdated = new Date().toISOString();
    
    res.json({ 
      success: true, 
      message: `Slot settings updated for ${slotType}`,
      config: adConfig 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update slot settings' });
  }
});

// Emergency ad disable (for policy violations, etc.)
app.post('/api/ad-config/emergency-disable', (req, res) => {
  try {
    adConfig.adsEnabled = false;
    adConfig.globalSettings.showAds = false;
    adConfig.lastUpdated = new Date().toISOString();
    
    res.json({ 
      success: true, 
      message: 'Ads disabled emergency mode',
      config: adConfig 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to disable ads' });
  }
});

// Re-enable ads
app.post('/api/ad-config/enable', (req, res) => {
  try {
    adConfig.adsEnabled = true;
    adConfig.globalSettings.showAds = true;
    adConfig.lastUpdated = new Date().toISOString();
    
    res.json({ 
      success: true, 
      message: 'Ads re-enabled',
      config: adConfig 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to enable ads' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    adsEnabled: adConfig.adsEnabled 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Ad Control API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Ad config: http://localhost:${PORT}/api/ad-config`);
});