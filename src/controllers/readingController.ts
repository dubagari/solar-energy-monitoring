import { Response, NextFunction } from "express";
import SolarReading from "../models/SolarReading";
import Device from "../models/Device";
import { AuthRequest } from "../middleware/authMiddleware";

export const createReading = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { deviceId, voltage, current } = req.body;

    if (!deviceId || voltage === undefined || current === undefined) {
      res.status(400).json({
        success: false,
        message: "deviceId, voltage, and current are required",
      });
      return;
    }

    const apiKey = req.headers["x-api-key"];

    if (!apiKey || typeof apiKey !== "string") {
      res.status(401).json({
        success: false,
        message: "Device API key is required in the x-api-key header",
      });
      return;
    }

    const device = await Device.findOne({
      deviceId,
      isActive: true,
    }).select("+apiKey");

    if (!device) {
      res.status(404).json({
        success: false,
        message: "Active device not found",
      });
      return;
    }

    if (device.apiKey !== apiKey) {
      res.status(401).json({
        success: false,
        message: "Invalid device API key",
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
    next(error);
  }
};

export const getDeviceReadings = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { deviceId } = req.params;

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const device = await Device.findOne({
      deviceId,
      isActive: true,
    }).populate("site");

    if (!device) {
      res.status(404).json({
        success: false,
        message: "Active device not found",
      });
      return;
    }

    const site = device.site as unknown as {
      _id: string;
      owner: string;
      }
      
    if (
      req.user.role !== "ADMIN" &&
      site.owner.toString() !== req.user.userId
    ) {
      res.status(403).json({
        success: false,
        message: "You do not have access to this solar device",
      });
      return;
    }

    const readings = await SolarReading.find({
      device: device._id,
    })
      .sort({ recordedAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: readings.length,
      readings,
    });
  } catch (error) {
    next(error);
  }
};