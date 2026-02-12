import { NextResponse } from "next/server";

const LEGACY_STATIC_REDIRECTS = {
  "/post/about-us": "/about",
  "/post/privacy-policy": "/privacy-policy",
};

const LEGACY_VIEW_ALL_REDIRECTS = {
  "/post/admit-card": { name: "Admit Card", category: "admit-card" },
};

const normalizePathname = (value) => {
  const pathname = String(value || "/");
  if (pathname === "/") return "/";
  return pathname.replace(/\/+$/, "") || "/";
};

const buildViewAllRedirectUrl = (origin, target) => {
  const url = new URL("/view-all", origin);
  if (target?.name) url.searchParams.set("name", target.name);
  if (target?.category) url.searchParams.set("category", target.category);
  return url;
};

const toCanonicalPostPath = (value) => {
  if (!value) return null;
  try {
    const parsed = new URL(value, "https://jobsaddah.com");
    const path = parsed.pathname || "";
    if (path.startsWith("/post/")) return path;
    const clean = path.replace(/^\/+|\/+$/g, "");
    if (!clean) return null;
    return `/post/${clean}`;
  } catch {
    return null;
  }
};

export async function middleware(request) {
  const { pathname, searchParams, origin } = request.nextUrl;
  const normalizedPathname = normalizePathname(pathname);

  const legacyStaticTarget = LEGACY_STATIC_REDIRECTS[normalizedPathname];
  if (legacyStaticTarget) {
    return NextResponse.redirect(new URL(legacyStaticTarget, origin), 301);
  }

  const legacyViewAllTarget = LEGACY_VIEW_ALL_REDIRECTS[normalizedPathname];
  if (legacyViewAllTarget) {
    return NextResponse.redirect(
      buildViewAllRedirectUrl(origin, legacyViewAllTarget),
      301,
    );
  }

  if (normalizedPathname !== "/post") return NextResponse.next();

  const urlParam = searchParams.get("url");
  if (urlParam) {
    const canonical = toCanonicalPostPath(urlParam);
    if (canonical) {
      return NextResponse.redirect(new URL(canonical, origin), 301);
    }
    return NextResponse.redirect(new URL("/post", origin), 301);
  }

  const idParam = searchParams.get("id");
  if (idParam) {
    try {
      const apiUrl = new URL("/api/gov-post/post-details", origin);
      apiUrl.searchParams.set("id", idParam);
      const res = await fetch(apiUrl, { cache: "no-store" });
      if (res.ok) {
        const payload = await res.json();
        const data = payload?.data || payload?.result || payload?.post;
        const candidate =
          data?.sourceUrl ||
          data?.url ||
          data?.link ||
          data?._raw?.sourceUrl ||
          data?._raw?.url ||
          data?._raw?.link;
        const canonical = toCanonicalPostPath(candidate);
        if (canonical) {
          return NextResponse.redirect(new URL(canonical, origin), 301);
        }
      }
    } catch {
      return NextResponse.redirect(new URL("/post", origin), 301);
    }
    return NextResponse.redirect(new URL("/post", origin), 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/post", "/post/:path*"],
};
