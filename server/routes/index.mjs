import express from "express";
import adminRoute from "./admin.mjs";
import authRoute from "./auth.mjs";
import govScrapperRoute from "./govScrapper.mjs";
import pvtScrapperRoute from "./pvtScrapper.mjs";
import govJobRoute from "./govJobs.mjs";
import aiRoute from "./ai.mjs";
import subscriberRoute from "./subscribers.mjs";

const router = express.Router();

router.use("/", adminRoute);
router.use("/", authRoute);
router.use("/scrapper", govScrapperRoute);
router.use("/pvt-scrapper", pvtScrapperRoute);
router.use("/", govJobRoute);
router.use("/ai", aiRoute);
router.use("/", subscriberRoute);

export default router;
