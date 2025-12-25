import React, { useEffect } from 'react';

const DEFAULT_OPTIONS = {
  key: '3980da1481f07e66820a4c64083d9467',
  format: 'iframe',
  height: 600,
  width: 160,
  params: {}
};

const Ads160x600 = ({
  options = DEFAULT_OPTIONS,
  // slot id (useful when rendering multiple instances)
  slot = "1",
  // Minimum viewport width required to show ad (px)
  minViewportWidth = 1400,
}) => {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;

    let timeout = null;
    const check = () => {
      const iw = window.innerWidth;
      setVisible(iw >= minViewportWidth);
    };

    check();
    const onResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(check, 120);
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      clearTimeout(timeout);
    };
  }, [minViewportWidth]);

  React.useEffect(() => {
    if (!visible) return;

    try {
      // Provide the global options object expected by the provider
      window.atOptions = {
        key: options.key,
        format: options.format,
        height: options.height,
        width: options.width,
        params: options.params || {},
      };

      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = `https://www.highperformanceformat.com/${options.key}/invoke.js`;
      script.async = true;

      const container = document.getElementById(`ad-container-160x600-${slot}`);
      // Only append script if container exists and is empty (prevents duplicate injection)
      if (container && container.childNodes.length === 0) container.appendChild(script);

      return () => {
        // Cleanup injected script and global
        if (container) {
          const children = Array.from(container.childNodes);
          children.forEach((c) => {
            if (c.tagName === 'SCRIPT' && c.src && c.src.includes(options.key)) container.removeChild(c);
          });
        }
        try {
          delete window.atOptions;
        } catch (e) {
          window.atOptions = undefined;
        }
      };
    } catch (err) {
      // Fail silently to avoid breaking the app when third-party scripts are blocked
      // eslint-disable-next-line no-console
      console.error('Ad160x600 load error', err);
    }
  }, [visible, options]);

  if (!visible) return null;

  return (
    // Keep markup minimal; consumer can wrap this in responsive utilities.
    <div
      id={`ad-container-160x600-${slot}`}
      style={{ width: `${options.width}px`, height: `${options.height}px` }}
      aria-hidden="true"
    />
  );
};

export default Ads160x600;
