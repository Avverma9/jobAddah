const express = require("express");
const router = express.Router();

const {
  getJobs, // Filtered: Online Forms
  getallPost,
  createPost,
} = require("@/controller/jobs");
router.get("/get-jobs", getJobs);
router.get("/get-all", getallPost);
router.post('/add-job', createPost);
module.exports = router;
