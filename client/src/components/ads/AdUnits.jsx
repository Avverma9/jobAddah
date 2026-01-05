"use client";
import { useEffect, useRef, useState } from 'react';

const MIN_RENDER_WIDTH = 80; // Google responsive ads need a tangible width

// Google AdSense Ad Units
const AdUnit = ({ slot, format = "auto", responsive = true, className = "" }) => {
  const containerRef = useRef(null);
  const insRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);

  // Detect visibility
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.05 }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  // Track container width with ResizeObserver (fallback to resize event)
  useEffect(() => {
    if (!containerRef.current) return;

    let resizeObserver;
    const measure = () => {
      const width = containerRef.current?.getBoundingClientRect().width || 0;
      setContainerWidth(width);
    };

    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerWidth(entry.contentRect.width);
        }
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

  // Attempt to load ad once visible + has width
  useEffect(() => {
    if (!isVisible || isLoaded) return;
    if (containerWidth < MIN_RENDER_WIDTH) return;

    let cancelled = false;

    const attemptLoad = () => {
      try {
        if (cancelled) return;
        if (typeof window === 'undefined') return;

        const containerEl = containerRef.current;
        const insEl = insRef.current;
        if (!containerEl || !insEl) return;

        const computed = window.getComputedStyle(containerEl);
        if (computed.display === 'none' || computed.visibility === 'hidden' || Number(computed.opacity) === 0) {
          return;
        }

        const width = Math.max(containerWidth, MIN_RENDER_WIDTH);
        insEl.style.width = `${width}px`;
        insEl.style.minWidth = `${MIN_RENDER_WIDTH}px`;
        insEl.style.display = 'block';

        (window.adsbygoogle = window.adsbygoogle || []).push({});
        setIsLoaded(true);
      } catch (err) {
        console.error('AdSense error:', err);
      }
    };

    const timer = window.setTimeout(attemptLoad, 150);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [isVisible, isLoaded, containerWidth, slot]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ minHeight: '90px', minWidth: `${MIN_RENDER_WIDTH}px` }}
    >
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

// Horizontal ad - main ad unit for content areas
export const HorizontalAd = ({ className = "" }) => (
  <AdUnit 
    slot="5781285537"
    format="auto"
    responsive={true}
    className={`w-full ${className}`}
  />
);

// Sidebar ad for desktop (160x600 or responsive)
export const SidebarAd = ({ className = "" }) => (
  <AdUnit 
    slot="5781285537" // Using horizontal ad slot
    format="auto"
    responsive={true}
    className={`hidden lg:flex justify-center ${className}`}
  />
);

// Mobile banner ad (320x50 or responsive)
export const MobileBannerAd = ({ className = "" }) => (
  <AdUnit 
    slot="5781285537" // Using horizontal ad slot
    format="auto"
    responsive={true}
    className={`flex lg:hidden justify-center ${className}`}
  />
);

// Leaderboard ad for desktop (728x90 or responsive)
export const LeaderboardAd = ({ className = "" }) => (
  <AdUnit 
    slot="5781285537" // Using horizontal ad slot
    format="auto"
    responsive={true}
    className={`hidden md:flex justify-center ${className}`}
  />
);

export default AdUnit;
