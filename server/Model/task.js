import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: [
        "Pending",
        "In Progress",
        "Under Review",
        "Revision Required",
        "Completed",
        "Late Submission",
      ],
      default: "Pending",
    },
    feedback: { type: String, default: "" },
    time: { type: String }, // Display string like "2 hrs"
    totalWorkedSeconds: { type: Number, default: 0 },
    activeSessionStart: { type: Date, default: null },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    submissionLink: { type: String, default: "" },
    date: {
      type: Date,
      default: () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      },
    },
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

export default mongoose.model("Task", taskSchema);
