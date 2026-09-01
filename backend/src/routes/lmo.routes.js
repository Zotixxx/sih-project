import { Router } from "express";
import { lmoController } from "../controllers/lmo.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", lmoController.getLmos);
router.get("/:id", lmoController.getLmoById);

export default router;
