import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { getCleanPostUrl } from "../lib/job-url.js";
import { buildRecruitmentQualityDetail } from "../lib/recruitment-quality-input.js";
import {
  getIndexabilitySignals,
  getThinReasons,
  isIndexableRecruitmentPage,
} from "../lib/recruitment-quality.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const Post = require(path.resolve(__dirname, "../lib/models/job.js"));

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://jobsaddah.com").replace(/\/$/, "");
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

const parseArgs = (argv) => {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      out[key] = true;
      continue;
    }
    out[key] = next;
    i += 1;
  }
  return out;
};

const parseLimit = (value) => {
  if (!value) return 5000;
  const parsed = Number.parseInt(String(value), 10);
  if (Number.isNaN(parsed) || parsed <= 0) return 5000;
  return parsed;
};

const toSortableTime = (value) => {
  if (!value) return 0;
  const ts = new Date(value).getTime();
  return Number.isNaN(ts) ? 0 : ts;
};

const run = async () => {
  if (!MONGO_URI) throw new Error("Missing MONGODB_URI or MONGO_URI in .env");
  const args = parseArgs(process.argv.slice(2));
  const limit = parseLimit(args.limit);
  const includeSignals = Boolean(args.includeSignals);

  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  try {
    const docs = await Post.find({})
      .sort({ updatedAt: -1 })
      .select("url link sourceUrl recruitment createdAt updatedAt")
      .limit(limit)
      .lean();

    const byPath = new Map();
    docs.forEach((doc) => {
      const detail = buildRecruitmentQualityDetail(doc);
      const pathValue = getCleanPostUrl(doc.url || doc.link || doc.sourceUrl || detail.sourceUrl || "");
      if (!pathValue || pathValue === "#" || pathValue === "/post") return;

      const signals = getIndexabilitySignals(detail);
      const indexable = isIndexableRecruitmentPage(detail);
      const row = {
        path: pathValue,
        url: `${SITE_URL}${pathValue}`,
        title: detail.title || null,
        organization: detail.organization || null,
        score: signals.score,
        robots: indexable ? "index,follow" : "noindex,follow",
        thin: !indexable,
        reasons: indexable ? [] : getThinReasons(signals),
        updatedAt: doc.updatedAt || null,
        createdAt: doc.createdAt || null,
      };
      if (includeSignals) row.signals = signals;

      const existing = byPath.get(pathValue);
      if (!existing || toSortableTime(row.updatedAt) > toSortableTime(existing.updatedAt)) {
        byPath.set(pathValue, row);
      }
    });

    const all = Array.from(byPath.values());
    const thin = all.filter((row) => row.thin);

    const reasonCounts = {};
    thin.forEach((row) => {
      row.reasons.forEach((reason) => {
        reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
      });
    });

    const report = {
      success: true,
      generatedAt: new Date().toISOString(),
      source: "db_scan",
      totalScanned: docs.length,
      uniquePostUrls: all.length,
      thinCount: thin.length,
      indexableCount: all.length - thin.length,
      filters: { limit, includeSignals, onlyThin: true },
      reasonCounts,
      data: thin,
    };

    await fs.writeFile("thin-pages-local-report.json", `${JSON.stringify(report, null, 2)}\n`, "utf8");
    await fs.writeFile(
      "thin-pages-local-urls.txt",
      `${thin.map((row) => row.url).join("\n")}\n`,
      "utf8",
    );

    console.log(`totalScanned=${report.totalScanned}`);
    console.log(`uniquePostUrls=${report.uniquePostUrls}`);
    console.log(`thinCount=${report.thinCount}`);
    console.log(`indexableCount=${report.indexableCount}`);
    console.log(`report=thin-pages-local-report.json`);
    console.log(`urls=thin-pages-local-urls.txt`);
    const sortedReasons = Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]);
    sortedReasons.slice(0, 6).forEach(([reason, count]) => {
      console.log(`${reason}=${count}`);
    });
  } finally {
    await mongoose.disconnect();
  }
};

run().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});
