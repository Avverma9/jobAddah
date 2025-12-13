import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initGtag, pageview } from './util/gtag'

// SSG entrypoint for `vite-plugin-ssg`
export function createApp() {
  return (
    <StrictMode>
      <App />
    </StrictMode>
  );
}

if (!import.meta.env.SSR) {
  const root = createRoot(document.getElementById('root'))
  root.render(createApp())
  // Initialize Google Analytics / gtag for client-side tracking
  // Set your Measurement ID in an env var `VITE_GTAG_ID` or replace below
  try {
    const gtagId = import.meta.env.VITE_GTAG_ID || 'G-XXXXXXXXXX'
    const consent = typeof window !== 'undefined' ? window.localStorage.getItem('jobsaddah_consent') : null;
    const autostart = import.meta.env.VITE_ANALYTICS_AUTOSTART === 'true';
    // Initialize only if user already accepted consent or explicit autostart env var enabled
    if (consent === 'accepted' || autostart) {
      initGtag(gtagId)
      // send initial page view for SPA
      pageview(window.location.pathname + window.location.search)
    }
  } catch (err) {
    // ignore in SSR build or if gtag not available
  }
}
