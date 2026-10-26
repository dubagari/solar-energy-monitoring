import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const API_URL =
  process.env.SIMULATOR_API_URL || "http://localhost:5001/api/v1/readings";
const DEVICE_ID = process.env.SIMULATOR_DEVICE_ID || "ESP32-SOLAR-001";
const DEVICE_API_KEY = process.env.DEVICE_API_KEY;
const INTERVAL_MS = 5000;

if (!DEVICE_API_KEY) {
  console.error(
    `DEVICE_API_KEY is not set in .env for ${DEVICE_ID} — readings will be rejected.`,
  );
}

const generateReading = () => {
  // Simulate changing solar output.
  const voltage = 23 + Math.random() * 3;
  const current = 3 + Math.random() * 4;

  return { voltage, current };
};

const sendReading = async () => {
  try {
    const { voltage, current } = generateReading();

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": DEVICE_API_KEY || "",
      },
      body: JSON.stringify({
        deviceId: DEVICE_ID,
        voltage: Number(voltage.toFixed(2)),
        current: Number(current.toFixed(2)),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to submit reading");
    }

    console.log(
      `[${new Date().toLocaleTimeString()}] Reading saved:`,
      `${voltage.toFixed(2)} V | ${current.toFixed(2)} A | ${data.reading.power.toFixed(2)} W`,
    );
  } catch (error) {
    console.error("Simulator error:", error);
  }
};

console.log(`Solar simulator started for ${DEVICE_ID}`);
console.log(`Sending readings every ${INTERVAL_MS / 1000} seconds.`);

sendReading();
setInterval(sendReading, INTERVAL_MS);
