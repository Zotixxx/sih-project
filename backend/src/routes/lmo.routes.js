import { Router } from "express";
import { lmoController } from "../controllers/lmo.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.use(authMiddleware);

router.get("/", requireRole(ROLES.ASSISTANT_CONTROLLER), lmoController.getLmos);
router.get("/:id", requireRole(ROLES.ASSISTANT_CONTROLLER), lmoController.getLmoById);

export default router;
