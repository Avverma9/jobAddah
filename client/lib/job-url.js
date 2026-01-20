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
    let path = url.pathname;
    
    // Remove leading/trailing slashes for clean slug
    path = path.replace(/^\/+|\/+$/g, "");
    
    return `/post/${path}`;
  } catch (e) {
    return "#";
  }
}
