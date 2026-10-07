import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import solarSiteRoutes from "./routes/solarSiteRoutes";
import deviceRoutes from "./routes/deviceRoutes";
import readingRoutes from "./routes/readingRoutes";

const app = express();

app.use(cors());
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

export default app;
