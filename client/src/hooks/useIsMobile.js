import { useState, useEffect } from "react";

/**
 * Custom hook to detect if the screen is mobile size
 * @param {number} breakpoint - The width breakpoint (default: 640px for sm)
 * @returns {boolean} - True if screen width is less than breakpoint
 */
export default function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < breakpoint);
    
    // Set initial value
    handleResize();
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}
