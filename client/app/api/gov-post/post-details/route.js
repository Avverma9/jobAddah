import { baseUrl } from "@/lib/baseUrl";
import { NextResponse } from "next/server";

function toText(value) {
  return String(value || "").trim();
}

async function safeParseJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function fetchByCanonicalKey(canonicalKey) {
  const response = await fetch(`${baseUrl}/post/scrape`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ canonicalKey }),
    cache: "no-store",
  });
  const payload = await safeParseJson(response);
  return { response, payload };
}

async function fetchLegacyByUrlOrId({ url, id }) {
  const legacyApiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!legacyApiUrl) return { response: null, payload: null };

  const response = await fetch(`${legacyApiUrl}/scrapper/scrape-complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, id }),
    cache: "no-store",
  });
  const payload = await safeParseJson(response);
  return { response, payload };
}

function buildProcessingResponse() {
  return NextResponse.json(
    {
      success: false,
      status: "PROCESSING",
      error: "Scraping started, try again shortly.",
    },
    { status: 202 },
  );
}

async function handleRequestPayload({ canonicalKey, url, id }) {
  const safeCanonicalKey = toText(canonicalKey);
  const safeUrl = toText(url);
  const safeId = toText(id);

  if (!safeCanonicalKey && !safeUrl && !safeId) {
    return NextResponse.json(
      {
        success: false,
        error: "canonicalKey is required (or provide URL/ID for legacy flow)",
      },
      { status: 400 },
    );
  }

  try {
    if (safeCanonicalKey) {
      const { response, payload } = await fetchByCanonicalKey(safeCanonicalKey);

      if (payload?.success && payload?.data) {
        return NextResponse.json(
          { success: true, data: payload.data },
          { status: response.status || 200 },
        );
      }

      if (payload) {
        const status = payload?.status === "PROCESSING" ? 202 : response.status;
        return NextResponse.json(payload, { status });
      }

      return buildProcessingResponse();
    }

    const legacy = await fetchLegacyByUrlOrId({ url: safeUrl, id: safeId });
    if (legacy?.payload?.success && legacy?.payload?.data) {
      return NextResponse.json(
        { success: true, data: legacy.payload.data },
        { status: legacy.response?.status || 200 },
      );
    }

    if (legacy?.payload) {
      const status =
        legacy.payload?.status === "PROCESSING"
          ? 202
          : legacy.response?.status || 200;
      return NextResponse.json(legacy.payload, { status });
    }

    return buildProcessingResponse();
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error?.message || "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  const searchParams = request?.nextUrl?.searchParams;
  return handleRequestPayload({
    canonicalKey: searchParams?.get("canonicalKey") || searchParams?.get("key"),
    url: searchParams?.get("url"),
    id: searchParams?.get("id"),
  });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  return handleRequestPayload({
    canonicalKey: body?.canonicalKey || body?.key,
    url: body?.url,
    id: body?.id,
  });
}
