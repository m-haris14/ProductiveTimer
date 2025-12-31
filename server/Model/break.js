import mongoose from "mongoose";

const breakSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, default: null },
    duration: { type: Number, default: 0 },
    status: { type: String, enum: ["running", "stopped"], default: "running" },
  },
  { timestamps: true }
);

export default mongoose.model("Break", breakSchema);
