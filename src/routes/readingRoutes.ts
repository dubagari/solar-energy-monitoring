import { Router } from "express";
import {
  createReading,
  getDeviceReadings,
  getDeviceSummary,
  getDeviceTrend,
} from "../controllers/readingController";
import { protect } from "../middleware/authMiddleware";
import handleValidation, {
  createReadingRules,
} from "../middleware/validators";

const router = Router();

router.post("/", createReadingRules, handleValidation, createReading);

router.get("/device/:deviceId", protect, getDeviceReadings);
router.get("/device/:deviceId/summary", protect, getDeviceSummary);
router.get("/device/:deviceId/trend", protect, getDeviceTrend);

export default router;
