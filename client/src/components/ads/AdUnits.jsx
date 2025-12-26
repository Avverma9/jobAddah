"use client";
import { useEffect, useRef, useState } from 'react';

const AD_BASE_URL = 'https://www.highperformanceformat.com';

const AD_CONFIGS = {
  sidebar: {
    key: '3980da1481f07e66820a4c64083d9467',
    width: 160,
    height: 600,
    format: 'iframe'
  },
  mobileBanner: {
    key: '52a59a395c89727fab5f4acc0d27ac12',
    width: 320,
    height: 50,
    format: 'iframe'
  },
  leaderboard: {
    key: '01bf085eb7b230d788625afbcd2667fa',
    width: 728,
    height: 90,
    format: 'iframe'
  }
};

const adQueue = [];
let isProcessingQueue = false;

const processAdQueue = () => {
  if (isProcessingQueue) return;
  const job = adQueue.shift();
  if (!job) return;

  const { container, config, label, onLoad, onError } = job;

  if (!container || job.cancelled) {
    processAdQueue();
    return;
  }

  try {
    isProcessingQueue = true;

    container.innerHTML = '';

    const configScript = document.createElement('script');
    configScript.type = 'text/javascript';
    configScript.innerHTML = `window.atOptions = ${JSON.stringify(config)};`;
    container.appendChild(configScript);

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `${AD_BASE_URL}/${config.key}/invoke.js`;
    script.async = true;

    const cleanupAndNext = () => {
      isProcessingQueue = false;
      processAdQueue();
    };

    const debugPrefix = `[Ads] ${label}`;

    script.onload = () => {
      console.debug(`${debugPrefix} script loaded`);
      if (!job.cancelled && onLoad) onLoad();
      cleanupAndNext();
    };

    script.onerror = (event) => {
      const message = event?.message || 'Failed to load ad script';
      console.error(`${debugPrefix} error: ${message}`, event);
      if (!job.cancelled && onError) onError(new Error(message));
      cleanupAndNext();
    };

    container.appendChild(script);

    // Failsafe timeout to keep queue moving if ad blocks silently
    window.setTimeout(() => {
      if (!isProcessingQueue) return;
      console.warn(`${debugPrefix} timed out – continuing queue`);
      cleanupAndNext();
    }, 6000);
  } catch (err) {
    console.error('[Ads] Unexpected error while processing queue', err);
    isProcessingQueue = false;
    processAdQueue();
  }
};

const enqueueAd = (job) => {
  adQueue.push(job);
  processAdQueue();
};

const AdUnit = ({ type, className = "", slotKey }) => {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const jobRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const config = AD_CONFIGS[type];
  if (!config) return null;

  useEffect(() => {
    if (!mounted) return;
    const container = containerRef.current;
    if (!container) {
      console.warn('[Ads] Missing container', type);
      return;
    }

    setLoading(true);
    setError(null);

    const label = slotKey || type;
    const job = {
      container,
      config,
      label,
      cancelled: false,
      onLoad: () => {
        setLoading(false);
        setError(null);
      },
      onError: (err) => {
        setLoading(false);
        setError(err?.message || 'Ad blocked');
      }
    };

    jobRef.current = job;

    console.debug(`[Ads] enqueue ${label}`, config);
    enqueueAd(job);

    return () => {
      job.cancelled = true;
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [mounted, config, type, slotKey]);

  const widthStyle = type === 'mobileBanner' ? '100%' : `${config.width}px`;
  const maxWidthStyle = type === 'mobileBanner' ? `${config.width}px` : undefined;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: widthStyle,
        maxWidth: maxWidthStyle,
        minHeight: `${config.height}px`
      }}
    >
      <div ref={containerRef} className="w-full h-full" />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-[10px] uppercase tracking-wide bg-slate-50 border border-dashed border-slate-200">
          Loading ad…
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-red-500 text-[10px] uppercase tracking-wide bg-red-50 border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
};

export const SidebarAd = ({ className = "" }) => (
  <AdUnit type="sidebar" className={`hidden lg:block ${className}`} />
);

export const MobileBannerAd = ({ className = "" }) => (
  <AdUnit type="mobileBanner" className={`block lg:hidden ${className}`} />
);

export const LeaderboardAd = ({ className = "" }) => (
  <AdUnit type="leaderboard" className={`hidden md:block ${className}`} />
);

export default AdUnit;
