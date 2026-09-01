import { Router } from "express";
import { inspectionController } from "../controllers/inspection.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.use(authMiddleware);

router.get("/", inspectionController.getInspections);
router.get("/:id", inspectionController.getInspectionById);

// LMO field actions
router.post("/:id/start", requireRole(ROLES.LMO), inspectionController.startInspection);
router.post("/:id/submit", requireRole(ROLES.LMO), inspectionController.submitInspection);

export default router;
