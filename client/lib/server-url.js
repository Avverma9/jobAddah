import { headers } from "next/headers";

const DEFAULT_LOCAL = "http://localhost:3000";

export async function getBaseUrl() {
  const siteEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteEnv) return siteEnv.replace(/\/$/, "");

  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  if (!host) return DEFAULT_LOCAL;

  const proto = h.get("x-forwarded-proto") || "http";
  return `${proto}://${host}`;
}
