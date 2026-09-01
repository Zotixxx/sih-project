import { Router } from "express";
import { certificateController } from "../controllers/certificate.controller.js";

const router = Router();

// Public endpoint for citizen/consumer QR code scanning (no auth required)
router.get("/certificates/:id", certificateController.getPublicVerification);

export default router;
