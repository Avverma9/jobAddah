import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const Post = require(path.resolve(__dirname, "../lib/models/job.js"));

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://jobsaddah.com").replace(/\/$/, "");
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
const URL_RE = /^https?:\/\/\S+$/i;
const DATE_KEYS = [
  "applicationStartDate",
  "applicationLastDate",
  "examDate",
  "admitCardDate",
  "resultDate",
];

const usage = `
Usage:
  node scripts/thin-content-updater.mjs export [--urls thin-pages-local-urls.txt] [--report thin-pages-local-report.json] [--out thin-pages-content-template.json]
  node scripts/thin-content-updater.mjs apply [--updates thin-pages-content-template.json] [--write]

Notes:
  - "export" creates an editable JSON template for high-value content filling.
  - "apply" is dry-run by default. Use --write to save changes in MongoDB.
`;

const parseArgs = (argv) => {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      out._.push(token);
      continue;
    }
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

const normalizeSpaces = (value) => String(value || "").replace(/\s+/g, " ").trim();

const toSafeString = (value) => {
  const v = normalizeSpaces(value);
  return v || "";
};

const ensureArrayStrings = (items) => {
  if (!Array.isArray(items)) return [];
  const out = [];
  const seen = new Set();
  items.forEach((item) => {
    let text = "";
    if (typeof item === "string") text = toSafeString(item);
    else if (item && typeof item === "object") {
      text = toSafeString(item.text || item.name || item.type || item.label || "");
    }
    if (!text || seen.has(text.toLowerCase())) return;
    seen.add(text.toLowerCase());
    out.push(text);
  });
  return out;
};

const normalizeUrlForMap = (value) => {
  try {
    const parsed = new URL(value, SITE_URL);
    const pathname = parsed.pathname.replace(/\/+$/, "");
    return `${parsed.origin}${pathname}`;
  } catch {
    return String(value || "").replace(/\/+$/, "");
  }
};

const toPostPathFromInput = (inputUrl) => {
  const parsed = new URL(inputUrl, SITE_URL);
  let pathname = parsed.pathname || "/";
  pathname = pathname.replace(/\/+$/, "");
  if (!pathname) pathname = "/";
  if (pathname.startsWith("/post")) {
    const rest = pathname.slice("/post".length) || "";
    const slug = `/${rest}`.replace(/\/+/g, "/");
    return slug === "/" ? "/" : slug.replace(/\/+$/, "");
  }
  return pathname;
};

const buildUrlCandidates = (inputUrl) => {
  const candidates = new Set();
  let pagePath = "/";
  let postPath = "/";

  try {
    const parsed = new URL(inputUrl, SITE_URL);
    pagePath = parsed.pathname || "/";
    pagePath = pagePath.replace(/\/+$/, "") || "/";
  } catch {
    pagePath = String(inputUrl || "").trim() || "/";
  }

  postPath = toPostPathFromInput(inputUrl);
  const clean = postPath.replace(/^\/+|\/+$/g, "");

  const add = (value) => {
    if (!value) return;
    let v = String(value).trim();
    if (!v) return;
    if (!v.startsWith("/")) v = `/${v}`;
    v = v.replace(/\/+/g, "/");
    candidates.add(v);
  };

  add(pagePath);
  add(`${pagePath}/`);
  add(postPath);
  add(`${postPath}/`);

  if (clean) {
    add(`/${clean}`);
    add(`/${clean}/`);
    add(`/post/${clean}`);
    add(`/post/${clean}/`);
  }

  return { pagePath, postPath, candidates: [...candidates] };
};

const readUrlsFile = async (filePath) => {
  const text = await fs.readFile(filePath, "utf8");
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const uniq = new Set();
  lines.forEach((line) => {
    try {
      const parsed = new URL(line, SITE_URL);
      const normalized = `${parsed.origin}${parsed.pathname.replace(/\/+$/, "")}`;
      if (normalized) uniq.add(normalized);
    } catch {
      if (line.startsWith("/post/")) uniq.add(`${SITE_URL}${line.replace(/\/+$/, "")}`);
    }
  });
  return [...uniq];
};

