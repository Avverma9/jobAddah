const Post = require("../models/jobs");

// --- Helper: Standard Response Formatter ---
const formatResponse = (data, page, limit, total) => ({
  success: true,
  count: data.length,
  totalDocuments: total,
  totalPages: Math.ceil(total / limit),
  currentPage: parseInt(page),
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
    res.status(400).json({ success: false, message: err.message }); // 400 for Bad Request (Duplicate slug etc)
  }
};

const insertBulkPosts = async (req, res) => {
  try {
    const posts = req.body;
    if (!Array.isArray(posts) || posts.length === 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Input must be a non-empty array of posts",
        });
    }

    // Mongoose automatically validates each document in the array
    const result = await Post.insertMany(posts);
    console.log(result);

    return res.status(201).json({
      success: true,
      message: `Successfully inserted ${result.length} posts`,
      data: result,
    });
  } catch (err) {
    console.error("insertBulkPosts error:", err);

    // Handle Mongoose validation errors
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation failed for one or more posts.",
        // Extract and send back specific validation errors
        errors: err.errors
          ? Object.values(err.errors).map((e) => e.message)
          : "No details available.",
      });
    }

    // Handle bulk write errors (e.g., duplicate key)
    if (err.name === "BulkWriteError" && err.code === 11000) {
      return res.status(409).json({
        // 409 Conflict is more appropriate for duplicates
        success: false,
        message: "One or more posts have duplicate keys.",
        // Provide details on which items failed if possible
        details: err.writeErrors?.map((e) => ({
          index: e.index,
          code: e.code,
          errmsg: e.errmsg,
        })),
      });
    }

    // Generic server error
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred during bulk insert.",
      error: err.message, // Provide error message for debugging
    });
  }
};

