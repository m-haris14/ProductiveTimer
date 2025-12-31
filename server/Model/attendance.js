import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      },
    },
    firstCheckIn: { type: Date },
    lastCheckOut: { type: Date },
    workDuration: { type: Number, default: 0 }, // cumulative seconds
    breakDuration: { type: Number, default: 0 }, // cumulative seconds
    status: {
      type: String,
      enum: ["working", "break", "none"],
      default: "none",
    },
    lastStatusChange: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Ensure one record per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
