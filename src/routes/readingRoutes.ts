import { Router } from "express";
import { createReading } from "../controllers/readingController";

const router = Router();

router.post("/", createReading);

export default router;
