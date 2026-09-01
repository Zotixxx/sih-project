import { Router } from "express";
import { approvalController } from "../controllers/approval.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.use(authMiddleware);

router.get(
  "/awaiting",
  requireRole(ROLES.ASSISTANT_CONTROLLER),
  approvalController.getAwaitingApproval
);

router.post(
  "/approve",
  requireRole(ROLES.ASSISTANT_CONTROLLER),
  approvalController.approve
);

router.post(
  "/return",
  requireRole(ROLES.ASSISTANT_CONTROLLER),
  approvalController.returnInspection
);

export default router;
