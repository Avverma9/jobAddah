// controllers/postController.js (ya jo bhi file ka naam hai)

const Post = require("@/models/gov/govtpost");
const postList = require("@/models/gov/postList");
const govPostList = require("@/models/gov/postList");
const Section = require("@/models/gov/section");

const getGovPostDetails = async (req, res) => {
  try {
    let url = req.query.url;
    if (!url) {
      return res.status(400).json({
        success: false,
        error: "URL is required",
      });
    }

    // --- Strip domain if full URL is passed ---
    try {
      if (url.startsWith("http://") || url.startsWith("https://")) {
        const parsed = new URL(url);
        url = parsed.pathname; // "/new-result/"
      }
    } catch (e) {
      // if URL constructor fails, keep original value
    }

    // Normalize path (remove double slashes, leading slashes, etc.)
    url = url.trim();

    const getData = await Post.findOne({ url }).sort({ createdAt: -1 });

    if (!getData) {
      return res.status(404).json({
        success: false,
        error: "Post not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: getData,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || "Internal server error",
    });
  }
};

const getGovJobSections = async (req, res) => {
  try {
    const getData = await Section.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: getData.length,
      data: getData,
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
    const url = req.params.url;
    const getData = await govPostList.find({ section: url }).sort({
      createdAt: -1,
    });
    return res.status(200).json({
      success: true,
      count: getData.length,
      data: getData,
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
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: updatedPost,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

const dateKeyPatterns = [
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

const parseDate = (dateString) => {
  if (!dateString || typeof dateString !== "string") return null;
  const trimmed = dateString.trim();
  if (!isNaN(Date.parse(trimmed))) return new Date(trimmed);

  const dateRegex = /(\d{1,2})\s+(\w+)\s+(\d{4})/;
  const match = trimmed.match(dateRegex);
  if (match) {
    const months = {
      january: 0,
      february: 1,
      march: 2,
      april: 3,
      may: 4,
      june: 5,
      july: 6,
      august: 7,
      september: 8,
      october: 9,
      november: 10,
      december: 11,
    };
    const day = parseInt(match[1]);
    const month = months[match[2].toLowerCase()];
    const year = parseInt(match[3]);
    if (month !== undefined && !isNaN(day) && !isNaN(year)) {
      return new Date(year, month, day, 23, 59, 59, 999);
    }
  }
  return null;
};

const getNestedValue = (obj, path) =>
  path.split(".").reduce((acc, part) => acc?.[part], obj);

const getLastDateForPost = (post) => {
  for (const keyPath of dateKeyPatterns) {
    const value = getNestedValue(post, keyPath);
    if (
      value &&
      typeof value === "string" &&
      value.trim() !== "" &&
      !value.toLowerCase().includes("will be updated") &&
      !value.toLowerCase().includes("available soon") &&
      !value.toLowerCase().includes("notify soon") &&
      !value.toLowerCase().includes("notify later")
    ) {
      const parsed = parseDate(value);
      if (parsed && !isNaN(parsed.getTime())) return parsed;
    }
  }
  return null;
};

const getFavPosts = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // सारे fav posts ले आओ
    const favPosts = await Post.find({ fav: true }).lean();

    const validFavs = [];
    const expiredIds = [];

    for (const post of favPosts) {
      const lastDate = getLastDateForPost(post);

      // अगर date ही नहीं मिला तो मान लो expire हो चुका → unmark
      if (!lastDate) {
        expiredIds.push(post._id);
        continue;
      }

      if (lastDate < today) {
        // last date cross हो चुकी है → fav हटाओ
        expiredIds.push(post._id);
      } else {
        // अभी valid है → list में show करो
        validFavs.push(post);
      }
    }

    // DB में भी fav false कर दो (background style; response का wait नहीं जरूरी)
    if (expiredIds.length > 0) {
      await Post.updateMany(
        { _id: { $in: expiredIds } },
        { $set: { fav: false } }
      );
    }

    // valid favs ko latest createdAt के हिसाब से sort कर दो
    validFavs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({
      success: true,
      count: validFavs.length,
      data: validFavs,
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
    // Scalability notes:
    // - Don't load entire collection into memory.
    // - Stream candidates with a cursor + small projection.
    // - Limit candidates with a coarse DB-side $or filter, then do strict parsing in JS.

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daysWindowRaw = Number(req.query.days ?? 2);
    const daysWindow = Number.isFinite(daysWindowRaw)
      ? Math.min(Math.max(daysWindowRaw, 1), 30)
      : 2;

    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + daysWindow);
    endDate.setHours(23, 59, 59, 999);

    const dateKeyPatterns = [
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

    const orConditions = dateKeyPatterns.map((field) => ({
      [field]: {
        $exists: true,
        $type: "string",
        $ne: "",
      },
    }));

    // Only fetch minimal fields needed for reminder output + date extraction
    const projection = {
      _id: 1,
      url: 1,
      recruitment: 1,
    };

    const cursor = Post.find({ $or: orConditions }, projection)
      .lean()
      .cursor();

    const reminders = [];

    // small helper optimized for repeated calls
    const MONTHS = {
      january: 0,
      february: 1,
      march: 2,
      april: 3,
      may: 4,
      june: 5,
      july: 6,
      august: 7,
      september: 8,
      october: 9,
      november: 10,
      december: 11,
    };

    const parseDateFast = (dateString) => {
      if (!dateString || typeof dateString !== "string") return null;
      const trimmed = dateString.trim();
      if (!trimmed) return null;

      // Ignore common placeholders early
      const lower = trimmed.toLowerCase();
      if (
        lower.includes("will be updated") ||
        lower.includes("available soon") ||
        lower.includes("notify soon") ||
        lower.includes("notify later")
      ) {
        return null;
      }

      const parsed = Date.parse(trimmed);
      if (!Number.isNaN(parsed)) return new Date(parsed);

      // e.g. "12 January 2025"
      const m = trimmed.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
      if (!m) return null;
      const day = Number(m[1]);
      const month = MONTHS[m[2].toLowerCase()];
      const year = Number(m[3]);
      if (month === undefined || Number.isNaN(day) || Number.isNaN(year)) return null;
      return new Date(year, month, day, 23, 59, 59, 999);
    };

    const getNestedValue = (obj, path) =>
      path.split(".").reduce((acc, part) => acc?.[part], obj);

    // Safety cap to protect node process in pathological cases
    const HARD_REMINDER_CAP = 5000;

    for (
      let post = await cursor.next();
      post != null;
      post = await cursor.next()
    ) {
      let dateValue = null;
      let usedKey = null;

      for (const keyPath of dateKeyPatterns) {
        const value = getNestedValue(post, keyPath);
        if (typeof value === "string" && value.trim() !== "") {
          const parsedDate = parseDateFast(value);
          if (!parsedDate) continue;
          if (parsedDate >= today && parsedDate <= endDate) {
            dateValue = value;
            usedKey = keyPath;
            const daysLeft = Math.ceil(
              (parsedDate - today) / (1000 * 60 * 60 * 24)
            );

            reminders.push({
              _id: post._id,
              title: post.recruitment?.title || "Untitled",
              organization: post.recruitment?.organization?.name || "N/A",
              applicationLastDate: dateValue,
              daysLeft,
              totalPosts: post.recruitment?.vacancyDetails?.totalPosts || 0,
              url: post.url,
              usedDateField: usedKey.split(".").pop(),
            });
            break;
          }
        }
      }

      if (reminders.length >= HARD_REMINDER_CAP) break;
    }

    reminders.sort((a, b) => a.daysLeft - b.daysLeft);

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
    console.error("Error fetching reminders:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch reminders",
    });
  }
};

function stripDomain(url) {
  if (!url) return url;

  try {
    const parsed = new URL(url);
    let path = parsed.pathname.trim();

    // ensure always starts & ends with "/"
    if (!path.startsWith("/")) path = "/" + path;
    if (!path.endsWith("/")) path = path + "/";

    return path;
  } catch (err) {
    // maybe already slug -> normalize
    let clean = url.trim();
    if (!clean.startsWith("/")) clean = "/" + clean;
    if (!clean.endsWith("/")) clean = clean + "/";
    return clean;
  }
}

const fixAllUrls = async (req, res) => {
  try {
    const posts = await Post.find({});
    let updatedCount = 0;

    for (let post of posts) {
      const original = post.url;
      const cleaned = stripDomain(original);

      if (original !== cleaned) {
        await Post.updateOne({ _id: post._id }, { $set: { url: cleaned } });
        updatedCount++;
      }
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
      return res.status(400).json({ success: false, error: "Title is required" });
    }

    // Prepare safe regex
    const safeTitle = title.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
    const titleRe = new RegExp(safeTitle, "i");

    // We'll try two sources: `postList` (jobs array) and fallback to `Post` (recruitment.title)
    // Stream results to avoid memory spikes.
    res.setHeader("Content-Type", "application/json");
    res.write(`{"success": true, "data": [`);

    let firstWritten = false;

    // 1) Search in postList (jobs array)
    const cursor1 = postList.find({ "jobs.title": titleRe }, { _id: 1, url: 1, jobs: 1, updatedAt: 1 }).lean().cursor();
    for (let doc = await cursor1.next(); doc != null; doc = await cursor1.next()) {
      // keep only matching jobs inside this postList document
      const matched = (doc.jobs || []).filter((j) => titleRe.test(j.title));
      if (matched.length === 0) continue;

      const out = {
        _id: doc._id,
        url: doc.url,
        jobs: matched,
        updatedAt: doc.updatedAt,
      };
      if (firstWritten) res.write(",");
      res.write(JSON.stringify(out));
      firstWritten = true;
    }

    // 2) Fallback: also search in Post collection's recruitment.title (if you still want these results)
    const cursor2 = Post.find({ "recruitment.title": titleRe }, { _id: 1, url: 1, recruitment: 1, updatedAt: 1, fav: 1 }).lean().cursor();
    for (let doc = await cursor2.next(); doc != null; doc = await cursor2.next()) {
      const out = {
        _id: doc._id,
        url: doc.url,
        recruitment: doc.recruitment,
        updatedAt: doc.updatedAt,
        fav: doc.fav,
      };
      if (firstWritten) res.write(",");
      res.write(JSON.stringify(out));
      firstWritten = true;
    }

    res.write("]}");
    res.end();
  } catch (err) {
    console.error("Stream error:", err);
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
