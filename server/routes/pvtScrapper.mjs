import express from "express";

import {
  getCategories,
  scrapper,
  scrapeCategory,
  analyzeDuplicates,
  deleteDuplicates
} from "../controllers/scrapper/pvtScrapper.mjs";

const router = express.Router();

router.post("/scrape-complete", scrapper);
router.post("/get-categories", getCategories);
router.post("/scrape-category", scrapeCategory);
router.get("/analyze-duplicates", analyzeDuplicates);
router.post("/delete-duplicates", deleteDuplicates);

export default router;
