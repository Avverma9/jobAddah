import postList from "../../models/govJob/govPostListBycatUrl.mjs";
import govPostList from "../../models/govJob/govPostListBycatUrl.mjs";
import govSection from "../../models/govJob/govSection.mjs";
import { scrapper } from "../scrapper/govScrapper.mjs";
import Post from "../../models/govJob/govJob.mjs";
import rephraseTitle from "../../utils/rephraser.js";
import { withContentDefaults } from "../../utils/contentDefaults.mjs";

const normalizePath = (inputUrl) => {
  if (!inputUrl) return null;
  let url = inputUrl.trim();
  // strip query/hash
  url = url.split("#")[0].split("?")[0];
  try {
    if (url.startsWith("http://") || url.startsWith("https://")) {
      const parsed = new URL(url);
      url = parsed.pathname;
    }
  } catch {}
  if (!url.startsWith("/")) url = "/" + url;
  if (url.length > 1 && url.endsWith("/")) url = url.slice(0, -1);
  return url;
};

const normalizeDate = (value) => {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const cleanUrlValue = (value) => String(value || "").trim().split("#")[0];

const buildPostLookupKeys = (job) => {
  const rawFull = cleanUrlValue(job?.canonicalLink || job?.link);
  const fullUrl = /^https?:\/\//i.test(rawFull) ? rawFull : "";
  const path = normalizePath(rawFull);
  const pathWithSlash = path && path !== "/" ? `${path}/` : path;

  return {
    fullUrl,
    path,
    pathWithSlash,
  };
};

const normalizeTitleKey = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getGovPostDetails = async (req, res) => {
  try {
    let url = req.query.url;
    if (!url) {
      return res.status(400).json({ success: false, error: "URL is required" });
    }

    const normalized = normalizePath(url);
    const variants = normalized
      ? [normalized, `${normalized}/`]
      : [];

    const getData = await Post.findOne({ url: { $in: variants } })
      .sort({ createdAt: -1 })
      .lean();

    if (!getData) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }

    return res.status(200).json({
      success: true,
      data: withContentDefaults(getData),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || "Internal server error",
    });
  }
};

