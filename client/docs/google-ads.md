# Google Ads / Analytics integration

- Add your Google Measurement ID in an environment variable: create a `.env` file at project root with `VITE_GTAG_ID=G-XXXXXXXXXX` (replace with your ID).
- `index.html` already includes the `gtag.js` snippet. The app disables automatic `page_view` for SPA routing; the client initializes gtag from `src/util/gtag.js` and sends an initial page view.
- To track conversions or custom events, call `gtagEvent` from `src/util/gtag.js` with `{ action, category, label, value }`.
- For AdSense/Google Ads placements, add ad slots via Google AdSense scripts in the pages where you want to show ads and follow AdSense policy for layout and consent.
- Make sure to implement a consent mechanism (GDPR/CCPA) before enabling personalization and ad tracking in production.

If you want, I can add a consent banner component and an example ad-slot component next.

## AdSense AdSlot setup

- Recommended env vars (create `.env` at project root):
	- `VITE_ADSENSE_CLIENT=ca-pub-XXXXXXXXXXXX`
	- `VITE_ADSENSE_SLOT=1234567890`

- The repository includes `src/components/AdSlot.jsx` which injects a Google AdSense `ins` tag and the AdSense script when the user has accepted analytics/ads consent. The component is consent-gated and will not render if `localStorage.jobsaddah_consent !== 'accepted'`.

- Example usage (already added to the post page):

```jsx
<AdSlot
	client={import.meta.env.VITE_ADSENSE_CLIENT}
	slot={import.meta.env.VITE_ADSENSE_SLOT}
	style={{ display: 'block', width: '100%', height: '90px' }}
	className="my-4"
/>
```

- After adding your `VITE_ADSENSE_CLIENT` & `VITE_ADSENSE_SLOT`, test with the consent banner by accepting and watching the Network tab for requests to `pagead2.googlesyndication.com`.

Notes:
- Ensure your AdSense account is approved and the client/slot IDs are correct.
- Do not autofill consent; require explicit user action for personalized ads unless you have a valid legal basis.
