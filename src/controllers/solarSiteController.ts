import { Response } from "express";
import SolarSite from "../models/SolarSite";
import { AuthRequest } from "../middleware/authMiddleware";

export const createSolarSite = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, location, owner } = req.body;

    if (!name || !location || !owner) {
      res.status(400).json({
        success: false,
        message: "Name, location, and owner are required",
      });
      return;
    }

    const solarSite = await SolarSite.create({
      name,
      location,
      owner,
    });

    res.status(201).json({
      success: true,
      message: "Solar site created successfully",
      solarSite,
    });
  } catch (error) {
    console.error("Create solar site error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const updateSolarSiteOwner = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { siteId } = req.params;
    const { owner } = req.body;

    if (!owner) {
      res.status(400).json({
        success: false,
        message: "Owner is required",
      });
      return;
    }

    const solarSite = await SolarSite.findById(siteId);

    if (!solarSite) {
      res.status(404).json({
        success: false,
        message: "Solar site not found",
      });
      return;
    }

    solarSite.owner = owner;

    await solarSite.save();

    res.status(200).json({
      success: true,
      message: "Solar site owner updated successfully",
      solarSite,
    });
  } catch (error) {
    console.error("Update solar site owner error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getMySolarSite = async (req: AuthRequest, res: Response) => {
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

    res.status(200).json({
      success: true,
      solarSite,
    });
  } catch (error) {
    console.error("Get my solar site error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};