const Post = require("../models/jobs");

// --- Helper: Standard Response Formatter ---
const formatResponse = (data) => ({
  success: true,
  count: data.length,
  data: data,
});

// ==========================================
// A. CRUD OPERATIONS (Create, Update, Delete)
// ==========================================

// 1. Create a New Post
const createPost = async (req, res) => {
  try {
    const newPost = new Post(req.body);
    const savedPost = await newPost.save();
    res.status(201).json({ success: true, data: savedPost });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// 2. Insert Bulk Posts
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
    console.error("insertBulkPosts error:", err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: err.errors ? Object.values(err.errors).map((e) => e.message) : "No details.",
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

// 3. Update a Post by ID
const updatePost = async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedPost) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    res.json({ success: true, data: updatedPost });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// 4. Delete a Post by ID
const deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    res.json({ success: true, message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 5. Delete ALL Posts
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



// 7. Get Doc By ID (Simple)
const getDocsById = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ message: "Not found" });
    return res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================================
// B. CATEGORIZED GETTERS (No Pagination)
// ==========================================

// 8. Get All Jobs (Online Forms)
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

    const posts = await Post.find(query).sort({ createdAt: -1 });
    res.json(formatResponse(posts));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// 9. Get Private Jobs
const getPrivateJob = async (req, res) => {
  try {
    const { search } = req.query;
    const query = { postType: "PRIVATE_JOB" };

    if (search) {
      query.$or = [
        { postTitle: { $regex: search, $options: "i" } },
        { organization: { $regex: search, $options: "i" } },
      ];
    }

    const posts = await Post.find(query).sort({ createdAt: -1 }).lean();

    const data = posts.map((post) => ({
      _id: post._id,
      title: post.postTitle,
      slug: post.slug,
      org: post.organization,
      vacancies: post.totalVacancyCount || "N/A",
      lastDate: post.importantDates?.find((d) => d.label?.toLowerCase().includes("last"))?.value || "N/A",
      createdAt: post.createdAt,
    }));

    res.json(formatResponse(data));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 10. Get Admit Cards
const getAdmitCards = async (req, res) => {
  try {
    const { search } = req.query;
    const query = { postType: "ADMIT_CARD" };

    if (search) query.postTitle = { $regex: search, $options: "i" };

    const posts = await Post.find(query)
      .select("postTitle slug organization importantDates importantLinks")
      .sort({ createdAt: -1 })
      .lean();

    const data = posts.map((post) => ({
      _id: post._id,
      title: post.postTitle,
      slug: post.slug,
      examDate: post.importantDates?.find((d) => d.label.toLowerCase().includes("exam"))?.value || "Soon",
      downloadLink: post.importantLinks?.find((l) => /admit|download/i.test(l.label))?.url,
    }));

    res.json(formatResponse(data));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 11. Get Results
const getResults = async (req, res) => {
  try {
    const { search } = req.query;
    const query = { postType: "RESULT" };

    if (search) query.postTitle = { $regex: search, $options: "i" };

    const posts = await Post.find(query)
      .select("postTitle slug organization importantDates importantLinks")
      .sort({ createdAt: -1 })
      .lean();

    const data = posts.map((post) => ({
      _id: post._id,
      title: post.postTitle,
      slug: post.slug,
      resultDate: post.importantDates?.find((d) => d.label.toLowerCase().includes("result"))?.value || "Declared",
      checkLink: post.importantLinks?.find((l) => l.label.toLowerCase().includes("result"))?.url,
    }));

    res.json(formatResponse(data));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 12. Get Upcoming Exams
const getExams = async (req, res) => {
  try {
    const query = {
      "importantDates.label": { $regex: /Exam Date|Test Date|CBT Date/i },
    };

    const posts = await Post.find(query)
      .select("postTitle slug organization importantDates")
      .sort({ createdAt: -1 })
      .lean();

    const data = posts.map((post) => ({
      _id: post._id,
      title: post.postTitle,
      slug: post.slug,
      examDate: post.importantDates?.find((d) => /Exam Date|Test Date/i.test(d.label))?.value,
    }));

    res.json(formatResponse(data));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 13. Get Answer Keys
const getAnswerKeys = async (req, res) => {
  try {
    const query = { postType: "ANSWER_KEY" };
    const posts = await Post.find(query).sort({ createdAt: -1 });
    res.json(formatResponse(posts));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 14. Get All Posts (Raw)
const getallPost = async (req, res) => {
  try {
    const response = await Post.find().sort({ createdAt: -1 });
    res.json(response);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ==========================================
// C. STATS & UTILITIES
// ==========================================

// 15. Get Dashboard Stats
const getStats = async (req, res) => {
  try {
    const stats = await Promise.all([
      Post.countDocuments({}),
      Post.countDocuments({ postType: "JOB" }),
      Post.countDocuments({ postType: "ADMIT_CARD" }),
      Post.countDocuments({ postType: "RESULT" }),
      Post.countDocuments({ postType: "ADMISSION" }),
      Post.countDocuments({ postType: "ANSWER_KEY" }),
    ]);

    res.json({
      success: true,
      stats: {
        total: stats[0],
        jobs: stats[1],
        admitCards: stats[2],
        results: stats[3],
        admissions: stats[4],
        answerKeys: stats[5],
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 16. Expiring Jobs Reminder
const getExpiringJobsReminder = async (req, res) => {
  try {
    const today = new Date();
    const fiveDaysLater = new Date();
    fiveDaysLater.setDate(today.getDate() + 5);

    const jobs = await Post.find({ postType: "JOB", isLive: true }).lean();

    const extractLastDate = (job) => {
      const lastObj = job.importantDates?.find((d) => d.label?.toLowerCase().includes("last"));
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

// 17. State Filtering Logic
const STATE_KEYWORDS = {
  // Full States
  andhra: "Andhra Pradesh", arunachal: "Arunachal Pradesh", assam: "Assam", bihar: "Bihar", bssc: "Bihar",
  chhattisgarh: "Chhattisgarh", goa: "Goa", gujarat: "Gujarat", haryana: "Haryana",
  himachal: "Himachal Pradesh", hp: "Himachal Pradesh", jharkhand: "Jharkhand", karnataka: "Karnataka",
  kerala: "Kerala", "madhya pradesh": "Madhya Pradesh", mp: "Madhya Pradesh", maharashtra: "Maharashtra",
  mh: "Maharashtra", manipur: "Manipur", meghalaya: "Meghalaya", mizoram: "Mizoram", nagaland: "Nagaland",
  odisha: "Odisha", orissa: "Odisha", punjab: "Punjab", rajasthan: "Rajasthan", rssb: "Rajasthan",
  rsmssb: "Rajasthan", sikkim: "Sikkim", tamil: "Tamil Nadu", tn: "Tamil Nadu", telangana: "Telangana",
  tripura: "Tripura", "uttar pradesh": "Uttar Pradesh", up: "Uttar Pradesh", upsssc: "Uttar Pradesh",
  uppsc: "Uttar Pradesh", uttarakhand: "Uttarakhand", uk: "Uttarakhand", "west bengal": "West Bengal",
  wb: "West Bengal", wbssc: "West Bengal",
  // Union Territories
  andaman: "Andaman and Nicobar Islands", nicobar: "Andaman and Nicobar Islands", chandigarh: "Chandigarh",
  dd: "Dadra and Nagar Haveli and Daman and Diu", daman: "Dadra and Nagar Haveli and Daman and Diu",
  diu: "Dadra and Nagar Haveli and Daman and Diu", delhi: "Delhi", "new delhi": "Delhi", dsssb: "Delhi",
  jammu: "Jammu and Kashmir", kashmir: "Jammu and Kashmir", ladakh: "Ladakh", lakshadweep: "Lakshadweep",
  puducherry: "Puducherry", pondicherry: "Puducherry",
  // Central Govt
  ssc: "ALL", sscsr: "ALL", sscnr: "ALL", drdo: "ALL", afcat: "ALL", af: "ALL", army: "ALL", navy: "ALL",
  "air force": "ALL", aiims: "ALL", sebi: "ALL", ecgc: "ALL", rbi: "ALL", "bank of baroda": "ALL",
  bob: "ALL", ibps: "ALL", railway: "ALL", rrb: "ALL", ntpc: "ALL", ongc: "ALL", gail: "ALL",
  "bpsc central": "ALL", upsc: "ALL",
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
      return res.status(400).json({ success: false, message: "Please provide ?state=Bihar or ?state=ALL" });
    }

    // Get all jobs, simple find, no cursors needed for non-paginated small-to-medium datasets
    const allJobs = await Post.find({ postType: "JOB" }).sort({ createdAt: -1 }).lean();

    if (state.toUpperCase() === "ALL") {
      return res.json({
        success: true,
        count: allJobs.length,
        state: "ALL",
        data: allJobs,
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
      data: filtered,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 18. Favorite Logic



const deleteAllJobs = async (req, res) => {
  try {
    const result = await Post.deleteMany({ postType: 'JOB' });
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createPost,
  updatePost,
  deletePost,
  deleteAllPosts,
  getJobs,
  getAdmitCards,
  getResults,
  getExams,
  getAnswerKeys,
  getStats,
  insertBulkPosts,
  getallPost,
  getDocsById,
  getPrivateJob,
  getExpiringJobsReminder,
  getJobsSmartByState,
  deleteAllJobs,

};