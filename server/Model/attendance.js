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
    idleDuration: { type: Number, default: 0 }, // cumulative idle seconds
    status: {
      type: String,
      enum: ["working", "break", "idle", "none", "stopped", "checked-out", "leave"],
      default: "none",
    },
    lastStatusChange: { type: Date, default: Date.now },
    requiredHours: { type: Number, default: 8 }, // Snapshot of requirement for this day
    hoursShortage: { type: Number, default: 0 }, // Positive = Shortage, Negative = Surname
    cumulativeShortage: { type: Number, default: 0 }, // Running total
  },
  { timestamps: true }
);

// Ensure one record per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
