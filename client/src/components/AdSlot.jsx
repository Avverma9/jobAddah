import React, { useEffect, useRef } from 'react';

// Simple AdSlot component that injects an AdSense ins/adsbygoogle slot when consented.
// Usage: <AdSlot client="ca-pub-XXXX" slot="YYYY" style={{ display: 'block' }} dataAdFormat="auto" />

export default function AdSlot({ client, slot, style, className = '', dataAdFormat = 'auto' }) {
  const ref = useRef(null);

  useEffect(() => {
    try {
      const consent = typeof window !== 'undefined' ? window.localStorage.getItem('jobaddah_consent') : null;
      if (consent !== 'accepted') return; // do not render ads if not accepted

      // If AdSense script not loaded, add it (non-personalized ads config omitted here)
      if (typeof window !== 'undefined' && !document.querySelector('script[data-adsbygoogle-init]')) {
        const s = document.createElement('script');
        s.setAttribute('async', '');
        s.setAttribute('data-adsbygoogle-init', 'true');
        s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        document.head.appendChild(s);
      }

      // create ins element if not present
      if (ref.current && !ref.current.querySelector('ins.adsbygoogle')) {
        const ins = document.createElement('ins');
        ins.className = 'adsbygoogle';
        if (client) ins.setAttribute('data-ad-client', client);
        if (slot) ins.setAttribute('data-ad-slot', slot);
        ins.setAttribute('style', Object.entries(style || { display: 'block' }).map(([k,v]) => `${k}:${v}`).join(';'));
        ins.setAttribute('data-ad-format', dataAdFormat);
        ref.current.appendChild(ins);

        try {
          // eslint-disable-next-line no-undef
          (adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
          // ignore until script loads
        }
      }
    } catch (e) {
      // ignore
    }
  }, [client, slot, style, dataAdFormat]);

  return <div ref={ref} className={className} />;
}
