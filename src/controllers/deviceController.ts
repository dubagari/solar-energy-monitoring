import { Response } from "express";
import Device from "../models/Device";
import SolarSite from "../models/SolarSite";
import { AuthRequest } from "../middleware/authMiddleware";

export const createDevice = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, deviceId, site } = req.body;

    if (!name || !deviceId || !site) {
      res.status(400).json({
        success: false,
        message: "Name, deviceId, and site are required",
      });
      return;
    }

    const solarSite = await SolarSite.findById(site);

    if (!solarSite) {
      res.status(404).json({
        success: false,
        message: "Solar site not found",
      });
      return;
    }

    const existingDevice = await Device.findOne({
      deviceId,
    });

    if (existingDevice) {
      res.status(409).json({
        success: false,
        message: "Device with this deviceId already exists",
      });
      return;
    }

    const device = await Device.create({
      name,
      deviceId,
      site,
    });

    res.status(201).json({
      success: true,
      message: "Device created successfully",
      device,
    });
  } catch (error) {
    console.error("Create device error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
