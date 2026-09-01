import { Router } from "express";
import { businessController } from "../controllers/business.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/profile", businessController.getProfile);
router.put("/profile", businessController.updateProfile);

export default router;
