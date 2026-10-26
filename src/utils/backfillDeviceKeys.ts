import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import connectDB from "../config/db";
import Device from "../models/Device";

dotenv.config();

const SIMULATOR_DEVICE_ID = "ESP32-SOLAR-001";

const run = async (): Promise<void> => {
  await connectDB();

  const devices = await Device.find({}).select("+apiKey").sort({
    createdAt: 1,
  });

  const envPath = path.resolve(__dirname, "../../.env");

  let envContent = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, "utf8")
    : "";

  let envChanged = false;

  for (const device of devices) {
    if (!device.apiKey) {
      device.apiKey = crypto.randomBytes(24).toString("hex");
      await device.save();
      console.log(`Generated API key for ${device.deviceId}`);
    }

    if (device.deviceId === SIMULATOR_DEVICE_ID) {
      if (/^DEVICE_API_KEY=/m.test(envContent)) {
        envContent = envContent.replace(
          /^DEVICE_API_KEY=.*$/m,
          `DEVICE_API_KEY=${device.apiKey}`,
        );
      } else {
        envContent = `${envContent.trimEnd()}\nDEVICE_API_KEY=${device.apiKey}\n`;
      }

      envChanged = true;
    }
  }

  if (envChanged) {
    fs.writeFileSync(envPath, envContent, "utf8");
    console.log(
      `Updated .env with DEVICE_API_KEY for ${SIMULATOR_DEVICE_ID}`,
    );
  }

  console.log("Backfill complete");

  await new Promise((resolve) => setTimeout(resolve, 500));
  process.exit(0);
};

run().catch((error) => {
  console.error("Backfill error:", error);
  process.exit(1);
});
