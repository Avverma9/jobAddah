import express from "express";
import {
  setModel,
  getModel,
  setApiKey,
  getApiKey,
  changeStatus as changeGeminiStatus,
} from "../controllers/ai/gemini.mjs";
import {
  setModelName,
  getModelName,
  setPplApiKey,
  getPplApiKey,
  testModelAvailability,
  changeStatus as changePerplexityStatus,
} from "../controllers/ai/perplexity.mjs";
import { verifyToken, authorizeRoles } from "../middleware/auth.mjs";

const router = express.Router();

router.post(
  "/set-model",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  setModel
);

router.get(
  "/get-model",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  getModel
);

router.post(
  "/set-api-key",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  setApiKey
);

router.get(
  "/get-api-key",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  getApiKey
);

router.post(
  "/change-gemini-status",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  changeGeminiStatus
);

router.post(
  "/set-model-ppl",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  setModelName
);

router.get(
  "/get-model-ppl",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  getModelName
);

router.post(
  "/set-api-key-ppl",
  
  setPplApiKey
);

router.get(
  "/get-api-key-ppl",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  getPplApiKey
);

router.post("/check-models", testModelAvailability);

router.post(
  "/change-perplexity-status",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  changePerplexityStatus
);

export default router;
