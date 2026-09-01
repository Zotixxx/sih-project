import { Router } from "express";
import { applicationController } from "../controllers/application.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.use(authMiddleware);

// Drafts
router.get("/drafts/current", applicationController.getDraft);
router.post("/draft", applicationController.saveDraft);

// Applications
router.get("/", applicationController.getApplications);
router.post("/", applicationController.createApplication);
router.get("/:id", applicationController.getApplicationById);

// Assistant Controller actions
router.post(
  "/:id/accept",
  requireRole(ROLES.ASSISTANT_CONTROLLER),
  applicationController.acceptApplication
);

router.post(
  "/:id/reject",
  requireRole(ROLES.ASSISTANT_CONTROLLER),
  applicationController.rejectApplication
);

router.post(
  "/:id/assign",
  requireRole(ROLES.ASSISTANT_CONTROLLER),
  applicationController.assignLmo
);

export default router;
