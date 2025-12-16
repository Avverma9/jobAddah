const express = require("express");
const router = express.Router();

const {
  getJobs, // Filtered: Online Forms
  getallPost,
} = require("@/controller/jobs");
router.get("/get-jobs", getJobs);
router.get("/get-all", getallPost);
module.exports = router;
