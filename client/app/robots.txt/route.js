import { NextResponse } from "next/server";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://jobsaddah.com").replace(/\/$/, "");
const ROBOTS = `User-agent: *
Allow: /
Disallow: /search
Disallow: /post?id=
Disallow: /view-all
Disallow: /api/
Allow: /ads.txt
Host: ${SITE_URL}
Sitemap: ${SITE_URL}/sitemap.xml
`;

export function GET() {
  return new NextResponse(ROBOTS, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
