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
