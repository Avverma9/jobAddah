const Post = require("../models/jobs");
const postList = require("../models/postList");
const Section = require("../models/section");
const GeminiModel = require("./gemini-model");

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
const setModel = async (req, res) => {
  try {
    const modelName = req.body.modelName;

    if (!modelName) {
      return res.status(400).json({ success: false, message: "modelName is required" });
    }

    // Upsert in one go (cleanest way)
    const modelRecord = await GeminiModel.findOneAndUpdate(
      {},
      { modelName },
      { new: true, upsert: true }
    );

    return res.json({
      success: true,
      message: "Model updated successfully",
      model: modelRecord
    });

  } catch (err) {
    console.error("Error setting Gemini model:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

const getModel = async (req, res) => {
  try {
    const modelRecord = await GeminiModel.findOne({});

    return res.json({
      success: true,
      modelName: modelRecord ? modelRecord.modelName : null
    });

  } catch (err) {
    console.error("Error getting Gemini model:", err);
    
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

module.exports = { getPostDetails, getSections, getPostListBySection, markFav, getFavPosts, setModel, getModel };