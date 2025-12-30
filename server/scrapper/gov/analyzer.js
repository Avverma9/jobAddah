const Post = require("@/models/gov/govtpost");


const isValidUrl = (url) => {
  if (!url || typeof url !== "string") return false;
  if (url.length < 8) return false;

  const lowered = url.toLowerCase();
  if (
    lowered.includes("click here") ||
    lowered === "#" ||
    lowered === "na" ||
    lowered === "n/a"
  ) {
    return false;
  }

  try {
    new URL(url.startsWith("http") ? url : `https://${url}`);
    return true;
  } catch {
    return false;
  }
};
const scoreImportantLinks = (links = {}) => {
  if (!links || typeof links !== "object") return 0;

  let score = 0;
  let total = 0;

  for (const key of Object.keys(links)) {
    total++;
    if (isValidUrl(links[key])) score++;
  }

  return total === 0 ? 0 : score / total; // 0 → 1
};

const normalize = (s = "") =>
  s.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();

const similarity = (a, b) => {
  if (!a || !b) return 0;

  const A = new Set(normalize(a).split(" "));
  const B = new Set(normalize(b).split(" "));

  const intersection = [...A].filter((x) => B.has(x));
  return (intersection.length / Math.max(A.size, B.size)) * 100;
};

const comparePosts = (p1, p2) => {
  const titleScore = similarity(
    p1.recruitment?.title,
    p2.recruitment?.title
  );

  const orgScore = similarity(
    p1.recruitment?.organization?.name,
    p2.recruitment?.organization?.name
  );

  const urlScore = similarity(p1.url, p2.url);

  // weighted score
  return (
    titleScore * 0.6 +
    orgScore * 0.25 +
    urlScore * 0.15
  );
};


exports.analyzeSmartDuplicates = async (req, res) => {
  try {
    const shouldDelete = req.query.delete === "true";

    const posts = await Post.find({})
      .sort({ createdAt: 1 }) // OLDER → NEWER
      .lean();

    const results = [];
    const deletedIds = new Set();

    for (let i = 0; i < posts.length; i++) {
      const older = posts[i];
      if (deletedIds.has(String(older._id))) continue;

      for (let j = i + 1; j < posts.length; j++) {
        const newer = posts[j];
        if (deletedIds.has(String(newer._id))) continue;

        const simScore = comparePosts(older, newer);
        if (simScore < 60) continue;

        // Quality scores
        const olderLinkScore = scoreImportantLinks(
          older.recruitment?.importantLinks
        );
        const newerLinkScore = scoreImportantLinks(
          newer.recruitment?.importantLinks
        );

        // Decision (who is better)
        let decision = "KEEP_NEWER";
        if (olderLinkScore > newerLinkScore) decision = "KEEP_OLDER";

        // 🚨 DELETE RULE (as per your request)
        const deletePost = older; // ALWAYS older
        const keepPost = newer;

        // Perform delete if enabled
        if (shouldDelete) {
          await Post.findByIdAndDelete(deletePost._id);
          deletedIds.add(String(deletePost._id));
        }

        results.push({
          similarity: simScore.toFixed(2),
          decision,
          deleted: shouldDelete,
          deletedPost: {
            id: deletePost._id,
            title: deletePost.recruitment?.title,
            url: deletePost.url,
            createdAt: deletePost.createdAt,
          },
          keptPost: {
            id: keepPost._id,
            title: keepPost.recruitment?.title,
            url: keepPost.url,
            createdAt: keepPost.createdAt,
          },
        });

        break; // stop once duplicate resolved
      }
    }

    return res.json({
      success: true,
      mode: shouldDelete ? "ANALYZE + DELETE" : "ANALYZE ONLY",
      duplicatesFound: results.length,
      deletedCount: shouldDelete ? deletedIds.size : 0,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Smart Analyzer Error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};
