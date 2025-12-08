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



module.exports = { getPostDetails, getSections, getPostListBySection };
