import crypto from "crypto";
import Post from "../../models/govJob/govJob.mjs";
import { notifySubscribersAboutPost } from "../../utils/subscriberNotifier.mjs";
import { withContentDefaults } from "../../utils/contentDefaults.mjs";

const formatResponse = (data) => ({
  success: true,
  count: data.length,
  data: data.map(withContentDefaults),
});

const normalizeForHash = (value) => {
  if (value == null) return "";
  if (typeof value === "string") return value.replace(/\s+/g, " ").trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  try {
    return JSON.stringify(value);
  } catch (err) {
    return "";
  }
};

const buildManualHashInput = (payload) => {
  const fields = [
    payload.postTitle,
    payload.slug,
    payload.organization,
    payload.postType,
    payload.url,
    payload.sourceUrl,
    payload.postLocation,
    payload.recruitment?.board,
  ];

  const normalizedValues = [];
  fields.forEach((field) => {
    const normalized = normalizeForHash(field);
    if (normalized) {
      normalizedValues.push(normalized);
    }
  });

  const importantDates = payload.recruitment?.importantDates;
  if (importantDates && typeof importantDates === "object") {
    Object.keys(importantDates)
      .sort()
      .forEach((key) => {
        const normalized = normalizeForHash(importantDates[key]);
        if (normalized) {
          normalizedValues.push(`${key}:${normalized}`);
        }
      });
  }

  if (!normalizedValues.length) {
    return JSON.stringify(payload || {});
  }

  return normalizedValues.join("|");
};

const generateManualPageHash = (payload) =>
  crypto.createHash("md5").update(buildManualHashInput(payload)).digest("hex");

const prepareManualPostData = (rawBody) => {
  const body = { ...rawBody };
  const sourceUrl = body.sourceUrl || body.url;
  if (sourceUrl) {
    body.sourceUrl = sourceUrl;
    if (!body.url) {
      body.url = sourceUrl;
    }
  }

  if (!body.pageHash) {
    body.pageHash = generateManualPageHash(body);
  }

  return body;
};

const createPost = async (req, res) => {
  try {
    const { _id, createdAt, updatedAt, ...cleanBody } = req.body;
    const preparedBody = prepareManualPostData(cleanBody);
    const newPost = new Post(preparedBody);
    const savedPost = await newPost.save();

    notifySubscribersAboutPost(savedPost).catch((err) =>
      console.error("Notify subscribers failed:", err?.message || err)
    );

    res.status(201).json({
      success: true,
      data: savedPost,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};



const insertBulkPosts = async (req, res) => {
  try {
    const posts = req.body;

    if (!Array.isArray(posts) || posts.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Input must be a non-empty array of posts",
      });
    }

    const result = await Post.insertMany(posts);

    return res.status(201).json({
      success: true,
      message: `Successfully inserted ${result.length} posts`,
      data: result,
    });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: err.errors
          ? Object.values(err.errors).map((e) => e.message)
          : "No details.",
      });
    }

    if (err.name === "BulkWriteError" && err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate keys detected.",
        details: err.writeErrors?.map((e) => ({
          index: e.index,
          errmsg: e.errmsg,
        })),
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unexpected error during bulk insert.",
      error: err.message,
    });
  }
};

