const express = require("express");
const {
  getSections,
  getPostListBySection,
  getPostDetails,
} = require("../controller/posts");
const router = express.Router();
router.get("/get-sections", getSections);
router.post("/get-postlist", getPostListBySection);
router.get("/get-post/details", getPostDetails);
module.exports = router;
