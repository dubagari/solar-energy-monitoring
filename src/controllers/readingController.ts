import { Response, NextFunction } from "express";
import SolarReading from "../models/SolarReading";
import Device, { IDevice } from "../models/Device";
import { AuthRequest } from "../middleware/authMiddleware";

type DeviceAccess = {
  device: IDevice;
} | null;

const findAccessibleDevice = async (
  deviceId: string,
  userId: string,
  role: string,
): Promise<DeviceAccess> => {
  const device = await Device.findOne({
    deviceId,
    isActive: true,
  }).populate("site");

  if (!device) {
    return null;
  }

  const site = device.site as unknown as { owner?: { toString(): string } };

  if (site.owner === undefined) {
    return null;
  }

  if (role !== "ADMIN" && site.owner.toString() !== userId) {
    return null;
  }

  return { device };
};

type RangeParams = {
  from?: Date;
  to?: Date;
  limit: number;
};

const parseRangeParams = (req: AuthRequest): RangeParams => {
  const from = req.query.from ? new Date(String(req.query.from)) : undefined;
  const to = req.query.to ? new Date(String(req.query.to)) : undefined;

  let limit = req.query.limit ? Number(req.query.limit) : 100;

  if (!Number.isFinite(limit) || limit < 1) limit = 100;
  if (limit > 5000) limit = 5000;

  return {
    from: from && !Number.isNaN(from.getTime()) ? from : undefined,
    to: to && !Number.isNaN(to.getTime()) ? to : undefined,
    limit,
  };
};

const buildTimeMatch = (device: IDevice, range: RangeParams) => {
  const timeMatch: Record<string, unknown> = { device: device._id };

  const within: Record<string, Date> = {};

  if (range.from) within.$gte = range.from;
  if (range.to) within.$lte = range.to;

  if (Object.keys(within).length > 0) {
    timeMatch.recordedAt = within;
  }

  return timeMatch;
};

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
    const deviceId = String(req.params.deviceId);

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const access = await findAccessibleDevice(
      deviceId,
      req.user.userId,
      req.user.role,
    );

    if (!access) {
      res.status(404).json({
        success: false,
        message: "Device not found",
      });
      return;
    }

    const range = parseRangeParams(req);
    const timeMatch = buildTimeMatch(access.device, range);

    const readings = await SolarReading.find(timeMatch)
      .sort({ recordedAt: -1 })
      .limit(range.limit);

    res.status(200).json({
      success: true,
      count: readings.length,
      readings,
    });
  } catch (error) {
    next(error);
  }
};

