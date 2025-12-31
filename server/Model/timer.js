import mongoose from "mongoose";

const timerSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, default: null },
    duration: { type: Number, default: 0 }, // seconds
    type: { type: String, enum: ["work"], default: "work" },
    status: { type: String, enum: ["running", "stopped"], default: "running" },
  },
  { timestamps: true }
);

// Ensure one running timer per employee
timerSchema.index(
  { employee: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "running" } }
);

export default mongoose.model("Timer", timerSchema);