const readJsonSafe = async (filePath) => {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const toImportantLink = (value) => {
  if (typeof value === "string") return toSafeString(value);
  if (!value || typeof value !== "object") return "";
  return toSafeString(value.url || value.link || value.href || "");
};

const getOrgName = (organization) => {
  if (!organization) return "";
  if (typeof organization === "string") return toSafeString(organization);
  if (typeof organization === "object") {
    return toSafeString(organization.name || organization.shortName || "");
  }
  return "";
};

const extractCurrentSet = (doc) => {
  const recruitment = doc?.recruitment || {};
  const links = recruitment.importantLinks || {};
  const dates = recruitment.importantDates || {};
  const content = recruitment.content || {};

  const outDates = {};
  DATE_KEYS.forEach((key) => {
    outDates[key] = toSafeString(dates[key] || "");
  });

  return {
    title: toSafeString(recruitment.title || ""),
    organization: getOrgName(recruitment.organization),
    summary: toSafeString(content.originalSummary || recruitment.shortDescription || ""),
    officialNotification: toImportantLink(links.officialNotification),
    applyOnline: toImportantLink(links.applyOnline),
    officialWebsite: toImportantLink(links.officialWebsite),
    selectionProcess: ensureArrayStrings(recruitment.selectionProcess),
    documents: ensureArrayStrings(recruitment.documentation),
    dates: outDates,
  };
};

const getMissingHints = (setData) => {
  const hints = [];
  if (!setData.officialNotification && !setData.applyOnline && !setData.officialWebsite) {
    hints.push("trusted_source_links");
  }
  if (!setData.summary || setData.summary.length < 80) {
    hints.push("rich_summary");
  }
  if (!Array.isArray(setData.documents) || setData.documents.length === 0) {
    hints.push("documents_list");
  }
  if (!Array.isArray(setData.selectionProcess) || setData.selectionProcess.length === 0) {
    hints.push("selection_process");
  }
  if (!setData.title || setData.title.length < 20) {
    hints.push("identity_title");
  }
  if (!setData.organization || setData.organization.length < 3) {
    hints.push("identity_organization");
  }
  return hints;
};

const findPostDocByPageUrl = async (pageUrl) => {
  const { postPath, candidates } = buildUrlCandidates(pageUrl);
  let doc = await Post.findOne({ url: { $in: candidates } })
    .sort({ updatedAt: -1 })
    .select("url recruitment createdAt updatedAt")
    .lean();

  if (!doc && postPath && postPath !== "/") {
    const escaped = postPath
      .replace(/^\/+|\/+$/g, "")
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    doc = await Post.findOne({ url: { $regex: `^/?${escaped}/?$`, $options: "i" } })
      .sort({ updatedAt: -1 })
      .select("url recruitment createdAt updatedAt")
      .lean();
  }

  return doc;
};

const loadReasonMap = async (reportPath) => {
  const data = await readJsonSafe(reportPath);
  const map = new Map();
  if (!data) return map;

  const rows = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.thin)
      ? data.thin
      : [];

  rows.forEach((row) => {
    const key = normalizeUrlForMap(row.url || `${SITE_URL}${row.path || ""}`);
    map.set(key, {
      score: typeof row.score === "number" ? row.score : null,
      reasons: Array.isArray(row.reasons) ? row.reasons : [],
    });
  });
  return map;
};

