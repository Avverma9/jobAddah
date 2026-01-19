import express from "express";
const router = express.Router();
import {  scrapper } from "../controllers/scrapper/govScrapper.mjs";
import { analyzeSmartDuplicates } from "../utils/duplicate_analyzer.mjs";
import { getCategories, scrapeCategory } from "../controllers/scrapper/categoryScrapper.mjs";

router.post("/scrape-complete", scrapper);
router.post("/get-categories", getCategories);
router.post("/scrape-category",scrapeCategory );
router.get("/analyze-duplicates",analyzeSmartDuplicates)
export default router;