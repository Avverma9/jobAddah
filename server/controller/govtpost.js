// controllers/postController.js

const Post = require("@/models/gov/govtpost");
const postList = require("@/models/gov/postList");
const govPostList = require("@/models/gov/postList");
const Section = require("@/models/gov/section");

// ------------------------------------------------------------------
// 1. Get Gov Post Details (Optimized: Lean query + Projection)
// ------------------------------------------------------------------
const getGovPostDetails = async (req, res) => {
  try {
    let url = req.query.url;
    if (!url) {
      return res.status(400).json({ success: false, error: "URL is required" });
    }

    try {
      if (url.startsWith("http://") || url.startsWith("https://")) {
        const parsed = new URL(url);
        url = parsed.pathname;
      }
    } catch (e) {}
    url = url.trim();

    // lean() makes it faster by returning POJO instead of Mongoose Document
    const getData = await Post.findOne({ url }).sort({ createdAt: -1 }).lean();

    if (!getData) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }

    return res.status(200).json({ success: true, data: getData });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || "Internal server error" });
  }
};

// ------------------------------------------------------------------
// 2. Get Sections (Optimized: Lean + Count optimization)
// ------------------------------------------------------------------
const getGovJobSections = async (req, res) => {
  try {
    const getData = await Section.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, count: getData.length, data: getData });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || "Internal server error" });
  }
};

// ------------------------------------------------------------------
// 3. Get Post List by Section (Optimized: Indexed Query + Lean)
// ------------------------------------------------------------------
const getGovPostListBySection = async (req, res) => {
  try {
    const url = req.params.url;
    const getData = await govPostList
      .find({ section: url })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, count: getData.length, data: getData });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || "Internal server error" });
  }
};

// ------------------------------------------------------------------
// 4. Mark Fav (Optimized: Atomic Update + Count Check)
// ------------------------------------------------------------------
const markFav = async (req, res) => {
  try {
    const { id } = req.params;
    const { fav } = req.body;

    if (fav === true) {
      const favCount = await Post.countDocuments({ fav: true });
      if (favCount >= 8) {
        return res.status(400).json({ success: false, message: "You can mark only 8 posts as favorite" });
      }
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { fav },
      { new: true }
    ).lean();

    if (!updatedPost) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    return res.status(200).json({ success: true, data: updatedPost });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Internal server error" });
  }
};

// ------------------------------------------------------------------
// 5. Get Fav Posts (Optimized: 1 DB Call with Date Logic inside Query)
// ------------------------------------------------------------------
const getFavPosts = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Step 1: Unmark expired posts directly in DB (Atomic Bulk Update)
    // Uses $expr and $dateFromString to check expiry without fetching data to Node
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
                        { $ifNull: ["$recruitment.importantDates.applicationLastDate", "$recruitment.importantDates.lastDate"] }, 
                        "" 
                      ] 
                    } 
                  } 
                },
                onError: new Date("2099-12-31"), // Treat bad dates as valid (future) to avoid accidental unmark
                onNull: new Date("2099-12-31")
              }
            },
            today
          ]
        }
      },
      { $set: { fav: false } }
    );

    // Step 2: Fetch only valid favs
    const validFavs = await Post.find({ fav: true }).sort({ createdAt: -1 }).lean();

    return res.status(200).json({ success: true, count: validFavs.length, data: validFavs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Internal server error" });
  }
};

