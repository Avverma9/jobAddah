import express from "express";
import {
  deleteSubscriber,
  listSubscribers,
  subscribeUser,
  updateSubscriberStatus,
} from "../controllers/subscriber.mjs";
import { authorizeRoles, verifyToken } from "../middleware/auth.mjs";

const router = express.Router();

router.post("/subscribers", subscribeUser);

router.get(
  "/subscribers",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  listSubscribers
);

router.patch(
  "/subscribers/:id/status",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  updateSubscriberStatus
);

router.delete(
  "/subscribers/:id",
  verifyToken,
  authorizeRoles("admin", "super_admin"),
  deleteSubscriber
);

export default router;
