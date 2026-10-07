import { Response } from "express";
import SolarReading from "../models/SolarReading";
import Device from "../models/Device";
import { AuthRequest } from "../middleware/authMiddleware";

export const createReading = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { deviceId, voltage, current } = req.body;

    if (
      !deviceId ||
      voltage === undefined ||
      current === undefined
    ) {
      res.status(400).json({
        success: false,
        message: "deviceId, voltage, and current are required",
      });
      return;
    }

    const device = await Device.findOne({
      deviceId,
      isActive: true,
    });

    if (!device) {
      res.status(404).json({
        success: false,
        message: "Active device not found",
      });
      return;
    }

    const power = voltage * current;

    const reading = await SolarReading.create({
      device: device._id,
      voltage,
      current,
      power,
      recordedAt: new Date(),
    });

    res.status(201).json({
      success: true,
      message: "Solar reading recorded successfully",
      reading,
    });
  } catch (error) {
    console.error("Create reading error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};