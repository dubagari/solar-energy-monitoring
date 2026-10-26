import mongoose, { Document, Schema } from "mongoose";

export interface ISolarReading extends Document {
  device: mongoose.Types.ObjectId;
  voltage: number;
  current: number;
  power: number;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const solarReadingSchema = new Schema<ISolarReading>(
  {
    device: {
      type: Schema.Types.ObjectId,
      ref: "Device",
      required: true,
    },

    voltage: {
      type: Number,
      required: true,
      min: 0,
    },

    current: {
      type: Number,
      required: true,
      min: 0,
    },

    power: {
      type: Number,
      required: true,
      min: 0,
    },

    recordedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

solarReadingSchema.index({ device: 1, recordedAt: -1 });

const SolarReading = mongoose.model<ISolarReading>(
  "SolarReading",
  solarReadingSchema,
);

export default SolarReading;
