import { Router } from "express";

import { protect, adminOnly } from "../middleware/authMiddleware";
import {
  createSolarSite,
  updateSolarSiteOwner,
  getMySolarSite
} from "../controllers/solarSiteController";

const router = Router();

router.post("/", protect, adminOnly, createSolarSite);
router.patch("/:siteId/owner", protect, adminOnly, updateSolarSiteOwner);
router.get("/my", protect, getMySolarSite);


export default router;
