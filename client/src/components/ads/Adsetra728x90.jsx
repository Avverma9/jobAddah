import React, { useEffect } from 'react';

const DEFAULT_OPTIONS = {
  key: '01bf085eb7b230d788625afbcd2667fa',
  format: 'iframe',
  height: 90,
  width: 728,
  params: {}
};

const AdBanner728x90 = ({ options = DEFAULT_OPTIONS }) => {
  useEffect(() => {
    try {
      // Some ad providers expect a global `atOptions` object present before loading invoke.js
      // Set it on window so the script can read configuration
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

      const container = document.getElementById('ad-container-728x90');
      if (container) {
        container.appendChild(script);
      }

      return () => {
        // Cleanup: remove the injected script and global var
        if (container) {
          const children = Array.from(container.childNodes);
          children.forEach((c) => {
            if (c.tagName === 'SCRIPT' && c.src && c.src.includes(options.key)) container.removeChild(c);
          });
        }
        try { delete window.atOptions; } catch (e) { window.atOptions = undefined; }
      };
    } catch (err) {
      // swallow errors to avoid breaking the app when third-party script is blocked
      console.error('AdBanner728x90 load error', err);
    }
  }, [options]);

  return (
    <div id="ad-container-728x90" style={{ width: '728px', height: '90px' }}>
      {/* Ad will be injected here by the network's invoke.js */}
    </div>
  );
};

export default AdBanner728x90;
