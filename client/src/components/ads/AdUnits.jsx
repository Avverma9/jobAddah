"use client";

import { useEffect, useRef } from "react";

const AdUnit = ({ slot, className = "", format = "auto", responsive = true }) => {
  const adRef = useRef(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!adRef.current) return;
    if (pushed.current) return;

    try {
      pushed.current = true;
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error:", err);
      pushed.current = false;
    }
  }, [slot]);

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle block w-full"
        style={{ display: "block" }}
        data-ad-client="ca-pub-5390089359360512"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
};

export default AdUnit;
export const HorizontalAd = ({ className = "" }) => (
  <AdUnit slot="5781285537" className={className} />
);
