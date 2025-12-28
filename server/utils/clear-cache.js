// utils/clearCache.js (Node.js server)
const axios = require('axios');

async function clearNextJsCache() {
  try {
    const response = await axios.post(
      `${process.env.NEXTJS_APP_URL || "https://jobsaddah.com"}/api/admin/clear-cache`,
      {},
      {
       
        timeout: 5000
      }
    );
    
    console.log('✅ Cache cleared:', response.data.message);
    return { success: true };
    
  } catch (error) {
    console.warn('⚠️ Cache clear failed:', error.message);
    return { success: false };
  }
}

module.exports = { clearNextJsCache };
