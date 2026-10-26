import { Router } from "express";

import { protect, adminOnly } from "../middleware/authMiddleware";
import handleValidation, {
  createSiteRules,
  updateSiteOwnerRules,
} from "../middleware/validators";
import {
  createSolarSite,
  updateSolarSiteOwner,
  getMySolarSite
} from "../controllers/solarSiteController";

const router = Router();

router.post(
  "/",
  protect,
  adminOnly,
  createSiteRules,
  handleValidation,
  createSolarSite,
);
router.patch(
  "/:siteId/owner",
  protect,
  adminOnly,
  updateSiteOwnerRules,
  handleValidation,
  updateSolarSiteOwner,
);
router.get("/my", protect, getMySolarSite);


export default router;
