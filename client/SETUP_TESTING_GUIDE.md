# 🚀 Ad Control System - Setup & Testing Guide

## 📋 **Quick Setup Checklist**

### **✅ 1. Start the Ad Control API Server**
```bash
cd api-example
npm install
npm start
# Server runs on http://localhost:3001
```

### **✅ 2. Initialize Your AdSense Credentials**
```bash
# Initialize your specific AdSense account (FIRST TIME ONLY)
curl -X POST http://localhost:3001/api/ad-config/initialize \
  -H "Content-Type: application/json" \
  -d '{
    "publisherId": "ca-pub-7416335110977682",
    "domain": "jobsaddah.com",
    "siteName": "JobsAddah - Sarkari Result 2025",
    "apiKey": "jobsaddah-secure-key-2025"
  }'
```

### **✅ 3. Configure Environment Variables**
```bash
# Create/update .env.local
echo "VITE_API_BASE_URL=http://localhost:3001" > .env.local
```

### **✅ 4. Start Frontend Development Server**
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

### **✅ 5. Test Ad Control System**

#### **Check API Health:**
```bash
curl http://localhost:3001/api/health
```

#### **Get Current Ad Configuration:**
```bash
curl -H "X-Publisher-ID: ca-pub-7416335110977682" \
  http://localhost:3001/api/ad-config
```

#### **Test Emergency Disable:**
```bash
curl -X POST http://localhost:3001/api/ad-config/emergency-disable \
  -H "X-Publisher-ID: ca-pub-7416335110977682"
```

#### **Test Re-enable:**
```bash
curl -X POST http://localhost:3001/api/ad-config/enable \
  -H "X-Publisher-ID: ca-pub-7416335110977682"
```

## 🧪 **Testing Scenarios**

### **Scenario 1: Development Mode (Ads Hidden)**
1. Start both servers
2. Visit http://localhost:5173
3. **Expected**: No ads visible, no blank spaces
4. Check browser console for "Ad config" logs

### **Scenario 2: Enable Ads via API**
1. Enable ads globally:
```bash
curl -X POST http://localhost:3001/api/ad-config/global \
  -H "Content-Type: application/json" \
  -H "X-Publisher-ID: ca-pub-7416335110977682" \
  -d '{
    "publisherId": "ca-pub-7416335110977682",
    "adsEnabled": true,
    "showAds": true
  }'
```
2. Refresh page
3. **Expected**: Ad placeholders visible (AdSense won't load in localhost)

### **Scenario 3: Page-Specific Control**
1. Disable ads on homepage only:
```bash
curl -X POST http://localhost:3001/api/ad-config/page/homepage \
  -H "Content-Type: application/json" \
  -H "X-Publisher-ID: ca-pub-7416335110977682" \
  -d '{
    "publisherId": "ca-pub-7416335110977682",
    "enabled": false
  }'
```
2. Visit homepage vs other pages
3. **Expected**: No ads on homepage, ads on other pages

### **Scenario 4: Slot-Specific Control**
1. Disable banner ads only:
```bash
curl -X POST http://localhost:3001/api/ad-config/slot/banner \
  -H "Content-Type: application/json" \
  -H "X-Publisher-ID: ca-pub-7416335110977682" \
  -d '{
    "publisherId": "ca-pub-7416335110977682",
    "enabled": false
  }'
```
2. Check all pages
3. **Expected**: No banner ads, rectangle ads still show

## 🔍 **Debugging Tips**

### **Check Browser Console:**
- Look for "Ad config" logs from useAdControl hook
- Check for API request errors
- Verify AdSense script loading

### **Check Network Tab:**
- API calls to `/api/ad-config` should return 200
- Verify X-Publisher-ID header is sent
- Check response contains your configuration

### **Common Issues:**

#### **❌ "Invalid or missing publisher ID"**
- **Solution**: Add X-Publisher-ID header to requests
- **Check**: curl commands include the header

#### **❌ Ads not showing after enabling**
- **Solution**: Clear browser cache and localStorage
- **Check**: API response shows adsEnabled: true

#### **❌ API connection failed**
- **Solution**: Verify API server is running on port 3001
- **Check**: curl http://localhost:3001/api/health

#### **❌ Blank spaces still showing**
- **Solution**: Ensure AdContainer returns null when canShow is false
- **Check**: Component implementation in AdContainer.jsx

## 📊 **Production Deployment**

### **Environment Variables for Production:**
```env
# .env.production
VITE_API_BASE_URL=https://your-api-domain.com
VITE_ADSENSE_ENABLED=true
```

### **Production API Setup:**
1. Deploy API server to your hosting platform
2. Update VITE_API_BASE_URL to production API URL
3. Initialize credentials with production domain:
```bash
curl -X POST https://your-api-domain.com/api/ad-config/initialize \
  -H "Content-Type: application/json" \
  -d '{
    "publisherId": "ca-pub-7416335110977682",
    "domain": "jobsaddah.com",
    "siteName": "JobsAddah",
    "apiKey": "your-production-api-key"
  }'
```

### **AdSense Approval Process:**
1. Keep ads disabled during development
2. Enable ads only after AdSense approval:
```bash
curl -X POST https://your-api-domain.com/api/ad-config/enable \
  -H "Content-Type: application/json" \
  -H "X-Publisher-ID: ca-pub-7416335110977682" \
  -d '{
    "publisherId": "ca-pub-7416335110977682",
    "reason": "AdSense approved for jobsaddah.com"
  }'
```

## 🎯 **Success Indicators**

### **✅ System Working Correctly When:**
1. **API Health Check** returns status: "OK"
2. **Ad Config API** returns your publisher ID and settings
3. **Frontend Console** shows "Ad config" logs without errors
4. **Emergency Disable** immediately hides all ads
5. **Page-Specific Controls** work independently
6. **No Blank Spaces** when ads are disabled
7. **Real-time Updates** reflect within 5 minutes (cache refresh)

### **🚀 Ready for Production When:**
1. All test scenarios pass
2. AdSense approval received
3. Production API deployed and configured
4. Environment variables set correctly
5. Emergency controls tested and working

---

**Your dynamic ad control system is now fully implemented and ready for testing! 🎉**