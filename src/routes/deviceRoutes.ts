import { Router } from "express";
import { createDevice, getMyDevice } from "../controllers/deviceController";
import { protect, adminOnly } from "../middleware/authMiddleware";
import handleValidation, {
  createDeviceRules,
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

export default router;
