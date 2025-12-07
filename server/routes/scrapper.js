const express = require("express");
const {
  scrapper,
  getCategories,
  scrapeCategory,
} = require("../scrapper/scrapper");
const router = express.Router();

router.post("/scrape-complete", scrapper);
router.post("/get-categories", getCategories);
router.post("/scrape-category", scrapeCategory);

module.exports = router;
