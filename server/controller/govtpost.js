// controllers/postController.js (ya jo bhi file ka naam hai)

const Post = require("@/models/gov/govtpost");
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const twoDaysLater = new Date(today);
    twoDaysLater.setDate(twoDaysLater.getDate() + 2);
    twoDaysLater.setHours(23, 59, 59, 999);

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
        $ne: null,
        $ne: "",
        $ne: "Will Be Updated Here Soon",
        $ne: "Available Soon",
        $ne: "Notify Soon",
      },
    }));

    const postsWithDates = await Post.find({
      $or: orConditions,
    }).lean();

    const reminders = [];

    const parseDate = (dateString) => {
      if (!dateString || typeof dateString !== "string") return null;

      const trimmed = dateString.trim();

      if (!isNaN(Date.parse(trimmed))) {
        return new Date(trimmed);
      }

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

    const getNestedValue = (obj, path) => {
      return path.split(".").reduce((acc, part) => acc?.[part], obj);
    };

    for (const post of postsWithDates) {
      let dateValue = null;
      let usedKey = null;

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
          dateValue = value;
          usedKey = keyPath;
          break;
        }
      }

      if (!dateValue) continue;

      try {
        const parsedDate = parseDate(dateValue);

        if (!parsedDate || isNaN(parsedDate.getTime())) {
          continue;
        }

        if (parsedDate >= today && parsedDate <= twoDaysLater) {
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
        }
      } catch (error) {
        console.error(`Date parsing error for post ${post._id}:`, error);
        continue;
      }
    }

    const sortedReminders = reminders.sort((a, b) => a.daysLeft - b.daysLeft);

    return res.status(200).json({
      success: true,
      count: sortedReminders.length,
      reminders: sortedReminders,
      message:
        sortedReminders.length === 0
          ? "No reminders within 2 days"
          : `Found ${sortedReminders.length} reminders`,
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
      return res.status(400).json({
        success: false,
        error: "Title is required",
      });
    }

    // Prepare safe regex
    const safeTitle = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Cursor Query (streaming)
    const cursor = Post.find(
      {
        "recruitment.title": { $regex: new RegExp(safeTitle, "i") },
      },
      {
        _id: 1,
        url: 1, // ✅ FIX → url added
        recruitment: 1,
        updatedAt: 1,
        fav: 1,
      }
    )
      .lean()
      .cursor();

    // Streaming Response
    res.setHeader("Content-Type", "application/json");
    res.write(`{"success": true, "data": [`);

    let first = true;

    for (
      let doc = await cursor.next();
      doc != null;
      doc = await cursor.next()
    ) {
      if (!first) res.write(",");
      res.write(JSON.stringify(doc));
      first = false;
    }

    res.write("]}");
    res.end();
  } catch (err) {
    console.error("Stream error:", err);
    return res.status(500).json({
      success: false,
      error: "Server error",
    });
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
