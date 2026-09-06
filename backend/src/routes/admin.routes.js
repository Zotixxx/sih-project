import { Router } from "express";
import { adminController } from "../controllers/admin.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { rateLimit } from "../middleware/rateLimit.middleware.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

const requireSystemAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required." },
    });
  }

  if (req.user.role !== ROLES.SYSTEM_ADMIN) {
    return res.status(403).json({
      success: false,
      error: { code: "FORBIDDEN", message: "Only System Admin users can access this endpoint." },
    });
  }

  next();
};

router.use(authMiddleware);
router.use(requireSystemAdmin);

router.get("/dashboard", adminController.getDashboard);
router.get(
  "/assistant-controllers",
  rateLimit({ windowMs: 60_000, max: 120, keyPrefix: "admin-ac-search" }),
  adminController.searchAssistantControllers
);
router.post(
  "/assistant-controllers",
  rateLimit({ windowMs: 60_000, max: 20, keyPrefix: "admin-ac-create" }),
  adminController.createAssistantController
);
router.get("/assistant-controllers/:id", adminController.getAssistantController);
router.patch("/assistant-controllers/:id", adminController.updateAssistantController);
router.get(
  "/lmos",
  rateLimit({ windowMs: 60_000, max: 120, keyPrefix: "admin-lmo-search" }),
  adminController.searchLmos
);
router.get("/lmos/:id", adminController.getLmo);
router.get(
  "/audit-logs",
  rateLimit({ windowMs: 60_000, max: 120, keyPrefix: "admin-audit-search" }),
  adminController.searchAuditLogs
);

export default router;
