import { Router } from "express";
import { reportController, notificationController } from "../controllers/report.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.use(authMiddleware);

router.get("/summary", requireRole(ROLES.ASSISTANT_CONTROLLER), reportController.getSummary);
router.get("/audit-logs", requireRole(ROLES.ASSISTANT_CONTROLLER), reportController.getAuditLogs);
router.get("/notifications", notificationController.getNotifications);
router.post("/notifications/notice", notificationController.createNotice);

export default router;
