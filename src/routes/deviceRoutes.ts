import { Router } from "express";
import {
  createDevice,
  getMyDevice,
  getDevices,
  updateDevice,
  rotateDeviceApiKey,
  deleteDevice,
} from "../controllers/deviceController";
import { protect, adminOnly } from "../middleware/authMiddleware";
import handleValidation, {
  createDeviceRules,
  deviceUpdateIdRules,
  updateDeviceRules,
} from "../middleware/validators";

const router = Router();

router.post(
  "/",
  protect,
  adminOnly,
  createDeviceRules,
  handleValidation,
  createDevice,
);
router.get("/my", protect, getMyDevice);

router.get("/", protect, adminOnly, getDevices);
router.patch(
  "/:id",
  protect,
  adminOnly,
  deviceUpdateIdRules,
  updateDeviceRules,
  handleValidation,
  updateDevice,
);
router.patch(
  "/:id/api-key",
  protect,
  adminOnly,
  deviceUpdateIdRules,
  handleValidation,
  rotateDeviceApiKey,
);
router.delete(
  "/:id",
  protect,
  adminOnly,
  deviceUpdateIdRules,
  handleValidation,
  deleteDevice,
);

export default router;
