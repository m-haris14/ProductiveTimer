import Task from "../Model/task.js";
import Project from "../Model/project.js";

export const getPendingReviews = async (req, res) => {
  try {
    // 1. Fetch Tasks Under Review
    const tasks = await Task.find({
      status: { $in: ["Under Review", "Late Submission"] },
    }).populate("employee", "fullName");

    // 2. Fetch Projects with Milestones Under Review
    const projects = await Project.find({
      "milestones.status": "Under Review",
    }).populate("teamLead", "fullName");

    // Format Milestones for notification
    const milestoneReviews = [];
    projects.forEach((project) => {
      project.milestones.forEach((milestone) => {
        if (milestone.status === "Under Review") {
          milestoneReviews.push({
            _id: milestone._id,
            projectId: project._id,
            projectName: project.name,
            title: milestone.title,
            type: "milestone",
            updatedAt: milestone.updatedAt || project.updatedAt,
          });
        }
      });
    });

    const taskReviews = tasks.map((task) => ({
      _id: task._id,
      title: task.title,
      employeeName: task.employee?.fullName,
      type: "task",
      status: task.status,
      updatedAt: task.updatedAt,
    }));

    // Combine and sort by date
    const allReviews = [...taskReviews, ...milestoneReviews].sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );

    res.json(allReviews);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Pending Idle Requests for Admin Review
export const getPendingIdleRequests = async (req, res) => {
  try {
    const Idle = (await import("../Model/idle.js")).default;
    const pendingRequests = await Idle.find({
      approvalStatus: "pending",
      status: "stopped", // Only completed idle sessions
    })
      .populate("employee", "fullName department email")
      .sort({ createdAt: -1 });

    const formatted = pendingRequests.map((idle) => ({
      _id: idle._id,
      employeeId: idle.employee._id,
      employeeName: idle.employee.fullName,
      department: idle.employee.department || "N/A",
      reason: idle.reason,
      duration: idle.duration,
      startTime: idle.startTime,
      endTime: idle.endTime,
      createdAt: idle.createdAt,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching pending idle requests:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Approve or Reject Idle Request
export const approveIdleRequest = async (req, res) => {
  try {
    const Idle = (await import("../Model/idle.js")).default;
    const Attendance = (await import("../Model/attendance.js")).default;
    const { getTodayStart } = await import("../Utils/dateUtils.js");
    
    const { idleId } = req.params;
    const { approved, reviewNote, adminId } = req.body;

    const idleRecord = await Idle.findById(idleId).populate("employee");
    if (!idleRecord) {
      return res.status(404).json({ message: "Idle record not found" });
    }

    if (idleRecord.approvalStatus !== "pending") {
      return res.status(400).json({ message: "This idle request has already been reviewed" });
    }

    const now = new Date();
    idleRecord.approvalStatus = approved ? "approved" : "rejected";
    idleRecord.reviewedBy = adminId;
    idleRecord.reviewedAt = now;
    if (reviewNote) {
      idleRecord.reviewNote = reviewNote;
    }
    await idleRecord.save();

    // If approved, add idle duration to employee's work duration
    if (approved) {
      const idleDate = new Date(idleRecord.startTime);
      idleDate.setHours(0, 0, 0, 0);
      
      const attendance = await Attendance.findOne({
        employee: idleRecord.employee._id,
        date: idleDate,
      });

      if (attendance) {
        // Add approved idle time to work duration
        attendance.workDuration += idleRecord.duration;
        await attendance.save();
      }
    }

    // Emit socket event to notify employee and refresh admin dashboard
    const io = req.app.get("io");
    if (io) {
      io.emit("idle_approval_update", {
        idleId: idleRecord._id,
        employeeId: idleRecord.employee._id.toString(),
        approved,
        duration: idleRecord.duration,
        timestamp: now,
      });
    }

    res.json({
      message: approved ? "Idle time approved" : "Idle time rejected",
      idleRecord,
    });
  } catch (error) {
    console.error("Error approving idle request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get Idle History for an Employee
export const getIdleHistory = async (req, res) => {
  try {
    const Idle = (await import("../Model/idle.js")).default;
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;

    const query = { employee: employeeId, status: "stopped" };

    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }

    const idleHistory = await Idle.find(query)
      .populate("reviewedBy", "fullName")
      .sort({ startTime: -1 });

    res.json(idleHistory);
  } catch (error) {
    console.error("Error fetching idle history:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
