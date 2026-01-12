const getSiteOrigin = () => {
  const fallback = "https://jobsaddah.com";
  const envUrl =
    process.env.SITE_ORIGIN || process.env.NEXT_PUBLIC_SITE_URL || fallback;
  return envUrl.replace(/\/$/, "");
};

const DISALLOW_PATHS = [
  "/api/",
  "/admin",
  "/dashboard",
  "/auth",
  "/login",
  "/register",
];

export default function robots() {
  const siteOrigin = getSiteOrigin();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOW_PATHS,
      },
    ],
    sitemap: `${siteOrigin}/sitemap.xml`,
  };
}