const getGovPostListBySection = async (req, res) => {
  try {
    const raw = req.body?.url || req.query?.url || req.params?.url || "";
    const url = String(raw).trim();
    if (!url) {
      return res.status(400).json({
        success: false,
        error: "Section/category URL is required",
      });
    }

    let sectionPath = url;
    try {
      const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
      sectionPath = parsed.pathname.replace(/\/+$/, "") || "/";
    } catch {
      sectionPath = url.replace(/\/+$/, "") || "/";
    }

    const getData = await govPostList
      .find({
        $or: [
          { section: sectionPath },
          { url },
          { url: url.replace(/\/+$/, "") },
          { url: `${url.replace(/\/+$/, "")}/` },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    const allJobs = getData.flatMap((doc) => (Array.isArray(doc.jobs) ? doc.jobs : []));
    const fullUrls = [...new Set(allJobs.map((job) => buildPostLookupKeys(job).fullUrl).filter(Boolean))];
    const titleKeys = [...new Set(allJobs.map((job) => normalizeTitleKey(job?.title)).filter(Boolean))];
    const paths = [...new Set(
      allJobs
        .flatMap((job) => {
          const keys = buildPostLookupKeys(job);
          return [keys.path, keys.pathWithSlash];
        })
        .filter(Boolean),
    )];

    let matchedPosts = [];
    if (fullUrls.length || paths.length) {
      matchedPosts = await Post.find({
        $or: [
          ...(fullUrls.length ? [{ canonicalUrl: { $in: fullUrls } }] : []),
          ...(fullUrls.length ? [{ sourceUrlFull: { $in: fullUrls } }] : []),
          ...(paths.length ? [{ url: { $in: paths } }] : []),
          ...(paths.length ? [{ path: { $in: paths } }] : []),
          ...(titleKeys.length ? [{ "recruitment.title": { $in: allJobs.map((j) => j?.title).filter(Boolean) } }] : []),
        ],
      })
        .select("canonicalUrl sourceUrlFull url path recruitment.title updatedAt")
        .lean();
    }

    const postMap = new Map();
    const postTitleMap = new Map();
    matchedPosts.forEach((p) => {
      const keys = [p?.canonicalUrl, p?.sourceUrlFull, p?.url, p?.path]
        .map((v) => cleanUrlValue(v))
        .filter(Boolean);
      keys.forEach((k) => {
        if (!postMap.has(k)) postMap.set(k, p);
      });

      const tKey = normalizeTitleKey(p?.recruitment?.title);
      if (tKey && !postTitleMap.has(tKey)) postTitleMap.set(tKey, p);
    });

    const normalized = getData.map((doc) => {
      const jobs = Array.isArray(doc.jobs)
        ? doc.jobs.map((job) => {
            const lookup = buildPostLookupKeys(job);
            const matchedPost =
              postMap.get(lookup.fullUrl) ||
              postMap.get(lookup.path) ||
              postMap.get(lookup.pathWithSlash) ||
              postTitleMap.get(normalizeTitleKey(job?.title));
            const createdAt = normalizeDate(job?.createdAt) || normalizeDate(job?.updatedAt);
            const publishDate =
              normalizeDate(matchedPost?.updatedAt) ||
              normalizeDate(job?.publishDate) ||
              createdAt;
            return {
              ...job,
              createdAt,
              publishDate,
            };
          })
        : [];
      return { ...doc, jobs };
    });

    return res.status(200).json({
      success: true,
      count: normalized.length,
      data: normalized,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || "Internal server error",
    });
  }
};

const markFav = async (req, res) => {
  try {
    const { id } = req.params;
    const { fav } = req.body;

    if (fav === true) {
      const favCount = await Post.countDocuments({ fav: true });
      if (favCount >= 8) {
        return res.status(400).json({
          success: false,
          message: "You can mark only 8 posts as favorite",
        });
      }
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { fav },
      { new: true },
    ).lean();

    if (!updatedPost) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    return res.status(200).json({ success: true, data: updatedPost });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

const getFavPosts = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await Post.updateMany(
      {
        fav: true,
        $expr: {
          $lt: [
            {
              $dateFromString: {
                dateString: {
                  $trim: {
                    input: {
                      $ifNull: [
                        {
                          $ifNull: [
                            "$recruitment.importantDates.applicationLastDate",
                            "$recruitment.importantDates.lastDate",
                          ],
                        },
                        "",
                      ],
                    },
                  },
                },
                onError: new Date("2099-12-31"),
                onNull: new Date("2099-12-31"),
              },
            },
            today,
          ],
        },
      },
      { $set: { fav: false } },
    );

    const validFavs = await Post.find({ fav: true })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: validFavs.length,
      data: validFavs.map(withContentDefaults),
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

const getReminders = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysWindowRaw = Number(req.query.days ?? 2);
    const daysWindow = Number.isFinite(daysWindowRaw)
      ? Math.min(Math.max(daysWindowRaw, 1), 30)
      : 2;

    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + daysWindow);
    endDate.setHours(23, 59, 59, 999);

    const dateFields = [
      "$recruitment.importantDates.applicationLastDate",
      "$recruitment.importantDates.applicationEndDate",
      "$recruitment.importantDates.lastDateToApplyOnline",
      "$recruitment.importantDates.onlineApplyLastDate",
      "$recruitment.importantDates.lastDateOfRegistration",
      "$recruitment.importantDates.lastDate",
      "$recruitment.importantDates.applicationEnd",
      "$recruitment.importantDates.onlineApplyEnd",
      "$recruitment.importantDates.lastDateForRegistration",
    ];

    const reminders = await Post.aggregate([
      {
        $project: {
          _id: 1,
          url: 1,
          title: "$recruitment.title",
          organization: "$recruitment.organization.name",
          totalPosts: "$recruitment.vacancyDetails.totalPosts",
          rawDates: dateFields,
        },
      },
      {
        $addFields: {
          parsedDates: {
            $filter: {
              input: {
                $map: {
                  input: "$rawDates",
                  as: "d",
                  in: {
                    $dateFromString: {
                      dateString: { $trim: { input: "$$d" } },
                      onError: null,
                      onNull: null,
                    },
                  },
                },
              },
              as: "pd",
              cond: {
                $and: [
                  { $ne: ["$$pd", null] },
                  { $gte: ["$$pd", today] },
                  { $lte: ["$$pd", endDate] },
                ],
              },
            },
          },
        },
      },
      { $match: { "parsedDates.0": { $exists: true } } },
      { $addFields: { nearestDate: { $min: "$parsedDates" } } },
      {
        $project: {
          _id: 1,
          title: { $ifNull: ["$title", "Untitled"] },
          organization: { $ifNull: ["$organization", "N/A"] },
          url: 1,
          totalPosts: { $ifNull: ["$totalPosts", 0] },
          applicationLastDate: "$nearestDate",
          daysLeft: {
            $ceil: {
              $divide: [
                { $subtract: ["$nearestDate", today] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
      },
      { $sort: { daysLeft: 1 } },
      { $limit: 100 },
    ]);

    return res.status(200).json({
      success: true,
      count: reminders.length,
      reminders,
      message:
        reminders.length === 0
          ? `No reminders within ${daysWindow} days`
          : `Found ${reminders.length} reminders`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch reminders",
    });
  }
};

const stripDomain = (url) => {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    let path = parsed.pathname.trim();
    if (!path.startsWith("/")) path = "/" + path;
    if (!path.endsWith("/")) path += "/";
    return path;
  } catch {
    let clean = url.trim();
    if (!clean.startsWith("/")) clean = "/" + clean;
    if (!clean.endsWith("/")) clean += "/";
    return clean;
  }
};

const fixAllUrls = async (req, res) => {
  try {
    const posts = await Post.find({}, { url: 1 }).lean();
    const bulkOps = [];

    for (const post of posts) {
      const cleaned = stripDomain(post.url);
      if (post.url !== cleaned) {
        bulkOps.push({
          updateOne: {
            filter: { _id: post._id },
            update: { $set: { url: cleaned } },
          },
        });
      }
    }

    let updatedCount = 0;
    if (bulkOps.length > 0) {
      const result = await Post.bulkWrite(bulkOps);
      updatedCount = result.modifiedCount;
    }

    return res.json({
      success: true,
      updated: updatedCount,
      message: "All URLs normalized successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

const findByTitle = async (req, res) => {
  try {
    const { title } = req.query;
    if (!title) {
      return res
        .status(400)
        .json({ success: false, error: "Title is required" });
    }

    const safeTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const titleRe = new RegExp(safeTitle, "i");

    const [results1, results2] = await Promise.all([
      postList.aggregate([
        { $match: { "jobs.title": titleRe } },
        { $limit: 20 },
        {
          $project: {
            _id: 1,
            url: 1,
            updatedAt: 1,
            jobs: {
              $filter: {
                input: "$jobs",
                as: "job",
                cond: {
                  $regexMatch: {
                    input: "$$job.title",
                    regex: titleRe,
                  },
                },
              },
            },
          },
        },
      ]),
      Post.find(
        { "recruitment.title": titleRe },
        { _id: 1, url: 1, recruitment: 1, updatedAt: 1, fav: 1 },
      )
        .limit(20)
        .lean(),
    ]);

    return res
      .status(200)
      .json({ success: true, data: [...results1, ...results2] });
  } catch {
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

const rephraseAllGovPostListTitles = async (req, res) => {
  try {
    const cursor = govPostList.find({}, { jobs: 1 }).lean().cursor();
    const bulkOps = [];
    let updatedDocs = 0;
    let updatedJobs = 0;

    for await (const doc of cursor) {
      if (!doc.jobs || !Array.isArray(doc.jobs) || doc.jobs.length === 0) {
        continue;
      }

      let changed = false;
      const nextJobs = doc.jobs.map((job) => {
        if (!job || !job.title) return job;
        const nextTitle = rephraseTitle(job.title);
        if (nextTitle && nextTitle !== job.title) {
          changed = true;
          updatedJobs += 1;
          return { ...job, title: nextTitle };
        }
        return job;
      });

      if (changed) {
        updatedDocs += 1;
        bulkOps.push({
          updateOne: {
            filter: { _id: doc._id },
            update: { $set: { jobs: nextJobs } },
          },
        });
      }

      if (bulkOps.length >= 200) {
        await govPostList.bulkWrite(bulkOps);
        bulkOps.length = 0;
      }
    }

    if (bulkOps.length > 0) {
      await govPostList.bulkWrite(bulkOps);
    }

    return res.status(200).json({
      success: true,
      updatedDocs,
      updatedJobs,
      message: "Rephrased govPostList job titles",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || "Internal server error",
    });
  }
};

export {
  getGovPostDetails,
  getGovPostListBySection,
  markFav,
  getFavPosts,
  getReminders,
  fixAllUrls,
  findByTitle,
  rephraseAllGovPostListTitles,
};
