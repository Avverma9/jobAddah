const govPostList = require("@/models/gov/postList");
const Post = require("@/models/gov/govtpost");
const Section = require("@/models/gov/section");
const Site = require("@/models/gov/scrapperSite");

// ======================
// 1️⃣  getGovPostListBySection (Optimized: .lean())
// ======================
const getGovPostListBySection = async (req, res) => {
  try {
    const url = req.params.url;

    // lean() returns plain JS objects, much faster for read-only APIs
    const getData = await govPostList
      .find({ section: url })
      .sort({ createdAt: -1 })
      .lean();

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

// ======================
// 2️⃣  getGovJobSections (Optimized: .lean())
// ======================
const getGovJobSections = async (req, res) => {
  try {
    const getData = await Section.find().sort({ createdAt: -1 }).lean();

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

// ======================
// 3️⃣  getGovPostDetails (Optimized: .lean() + Error Handling)
// ======================
const getGovPostDetails = async (req, res) => {
  try {
    let url = req.query.url;
    if (!url) {
      return res.status(400).json({ success: false, error: "URL is required" });
    }

    // Strip domain logic
    try {
      if (url.startsWith("http://") || url.startsWith("https://")) {
        const parsed = new URL(url);
        url = parsed.pathname;
      }
    } catch (e) {
      // Keep original if parsing fails
    }
    url = url.trim();

    // lean() is crucial here if the post object is large
    const getData = await Post.findOne({ url })
      .sort({ createdAt: -1 })
      .lean();

    if (!getData) {
      return res.status(404).json({ success: false, error: "Post not found" });
    }

    return res.status(200).json({ success: true, data: getData });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message || "Internal server error",
    });
  }
};

// ======================
// 4️⃣  setGovSite (Optimized: atomic update)
// ======================
const setGovSite = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== "string") {
      return res.status(400).json({ success: false, error: "Valid URL is required" });
    }

    // findOneAndUpdate with upsert is already atomic and efficient
    // Added .lean() to the result if you just need the data back
    const updated = await Site.findOneAndUpdate(
      {}, 
      { url }, 
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error("setGovSite error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ======================
// 5️⃣  getGovSlice (Optimized: .lean())
// ======================
const getGovSlice = async (req, res) => {
  try {
    // lean() makes this instantaneous
    const site = await Site.findOne().lean();

    // If null, return empty object or null, standard practice
    return res.status(200).json(site || {});
  } catch (err) {
    console.error("getGovSlice error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  getGovPostListBySection,
  getGovJobSections,
  getGovPostDetails,
  setGovSite,
  getGovSlice,
};
