import { Router } from "express";
import { createUser, login } from "../controllers/authController";
import { protect, adminOnly } from "../middleware/authMiddleware";
import handleValidation, {
  createUserRules,
  loginRules,
} from "../middleware/validators";

const router = Router();

router.post(
  "/create-user",
  protect,
  adminOnly,
  createUserRules,
  handleValidation,
  createUser,
);
router.post("/login", loginRules, handleValidation, login);

export default router;
