import React, { useState, useEffect } from 'react';
import { initGtag, pageview } from '../util/gtag';

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = window.localStorage.getItem('jobsaddah_consent');
      if (!consent) setVisible(true);
    } catch (e) {
      // ignore
    }
  }, []);

  const accept = () => {
    try {
      window.localStorage.setItem('jobsaddah_consent', 'accepted');
      const gtagId = import.meta.env.VITE_GTAG_ID || 'G-XXXXXXXXXX';
      initGtag(gtagId);
      pageview(window.location.pathname + window.location.search);
    } catch (e) {}
    setVisible(false);
  };

  const decline = () => {
    try { window.localStorage.setItem('jobsaddah_consent', 'declined'); } catch (e) {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 z-50 max-w-xl mx-auto">
      <div className="bg-white dark:bg-gray-900 border p-4 rounded-lg shadow-lg flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex-1 text-xs text-gray-800 dark:text-gray-200">We use cookies and analytics to improve the site and show relevant ads. By accepting, you allow analytics tracking. You can change this later in browser settings.</div>
        <div className="flex-shrink-0 flex gap-2">
          <button onClick={decline} className="px-3 py-1 rounded border text-xs">Decline</button>
          <button onClick={accept} className="px-3 py-1 rounded bg-blue-600 text-white text-xs">Accept</button>
        </div>
      </div>
    </div>
  );
}
