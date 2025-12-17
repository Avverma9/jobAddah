const express = require("express");

const { getCategories, scrapper,scrapeCategory,analyzeDuplicates,deleteDuplicates } = require("@/scrapper/pvt/pvtScrapper");
const router = express.Router();

router.post("/scrape-complete", scrapper);
router.post("/get-categories", getCategories);
router.post("/scrape-category", scrapeCategory);
router.get("/analyze-duplicates",analyzeDuplicates)
router.post("/delete-duplicates",deleteDuplicates)

module.exports = router;
