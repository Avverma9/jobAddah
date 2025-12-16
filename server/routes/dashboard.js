const express = require("express");
const { getGovJobSections,getGovPostListBySection, getGovPostDetails, getGovSlice, setGovSite } = require("@/controller/dashboard");
const router = express.Router();
router.get("/get-sections", getGovJobSections);
router.post("/get-postlist", getGovPostListBySection);
router.get("/get-post/details", getGovPostDetails);
router.get("/get-site",getGovSlice)
router.post("/set-site",setGovSite)

module.exports = router;