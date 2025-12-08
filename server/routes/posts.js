const express = require("express");
const {
  getSections,
  getPostListBySection,
  getPostDetails,
  markFav,
  getFavPosts,
  setModel,
  getModel,
} = require("../controller/posts");
const { verifyToken, authorizeRoles } = require("../middleware/auth");
const router = express.Router();
router.get("/get-sections", getSections);
router.post("/get-postlist", getPostListBySection);
router.get("/get-post/details", getPostDetails);
router.put("/mark-fav/:id",verifyToken, authorizeRoles("admin", "super_admin"),  markFav); // Mark/Unmark Favorite Post
router.get("/fav-posts", getFavPosts); // Fetch Favorite Posts
router.post("/set-model", verifyToken, authorizeRoles("admin", "super_admin"),setModel)
router.get("/get-model", verifyToken, authorizeRoles("admin", "super_admin"),getModel)

module.exports = router;
