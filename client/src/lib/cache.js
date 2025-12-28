// lib/cache.js - Simple cache helper
const cache = new Map();

export const getCache = (key) => {
  const item = cache.get(key);
  
  if (!item) return null;
  
  // Check if expired
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  
  return item.data;
};

export const setCache = (key, data, ttlSeconds = 300) => {
  cache.set(key, {
    data,
    expiry: Date.now() + (ttlSeconds * 1000)
  });
};

export const clearCache = (key) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear(); // Clear all
  }
};