// 2. Update a Post by ID
const updatePost = async (req, res) => {
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // Return updated doc & validate
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

// 3. Delete a Post by ID
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

// 4. Delete ALL Posts (Dangerous!)
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

// 5. Get Single Post (By Slug or ID)
const getPostDetails = async (req, res) => {
  try {
    // Check if param is valid ObjectID, else treat as Slug
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(req.params.id);
    const query = isObjectId ? { _id: req.params.id } : { slug: req.params.id };

    const post = await Post.findOne(query);
    if (!post)
      return res
        .status(404)
        .json({ success: false, message: "Post not found" });

    res.json({ success: true, data: post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// B. CATEGORIZED GETTERS (Filtering)
// ==========================================

// 6. Get Online Forms (Latest Jobs)
const getJobs = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, postType } = req.query;

    const query = {};

    // Dynamic postType filter
    if (postType && postType !== "ALL") {
      query.postType = postType.toUpperCase();
    }

    // Search across multiple fields
    if (search) {
      query.$or = [
        { postTitle: { $regex: search, $options: "i" } },
        { organization: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await Post.countDocuments(query);

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));



    res.json(formatResponse(posts, page, limit, total));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



const getPrivateJob = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { postType: "PRIVATE_JOB" };

    if (search) {
      query.$or = [
        { postTitle: { $regex: search, $options: "i" } },
        { organization: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await Post.countDocuments(query);

    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Lightweight response for listing
    const data = posts.map((post) => ({
      _id: post._id,
      title: post.postTitle,
      slug: post.slug,
      org: post.organization,
      vacancies: post.totalVacancyCount || "N/A",
      lastDate:
        post.importantDates?.find((d) =>
          d.label?.toLowerCase().includes("last")
        )?.value || "N/A", // "last" label more flexible for various formats
      createdAt: post.createdAt, // Optionally send createdAt for debugging or frontend sorting
    }));

    res.json(formatResponse(data, page, limit, total));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
const getDocsById = async (req, res) => {
  const { id } = req.params;
  const post = await Post.findById(id);
  return res.status(200).json(post);
};
// 7. Get Admit Cards
const getAdmitCards = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { postType: "ADMIT_CARD" };

    if (search) query.postTitle = { $regex: search, $options: "i" };

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .select("postTitle slug organization importantDates importantLinks")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const data = posts.map((post) => ({
      _id: post._id,
      title: post.postTitle,
      slug: post.slug,
      examDate:
        post.importantDates.find((d) => d.label.toLowerCase().includes("exam"))
          ?.value || "Soon",
      downloadLink: post.importantLinks.find(
        (l) =>
          l.label.toLowerCase().includes("admit") ||
          l.label.toLowerCase().includes("download")
      )?.url,
    }));

    res.json(formatResponse(data, page, limit, total));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 8. Get Results
const getResults = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const query = { postType: "RESULT" };

    if (search) query.postTitle = { $regex: search, $options: "i" };

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .select("postTitle slug organization importantDates importantLinks")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const data = posts.map((post) => ({
      _id: post._id,
      title: post.postTitle,
      slug: post.slug,
      resultDate:
        post.importantDates.find((d) =>
          d.label.toLowerCase().includes("result")
        )?.value || "Declared",
      checkLink: post.importantLinks.find((l) =>
        l.label.toLowerCase().includes("result")
      )?.url,
    }));

    res.json(formatResponse(data, page, limit, total));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 9. Get Upcoming Exams
// Logic: Finds posts where `importantDates` contains "Exam Date" or "Test Date"
const getExams = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const query = {
      "importantDates.label": { $regex: /Exam Date|Test Date|CBT Date/i },
    };

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .select("postTitle slug organization importantDates")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const data = posts.map((post) => ({
      _id: post._id,
      title: post.postTitle,
      slug: post.slug,
      examDate: post.importantDates.find((d) =>
        /Exam Date|Test Date/i.test(d.label)
      )?.value,
    }));

    res.json(formatResponse(data, page, limit, total));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 10. Get Answer Keys (Bonus)
const getAnswerKeys = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const query = { postType: "ANSWER_KEY" };

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json(formatResponse(posts, page, limit, total));
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ==========================================
// C. STATS & DASHBOARD
// ==========================================

// 11. Get Dashboard Stats
const getStats = async (req, res) => {
  try {
    const stats = await Promise.all([
      Post.countDocuments({}), // Total Posts
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
const getallPost = async (req, res) => {
  try {
    const response = await Post.find().sort({ createdAt: -1 });
    res.json(response);
  } catch (err) {
    console.error(err);
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
          message: "Last date is today!"
        });
      } else if (diffDays > 0 && diffDays <= 5) {
        expiringSoon.push({
          _id: job._id,
          title: job.postTitle,
          slug: job.slug,
          lastDate: lastDateStr,
          daysLeft: diffDays,
          message: `${diffDays} days left`
        });
      }
    });

    res.json({
      success: true,
      expiresToday,
      expiringSoon,
      totalExpiring: expiresToday.length + expiringSoon.length
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


const STATE_KEYWORDS = {
  // Full States
  "andhra": "Andhra Pradesh",
  "arunachal": "Arunachal Pradesh",
  "assam": "Assam",
  "bihar": "Bihar",
  "bssc": "Bihar",
  "chhattisgarh": "Chhattisgarh",
  "goa": "Goa",
  "gujarat": "Gujarat",
  "haryana": "Haryana",
  "himachal": "Himachal Pradesh",
  "hp": "Himachal Pradesh",
  "jharkhand": "Jharkhand",
  "karnataka": "Karnataka",
  "kerala": "Kerala",
  "madhya pradesh": "Madhya Pradesh",
  "mp": "Madhya Pradesh",
  "maharashtra": "Maharashtra",
  "mh": "Maharashtra",
  "manipur": "Manipur",
  "meghalaya": "Meghalaya",
  "mizoram": "Mizoram",
  "nagaland": "Nagaland",
  "odisha": "Odisha",
  "orissa": "Odisha",
  "punjab": "Punjab",
  "rajasthan": "Rajasthan",
  "rssb": "Rajasthan",
  "rsmssb": "Rajasthan",
  "sikkim": "Sikkim",
  "tamil": "Tamil Nadu",
  "tn": "Tamil Nadu",
  "telangana": "Telangana",
  "tripura": "Tripura",
  "uttar pradesh": "Uttar Pradesh",
  "up": "Uttar Pradesh",
  "upsssc": "Uttar Pradesh",
  "uppsc": "Uttar Pradesh",
  "uttarakhand": "Uttarakhand",
  "uk": "Uttarakhand",
  "west bengal": "West Bengal",
  "wb": "West Bengal",
  "wbssc": "West Bengal",

  // Union Territories
  "andaman": "Andaman and Nicobar Islands",
  "nicobar": "Andaman and Nicobar Islands",
  "chandigarh": "Chandigarh",
  "dd": "Dadra and Nagar Haveli and Daman and Diu",
  "daman": "Dadra and Nagar Haveli and Daman and Diu",
  "diu": "Dadra and Nagar Haveli and Daman and Diu",
  "delhi": "Delhi",
  "new delhi": "Delhi",
  "dsssb": "Delhi",
  "jammu": "Jammu and Kashmir",
  "kashmir": "Jammu and Kashmir",
  "ladakh": "Ladakh",
  "lakshadweep": "Lakshadweep",
  "puducherry": "Puducherry",
  "pondicherry": "Puducherry",

  // Central Govt (Return ALL)
  "ssc": "ALL",
  "sscsr": "ALL",
  "sscnr": "ALL",
  "drdo": "ALL",
  "afcat": "ALL",
  "af": "ALL",
  "army": "ALL",
  "navy": "ALL",
  "air force": "ALL",
  "aiims": "ALL",
  "sebi": "ALL",
  "ecgc": "ALL",
  "rbi": "ALL",
  "bank of baroda": "ALL",
  "bob": "ALL",
  "ibps": "ALL",
  "railway": "ALL",
  "rrb": "ALL",
  "ntpc": "ALL",
  "ongc": "ALL",
  "gail": "ALL",
  "bpsc central": "ALL",
  "upsc": "ALL"
};

const detectStateSmart = (job) => {
  const text =
    `${job.postTitle} ${job.slug} ${job.organization}`.toLowerCase();

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
        message: "Please provide ?state=Bihar or ?state=ALL"
      });
    }

    // Build main query
    const query = { postType: "JOB" };

    // Use cursor with sorting
    const cursor = Post.find(query)
      .sort({ createdAt: -1 })
      .cursor();

    const allJobs = [];
    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
      allJobs.push(doc.toObject());
    }

    // If state = ALL → return complete sorted list
    if (state.toUpperCase() === "ALL") {
      return res.json({
        success: true,
        count: allJobs.length,
        state: "ALL",
        data: allJobs
      });
    }

    // Smart filtering
    const filtered = allJobs.filter((job) => {
      const detected = detectStateSmart(job);
      return detected.toLowerCase() === state.toLowerCase();
    });

    return res.json({
      success: true,
      count: filtered.length,
      state,
      data: filtered
    });

  } catch (err) {
    console.error("getJobsSmartByState error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


const markFav = async (req, res) => {
  try {
    const { id } = req.params;
    const { fav } = req.body;

    // Validate inputs
    if (!id || typeof fav !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: "Invalid ID or fav status required"
      });
    }

    // Count current favorites for this user (assuming user auth middleware)
    const userId = req.user?.id; // From auth middleware
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    const currentFavCount = await Post.countDocuments({
      fav: true,
      userId: userId // Per-user favorites
    });

    if (fav === true && currentFavCount >= 8) {
      return res.status(400).json({
        success: false,
        message: "You can mark only 8 posts as favorite"
      });
    }

    // Find and update the post
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        fav: fav,
        userId: userId, // Track per user
        updatedAt: new Date()
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('userId', 'name email'); // Optional: populate user info

    if (!updatedPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found"
      });
    }

    res.json({
      success: true,
      data: updatedPost
    });

  } catch (err) {
    console.error("markFav error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


const getFavPosts = async (req, res) => {
  try {
    const favPosts = await Post.find({ fav: true }).sort({ createdAt: -1 });
    res.json({ success: true, count: favPosts.length, data: favPosts });
  } catch (err) {
    console.error("getFavPosts error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createPost,
  updatePost,
  deletePost,
  deleteAllPosts,
  getPostDetails,
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
  markFav,
  getFavPosts
};
