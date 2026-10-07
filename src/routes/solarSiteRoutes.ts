import { Router } from "express";
import { createSolarSite } from "../controllers/solarSiteController";
import { protect, adminOnly } from "../middleware/authMiddleware";

const router = Router();

router.post("/", protect, adminOnly, createSolarSite);

export default router;
