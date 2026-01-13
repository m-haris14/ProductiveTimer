import mongoose from "mongoose";

const idleSchema = new mongoose.Schema(
    {
        employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },
        startTime: { type: Date, required: true },
        endTime: { type: Date, default: null },
        duration: { type: Number, default: 0 }, // seconds
        status: { type: String, enum: ["running", "stopped"], default: "running" },
        reason: { type: String, default: "" }, // Employee's explanation for idle time
        approvalStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Employee", // References admin who reviewed
            default: null,
        },
        reviewedAt: { type: Date, default: null },
        reviewNote: { type: String, default: "" }, // Optional admin note
    },
    { timestamps: true }
);

// Ensure one running idle session per employee
idleSchema.index(
    { employee: 1, status: 1 },
    { unique: true, partialFilterExpression: { status: "running" } }
);

export default mongoose.model("Idle", idleSchema);
