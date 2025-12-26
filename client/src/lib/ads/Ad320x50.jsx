'use client'
import React, { useEffect, useState, useRef } from 'react';

const DEFAULT_OPTIONS = {
  key: '52a59a395c89727fab5f4acc0d27ac12',
  format: 'iframe',
  height: 50,
  width: 320,
  params: {}
};

const Ad320x50 = ({ options = DEFAULT_OPTIONS }) => {
  const [status, setStatus] = useState('idle');
  const containerRef = useRef(null);

  const injectScript = () => {
    const reportContainer = (container, reason) => {
      try {
        const rect = container.getBoundingClientRect ? container.getBoundingClientRect() : null;
        const style = window.getComputedStyle ? window.getComputedStyle(container) : null;
        console.warn('Ad 320x50 no-creative report:', { reason, isConnected: container.isConnected, childCount: container.childNodes.length, rect, display: style && style.display, visibility: style && style.visibility, overflow: style && style.overflow });
        Array.from(container.childNodes).forEach((n, i) => console.log('ad-child', i, n.nodeName, n.nodeType, n));
      } catch (e) {}
    };
    try {
      // Only inject mobile 320x50 on small viewports (< md)
      if (typeof window !== 'undefined' && window.innerWidth >= 768) return;

      setStatus('loading');

      // Set global atOptions for provider to read
      window.atOptions = {
        key: options.key,
        format: options.format,
        height: options.height,
        width: options.width,
        params: options.params || {}
      };

      const scriptSrc = `https://www.highperformanceformat.com/${options.key}/invoke.js`;
      const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);

      const container = containerRef.current || document.getElementById('ad-container-320x50');
      if (!container) {
        setStatus('failed');
        return;
      }

      if (!existingScript) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = scriptSrc;
        script.async = true;
        script.dataset.hpfInjected = 'true';
        script.onload = () => {
          setStatus('loaded');
          try { if (container) container.dataset.hpfLoaded = '1'; } catch (e) {}
          console.log('Ad 320x50 provider script loaded');
        };
        script.onerror = () => {
          setStatus('failed');
          try { if (container) container.dataset.hpfFailed = '1'; } catch (e) {}
          console.warn('Ad 320x50 provider script failed to load');
        };
        container.appendChild(script);
        container.dataset.hpfHasScript = '1';
        setTimeout(() => {
          try {
            if (container && container.childNodes.length === 1 && !container.dataset.hpfLoaded) {
                setStatus('no-creative');
                console.warn('Ad 320x50 container present but provider did not render creative. It may be blocked by extension or network.');
                reportContainer(container, 'initial-check-no-creative');
              }
          } catch (e) {}
        }, 3000);
      } else {
        const marker = document.createElement('div');
        marker.dataset.hpfMarker = 'true';
        container.appendChild(marker);
        setTimeout(() => {
          const hasCreative = Array.from(container.childNodes).some((n) => n.nodeName !== 'SCRIPT');
          if (hasCreative) setStatus('loaded');
          else {
            setStatus('no-creative');
            reportContainer(container, 'existing-script-check-no-creative');
          }
        }, 1500);
      }
    } catch (err) {
      console.error('Ad320x50 load error', err);
      setStatus('failed');
    }
  };

  useEffect(() => {
    injectScript();
    return () => {
      try {
        const containerEl = containerRef.current || document.getElementById('ad-container-320x50');
        if (containerEl) {
          const markers = Array.from(containerEl.querySelectorAll('[data-hpf-marker]'));
          markers.forEach((m) => m.parentNode && m.parentNode.removeChild(m));
          const scripts = Array.from(containerEl.querySelectorAll('script'));
          scripts.forEach((s) => {
            if (s.src && s.src.includes(options.key) && s.dataset.hpfInjected === 'true') s.remove();
          });
        }
      } catch (e) {}
      try { delete window.atOptions; } catch (e) { window.atOptions = undefined; }
    };
  }, [options]);

  const handleReload = () => {
    try {
      const container = containerRef.current || document.getElementById('ad-container-320x50');
      if (container) {
        Array.from(container.querySelectorAll('[data-hpf-marker]')).forEach((n) => n.remove());
        Array.from(container.querySelectorAll('script')).forEach((s) => {
          if (s.dataset.hpfInjected === 'true') s.remove();
        });
      }
    } catch (e) {}
    setStatus('idle');
    setTimeout(injectScript, 200);
  };
  

  return (
    <div
      id="ad-container-320x50"
      role="region"
      aria-label="Advertisement"
      style={{ width: '100%', maxWidth: `${options.width}px`, height: `${options.height}px`, margin: '0 auto' }}
    >
      {/* Ad will be injected here by the network's invoke.js */}
      {status === 'no-creative' || status === 'failed' ? (
        <div className="text-center text-xs text-gray-500 mt-2">
          <div>Ad not available (blocked or failed to load).</div>
          <button
            onClick={handleReload}
            className="mt-2 inline-block px-3 py-1 bg-blue-600 text-white rounded text-sm"
          >
            Retry Ad
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default Ad320x50;
