const Post = require("../models/jobs");
const postList = require("../models/postList");
const Section = require("../models/section");


const getPostDetails = async (req, res) => {
  try {
    const url = req.query.url;
    const getData = await Post.findOne({ url: url }).sort({ createdAt: -1 });
    if(getData === null){
      return res.status(404).json({ error: "Post not found" });
    }

    res.json(getData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSections = async (req, res) => {
  try {
    const getData = await Section.find().sort({ createdAt: -1 });

    res.json(getData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPostListBySection = async (req, res) => {
  try {
    const url = req.params.url;
    const getData = await postList.find({ section: url }).sort({
      createdAt: -1,
    });

    res.json(getData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

    const updatedPost = await Post.findByIdAndUpdate(id, { fav }, { new: true });
    if (!updatedPost) return res.status(404).json({ success: false, message: "Post not found" });

    res.json({ success: true, data: updatedPost });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getFavPosts = async (req, res) => {
  try {
    const favPosts = await Post.find({ fav: true }).sort({ createdAt: -1 });
    res.json({ success: true, count: favPosts.length, data: favPosts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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

    reminders.sort((a, b) => a.daysLeft - b.daysLeft);

    res.json({
      success: true,
      count: reminders.length,
      reminders,
      message:
        reminders.length === 0
          ? "No reminders within 2 days"
          : `Found ${reminders.length} reminders`,
    });
  } catch (error) {
    console.error("Error fetching reminders:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch reminders",
    });
  }
};



module.exports = { getPostDetails, getSections, getPostListBySection, markFav, getFavPosts,getReminders };