import mongoose, { Document, Schema } from "mongoose";
import crypto from "node:crypto";

export interface IDevice extends Document {
  name: string;
  deviceId: string;
  site: mongoose.Types.ObjectId;
  apiKey: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const deviceSchema = new Schema<IDevice>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    deviceId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    site: {
      type: Schema.Types.ObjectId,
      ref: "SolarSite",
      required: true,
    },

    apiKey: {
      type: String,
      unique: true,
      required: true,
      select: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

deviceSchema.pre("validate", function generateApiKey(): void {
  if (!this.apiKey) {
    this.apiKey = crypto.randomBytes(24).toString("hex");
  }
});

const Device = mongoose.model<IDevice>("Device", deviceSchema);

export default Device;
