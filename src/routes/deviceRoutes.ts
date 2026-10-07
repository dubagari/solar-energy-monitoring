import { Router } from "express";
import { createDevice } from "../controllers/deviceController";
import { protect, adminOnly } from "../middleware/authMiddleware";

const router = Router();

router.post("/", protect, adminOnly, createDevice);

export default router;
