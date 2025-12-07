const express = require("express");
const router = express.Router();
const { aiAssistant } = require("../ai-assistant/assistant");
// AI Assistant route
router.post("/ai-chat", aiAssistant);

module.exports = router;