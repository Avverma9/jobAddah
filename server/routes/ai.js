const express = require("express");
const { setModel, getModel, setApiKey, getApiKey } = require("@/controller/ai/gemini");
const { verifyToken, authorizeRoles } = require("@/middleware/auth");
const { setModelName, getModelName, setPplApiKey, getPplApiKey, testModelAvailability } = require("@/controller/ai/perplexity");
const router = express.Router();
// GEMINI ROUTES
router.post("/set-model", verifyToken, authorizeRoles("admin", "super_admin"),setModel)
router.get("/get-model", verifyToken, authorizeRoles("admin", "super_admin"),getModel)
router.post("/set-api-key", verifyToken, authorizeRoles("admin", "super_admin"),setApiKey)
router.get("/get-api-key", verifyToken, authorizeRoles("admin", "super_admin"),getApiKey)
router.post("/change-gemini-status", verifyToken, authorizeRoles("admin", "super_admin"),require("@/controller/ai/gemini").changeStatus)
// PERPLEXITY ROUTES
router.post("/set-model-ppl", verifyToken, authorizeRoles("admin", "super_admin"),setModelName)
router.get("/get-model-ppl", verifyToken, authorizeRoles("admin", "super_admin"),getModelName)
router.post("/set-api-key-ppl", verifyToken, authorizeRoles("admin", "super_admin"),setPplApiKey)
router.get("/get-api-key-ppl", verifyToken, authorizeRoles("admin", "super_admin"),getPplApiKey)
router.post("/check-models",testModelAvailability)
router.post("/change-perplexity-status", verifyToken, authorizeRoles("admin", "super_admin"),require("@/controller/ai/perplexity").changeStatus)
module.exports = router;