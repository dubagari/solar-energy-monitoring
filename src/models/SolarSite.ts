import mongoose, { Document, Schema } from "mongoose";

export interface ISolarSite extends Document {
  name: string;
  location: string;
  owner: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const solarSiteSchema = new Schema<ISolarSite>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const SolarSite = mongoose.model<ISolarSite>("SolarSite", solarSiteSchema);

export default SolarSite;
