import { Router } from "express";
import {
  getUsers,
  updateUser,
  deleteUser,
  getMe,
} from "../controllers/userController";
import { protect, adminOnly } from "../middleware/authMiddleware";
import handleValidation, {
  updateUserRules,
  userIdRules,
} from "../middleware/validators";

const router = Router();

router.get("/me", protect, getMe);
router.get("/", protect, adminOnly, getUsers);
router.patch("/:id", protect, adminOnly, userIdRules, updateUserRules, handleValidation, updateUser);
router.delete("/:id", protect, adminOnly, userIdRules, handleValidation, deleteUser);

export default router;
