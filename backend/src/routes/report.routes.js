import { Router } from "express";
import { reportController, notificationController } from "../controllers/report.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/summary", reportController.getSummary);
router.get("/audit-logs", reportController.getAuditLogs);
router.get("/notifications", notificationController.getNotifications);
router.post("/notifications/notice", notificationController.createNotice);

export default router;
