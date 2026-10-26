const API_URL = "http://localhost:5001/api/v1/readings";
const DEVICE_ID = "ESP32-SOLAR-001";
const INTERVAL_MS = 5000;

const generateReading = () => {
  // Simulate changing solar output.
  const voltage = Number((23 + Math.random() * 3).toFixed(2));
  const current = Number((3 + Math.random() * 4).toFixed(2));

  return { voltage, current };
};

const sendReading = async () => {
  try {
    const { voltage, current } = generateReading();

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        deviceId: DEVICE_ID,
        voltage,
        current,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to submit reading");
    }

    console.log(
      `[${new Date().toLocaleTimeString()}] Reading saved:`,
      `${voltage} V | ${current} A | ${data.reading.power.toFixed(2)} W`,
    );
  } catch (error) {
    console.error("Simulator error:", error);
  }
};

console.log(`Solar simulator started for ${DEVICE_ID}`);
console.log(`Sending readings every ${INTERVAL_MS / 1000} seconds.`);

sendReading();
setInterval(sendReading, INTERVAL_MS);
