import { useEffect } from "react";

export default function SmartAdSense({ slotId, format = "auto" }) {
  useEffect(() => {
    if (!window.adsbygoogle) return;

    try {
      window.adsbygoogle.push({});
    } catch (e) {
      console.warn("AdSense error", e);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block" }}
      data-ad-client="ca-pub-7416335110977682"
      data-ad-slot={slotId}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
