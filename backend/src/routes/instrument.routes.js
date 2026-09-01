import { Router } from "express";
import { instrumentController } from "../controllers/instrument.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/", instrumentController.getInstruments);
router.post("/", instrumentController.createInstrument);
router.get("/:id", instrumentController.getInstrumentById);
router.put("/:id", instrumentController.updateInstrument);

export default router;
