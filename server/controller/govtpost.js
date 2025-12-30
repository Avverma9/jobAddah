const Post = require("@/models/gov/govtpost");
const postList = require("@/models/gov/postList");
const govPostList = require("@/models/gov/postList");
const Section = require("@/models/gov/section");
const { scrapper } = require("@/scrapper/gov/scrapper");

// ------------------------------------------------------------------
// 1. Get Gov Post Details (Optimized: Auto-Scrape on 404)
// ------------------------------------------------------------------
const getGovPostDetails = async (req, res) => {
  try {
    let url = req.query.url;
    if (!url) {
      return res.status(400).json({ success: false, error: "URL is required" });
    }

    const originalUrl = url;

    try {
      if (url.startsWith("http://") || url.startsWith("https://")) {
        const parsed = new URL(url);
        url = parsed.pathname;
      }
    } catch (e) {}
    url = url.trim();

    let getData = await Post.findOne({ url }).sort({ createdAt: -1 }).lean();

    if (!getData) {
      const callUrl = originalUrl || url;

      // Internal call to scraper logic
      const scrapeResult = await new Promise((resolve) => {
        const fakeReq = { body: { url: callUrl } };
        const fakeRes = {
          _status: 200,
          status(code) { this._status = code; return this; },
          json(payload) { resolve({ status: this._status, payload }); },
          send(payload) { resolve({ status: this._status, payload }); },
        };
        try {
          scrapper(fakeReq, fakeRes);
        } catch (e) {
          resolve({ status: 500, payload: null });
        }
      });

      if (scrapeResult?.payload?.success) {
        getData = await Post.findOne({ url }).sort({ createdAt: -1 }).lean();
        if (getData) {
          return res.status(200).json({ success: true, data: getData, createdByScrape: true });
        }
      }
    }

    if (!getData) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }

    return res.status(200).json({ success: true, data: getData });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || "Internal server error" });
  }
};

// ------------------------------------------------------------------
// 2. Get Sections
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
// 3. Get Post List by Section
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
// 4. Mark Fav
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
// 5. Get Fav Posts
// ------------------------------------------------------------------
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
                        { $ifNull: ["$recruitment.importantDates.applicationLastDate", "$recruitment.importantDates.lastDate"] }, 
                        "" 
                      ] 
                    } 
                  } 
                },
                onError: new Date("2099-12-31"),
                onNull: new Date("2099-12-31")
              }
            },
            today
          ]
        }
      },
      { $set: { fav: false } }
    );

    const validFavs = await Post.find({ fav: true }).sort({ createdAt: -1 }).lean();

    return res.status(200).json({ success: true, count: validFavs.length, data: validFavs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message || "Internal server error" });
  }
};

// ------------------------------------------------------------------
// 6. Get Reminders
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

      // Convert all date strings → Date objects
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

      // Skip posts with no valid date in window
      {
        $match: {
          "parsedDates.0": { $exists: true },
        },
      },

      // Pick NEAREST date only
      {
        $addFields: {
          nearestDate: { $min: "$parsedDates" },
        },
      },

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
    console.error("Reminder API Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch reminders",
    });
  }
};

// ------------------------------------------------------------------
// 7. Fix URLs
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
// 8. Find By Title
// ------------------------------------------------------------------
const findByTitle = async (req, res) => {
  try {
    const { title } = req.query;

    if (!title) {
      return res.status(400).json({ success: false, error: "Title is required" });
    }

    const safeTitle = title.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
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
                cond: { $regexMatch: { input: "$$job.title", regex: titleRe } }
              }
            }
          }
        }
      ]),
      Post.find(
        { "recruitment.title": titleRe },
        { _id: 1, url: 1, recruitment: 1, updatedAt: 1, fav: 1 }
      ).limit(20).lean()
    ]);

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
