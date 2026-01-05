"use client";

import { useEffect, useRef, useState } from "react";

const ADS_CLIENT = "ca-pub-5390089359360512";
const MIN_WIDTH = 120;

const AdUnit = ({
  slot,
  className = "",
  format = "auto",
  responsive = true,
}) => {
  const containerRef = useRef(null);
  const insRef = useRef(null);
  const pushedRef = useRef(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pushedRef.current) return;

    const container = containerRef.current;
    const ins = insRef.current;
    if (!container || !ins) return;

    const width = container.getBoundingClientRect().width;
    if (width < MIN_WIDTH) return; // 🚫 width = 0 guard

    try {
      pushedRef.current = true;
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      pushedRef.current = false;
      return;
    }

    // 🔍 Watch for actual ad render (iframe injection)
    const observer = new MutationObserver(() => {
      const iframe = ins.querySelector("iframe");
      if (iframe) {
        setVisible(true);
        observer.disconnect();
      }
    });

    observer.observe(ins, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [slot]);

  return (
    <div
      ref={containerRef}
      className={`w-full overflow-hidden transition-all duration-200 ${
        visible ? "opacity-100" : "opacity-0 h-0"
      }`}
      aria-hidden={!visible}
    >
      <div className={className}>
        <ins
          ref={insRef}
          className="adsbygoogle block w-full"
          style={{ display: "block" }}
          data-ad-client={ADS_CLIENT}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive ? "true" : "false"}
        />
      </div>
    </div>
  );
};

export default AdUnit;

export const HorizontalAd = ({ className = "" }) => (
  <AdUnit slot="5781285537" className={className} />
);
