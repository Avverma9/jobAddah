import express from "express";
import {
  createPost,
  getallPost,
  getJobById,
  getJobs,
  updatePost,
} from "../controllers/govJob/govJob.mjs";
import {
  getGovJobSections,
  getGovPostListBySection,
  getGovPostDetails,
  markFav,
  getFavPosts,
  getReminders,
  fixAllUrls,
  findByTitle,
  rephraseAllGovPostListTitles,
} from "../controllers/govJob/scrapperGovPost.mjs";
import { verifyToken, authorizeRoles } from "../middleware/auth.mjs";

const router = express.Router();

router.get("/get-jobs", getJobs);
router.get("/get-job/:id", getJobById);
router.get("/get-all", getallPost);
router.post("/add-job", createPost);
router.patch("/update-job/:id", updatePost);

router.get("/get-sections", getGovJobSections);
router.post("/get-postlist", getGovPostListBySection);
router.get("/get-post/details", getGovPostDetails);
router.put(
  "/mark-fav/:id",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  markFav
);
router.get("/fav-posts", getFavPosts);
router.get("/reminders/expiring-jobs", getReminders);
router.post("/fix-all-urls", fixAllUrls);
router.get("/find-by-title", findByTitle);
router.post("/rephrase-postlist-titles", rephraseAllGovPostListTitles);

export default router;
