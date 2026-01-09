import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    teamLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],
    milestones: [
      {
        title: { type: String, required: true },
        description: { type: String },
        progress: { type: Number, default: 0, min: 0, max: 100 },
        status: {
          type: String,
          enum: ["Pending", "Under Review", "Completed", "Rejected"],
          default: "Pending",
        },
        link: { type: String, default: "" },
        feedback: { type: String, default: "" },
        weightage: { type: Number, default: 0, min: 0, max: 100 },
      },
    ],
    status: {
      type: String,
      enum: ["active", "completed", "on hold"],
      default: "active",
    },
    startDate: { type: Date },
    endDate: { type: Date },
    comments: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Employee",
          required: true,
        },
        text: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    unreadAdmin: { type: Boolean, default: false },
    unreadEmployee: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
