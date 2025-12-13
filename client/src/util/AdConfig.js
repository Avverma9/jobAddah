// src/util/AdConfig.js
// AdSense Configuration for JobsAddah

export const AD_CLIENT = "ca-pub-7416335110977682";

// Ad Slot IDs - Replace these with your actual AdSense ad slot IDs
export const AD_SLOTS = {
  // Header/Top ads
  HEADER_BANNER: "1234567890",
  TOP_LEADERBOARD: "2345678901",
  
  // Content ads
  IN_ARTICLE: "3456789012",
  CONTENT_RECTANGLE: "4567890123",
  SIDEBAR_RECTANGLE: "5678901234",
  
  // Footer ads
  FOOTER_BANNER: "6789012345",
  
  // Mobile specific
  MOBILE_BANNER: "7890123456",
  MOBILE_RECTANGLE: "8901234567",
  
  // List/Feed ads
  FEED_AD: "9012345678",
  
  // Page specific
  HOME_RECTANGLE: "0123456789",
  POST_RECTANGLE: "1234567890",
  CONTACT_RECTANGLE: "2345678901"
};

// Ad Formats
export const AD_FORMATS = {
  AUTO: 'auto',
  RECTANGLE: 'rectangle',
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical',
  FLUID: 'fluid'
};

// Responsive ad sizes
export const AD_SIZES = {
  LEADERBOARD: { width: 728, height: 90 },
  RECTANGLE: { width: 300, height: 250 },
  LARGE_RECTANGLE: { width: 336, height: 280 },
  BANNER: { width: 320, height: 50 },
  LARGE_BANNER: { width: 320, height: 100 },
  SKYSCRAPER: { width: 160, height: 600 }
};

// Ad placement configuration
export const AD_CONFIG = {
  // Show ads only in production
  ENABLED: process.env.NODE_ENV === 'production',
  
  // Minimum content length before showing in-article ads
  MIN_CONTENT_LENGTH: 500,
  
  // Delay before loading ads (in ms)
  LOAD_DELAY: 100,
  
  // Maximum ads per page
  MAX_ADS_PER_PAGE: 6
};

export default {
  AD_CLIENT,
  AD_SLOTS,
  AD_FORMATS,
  AD_SIZES,
  AD_CONFIG
};