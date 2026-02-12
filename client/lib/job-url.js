export function buildCanonicalPath(path) {
  if (!path) return "/";
  try {
    // If it's a full URL, just return the pathname part or handle it
    if (path.startsWith("http")) {
      const url = new URL(path);
      return url.pathname;
    }
  } catch (e) {
    console.error("Error parsing path in buildCanonicalPath", e);
  }
  
  // Ensure starting slash
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  // Remove trailing slash if not root
  if (cleanPath.length > 1 && cleanPath.endsWith("/")) {
    return cleanPath.slice(0, -1);
  }
  return cleanPath;
}

export function getCleanPostUrl(link) {
  if (!link) return "#";
  try {
    const url = new URL(link, "https://example.com");
    const idParam = url.searchParams.get("id");
    const source = idParam || url.pathname;
    let path = String(source || "").replace(/^\/+|\/+$/g, "");
    if (!path) return "#";

    if (path.toLowerCase().startsWith("post/")) {
      return `/${path}`.replace(/\/+$/, "");
    }

    return `/post/${path}`.replace(/\/+$/, "");
  } catch (e) {
    return "#";
  }
}
