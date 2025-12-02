const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../middleware/auth");

// Import the NEW Optimized Controller
const {
  createPost,
  updatePost,
  deletePost,
  deleteAllPosts,
  getPostDetails, // Single Post (Get by ID or Slug)
  getJobs,        // Filtered: Online Forms
  getAdmitCards,  // Filtered: Admit Cards
  getResults,     // Filtered: Results
  getExams,       // Filtered: Upcoming Exams
  getAnswerKeys,  // Filtered: Answer Keys
  getStats,        // Dashboard Stats
  insertBulkPosts,
  getallPost,
  getDocsById
} = require("../controller/jobs");

// ==================================================================
// 🟢 PUBLIC ROUTES (Accessible by Everyone - No Login Required)
// ==================================================================

// 1. Get Lists (Categorized)
router.get("/get-jobs", getJobs);               // Fetch Latest Jobs
router.get("/admit-cards", getAdmitCards);      // Fetch Admit Cards
router.get("/results", getResults);             // Fetch Results
router.get("/exams", getExams);                 // Fetch Upcoming Exams
router.get("/answer-keys", getAnswerKeys);      // Fetch Answer Keys
router.get("/get-all",getallPost)
router.get("/jobs/:id",getDocsById)
// 2. Get Single Post Details
// Note: This handles ID or Slug (e.g., /posts/6741d8... OR /posts/rrb-group-d-2025)
router.get("/posts/:id", getPostDetails);


// ==================================================================
// 🔴 PROTECTED ADMIN ROUTES (Requires Login & Admin Role)
// ==================================================================

// 1. Dashboard Statistics
router.get(
  "/admin/stats",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  getStats
);

// 2. Create New Post (Job/Admit Card/Result etc.)
router.post(
  "/add-job", // You can rename this to /add-post if you prefer
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  createPost
);
router.post(
  "/bulk-insert",
  verifyToken, 
  authorizeRoles("admin", "super_admin"), // Security zaroori hai
  insertBulkPosts
);
// 3. Update Existing Post
router.put(
  "/jobs/:id",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  updatePost
);

// 4. Delete Single Post
router.delete(
  "/jobs/:id",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  deletePost
);

// 5. Delete ALL Posts (Dangerous!)
router.delete(
  "/delete-all",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  deleteAllPosts
);

module.exports = router;