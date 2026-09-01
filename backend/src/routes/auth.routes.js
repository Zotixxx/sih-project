import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/login", authController.login);
router.get("/profile", authMiddleware, authController.getProfile);
router.get("/demo-users", authController.getDemoUsers);

export default router;
