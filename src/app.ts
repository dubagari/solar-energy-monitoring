import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes";
import solarSiteRoutes from "./routes/solarSiteRoutes";
import deviceRoutes from "./routes/deviceRoutes";
import readingRoutes from "./routes/readingRoutes";
import userRoutes from "./routes/userRoutes";
import { notFound, errorHandler } from "./middleware/errorMiddleware";

const app = express();

app.use(helmet());

const corsOrigin = process.env.CORS_ORIGIN;

app.use(
  cors(
    corsOrigin
      ? { origin: corsOrigin.split(",").map((o) => o.trim()) }
      : undefined,
  ),
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Solar Energy Monitoring API is running",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/solar-sites", solarSiteRoutes);
app.use("/api/v1/devices", deviceRoutes);
app.use("/api/v1/readings", readingRoutes);
app.use("/api/v1/users", userRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
