import React from 'react';

const Adsterra728x90 = () => {
  return (
    <div className="ad-container">
      {/* Replace the iframe src with your Adsterra ad code */}
      <iframe
        src="https://your-adsterra-ad-code"
        width="728"
        height="90"
        style={{ border: 'none' }}
        title="Adsterra 728x90 Ad"
      ></iframe>

      <style jsx>{`
        .ad-container {
          display: none;
        }

        @media (min-width: 768px) {
          .ad-container {
            display: block;
            margin: 20px auto;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Adsterra728x90;