const govPostList = require("../models/postList");
const Post = require("../models/govtpost");
const Section = require("../models/section");
const Site = require("../models/scrapperSite");

// ======================
// 1️⃣  getGovPostListBySection
// ======================
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

// ======================
// 2️⃣  getGovJobSections
// ======================
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

// ======================
// 3️⃣  getGovPostDetails (with domain stripping)
// ======================
const getGovPostDetails = async (req, res) => {
  try {
    let url = req.query.url;
    if (!url) {
      return res.status(400).json({
        success: false,
        error: "URL is required",
      });
    }

    // Strip domain: convert full URL → only pathname
    try {
      if (url.startsWith("http://") || url.startsWith("https://")) {
        const parsed = new URL(url);
        url = parsed.pathname; // "/new-result/"
      }
    } catch (e) {
      // ignore formatting error
    }

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

// Create or Update Site URL
const setGovSite = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== "string") {
      return res.status(400).json({
        success: false,
        error: "Valid URL is required",
      });
    }

    // Always maintain only one site document
    const updated = await Site.findOneAndUpdate(
      {}, // always update the first doc
      { url }, // update fields
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (err) {
    console.error("setGovSite error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// Get Site URL
const getGovSlice = async (req, res) => {
  try {
    const site = await Site.findOne();

    return res.status(200).json(site);
  } catch (err) {
    console.error("getGovSlice error:", err);
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};


// EXPORT MULTIPLE CONTROLLERS
module.exports = {
  getGovPostListBySection,
  getGovJobSections,
  getGovPostDetails,
  setGovSite,
  getGovSlice,
};