export const getDeviceSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const deviceId = String(req.params.deviceId);

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const access = await findAccessibleDevice(
      deviceId,
      req.user.userId,
      req.user.role,
    );

    if (!access) {
      res.status(404).json({
        success: false,
        message: "Device not found",
      });
      return;
    }

    const range = parseRangeParams(req);
    const timeMatch = buildTimeMatch(access.device, range);

    const windowHours =
      range.from && range.to
        ? Math.round((range.to.getTime() - range.from.getTime()) / 3600000)
        : null;

    const statsResult = await SolarReading.aggregate([
      { $match: timeMatch },
      {
        $group: {
          _id: null,
          readings: { $sum: 1 },
          minVoltage: { $min: "$voltage" },
          maxVoltage: { $max: "$voltage" },
          avgVoltage: { $avg: "$voltage" },
          avgCurrent: { $avg: "$current" },
          minPower: { $min: "$power" },
          maxPower: { $max: "$power" },
          avgPower: { $avg: "$power" },
          firstAt: { $min: "$recordedAt" },
          lastAt: { $max: "$recordedAt" },
        },
      },
    ]);

    const energyResult = await SolarReading.aggregate([
      { $match: timeMatch },
      { $sort: { recordedAt: 1 } },
      {
        $setWindowFields: {
          sortBy: { recordedAt: 1 },
          output: {
            prevAt: {
              $shift: {
                output: "$recordedAt",
                by: -1,
              },
            },
          },
        },
      },
      {
        $addFields: {
          gapMs: {
            $cond: [
              { $eq: [{ $ifNull: ["$prevAt", null] }, null] },
              null,
              {
                $dateDiff: {
                  startDate: "$prevAt",
                  endDate: "$recordedAt",
                  unit: "millisecond",
                },
              },
            ],
          },
        },
      },
      {
        $addFields: {
          wh: {
            $cond: [
              {
                $and: [
                  { $ne: ["$gapMs", null] },
                  { $gt: ["$gapMs", 0] },
                  { $lte: ["$gapMs", 600000] },
                ],
              },
              {
                $divide: [
                  { $multiply: ["$power", "$gapMs"] },
                  3600000,
                ],
              },
              0,
            ],
          },
        },
      },
      { $group: { _id: null, watthours: { $sum: "$wh" } } },
    ]);

    const [latest] = await SolarReading.find(timeMatch)
      .sort({ recordedAt: -1 })
      .limit(1);

    const stats =
      statsResult.length > 0
        ? statsResult[0]
        : {
            readings: 0,
            minVoltage: null,
            maxVoltage: null,
            avgVoltage: null,
            avgCurrent: null,
            minPower: null,
            maxPower: null,
            avgPower: null,
            firstAt: null,
            lastAt: null,
          };

    const watthours = energyResult.length > 0 ? energyResult[0].watthours : 0;

    res.status(200).json({
      success: true,
      deviceId,
      window: {
        from: range.from ?? null,
        to: range.to ?? null,
        hours: windowHours,
      },
      stats: {
        readings: stats.readings,
        firstAt: stats.firstAt,
        lastAt: stats.lastAt,
        voltage: {
          min: stats.minVoltage,
          max: stats.maxVoltage,
          avg: stats.avgVoltage,
        },
        current: { avg: stats.avgCurrent },
        power: {
          min: stats.minPower,
          max: stats.maxPower,
          avg: stats.avgPower,
          latest: latest ? latest.power : null,
          latestAt: latest ? latest.recordedAt : null,
        },
        energy: {
          watthours: Number(watthours.toFixed(2)),
          kilowatthours: Number((watthours / 1000).toFixed(4)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDeviceTrend = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const deviceId = String(req.params.deviceId);

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required",
      });
      return;
    }

    const access = await findAccessibleDevice(
      deviceId,
      req.user.userId,
      req.user.role,
    );

    if (!access) {
      res.status(404).json({
        success: false,
        message: "Device not found",
      });
      return;
    }

    const range = parseRangeParams(req);

    const unitString = String(req.query.interval || "hour");
    const unit = ["hour", "day", "week", "month"].includes(unitString)
      ? unitString
      : "hour";

    const timeMatch = buildTimeMatch(access.device, range);

    const buckets = await SolarReading.aggregate([
      { $match: timeMatch },
      { $sort: { recordedAt: 1 } },
      {
        $setWindowFields: {
          sortBy: { recordedAt: 1 },
          output: {
            prevAt: {
              $shift: {
                output: "$recordedAt",
                by: -1,
              },
            },
          },
        },
      },
      {
        $addFields: {
          bucket: {
            $dateTrunc: {
              date: "$recordedAt",
              unit,
            },
          },
          gapMs: {
            $cond: [
              { $eq: [{ $ifNull: ["$prevAt", null] }, null] },
              null,
              {
                $dateDiff: {
                  startDate: "$prevAt",
                  endDate: "$recordedAt",
                  unit: "millisecond",
                },
              },
            ],
          },
        },
      },
      {
        $addFields: {
          wh: {
            $cond: [
              {
                $and: [
                  { $ne: ["$gapMs", null] },
                  { $gt: ["$gapMs", 0] },
                  { $lte: ["$gapMs", 600000] },
                ],
              },
              { $divide: [{ $multiply: ["$power", "$gapMs"] }, 3600000] },
              0,
            ],
          },
        },
      },
      {
        $group: {
          _id: "$bucket",
          readings: { $sum: 1 },
          avgVoltage: { $avg: "$voltage" },
          maxVoltage: { $max: "$voltage" },
          avgCurrent: { $avg: "$current" },
          avgPower: { $avg: "$power" },
          maxPower: { $max: "$power" },
          watthours: { $sum: "$wh" },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          t: "$_id",
          readings: 1,
          avgVoltage: { $round: ["$avgVoltage", 2] },
          maxVoltage: { $round: ["$maxVoltage", 2] },
          avgCurrent: { $round: ["$avgCurrent", 3] },
          avgPower: { $round: ["$avgPower", 2] },
          maxPower: { $round: ["$maxPower", 2] },
          watthours: { $round: ["$watthours", 2] },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      deviceId,
      interval: unit,
      count: buckets.length,
      buckets,
    });
  } catch (error) {
    next(error);
  }
};
