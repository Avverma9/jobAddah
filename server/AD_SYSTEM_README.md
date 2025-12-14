# 🎯 JobsAddah Dynamic Ad Control System

Complete API-controlled AdSense management system for JobsAddah with real-time ad control and smart space management.

## 🚀 Quick Start

### 1. Start Your Server
```bash
npm start
# Server runs on http://localhost:5000
```

### 2. Initialize AdSense (First Time Only)
```bash
node setup-ad-system.js
```

### 3. Test API Endpoints
```bash
node test-ad-api.js
```

## 📋 Your AdSense Details

- **Publisher ID**: `ca-pub-7416335110977682`
- **Domain**: `jobsaddah.com`
- **Site Name**: JobsAddah - Sarkari Result 2025
- **Status**: Under Review (Getting Ready)

## 🔧 API Endpoints

### Base URL: `http://localhost:5000/api/v1/ad-config`

### 1. Health Check
```bash
GET /api/v1/ad-config/health
```

### 2. Initialize AdSense (First Time)
```bash
POST /api/v1/ad-config/initialize
Content-Type: application/json

{
  "publisherId": "ca-pub-7416335110977682",
  "domain": "jobsaddah.com",
  "siteName": "JobsAddah - Sarkari Result 2025",
  "apiKey": "jobsaddah-secure-key-2025"
}
```

### 3. Get Ad Configuration
```bash
GET /api/v1/ad-config/
Headers: X-Publisher-ID: ca-pub-7416335110977682
```

### 4. Get Ad Status (Frontend)
```bash
GET /api/v1/ad-config/status?pageType=homepage&slotType=banner
Headers: X-Publisher-ID: ca-pub-7416335110977682
```

### 5. Update Global Settings
```bash
POST /api/v1/ad-config/global
Headers: X-Publisher-ID: ca-pub-7416335110977682
Content-Type: application/json

{
  "publisherId": "ca-pub-7416335110977682",
  "adsEnabled": true,
  "showAds": true,
  "maxAdsPerPage": 6
}
```

### 6. Update Page Settings
```bash
POST /api/v1/ad-config/page/homepage
Headers: X-Publisher-ID: ca-pub-7416335110977682
Content-Type: application/json

{
  "publisherId": "ca-pub-7416335110977682",
  "enabled": true,
  "maxAds": 4
}
```

### 7. Update Ad Slot Settings
```bash
POST /api/v1/ad-config/slot/banner
Headers: X-Publisher-ID: ca-pub-7416335110977682
Content-Type: application/json

{
  "publisherId": "ca-pub-7416335110977682",
  "enabled": true,
  "priority": 1
}
```

### 8. Emergency Disable All Ads
```bash
POST /api/v1/ad-config/emergency-disable
Headers: X-Publisher-ID: ca-pub-7416335110977682
Content-Type: application/json

{
  "publisherId": "ca-pub-7416335110977682",
  "reason": "AdSense policy violation",
  "disabledBy": "admin"
}
```

### 9. Re-enable Ads
```bash
POST /api/v1/ad-config/enable
Headers: X-Publisher-ID: ca-pub-7416335110977682
Content-Type: application/json

{
  "publisherId": "ca-pub-7416335110977682",
  "reason": "AdSense approved",
  "enabledBy": "admin"
}
```

## 🎯 Common Use Cases

### AdSense Policy Violation Response
```bash
# Instantly disable all ads
curl -X POST http://localhost:5000/api/v1/ad-config/emergency-disable \
  -H "Content-Type: application/json" \
  -H "X-Publisher-ID: ca-pub-7416335110977682" \
  -d '{
    "publisherId": "ca-pub-7416335110977682",
    "reason": "Policy violation detected",
    "disabledBy": "system"
  }'
```

### A/B Testing
```bash
# Disable ads on specific page
curl -X POST http://localhost:5000/api/v1/ad-config/page/homepage \
  -H "Content-Type: application/json" \
  -H "X-Publisher-ID: ca-pub-7416335110977682" \
  -d '{
    "publisherId": "ca-pub-7416335110977682",
    "enabled": false
  }'
```

### Revenue Optimization
```bash
# Disable low-performing ad slots
curl -X POST http://localhost:5000/api/v1/ad-config/slot/sidebar \
  -H "Content-Type: application/json" \
  -H "X-Publisher-ID: ca-pub-7416335110977682" \
  -d '{
    "publisherId": "ca-pub-7416335110977682",
    "enabled": false,
    "reason": "Low performance"
  }'
```

### AdSense Approval Process
```bash
# When AdSense gets approved
curl -X POST http://localhost:5000/api/v1/ad-config/enable \
  -H "Content-Type: application/json" \
  -H "X-Publisher-ID: ca-pub-7416335110977682" \
  -d '{
    "publisherId": "ca-pub-7416335110977682",
    "reason": "AdSense approved for jobsaddah.com",
    "approvalDate": "2025-01-15"
  }'
```

## 📱 Frontend Integration

