const postList = require("../models/postList");
const Post = require("../models/jobs");
const Section = require("../models/section");


// ======================
// 1️⃣  getPostListBySection
// ======================
const getPostListBySection = async (req, res) => {
  try {
    const url = req.params.url;

    const getData = await postList.find({ section: url }).sort({
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
// 2️⃣  getSections
// ======================
const getSections = async (req, res) => {
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
// 3️⃣  getPostDetails (with domain stripping)
// ======================
const getPostDetails = async (req, res) => {
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


// EXPORT MULTIPLE CONTROLLERS
module.exports = {
  getPostListBySection,
  getSections,
  getPostDetails
};
