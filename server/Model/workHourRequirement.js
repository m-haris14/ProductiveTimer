import mongoose from "mongoose";

const workHourRequirementSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    dailyRequiredHours: {
      type: Number,
      required: true,
      default: 8,
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

// Index to efficiently query requirements for an employee by date
workHourRequirementSchema.index({ employee: 1, effectiveFrom: 1 });

const WorkHourRequirement = mongoose.model(
  "WorkHourRequirement",
  workHourRequirementSchema
);

export default WorkHourRequirement;
