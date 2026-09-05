import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { supabaseIdentityMiddleware } from "../middleware/supabaseAuth.middleware.js";

const router = Router();

router.post("/login", authController.login);
router.post("/register-business", supabaseIdentityMiddleware, authController.registerBusinessProfile);
router.get("/profile", authMiddleware, authController.getProfile);

export default router;
