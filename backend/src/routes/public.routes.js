import { Router } from "express";
import { certificateController } from "../controllers/certificate.controller.js";
import { districtController } from "../controllers/district.controller.js";

const router = Router();

router.get("/districts", districtController.getPublicDistricts);

// Public endpoint for citizen/consumer QR code scanning (no auth required)
router.get("/certificates/:id", certificateController.getPublicVerification);

export default router;
