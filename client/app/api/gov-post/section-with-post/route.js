import { baseUrl } from "@/lib/baseUrl";
import { NextResponse } from "next/server";

function toText(value) {
  return String(value || "").trim();
}

function toPositiveInt(value, fallback, max = 200) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (Number.isNaN(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
}

function normalizePostItem(item) {
  const canonicalKey = toText(item?.canonicalKey);
  const title = toText(item?.title);
  if (!canonicalKey || !title) return null;

  const postDate = item?.postDate || item?.createdAt || item?.updatedAt || null;
  return {
    ...item,
    canonicalKey,
    title,
    postId: toText(item?.postId),
    postDetailId: toText(item?.postDetailId),
    megaSlug: toText(item?.megaSlug),
    postDate,
    createdAt: item?.createdAt || postDate,
    updatedAt: item?.updatedAt || postDate,
    url: `/post/${encodeURIComponent(canonicalKey)}`,
  };
}

function dedupeByCanonicalKey(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = toText(item?.canonicalKey).toLowerCase();
    if (!key) return false;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchJson(url) {
  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  const payload = await response.json().catch(() => null);
  return { response, payload };
}

export async function GET(request) {
  const searchParams = request?.nextUrl?.searchParams;
  const megaTitle = toText(searchParams?.get("megaTitle"));
  const page = toPositiveInt(searchParams?.get("page"), 1, 1000);
  const limit = toPositiveInt(searchParams?.get("limit"), 20, 100);
  const q = toText(searchParams?.get("q"));
  const sort = toText(searchParams?.get("sort"));
  const ai = toText(searchParams?.get("ai"));

  if (!megaTitle) {
    return NextResponse.json(
      {
        success: false,
        message: "megaTitle is required",
      },
      { status: 400 },
    );
  }

  const qs = new URLSearchParams({
    megaTitle,
    page: String(page),
    limit: String(limit),
  });
  if (q) qs.set("q", q);
  if (sort) qs.set("sort", sort);
  if (ai) qs.set("ai", ai);

  const upstreamUrl = `${baseUrl}/site/post-list-by-section-url?${qs.toString()}`;

  try {
    const { response, payload } = await fetchJson(upstreamUrl);
    const rawData = Array.isArray(payload?.data) ? payload.data : [];
    const pagination = payload?.pagination || {};
    const normalized = dedupeByCanonicalKey(
      rawData.map(normalizePostItem).filter(Boolean),
    );

    return NextResponse.json(
      {
        success: payload?.success ?? response.ok,
        count:
          typeof payload?.count === "number" ? payload.count : normalized.length,
        total: typeof pagination?.total === "number" ? pagination.total : null,
        page:
          typeof payload?.page === "number"
            ? payload.page
            : typeof pagination?.page === "number"
              ? pagination.page
              : page,
        limit:
          typeof payload?.limit === "number"
            ? payload.limit
            : typeof pagination?.limit === "number"
              ? pagination.limit
              : limit,
        totalPages:
          typeof payload?.totalPages === "number"
            ? payload.totalPages
            : typeof pagination?.pages === "number"
              ? pagination.pages
              : null,
        megaTitle,
        data: normalized,
      },
      { status: response.status },
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch section posts",
        error: error?.message || "Unknown error",
      },
      { status: 502 },
    );
  }
}
