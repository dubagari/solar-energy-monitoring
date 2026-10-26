import { Router } from "express";
import { createDevice, getMyDevice } from "../controllers/deviceController";
import { protect, adminOnly } from "../middleware/authMiddleware";

const router = Router();

router.post("/", protect, adminOnly, createDevice);
router.get("/my", protect, getMyDevice);

export default router;
