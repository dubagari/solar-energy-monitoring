import { Router } from "express";
import { createSolarSite, updateSolarSiteOwner } from "../controllers/solarSiteController";
import { protect, adminOnly } from "../middleware/authMiddleware";

const router = Router();

router.post("/", protect, adminOnly, createSolarSite);
router.patch("/:siteId/owner", protect, adminOnly, updateSolarSiteOwner);

export default router;
