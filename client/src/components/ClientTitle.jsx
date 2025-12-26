"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function humanizeSegment(s) {
  return s
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ClientTitle() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname && pathname.startsWith("/post")) {
      return;
    }
    let title = "JobsAddah";
    if (!pathname || pathname === "/") {
      title = "JobsAddah";
    } else {
      const parts = pathname.split("/").filter(Boolean).map(humanizeSegment);
      title = `${parts.join(" - ")} — JobsAddah`;
    }
    document.title = title;

    // Optionally update the favicon for the root path only
    try {
      const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
      link.type = 'image/png';
      link.rel = 'icon';
      // Use /logo.png (public folder)
      link.href = '/logo.png';
      if (!document.querySelector("link[rel*='icon']")) document.getElementsByTagName('head')[0].appendChild(link);
    } catch (e) {
      // ignore
    }
  }, [pathname]);

  return null;
}
