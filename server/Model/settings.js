import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    weeklyOffs: {
      type: [Number], // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
      default: [0], // Default Sunday off
    },
    machineIp: {
      type: String,
      default: "192.168.1.222",
    },
    machinePort: {
      type: Number,
      default: 4370,
    },
    effectiveFrom: {
      type: Date,
      required: true,
      default: Date.now,
    },
    effectiveTo: {
      type: Date,
      default: null, // null means currently active
    },
  },
  { timestamps: true }
);

// We strictly want only one settings document.
// In controller we will ensure we always update the first one found or create one if none.

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;