// ------------------------------------------------------------------
// 6. Get Reminders (Optimized: Aggregation Pipeline - No Loop)
// ------------------------------------------------------------------
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
      "recruitment.importantDates.applicationLastDate",
      "recruitment.importantDates.applicationEndDate",
      "recruitment.importantDates.lastDateToApplyOnline",
      "recruitment.importantDates.onlineApplyLastDate",
      "recruitment.importantDates.lastDateOfRegistration",
      "recruitment.importantDates.lastDate",
      "recruitment.importantDates.applicationEnd",
      "recruitment.importantDates.onlineApplyEnd",
      "recruitment.importantDates.lastDateForRegistration",
    ];

    const reminders = await Post.aggregate([
      {
        $project: {
          _id: 1,
          url: 1,
          title: "$recruitment.title",
          organization: "$recruitment.organization.name",
          totalPosts: "$recruitment.vacancyDetails.totalPosts",
          datesToCheck: dateFields.map((field) => `$${field}`),
        },
      },
      { $unwind: { path: "$datesToCheck", preserveNullAndEmptyArrays: false } },
      { $match: { datesToCheck: { $type: "string", $ne: "" } } },
      {
        $addFields: {
          parsedDate: {
            $dateFromString: {
              dateString: { $trim: { input: "$datesToCheck" } },
              onError: null,
              onNull: null,
            },
          },
        },
      },
      {
        $match: {
          parsedDate: { $gte: today, $lte: endDate },
        },
      },
      {
        $project: {
          _id: 1,
          title: { $ifNull: ["$title", "Untitled"] },
          organization: { $ifNull: ["$organization", "N/A"] },
          applicationLastDate: "$datesToCheck",
          totalPosts: { $ifNull: ["$totalPosts", 0] },
          url: 1,
          daysLeft: {
            $ceil: {
              $divide: [{ $subtract: ["$parsedDate", today] }, 1000 * 60 * 60 * 24],
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
      message: reminders.length === 0
          ? `No reminders within ${daysWindow} days`
          : `Found ${reminders.length} reminders`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch reminders" });
  }
};

// ------------------------------------------------------------------
// 7. Fix URLs (Optimized: Bulk Write - 1 Query instead of N)
// ------------------------------------------------------------------
function stripDomain(url) {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    let path = parsed.pathname.trim();
    if (!path.startsWith("/")) path = "/" + path;
    if (!path.endsWith("/")) path = path + "/";
    return path;
  } catch (err) {
    let clean = url.trim();
    if (!clean.startsWith("/")) clean = "/" + clean;
    if (!clean.endsWith("/")) clean = clean + "/";
    return clean;
  }
}

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
            update: { $set: { url: cleaned } }
          }
        });
      }
    }

    let updatedCount = 0;
    if (bulkOps.length > 0) {
      const result = await Post.bulkWrite(bulkOps);
      updatedCount = result.modifiedCount;
    }

    return res.json({ success: true, updated: updatedCount, message: "All URLs normalized successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ------------------------------------------------------------------
// 8. Find By Title (Optimized: Parallel Exec + DB Filtering + No Stream)
// ------------------------------------------------------------------
const findByTitle = async (req, res) => {
  try {
    const { title } = req.query;

    if (!title) {
      return res.status(400).json({ success: false, error: "Title is required" });
    }

    const safeTitle = title.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
    const titleRe = new RegExp(safeTitle, "i");

    // Run both queries in parallel for maximum speed
    const [results1, results2] = await Promise.all([
      // Query 1: Filter inside jobs array directly in DB
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
                cond: { $regexMatch: { input: "$$job.title", regex: titleRe } }
              }
            }
          }
        }
      ]),
      // Query 2: Search in Recruitment Title
      Post.find(
        { "recruitment.title": titleRe },
        { _id: 1, url: 1, recruitment: 1, updatedAt: 1, fav: 1 }
      ).limit(20).lean()
    ]);

    // Format second result to match expected output structure
    // (Assuming structure is simple object array, merging both)
    // Structure: [{...results1 items}, {...results2 items}]
    
    // Note: To match exact previous streaming output structure:
    // The previous stream outputted a single flat array of mixed objects.
    // We do the same here.
    
    const combinedData = [...results1, ...results2];

    return res.status(200).json({ success: true, data: combinedData });

  } catch (err) {
    console.error("Search error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};

module.exports = {
  getGovPostDetails,
  getGovJobSections,
  getGovPostListBySection,
  markFav,
  getFavPosts,
  getReminders,
  fixAllUrls,
  findByTitle,
};
