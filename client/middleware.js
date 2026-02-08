import { NextResponse } from "next/server";

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
  if (pathname !== "/post") return NextResponse.next();

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
  matcher: ["/post"],
};
