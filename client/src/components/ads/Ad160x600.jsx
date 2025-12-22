import React, { useEffect } from 'react';

const DEFAULT_OPTIONS = {
  key: '3980da1481f07e66820a4c64083d9467',
  format: 'iframe',
  height: 600,
  width: 160,
  params: {}
};

const Ad160x600 = ({ options = DEFAULT_OPTIONS }) => {
  useEffect(() => {
    try {
      // Provide the global options object expected by the provider
      window.atOptions = {
        key: options.key,
        format: options.format,
        height: options.height,
        width: options.width,
        params: options.params || {}
      };

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://www.highperformanceformat.com/${options.key}/invoke.js`;
      script.async = true;

      const container = document.getElementById('ad-container-160x600');
      if (container) container.appendChild(script);

      return () => {
        // Cleanup injected script and global
        if (container) {
          const children = Array.from(container.childNodes);
          children.forEach((c) => {
            if (c.tagName === 'SCRIPT' && c.src && c.src.includes(options.key)) container.removeChild(c);
          });
        }
        try { delete window.atOptions; } catch (e) { window.atOptions = undefined; }
      };
    } catch (err) {
      // Fail silently to avoid breaking the app when third-party scripts are blocked
      console.error('Ad160x600 load error', err);
    }
  }, [options]);

  return (
    // Keep markup minimal; consumer can wrap this in responsive utilities.
    <div id="ad-container-160x600" style={{ width: `${DEFAULT_OPTIONS.width}px`, height: `${DEFAULT_OPTIONS.height}px` }}>
      {/* Provider will inject iframe or creative here */}
    </div>
  );
};

export default Ad160x600;
