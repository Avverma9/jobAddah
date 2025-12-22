import React, { useEffect } from 'react';

const AdBanner728x90 = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://www.highperformanceformat.com/01bf085eb7b230d788625afbcd2667fa/invoke.js';
    script.async = true;

    const container = document.getElementById('ad-container-728x90');
    if (container) {
      container.appendChild(script);
    }
  }, []);

  return (
    <div id="ad-container-728x90" style={{ width: '728px', height: '90px' }}>
      {/* Ad will be injected here */}
    </div>
  );
};

export default AdBanner728x90;
