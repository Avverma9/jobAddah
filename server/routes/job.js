const express = require("express");
const router = express.Router();
const Job = require("../models/jobs");
const { verifyToken, authorizeRoles } = require("../middleware/auth");
const {
  createJob,
  getJobs,
  updateJob,
  getJobById,
  deleteJob,
  getAdmitCard,
  getResult,
  getAdmitCardById,
  getResultById,
  getExams,
  getStats,
} = require("../controller/jobs");

//user routes for job management

router.get("/get-jobs", getJobs);
router.get(
  "/jobs/stats",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  getStats
);

router.get(
  "/jobs/:id",
  getJobById
);

// ✅ Existing Admin Routes (Protected)
router.post(
  "/add-jobs",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  createJob
);

router.get(
  "/jobs",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  getJobs
);

router.put(
  "/jobs/:id",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  updateJob
);

router.delete(
  "/jobs/:id",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  deleteJob
);

// ✅ Public Routes for Admit Cards & Results (No Auth Required)
// Users can access these without login

// Get all jobs with admit cards available
router.get(
  "/admit-cards",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  getAdmitCard
);

// Get all jobs with results available
router.get(
  "/results",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  getResult
);
router.get(
  "/exams",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  getExams
);

// Get admit card for specific job
router.get("/jobs/:id/admit-card", getAdmitCardById);

// Get result for specific job
router.get("/jobs/:id/result", getResultById);

// ✅ OPTIONAL: Protected versions if you want admin-only access
// Uncomment if needed

// router.get(
//   "/admit-cards",
//   verifyToken,
//   authorizeRoles("admin", "super_admin"),
//   getAdmitCard
// );

// router.get(
//   "/results",
//   verifyToken,
//   authorizeRoles("admin", "super_admin"),
//   getResult
// );

// router.get(
//   "/jobs/:id/admit-card",
//   verifyToken,
//   authorizeRoles("admin", "super_admin"),
//   getAdmitCardById
// );

// router.get(
//   "/jobs/:id/result",
//   verifyToken,
//   authorizeRoles("admin", "super_admin"),
//   getResultById
// );

module.exports = router;
