const express = require("express");
const {
  getGovJobSections,
  getGovPostListBySection,
  getGovPostDetails,
  markFav,
  getFavPosts,
  getReminders,
  fixAllUrls,
  findByTitle,
} = require("@/controller/govtpost");
const { verifyToken, authorizeRoles } = require("@/middleware/auth");
const router = express.Router();
router.get("/get-sections", getGovJobSections);
router.post("/get-postlist", getGovPostListBySection);
router.get("/get-post/details", getGovPostDetails);
router.put(
  "/mark-fav/:id",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  markFav
); // Mark/Unmark Favorite Post
router.get("/fav-posts", getFavPosts); // Fetch Favorite Posts
router.get("/reminders/expiring-jobs", getReminders);
router.post("/fix-all-urls", fixAllUrls);
router.get("/find-by-title", findByTitle);

module.exports = router;
