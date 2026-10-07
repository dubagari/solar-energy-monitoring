import { Router } from "express";
import {
  createReading,
  getDeviceReadings,
} from "../controllers/readingController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.post("/", createReading);

router.get("/device/:deviceId", protect, getDeviceReadings);

export default router;
