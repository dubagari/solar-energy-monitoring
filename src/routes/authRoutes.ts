import { Router } from "express";
import { createUser, login } from "../controllers/authController";
import { protect, adminOnly } from "../middleware/authMiddleware";

const router = Router();

router.post("/create-user", protect, adminOnly, createUser);
router.post("/login", login);

export default router;
