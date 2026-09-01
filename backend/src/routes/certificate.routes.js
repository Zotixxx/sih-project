import { Router } from "express";
import { certificateController } from "../controllers/certificate.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/search", certificateController.search);
router.get("/", certificateController.getCertificates);
router.get("/:id", certificateController.getCertificateById);

export default router;
