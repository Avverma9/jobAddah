const express = require("express");
const {
  scrapper,
  getCategories,
  scrapeCategory,

} = require("@/scrapper/gov/scrapper");
const { analyzeSmartDuplicates } = require("@/scrapper/gov/analyzer");
const router = express.Router();

router.post("/scrape-complete", scrapper);
router.post("/get-categories", getCategories);
router.post("/scrape-category", scrapeCategory);
router.get("/analyze-duplicates",analyzeSmartDuplicates)


module.exports = router;
