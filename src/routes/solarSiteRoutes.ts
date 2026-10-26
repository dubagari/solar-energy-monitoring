import { Router } from "express";

import { protect, adminOnly } from "../middleware/authMiddleware";
import handleValidation, {
  createSiteRules,
  updateSiteOwnerRules,
  siteIdRules,
  updateSiteRules,
} from "../middleware/validators";
import {
  createSolarSite,
  updateSolarSiteOwner,
  getMySolarSite,
  getSolarSites,
  updateSolarSite,
  deleteSolarSite,
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

router.get("/", protect, adminOnly, getSolarSites);
router.patch(
  "/:id",
  protect,
  adminOnly,
  siteIdRules,
  updateSiteRules,
  handleValidation,
  updateSolarSite,
);
router.delete(
  "/:id",
  protect,
  adminOnly,
  siteIdRules,
  handleValidation,
  deleteSolarSite,
);

export default router;
