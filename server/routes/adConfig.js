const express = require('express');
const {
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
} = require('../controller/adController');

const router = express.Router();

// Health check endpoint
router.get('/health', healthCheck);

// Initialize AdSense credentials (First time setup)
router.post('/initialize', initializeAdSense);

// Get ad configuration (requires publisher validation)
router.get('/', validatePublisher, getAdConfig);

// Get ad status for frontend (lightweight endpoint)
router.get('/status', validatePublisher, getAdStatus);

// Get enhanced ad status with slot ID and format
router.get('/enhanced-status', validatePublisher, getEnhancedAdStatus);

// Get ad slot mapping for frontend
router.get('/slot-mapping', validatePublisher, getAdSlotMapping);

// Update global ad settings
router.post('/global', validatePublisher, updateGlobalSettings);

// Update page-specific settings
router.post('/page/:pageType', validatePublisher, updatePageSettings);

// Update ad slot settings
router.post('/slot/:slotType', validatePublisher, updateAdSlotSettings);

// Initialize all ad slots
router.post('/slots/initialize', validatePublisher, initializeAdSlots);

// Bulk update ad slots
router.post('/slots/bulk-update', validatePublisher, bulkUpdateAdSlots);

// Test ad placement
router.post('/test-placement', validatePublisher, testAdPlacement);

// Emergency disable all ads
router.post('/emergency-disable', validatePublisher, emergencyDisable);

// Re-enable ads (after approval)
router.post('/enable', validatePublisher, enableAds);

module.exports = router;