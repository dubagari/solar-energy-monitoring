import { Response, NextFunction } from "express";
import SolarSite from "../models/SolarSite";
import Device from "../models/Device";
import User from "../models/User";
import { AuthRequest } from "../middleware/authMiddleware";

export const createSolarSite = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
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

    const ownerUser = await User.findById(owner);

    if (!ownerUser) {
      res.status(404).json({
        success: false,
        message: "Owner user not found",
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
    next(error);
  }
};

export const updateSolarSiteOwner = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
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

    const ownerUser = await User.findById(owner);

    if (!ownerUser) {
      res.status(404).json({
        success: false,
        message: "Owner user not found",
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
    next(error);
  }
};

export const getMySolarSite = async (
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

    res.status(200).json({
      success: true,
      solarSite,
    });
  } catch (error) {
    next(error);
  }
};

export const getSolarSites = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const sites = await SolarSite.find()
      .populate("owner", "name email role")
      .sort({ createdAt: -1 });

    const deviceCounts = await Device.aggregate([
      { $group: { _id: "$site", count: { $sum: 1 } } },
    ]);

    const countBySite = new Map<string, number>(
      deviceCounts.map((d) => [String(d._id), d.count]),
    );

    res.status(200).json({
      success: true,
      count: sites.length,
      solarSites: sites.map((site) => ({
        ...site.toObject(),
        deviceCount: countBySite.get(String(site._id)) ?? 0,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const updateSolarSite = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, location } = req.body;

    const solarSite = await SolarSite.findById(id);

    if (!solarSite) {
      res.status(404).json({
        success: false,
        message: "Solar site not found",
      });
      return;
    }

    if (name !== undefined) solarSite.name = name;
    if (location !== undefined) solarSite.location = location;

    await solarSite.save();

    res.status(200).json({
      success: true,
      message: "Solar site updated successfully",
      solarSite,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSolarSite = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { id } = req.params;

    const solarSite = await SolarSite.findById(id);

    if (!solarSite) {
      res.status(404).json({
        success: false,
        message: "Solar site not found",
      });
      return;
    }

    const deviceCount = await Device.countDocuments({ site: id });

    if (deviceCount > 0) {
      res.status(409).json({
        success: false,
        message: "This site has devices. Delete them first.",
      });
      return;
    }

    await solarSite.deleteOne();

    res.status(200).json({
      success: true,
      message: "Solar site deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
