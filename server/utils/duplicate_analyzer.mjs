import Post from "../models/govJob/govJob.mjs";
import axios from "axios";
import getActiveAIConfig from "./aiKey.mjs";
import pplKey from "../models/ai/perplexity-apikey.mjs";
import PerplexityModel from "../models/ai/perplexity-model.mjs";

const USE_AI = false;
const SIMILARITY_THRESHOLD = 65;

const normalize = (s = "") =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const textSimilarity = (a, b) => {
  if (!a || !b) return 0;
  const A = new Set(normalize(a).split(" "));
  const B = new Set(normalize(b).split(" "));
  const common = [...A].filter((x) => B.has(x));
  return (common.length / Math.max(A.size, B.size)) * 100;
};

const isValidValue = (v) => {
  if (!v) return false;
  if (typeof v === "string") {
    const t = v.toLowerCase();
    return !["", "na", "n/a", "#", "null", "undefined"].includes(t);
  }
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object") return Object.keys(v).length > 0;
  return true;
};

const countQualityScore = (obj = {}) => {
  let score = 0;
  const deepCheck = (o) => {
    if (!o || typeof o !== "object") return;
    for (const k in o) {
      const v = o[k];
      if (isValidValue(v)) score++;
      if (typeof v === "object") deepCheck(v);
    }
  };
  deepCheck(obj);
  return score;
};

const getExamType = (title = "") => {
  const t = title.toLowerCase();
  if (t.includes("rrb")) return "RRB";
  if (t.includes("so")) return "SO";
  if (t.includes("po")) return "PO";
  if (t.includes("clerk")) return "CLERK";
  return "OTHER";
};

const basicDuplicateScore = (p1, p2) => {
  const title = textSimilarity(p1.recruitment?.title, p2.recruitment?.title);
  const org = textSimilarity(
    p1.recruitment?.organization?.name,
    p2.recruitment?.organization?.name
  );
  const url = textSimilarity(p1.url, p2.url);
  return title * 0.7 + url * 0.2 + org * 0.1;
};

const analyzeWithPerplexity = async ({ older, newer }) => {
  let apiKey = null;
  let modelName = "sonar-pro";

  // try active-config picker first (prefers provider order)
  try {
    const cfg = await getActiveAIConfig({
      excludeKeyIds: [],
    });
    if (cfg.provider === "perplexity") {
      apiKey = cfg.apiKey;
      modelName = cfg.modelName;
    }
  } catch {}

  // fallback: pick first active ppl key/model
  if (!apiKey) {
    const keyDoc = await pplKey
      .findOne({ status: "ACTIVE" })
      .sort({ priority: -1, updatedAt: -1 })
      .lean();
    if (!keyDoc) throw new Error("Perplexity API key missing");
    apiKey = keyDoc.apiKey;
  }

  const modelDoc = await PerplexityModel.findOne({ status: true })
    .sort({ priority: -1, updatedAt: -1 })
    .lean();
  if (modelDoc?.modelName) modelName = modelDoc.modelName;

  const prompt = `
Compare two Indian govt job posts.
Return STRICT JSON ONLY:
{
  "isDuplicate": true|false,
  "keep": "OLDER"|"NEWER",
  "reason": "short explanation"
}

OLDER:
${JSON.stringify(older, null, 2)}

NEWER:
${JSON.stringify(newer, null, 2)}
`;

  const res = await axios.post(
    "https://api.perplexity.ai/chat/completions",
    {
      model: modelName,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 400,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  return JSON.parse(res.data.choices[0].message.content);
};

const analyzeSmartDuplicates = async (req, res) => {
  try {
    const shouldDelete = req.query.delete === "true";

    const ONE_MONTH_AGO = new Date();
    ONE_MONTH_AGO.setMonth(ONE_MONTH_AGO.getMonth() - 1);

    const posts = await Post.find({
      $or: [
        { createdAt: { $gte: ONE_MONTH_AGO } },
        { updatedAt: { $gte: ONE_MONTH_AGO } },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    const results = [];
    const deleted = new Set();

    for (let i = 0; i < posts.length; i++) {
      const older = posts[i];
      if (deleted.has(String(older._id))) continue;

      for (let j = i + 1; j < posts.length; j++) {
        const newer = posts[j];
        if (deleted.has(String(newer._id))) continue;

        const exam1 = getExamType(older.recruitment?.title);
        const exam2 = getExamType(newer.recruitment?.title);
        if (exam1 !== exam2) continue;

        const sim = basicDuplicateScore(older, newer);
        if (sim < SIMILARITY_THRESHOLD) continue;

        const olderScore = countQualityScore(older.recruitment);
        const newerScore = countQualityScore(newer.recruitment);

        let keep = newerScore >= olderScore ? "NEWER" : "OLDER";
        let reason = "Auto decision based on data completeness";

        if (USE_AI && Math.abs(olderScore - newerScore) < 5) {
          try {
            const ai = await analyzeWithPerplexity({ older, newer });
            if (!ai?.isDuplicate) continue;
            keep = ai.keep;
            reason = ai.reason;
          } catch {}
        }

        const deletePost = keep === "OLDER" ? newer : older;
        const keepPost = keep === "OLDER" ? older : newer;

        if (shouldDelete) {
          await Post.findByIdAndDelete(deletePost._id);
          deleted.add(String(deletePost._id));
        }

        results.push({
          similarity: sim.toFixed(2),
          keep,
          reason,
          deleted: shouldDelete,
          deletedPost: {
            id: deletePost._id,
            title: deletePost.recruitment?.title || "N/A",
            organization:
              deletePost.recruitment?.organization?.name || "N/A",
            createdAt: deletePost.createdAt,
          },
          keptPost: {
            id: keepPost._id,
            title: keepPost.recruitment?.title || "N/A",
            organization:
              keepPost.recruitment?.organization?.name || "N/A",
            createdAt: keepPost.createdAt,
          },
        });

        break;
      }
    }

    return res.json({
      success: true,
      mode: shouldDelete ? "ANALYZE + DELETE" : "ANALYZE ONLY",
      scannedPosts: posts.length,
      duplicatesFound: results.length,
      deletedCount: deleted.size,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

export { analyzeSmartDuplicates };