### React Hook Usage
```jsx
import { useAdControl } from './frontend-ad-utils';

const MyComponent = () => {
  const adStatus = useAdControl('homepage', 'banner');
  
  if (adStatus.loading) return null;
  
  return (
    <div>
      {adStatus.shouldShow && (
        <ins className="adsbygoogle"
             data-ad-client="ca-pub-7416335110977682"
             data-ad-slot="your-ad-slot"
             data-ad-format="auto">
        </ins>
      )}
    </div>
  );
};
```

### Smart Ad Component
```jsx
import { SmartAdSense } from './frontend-ad-utils';

<SmartAdSense 
  placement="banner" 
  pageType="homepage"
  adSlot="1234567890"
  adFormat="horizontal"
/>
```

### Ad Container with Fallback
```jsx
import { AdContainer } from './frontend-ad-utils';

<AdContainer 
  placement="rectangle" 
  pageType="jobDetail"
  adProps={{
    adSlot: "0987654321",
    adFormat: "rectangle"
  }}
  fallbackContent={<div>Alternative content</div>}
/>
```

## 🗄️ Database Schema

The system creates an `adconfigs` collection in MongoDB with this structure:

```javascript
{
  _id: ObjectId,
  publisherId: "ca-pub-7416335110977682",
  domain: "jobsaddah.com",
  siteName: "JobsAddah - Sarkari Result 2025",
  status: "under_review", // under_review, approved, rejected
  apiKey: "jobsaddah-secure-key-2025",
  adsEnabled: true,
  globalSettings: {
    showAds: true,
    maxAdsPerPage: 6
  },
  pageSettings: {
    homepage: { enabled: true, maxAds: 4 },
    jobDetail: { enabled: true, maxAds: 4 },
    jobList: { enabled: true, maxAds: 3 },
    govtPost: { enabled: true, maxAds: 3 }
  },
  adSlots: {
    banner: { enabled: true, priority: 1 },
    rectangle: { enabled: true, priority: 2 },
    inFeed: { enabled: true, priority: 3 },
    sidebar: { enabled: true, priority: 4 }
  },
  emergencyDisabled: false,
  disabledReason: null,
  disabledBy: null,
  disabledAt: null,
  lastUpdated: Date,
  createdAt: Date
}
```

## 🔒 Security Features

- **Publisher ID Validation**: All requests require valid publisher ID
- **API Key Authentication**: Secure initialization process
- **Input Validation**: All inputs are validated and sanitized
- **Error Handling**: Comprehensive error handling with fallbacks

## 📊 Monitoring & Analytics

### Check Ad Status
```bash
# Get current ad configuration
curl -H "X-Publisher-ID: ca-pub-7416335110977682" \
  http://localhost:5000/api/v1/ad-config/

# Check specific ad status
curl -H "X-Publisher-ID: ca-pub-7416335110977682" \
  "http://localhost:5000/api/v1/ad-config/status?pageType=homepage&slotType=banner"
```

### Frontend Logging
```javascript
// Check ad status in browser console
console.log('Ad banner on homepage:', shouldShow ? 'SHOW' : 'HIDE');
```

## 🚀 Production Deployment

### Environment Variables
```env
# .env file
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jobsaddah
ADSENSE_PUBLISHER_ID=ca-pub-7416335110977682
ADSENSE_DOMAIN=jobsaddah.com
API_SECRET_KEY=your-production-api-key
```

### Production API Calls
```bash
# Replace localhost with your production domain
API_BASE="https://your-api-domain.com/api/v1/ad-config"

# Initialize production
curl -X POST $API_BASE/initialize \
  -H "Content-Type: application/json" \
  -d '{
    "publisherId": "ca-pub-7416335110977682",
    "domain": "jobsaddah.com",
    "siteName": "JobsAddah",
    "apiKey": "your-production-api-key"
  }'
```

## 🎉 Benefits

### ✅ Complete Control
- Real-time ad enable/disable
- Page-specific ad management  
- Emergency controls for policy issues
- A/B testing capabilities

### ✅ Better UX
- No blank spaces when ads hidden
- Faster loading with smart caching
- Responsive design maintained
- Fallback content options

### ✅ Revenue Optimization
- Performance monitoring per ad slot
- Geographic targeting options
- User-based ad customization
- Scheduled controls for optimization

## 🛠️ Troubleshooting

### Common Issues

1. **"Publisher not found" Error**
   ```bash
   # Run initialization first
   node setup-ad-system.js
   ```

2. **Database Connection Issues**
   ```bash
   # Check MongoDB is running
   # Verify MONGODB_URI in .env
   ```

3. **API Not Responding**
   ```bash
   # Check server is running on correct port
   # Verify routes are properly configured
   ```

### Debug Commands
```bash
# Test health endpoint
curl http://localhost:5000/api/v1/ad-config/health

# Check if publisher exists
curl -H "X-Publisher-ID: ca-pub-7416335110977682" \
  http://localhost:5000/api/v1/ad-config/

# Run full test suite
node test-ad-api.js
```

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Run the test script: `node test-ad-api.js`
3. Verify your MongoDB connection
4. Check server logs for detailed error messages

---

**🎯 Your JobsAddah Ad Control System is now ready!**

Start with `node setup-ad-system.js` to initialize everything, then use the API endpoints to control your ads in real-time.