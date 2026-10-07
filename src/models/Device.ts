import mongoose, { Document, Schema } from "mongoose";

export interface IDevice extends Document {
  name: string;
  deviceId: string;
  site: mongoose.Types.ObjectId;
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

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Device = mongoose.model<IDevice>("Device", deviceSchema);

export default Device;
