import { Response, NextFunction } from "express";
import crypto from "node:crypto";
import Device from "../models/Device";
import SolarSite from "../models/SolarSite";
import SolarReading from "../models/SolarReading";
import { AuthRequest } from "../middleware/authMiddleware";

export const createDevice = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
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

    const apiKey = crypto.randomBytes(24).toString("hex");

    const device = await Device.create({
      name,
      deviceId,
      site,
      apiKey,
    });

    res.status(201).json({
      success: true,
      message:
        "Device created successfully. Store the apiKey securely — it is shown only here.",
      device: { ...device.toJSON(), apiKey },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyDevice = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const solarSite = await SolarSite.findOne({
      owner: req.user.userId,
    });

    if (!solarSite) {
      res.status(404).json({
        success: false,
        message: "No solar site assigned to this user",
      });
      return;
    }

    const device = await Device.findOne({
      site: solarSite._id,
    });

    if (!device) {
      res.status(404).json({
        success: false,
        message: "No device found for this solar site",
      });
      return;
    }

    res.status(200).json({
      success: true,
      device,
    });
  } catch (error) {
    next(error);
  }
};

export const getDevices = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const devices = await Device.find().populate("site", "name location").sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: devices.length,
      devices,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDevice = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, isActive, site } = req.body;

    const device = await Device.findById(id);

    if (!device) {
      res.status(404).json({
        success: false,
        message: "Device not found",
      });
      return;
    }

    if (name !== undefined) device.name = name;
    if (isActive !== undefined) device.isActive = isActive;

    if (site !== undefined && site !== String(device.site)) {
      const solarSite = await SolarSite.findById(site);

      if (!solarSite) {
        res.status(404).json({
          success: false,
          message: "Solar site not found",
        });
        return;
      }

      device.site = site;
    }

    await device.save();

    res.status(200).json({
      success: true,
      message: "Device updated successfully",
      device,
    });
  } catch (error) {
    next(error);
  }
};

export const rotateDeviceApiKey = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const device = await Device.findById(id).select("+apiKey");

    if (!device) {
      res.status(404).json({
        success: false,
        message: "Device not found",
      });
      return;
    }

    device.apiKey = crypto.randomBytes(24).toString("hex");

    await device.save();

    res.status(200).json({
      success: true,
      message:
        "API key rotated successfully. Store it securely — it is shown only once.",
      deviceId: device.deviceId,
      apiKey: device.apiKey,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDevice = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const device = await Device.findById(id);

    if (!device) {
      res.status(404).json({
        success: false,
        message: "Device not found",
      });
      return;
    }

    await SolarReading.deleteMany({ device: device._id });
    await device.deleteOne();

    res.status(200).json({
      success: true,
      message: "Device and its readings deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
