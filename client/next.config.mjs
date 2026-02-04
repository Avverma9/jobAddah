/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/resume-maker",
        destination: "/tools/resume",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
