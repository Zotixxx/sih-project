import { Router } from "express";
import { documentController } from "../controllers/document.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/upload", documentController.upload);

export default router;
