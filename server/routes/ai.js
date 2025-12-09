const express = require("express");
const { setModel, getModel, setApiKey, getApiKey } = require("../controller/ai/gemini");
const { verifyToken, authorizeRoles } = require("../middleware/auth");
const router = express.Router();
router.post("/set-model", verifyToken, authorizeRoles("admin", "super_admin"),setModel)
router.get("/get-model", verifyToken, authorizeRoles("admin", "super_admin"),getModel)
router.post("/set-api-key", verifyToken, authorizeRoles("admin", "super_admin"),setApiKey)
router.get("/get-api-key", verifyToken, authorizeRoles("admin", "super_admin"),getApiKey)
module.exports = router;