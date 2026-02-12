import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connectDB";
import Post from "@/lib/models/job";
import { getCleanPostUrl } from "@/lib/job-url";
import { buildRecruitmentQualityDetail } from "@/lib/recruitment-quality-input";
import {
  getIndexabilitySignals,
  getThinReasons,
  isIndexableRecruitmentPage,
} from "@/lib/recruitment-quality";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://jobsaddah.com").replace(/\/$/, "");
const REPORT_TOKEN =
  process.env.THIN_REPORT_TOKEN || process.env.ADMIN_REPORT_TOKEN || "";
const DEFAULT_LIMIT = 800;
const MAX_LIMIT = 2000;

const parseBool = (value, fallback) => {
  if (value == null) return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "y"].includes(normalized)) return true;
  if (["0", "false", "no", "n"].includes(normalized)) return false;
  return fallback;
};

const parseLimit = (value) => {
  if (!value) return DEFAULT_LIMIT;
  const parsed = Number.parseInt(String(value), 10);
  if (Number.isNaN(parsed) || parsed <= 0) return DEFAULT_LIMIT;
  return Math.min(parsed, MAX_LIMIT);
};

const isAuthorized = (request, searchParams) => {
  if (!REPORT_TOKEN) return true;
  const headerToken = request.headers.get("x-admin-token") || "";
  const queryToken = searchParams.get("token") || "";
  const token = headerToken || queryToken;
  return token === REPORT_TOKEN;
};

const toSortableTime = (value) => {
  if (!value) return 0;
  const ts = new Date(value).getTime();
  return Number.isNaN(ts) ? 0 : ts;
};

const buildUrlEntry = (doc, includeSignals = false) => {
  const detail = buildRecruitmentQualityDetail(doc);
  const path = getCleanPostUrl(doc.url || doc.link || doc.sourceUrl || detail.sourceUrl || "");
  if (!path || path === "#" || path === "/post") return null;

  const signals = getIndexabilitySignals(detail);
  const indexable = isIndexableRecruitmentPage(detail);
  const item = {
    path,
    url: `${SITE_URL}${path}`,
    title: detail.title || null,
    organization: detail.organization || null,
    score: signals.score,
    robots: indexable ? "index,follow" : "noindex,follow",
    thin: !indexable,
    reasons: indexable ? [] : getThinReasons(signals),
    updatedAt: doc.updatedAt || null,
    createdAt: doc.createdAt || null,
  };

  if (includeSignals) item.signals = signals;
  return item;
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  if (!isAuthorized(request, searchParams)) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const limit = parseLimit(searchParams.get("limit"));
  const onlyThin = parseBool(searchParams.get("onlyThin"), true);
  const includeSignals = parseBool(searchParams.get("includeSignals"), false);

  try {
    await connectDB();
    const posts = await Post.find({})
      .sort({ updatedAt: -1 })
      .select("url link recruitment sourceUrl createdAt updatedAt")
      .limit(limit)
      .lean();

    const byPath = new Map();
    posts.forEach((doc) => {
      const entry = buildUrlEntry(doc, includeSignals);
      if (!entry) return;

      const existing = byPath.get(entry.path);
      if (!existing) {
        byPath.set(entry.path, entry);
        return;
      }

      if (toSortableTime(entry.updatedAt) > toSortableTime(existing.updatedAt)) {
        byPath.set(entry.path, entry);
      }
    });

    const all = Array.from(byPath.values());
    const thinPages = all.filter((item) => item.thin);
    const rows = onlyThin ? thinPages : all;

    return NextResponse.json({
      success: true,
      generatedAt: new Date().toISOString(),
      totalScanned: posts.length,
      uniquePostUrls: all.length,
      thinCount: thinPages.length,
      indexableCount: all.length - thinPages.length,
      filters: { limit, onlyThin, includeSignals },
      data: rows,
    });
  } catch (error) {
    console.error("Thin pages report failed", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate thin pages report",
      },
      { status: 500 },
    );
  }
}
