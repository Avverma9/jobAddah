# Google AdSense Implementation Documentation

## 📋 Overview
Is application mein Google AdSense ads successfully implement kiye gaye hain. Sabhi ads horizontal format mein hain aur responsive hain (desktop aur mobile dono par properly display honge).

## 🔑 AdSense Configuration

### Account Details:
- **Publisher ID:** `ca-pub-5390089359360512`
- **Ad Slot ID:** `5781285537` (Horizontal Ad Unit)
- **Ad Format:** Auto (Responsive)
- **Full Width Responsive:** Enabled

### Script Location:
Main AdSense script `src/app/layout.js` mein load hoti hai:
```javascript
<Script 
  async 
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5390089359360512"
  crossOrigin="anonymous" 
  strategy="afterInteractive" 
/>
```

## 📁 Ad Components File Structure

### Main Component File: `src/components/ads/AdUnits.jsx`

Is file mein 4 ad components hain:

1. **HorizontalAd** - Main horizontal ad (full width)
2. **SidebarAd** - Desktop sidebar ke liye (currently horizontal ad use kar raha hai)
3. **MobileBannerAd** - Mobile ke liye banner ad
4. **LeaderboardAd** - Desktop ke liye leaderboard ad

**Note:** Sabhi components currently same horizontal ad slot (5781285537) use kar rahe hain.

## 📍 Ad Placements (Ads Kahan Lage Hain)

### 1. **Home Page** (`src/app/page.js`)
   - **Location 1:** Main heading ke baad
   - **Location 2:** FavJobsPreview aur Welcome sections ke beech
   - **Location 3:** Page ke bottom par
   
   ```javascript
   // Ad after heading
   <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
     <HorizontalAd />
   </div>
   ```

### 2. **Responsive Shell** (`src/components/ResponsiveShell.jsx`)
   - **Location 1:** Header ke neeche (global - har page par)
     - Desktop: Full width horizontal ad
     - Mobile: Horizontal ad
   - **Location 2:** Footer area (mobile only)
   
   ```javascript
   {/* Global Ads */}
   <div className="hidden lg:flex justify-center py-4 px-6 xl:px-10 2xl:px-16">
     <div className="w-full max-w-[90vw]"><HorizontalAd className="mx-auto" /></div>
   </div>
   ```

### 3. **Job Details Page** (`src/app/post/page.jsx`)
   - **Location:** Quick info grid ke turant baad
   - Job details dekhne se pehle ad dikhega
   
   ```javascript
   {/* Ad after header */}
   <div className="p-4 border-b border-slate-200">
     <HorizontalAd />
   </div>
   ```

### 4. **View All Jobs Page** (`src/app/view-all/page.jsx`)
   - **Location:** Page ke top par, header section se pehle
   
   ```javascript
   <div className="flex justify-center w-full my-4">
     <HorizontalAd />
   </div>
   ```

### 5. **Favorite Jobs Page** (`src/app/fav-jobs/page.jsx`)
   - **Location:** Trending jobs section ke baad, Tools section se pehle
   
   ```javascript
   {/* Ad after trending jobs */}
   <div className="px-3 sm:px-0 py-4">
     <HorizontalAd />
   </div>
   ```

### 6. **PDF Tool Page** (`src/app/pdf-tool/page.jsx`)
   - **Location 1:** Tool controls ke baad
   - **Location 2:** Page ke bottom par
   
   ```javascript
   <div className="flex justify-center mb-6">
     <HorizontalAd />
   </div>
   ```

## 🎨 Ad Display Behavior

### Desktop (Large Screens):
- Horizontal ads full width mein display honge
- Maximum width maintain karke center aligned
- Proper padding aur spacing ke saath

### Mobile (Small Screens):
- Horizontal ads responsive rahenge
- Screen width ke according adjust honge
- Touch-friendly spacing

## 🔧 Technical Implementation

### Ad Loading Process:
1. Page load hone par AdSense script automatically load hoti hai
2. Intersection Observer ensure karta hai ki ad tabhi load ho jab element viewport me aaye
3. Resize Observer (ya resize listener) se container ka actual width track hota hai
4. Jab width >= 80px hoti hai aur element visible hota hai tab `window.adsbygoogle.push({})` call hota hai
5. Ad render hone se pehle `<ins>` element ko measured width assign ki jati hai taaki AdSense ko exact slot size mile