const updatePost = async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedPost) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    res.json({ success: true, data: updatedPost });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });
    }

    res.json({ success: true, message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteAllPosts = async (req, res) => {
  try {
    const result = await Post.deleteMany({});
    res.json({
      success: true,
      message: "All posts deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getJobById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id).lean();
    if (!post) return res.status(404).json({ message: "Not found" });
    return res.status(200).json(withContentDefaults(post));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getJobs = async (req, res) => {
  try {
    const { search, postType } = req.query;
    const query = {};

    if (postType && postType !== "ALL") {
      query.postType = postType.toUpperCase();
    }

    if (search) {
      query.$or = [
        { postTitle: { $regex: search, $options: "i" } },
        { organization: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    const posts = await Post.find(query).sort({ createdAt: -1 }).lean();
    res.json(formatResponse(posts));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getallPost = async (req, res) => {
  try {
    const response = await Post.find().sort({ createdAt: -1 }).lean();
    res.json(response.map(withContentDefaults));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getExpiringJobsReminder = async (req, res) => {
  try {
    const today = new Date();
    const fiveDaysLater = new Date();
    fiveDaysLater.setDate(today.getDate() + 5);

    const jobs = await Post.find({ postType: "JOB", isLive: true }).lean();

    const extractLastDate = (job) => {
      const lastObj = job.importantDates?.find((d) =>
        d.label?.toLowerCase().includes("last")
      );
      return lastObj?.value || null;
    };

    const parseDate = (dateString) => {
      if (!dateString) return null;
      const parts = dateString.split("-");
      if (parts.length !== 3) return null;
      return new Date(parts[2], parts[1] - 1, parts[0]);
    };

    const expiresToday = [];
    const expiringSoon = [];

    jobs.forEach((job) => {
      const lastDateStr = extractLastDate(job);
      const lastDate = parseDate(lastDateStr);
      if (!lastDate || isNaN(lastDate)) return;

      const diffTime = lastDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) {
        expiresToday.push({
          _id: job._id,
          title: job.postTitle,
          slug: job.slug,
          lastDate: lastDateStr,
          message: "Last date is today!",
        });
      } else if (diffDays > 0 && diffDays <= 5) {
        expiringSoon.push({
          _id: job._id,
          title: job.postTitle,
          slug: job.slug,
          lastDate: lastDateStr,
          daysLeft: diffDays,
          message: `${diffDays} days left`,
        });
      }
    });

    res.json({
      success: true,
      expiresToday,
      expiringSoon,
      totalExpiring: expiresToday.length + expiringSoon.length,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const STATE_KEYWORDS = {
  andhra: "Andhra Pradesh",
  arunachal: "Arunachal Pradesh",
  assam: "Assam",
  bihar: "Bihar",
  bssc: "Bihar",
  chhattisgarh: "Chhattisgarh",
  goa: "Goa",
  gujarat: "Gujarat",
  haryana: "Haryana",
  himachal: "Himachal Pradesh",
  hp: "Himachal Pradesh",
  jharkhand: "Jharkhand",
  karnataka: "Karnataka",
  kerala: "Kerala",
  "madhya pradesh": "Madhya Pradesh",
  mp: "Madhya Pradesh",
  maharashtra: "Maharashtra",
  mh: "Maharashtra",
  manipur: "Manipur",
  meghalaya: "Meghalaya",
  mizoram: "Mizoram",
  nagaland: "Nagaland",
  odisha: "Odisha",
  orissa: "Odisha",
  punjab: "Punjab",
  rajasthan: "Rajasthan",
  rssb: "Rajasthan",
  rsmssb: "Rajasthan",
  sikkim: "Sikkim",
  tamil: "Tamil Nadu",
  tn: "Tamil Nadu",
  telangana: "Telangana",
  tripura: "Tripura",
  "uttar pradesh": "Uttar Pradesh",
  up: "Uttar Pradesh",
  upsssc: "Uttar Pradesh",
  uppsc: "Uttar Pradesh",
  uttarakhand: "Uttarakhand",
  uk: "Uttarakhand",
  "west bengal": "West Bengal",
  wb: "West Bengal",
  wbssc: "West Bengal",
  ssc: "ALL",
  sscsr: "ALL",
  sscnr: "ALL",
  drdo: "ALL",
  afcat: "ALL",
  af: "ALL",
  army: "ALL",
  navy: "ALL",
  "air force": "ALL",
  aiims: "ALL",
  sebi: "ALL",
  ecgc: "ALL",
  rbi: "ALL",
  "bank of baroda": "ALL",
  bob: "ALL",
  ibps: "ALL",
  railway: "ALL",
  rrb: "ALL",
  ntpc: "ALL",
  ongc: "ALL",
  gail: "ALL",
  "bpsc central": "ALL",
  upsc: "ALL",
};

const detectStateSmart = (job) => {
  const text = `${job.postTitle} ${job.slug} ${job.organization}`.toLowerCase();
  for (const key in STATE_KEYWORDS) {
    if (text.includes(key)) return STATE_KEYWORDS[key];
  }
  return "Unknown";
};

const getJobsSmartByState = async (req, res) => {
  try {
    const { state } = req.query;

    if (!state) {
      return res.status(400).json({
        success: false,
        message: "Please provide ?state=Bihar or ?state=ALL",
      });
    }

    const allJobs = await Post.find({ postType: "JOB" })
      .sort({ createdAt: -1 })
      .lean();

    if (state.toUpperCase() === "ALL") {
      return res.json({
        success: true,
        count: allJobs.length,
        state: "ALL",
        data: allJobs.map(withContentDefaults),
      });
    }

    const filtered = allJobs.filter((job) => {
      const detected = detectStateSmart(job);
      return detected.toLowerCase() === state.toLowerCase();
    });

    return res.json({
      success: true,
      count: filtered.length,
      state,
      data: filtered.map(withContentDefaults),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteAllJobs = async (req, res) => {
  try {
    const result = await Post.deleteMany({ postType: "JOB" });
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const backfillPageHash = async (req, res) => {
  try {
    const limitRaw = Number(req.query.limit);
    const limit =
      Number.isFinite(limitRaw) && limitRaw > 0
        ? Math.min(Math.floor(limitRaw), 5000)
        : 1000;

    const filter = {
      $or: [{ pageHash: { $exists: false } }, { pageHash: { $in: [null, ""] } }],
    };

    const posts = await Post.find(filter).limit(limit).lean();
    if (!posts.length) {
      return res.json({
        success: true,
        updated: 0,
        message: "No posts without pageHash",
      });
    }

    const bulkOps = posts.map((p) => ({
      updateOne: {
        filter: { _id: p._id },
        update: { $set: { pageHash: generateManualPageHash(p) } },
      },
    }));

    const result = await Post.bulkWrite(bulkOps);

    res.json({
      success: true,
      scanned: posts.length,
      modified: result.modifiedCount,
      message: "pageHash backfilled",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export {
  createPost,
  updatePost,
  deletePost,
  deleteAllPosts,
  getJobs,
  insertBulkPosts,
  getallPost,
  getJobById,
  getExpiringJobsReminder,
  getJobsSmartByState,
  deleteAllJobs,
  backfillPageHash,
};