const exportTemplate = async (args) => {
  const urlsPath = path.resolve(process.cwd(), args.urls || "thin-pages-local-urls.txt");
  const outPath = path.resolve(
    process.cwd(),
    args.out || "thin-pages-content-template.json",
  );
  const reportPath = path.resolve(
    process.cwd(),
    args.report || "thin-pages-local-report.json",
  );

  const urls = await readUrlsFile(urlsPath);
  const reasonMap = await loadReasonMap(reportPath);

  console.log(`Loaded ${urls.length} URLs from ${path.basename(urlsPath)}`);
  console.log(`Using report: ${path.basename(reportPath)} (${reasonMap.size} entries)`);

  const rows = [];
  const missingDocs = [];

  for (const pageUrl of urls) {
    const doc = await findPostDocByPageUrl(pageUrl);
    if (!doc) {
      missingDocs.push(pageUrl);
      continue;
    }

    const setData = extractCurrentSet(doc);
    const normalizedUrl = normalizeUrlForMap(pageUrl);
    const reportMeta = reasonMap.get(normalizedUrl) || {
      score: null,
      reasons: getMissingHints(setData),
    };

    rows.push({
      url: `${SITE_URL}${toPostPathFromInput(pageUrl).replace(/^\/+/, "/post/")}`.replace(
        /\/+$/,
        "",
      ),
      currentDocUrl: doc.url || null,
      score: reportMeta.score,
      reasons: reportMeta.reasons,
      missingHints: getMissingHints(setData),
      set: setData,
    });
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    source: {
      urls: path.basename(urlsPath),
      report: path.basename(reportPath),
    },
    count: rows.length,
    missingCount: missingDocs.length,
    notes: [
      "Edit only `set` fields you want to improve.",
      "Summary should be unique and ideally 80+ characters.",
      "Trusted links should be official https URLs.",
      "Run apply in dry-run first, then use --write.",
    ],
    data: rows,
    missingUrls: missingDocs,
  };

  await fs.writeFile(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Template written: ${outPath}`);
  console.log(`Template rows: ${rows.length}`);
  if (missingDocs.length) {
    console.log(`Could not map ${missingDocs.length} URLs to DB docs.`);
  }
};

const equalJson = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const sanitizeUrlValue = (value) => {
  const v = toSafeString(value);
  if (!v) return "";
  if (!URL_RE.test(v)) return "";
  return v;
};

const extractUpdatesList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const applyTemplate = async (args) => {
  const updatesPath = path.resolve(
    process.cwd(),
    args.updates || "thin-pages-content-template.json",
  );
  const writeMode = Boolean(args.write);
  const payload = await readJsonSafe(updatesPath);
  if (!payload) throw new Error(`Invalid or unreadable JSON: ${updatesPath}`);

  const updates = extractUpdatesList(payload);
  if (!updates.length) throw new Error(`No update rows found in ${updatesPath}`);

  const reportRows = [];
  let matched = 0;
  let skipped = 0;
  let updated = 0;
  let notFound = 0;

  for (const row of updates) {
    const url = toSafeString(row.url || row.pageUrl || row.path || "");
    if (!url) {
      skipped += 1;
      reportRows.push({ status: "skipped", reason: "missing_url" });
      continue;
    }

    const doc = await findPostDocByPageUrl(url);
    if (!doc) {
      notFound += 1;
      reportRows.push({ url, status: "not_found" });
      continue;
    }

    matched += 1;
    const setData = row.set && typeof row.set === "object" ? row.set : row;
    const current = extractCurrentSet(doc);
    const recruitment = doc.recruitment || {};
    const setOps = {};
    const warnings = [];

    const nextTitle = toSafeString(setData.title);
    if (nextTitle && nextTitle !== current.title) {
      setOps["recruitment.title"] = nextTitle;
    }

    const nextOrg = toSafeString(setData.organization);
    if (nextOrg && nextOrg !== current.organization) {
      if (
        recruitment.organization &&
        typeof recruitment.organization === "object" &&
        !Array.isArray(recruitment.organization)
      ) {
        setOps["recruitment.organization.name"] = nextOrg;
      } else {
        setOps["recruitment.organization"] = {
          name: nextOrg,
          shortName: "",
          website: "",
          type: "",
        };
      }
    }

    const nextSummary = toSafeString(setData.summary);
    if (nextSummary && nextSummary !== current.summary) {
      setOps["recruitment.content.originalSummary"] = nextSummary;
      if (nextSummary.length < 80) {
        warnings.push("summary_below_80_chars");
      }
    }

    const nextLinks = {
      officialNotification: sanitizeUrlValue(setData.officialNotification),
      applyOnline: sanitizeUrlValue(setData.applyOnline),
      officialWebsite: sanitizeUrlValue(setData.officialWebsite),
    };
    ["officialNotification", "applyOnline", "officialWebsite"].forEach((key) => {
      if (setData[key] && !nextLinks[key]) {
        warnings.push(`invalid_${key}_url`);
      }
      if (nextLinks[key] && nextLinks[key] !== current[key]) {
        setOps[`recruitment.importantLinks.${key}`] = nextLinks[key];
      }
    });

    const nextSelection = ensureArrayStrings(setData.selectionProcess);
    if (nextSelection.length && !equalJson(nextSelection, current.selectionProcess)) {
      setOps["recruitment.selectionProcess"] = nextSelection;
    }

    const nextDocuments = ensureArrayStrings(setData.documents);
    if (nextDocuments.length && !equalJson(nextDocuments, current.documents)) {
      setOps["recruitment.documentation"] = nextDocuments;
    }

    const nextDates = {};
    const incomingDates = setData?.dates && typeof setData.dates === "object" ? setData.dates : {};
    DATE_KEYS.forEach((key) => {
      const value = toSafeString(incomingDates[key]);
      if (value) nextDates[key] = value;
    });
    if (Object.keys(nextDates).length) {
      DATE_KEYS.forEach((key) => {
        if (nextDates[key] && nextDates[key] !== current.dates[key]) {
          setOps[`recruitment.importantDates.${key}`] = nextDates[key];
        }
      });
    }

    if (!Object.keys(setOps).length) {
      skipped += 1;
      reportRows.push({ url, docUrl: doc.url || null, status: "skipped", reason: "no_changes" });
      continue;
    }

    if (writeMode) {
      await Post.updateOne(
        { _id: doc._id },
        {
          $set: setOps,
          $currentDate: { updatedAt: true },
        },
      );
      updated += 1;
      reportRows.push({
        url,
        docUrl: doc.url || null,
        status: "updated",
        changedFields: Object.keys(setOps),
        warnings,
      });
    } else {
      reportRows.push({
        url,
        docUrl: doc.url || null,
        status: "dry_run",
        changedFields: Object.keys(setOps),
        warnings,
      });
    }
  }

  const outPath = path.resolve(process.cwd(), "thin-pages-apply-report.json");
  const summary = {
    generatedAt: new Date().toISOString(),
    writeMode,
    input: path.basename(updatesPath),
    totalRows: updates.length,
    matched,
    notFound,
    skipped,
    updated,
    dryRunChanges: writeMode ? 0 : reportRows.filter((r) => r.status === "dry_run").length,
    data: reportRows,
  };
  await fs.writeFile(outPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  console.log(writeMode ? "Applied updates to MongoDB." : "Dry run complete (no DB writes).");
  console.log(
    `total=${updates.length} matched=${matched} updated=${updated} skipped=${skipped} notFound=${notFound}`,
  );
  console.log(`Report written: ${outPath}`);
};

const run = async () => {
  if (!MONGO_URI) throw new Error("Missing MONGODB_URI or MONGO_URI in environment");

  const args = parseArgs(process.argv.slice(2));
  const command = args._[0];

  if (!command || args.help || args.h) {
    console.log(usage.trim());
    process.exit(0);
  }

  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });

  try {
    if (command === "export") {
      await exportTemplate(args);
      return;
    }
    if (command === "apply") {
      await applyTemplate(args);
      return;
    }
    throw new Error(`Unknown command: ${command}`);
  } finally {
    await mongoose.disconnect();
  }
};

run().catch((error) => {
  console.error(error?.message || error);
  process.exit(1);
});