### Ad Component Structure:
```javascript
const MIN_RENDER_WIDTH = 80;

const AdUnit = ({ slot, format = "auto", responsive = true, className = "" }) => {
  const containerRef = useRef(null);
  const insRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  // Intersection Observer -> visibility check
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.isIntersecting && setIsVisible(true));
    }, { threshold: 0.05 });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Resize Observer -> actual width capture
  useEffect(() => {
    if (!containerRef.current) return;
    let resizeObserver;
    const measure = () => setContainerWidth(containerRef.current?.getBoundingClientRect().width || 0);

    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) setContainerWidth(entry.contentRect.width);
      });
      resizeObserver.observe(containerRef.current);
    } else {
      window.addEventListener('resize', measure);
    }

    measure();
    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => {
    if (!isVisible || isLoaded || containerWidth < MIN_RENDER_WIDTH) return;

    const timer = window.setTimeout(() => {
      const insEl = insRef.current;
      if (!insEl) return;
      const width = Math.max(containerWidth, MIN_RENDER_WIDTH);
      insEl.style.width = `${width}px`;
      insEl.style.minWidth = `${MIN_RENDER_WIDTH}px`;
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      setIsLoaded(true);
    }, 150);

    return () => window.clearTimeout(timer);
  }, [isVisible, isLoaded, containerWidth, slot]);

  return (
    <div ref={containerRef} className={className} style={{ minHeight: '90px', minWidth: `${MIN_RENDER_WIDTH}px` }}>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client="ca-pub-5390089359360512"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive.toString()}
      />
    </div>
  );
};
```

### Error Handling:
- **Visibility Guard:** Intersection Observer ensure karta hai ki hidden elements ke liye push na ho
- **Width Tracking:** Resize Observer se width > 80px hone par hi load attempt hota hai
- **Timeout Protection:** 150ms delay se DOM stabilize hota hai before push
- **Try-Catch:** Koi error aaye to catch kar lete hain
- **Console Warnings:** Agar width mismatch ho to skip + log hota hai

## 📊 Ad Performance Tips

### Optimization:
1. **Placement:** Ads important content ke paas placed hain for better visibility
2. **Responsive:** All ads auto-responsive hain, kisi bhi screen size par properly display honge
3. **Non-intrusive:** Ads content flow ko disturb nahi karte
4. **Multiple Placements:** Strategic locations par multiple ads for better revenue

### Ad Policy Compliance:
- ✅ Ads clearly visible hain
- ✅ Accidental clicks avoid karne ke liye proper spacing
- ✅ Content aur ads ka clear distinction
- ✅ Mobile-friendly implementation

## 🚀 Future Improvements

Agar aap aur ad slots add karna chahte hain:

1. **AdSense Dashboard** mein jaakar naye ad units create karein
2. Nayi slot IDs ko `AdUnits.jsx` mein add karein
3. Components ko import karke desired locations par use karein

### Example:
```javascript
// Naya ad component banane ke liye
export const NewAdUnit = ({ className = "" }) => (
  <AdUnit 
    slot="YOUR_NEW_SLOT_ID"
    format="auto"
    responsive={true}
    className={`w-full ${className}`}
  />
);
```

## 🛠️ Maintenance

### Ad Blocked Scenario:
Agar user ad blocker use kar raha hai:
- Ads display nahi honge
- Console mein error message aa sakta hai (handled by try-catch)
- User experience affect nahi hoga

### Common Issues & Solutions:

#### Issue 1: "No slot size for availableWidth=0" Error
**Cause:** Ad container ki width 0 hai jab ad load ho raha hai
**Solution:** 
- Ad containers ko `w-full` class di gayi hai
- Parent containers ko bhi `w-full` class ensure ki gayi hai
- 100ms delay se DOM ready hone ka time milta hai
- Width check se pehle verify hota hai ki container visible hai

#### Issue 2: Ads Not Showing
**Possible Reasons:**
1. AdSense account pending approval
2. Ad blocker enabled
3. Container width 0 hai
4. Development mode (test ads dikhenge)

**Debug Steps:**
```javascript
// Console mein check karein:
console.log(window.adsbygoogle); // Should be an array
console.log(document.querySelector('.adsbygoogle').offsetWidth); // Should be > 0
```

### Testing:
1. Development environment mein ads test mode mein dikhenге
2. Production par actual ads display honge
3. AdSense approval ke baad full ads dikhenге

## 📝 Important Notes

1. **Build Cache:** Agar ads properly load nahi ho rahe, build cache clear karein:
   ```bash
   Remove-Item -Recurse -Force .next
   npm run dev
   ```

2. **AdSense Approval:** Ads properly display hone ke liye AdSense account approved hona chahiye

3. **Policy Compliance:** Google AdSense policies follow karein for long-term success

---

**Last Updated:** January 5, 2026
**Version:** 1.0
**Maintained by:** JobsAddah Team
