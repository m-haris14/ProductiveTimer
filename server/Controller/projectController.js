import Project from "../Model/project.js";
import Task from "../Model/task.js";
import Employee from "../Model/employee.js";

export const createProject = async (req, res) => {
  try {
    const { name, description, teamLead, members, startDate, endDate } =
      req.body;
    const project = new Project({
      name,
      description,
      teamLead,
      members,
      startDate,
      endDate,
    });
    await project.save();
    res.status(201).json({ message: "Project created successfully", project });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("teamLead", "fullName")
      .populate("members", "fullName")
      .populate("comments.sender", "fullName");
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getTeamLeadProjects = async (req, res) => {
  try {
    const projects = await Project.find({ teamLead: req.params.teamLeadId })
      .populate("teamLead", "fullName")
      .populate("members", "fullName")
      .populate("comments.sender", "fullName");
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getEmployeeProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { members: req.params.employeeId },
        { teamLead: req.params.employeeId },
      ],
    })
      .populate("teamLead", "fullName")
      .populate("members", "fullName");
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.projectId,
      req.body,
      {
        new: true,
      }
    );
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate("teamLead", "fullName")
      .populate("members", "fullName _id designation")
      .populate("comments.sender", "fullName");
    if (!project) return res.status(404).json({ message: "Project not found" });

    const tasks = await Task.find({ project: project._id })
      .populate("employee", "fullName designation")
      .populate("assignedBy", "fullName");

    res.json({ ...project.toObject(), tasks });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const addMilestone = async (req, res) => {
  try {
    const { title, description } = req.body;
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.milestones.push({ title, description });
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateMilestone = async (req, res) => {
  try {
    const { milestoneId, projectId } = req.params;
    const { progress, status, link, feedback, title, description } = req.body;

    const updateFields = {};
    if (progress !== undefined) {
      updateFields["milestones.$.progress"] = progress;
    } else if (status === "Rejected") {
      updateFields["milestones.$.progress"] = 90;
    }

    if (status !== undefined) updateFields["milestones.$.status"] = status;
    if (link !== undefined) updateFields["milestones.$.link"] = link;
    if (feedback !== undefined)
      updateFields["milestones.$.feedback"] = feedback;
    if (title !== undefined) updateFields["milestones.$.title"] = title;
    if (description !== undefined)
      updateFields["milestones.$.description"] = description;

    const project = await Project.findOneAndUpdate(
      { _id: projectId, "milestones._id": milestoneId },
      { $set: updateFields },
      { new: true }
    );

    if (!project)
      return res
        .status(404)
        .json({ message: "Project or Milestone not found" });

    if (status === "Under Review") {
      const io = req.app.get("io");
      if (io) io.emit("notification_update", { type: "milestone", projectId });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteMilestone = async (req, res) => {
  try {
    const { projectId, milestoneId } = req.params;
    const project = await Project.findByIdAndUpdate(
      projectId,
      { $pull: { milestones: { _id: milestoneId } } },
      { new: true }
    );
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getProjectStats = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const tasks = await Task.find({ project: project._id });

    // Calculate total time from tasks
    const totalSeconds = tasks.reduce(
      (acc, task) => acc + (task.totalWorkedSeconds || 0),
      0
    );
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    const totalTime = `${h}h ${m}m ${s}s`;

    // Calculate average task progress
    const avgProgress =
      tasks.length > 0
        ? tasks.reduce((acc, task) => acc + (task.progress || 0), 0) /
          tasks.length
        : 0;

    res.json({
      totalTime,
      taskProgress: avgProgress,
      taskCount: tasks.length,
      milestoneProgress:
        project.milestones.length > 0
          ? project.milestones.reduce((acc, m) => acc + m.progress, 0) /
            project.milestones.length
          : 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const addProjectComment = async (req, res) => {
  try {
    const { senderId, text } = req.body;
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const newComment = { sender: senderId, text };
    project.comments.push(newComment);

    const sender = await Employee.findById(senderId);
    if (sender) {
      if (sender.designation === "Admin") {
        project.unreadEmployee = true;
      } else {
        project.unreadAdmin = true;
      }
    }

    await project.save();
    await project.populate("comments.sender", "fullName text createdAt");
    const latestComment = project.comments[project.comments.length - 1];

    const io = req.app.get("io");
    if (io) {
      io.emit("project_comment", { projectId, comment: latestComment });
    }

    res.status(201).json({ message: "Comment added", comment: latestComment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteProjectComment = async (req, res) => {
  try {
    const { projectId, commentId } = req.params;
    const { userId } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const comment = project.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const requester = await Employee.findById(userId);
    const isAdmin = requester?.designation === "Admin";
    const isSender = String(comment.sender) === String(userId);

    if (!isAdmin && !isSender) {
      return res.status(403).json({ message: "Not authorized" });
    }

    project.comments.pull({ _id: commentId });
    await project.save();

    res.json({ message: "Comment deleted", projectId, commentId });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const markProjectCommentsAsRead = async (req, res) => {
  try {
    const { side } = req.body;
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (side === "admin") {
      project.unreadAdmin = false;
    } else {
      project.unreadEmployee = false;
    }

    await project.save();
    res.json({ message: "Comments marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getDetailedProjectReport = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate(
      "members",
      "fullName designation"
    );
    if (!project) return res.status(404).json({ message: "Project not found" });

    const tasks = await Task.find({ project: project._id }).populate(
      "employee",
      "fullName"
    );

    // Task Status Distribution
    const statusCounts = {
      Pending: 0,
      "In Progress": 0,
      "Under Review": 0,
      "Revision Required": 0,
      Completed: 0,
      "Late Submission": 0,
    };
    tasks.forEach((t) => {
      statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;
    });

    // Member Contribution
    const memberStats = {};

    // Initialize from project members to ensure they appear even with 0 tasks
    project.members.forEach((m) => {
      memberStats[m._id] = { name: m.fullName, hours: 0, tasks: 0 };
    });

    tasks.forEach((t) => {
      if (t.employee) {
        if (!memberStats[t.employee._id]) {
          // If assignee is not in project members, add them
          memberStats[t.employee._id] = {
            name: t.employee.fullName,
            hours: 0,
            tasks: 0,
          };
        }
        memberStats[t.employee._id].hours += (t.totalWorkedSeconds || 0) / 3600;
        if (t.status === "Completed") memberStats[t.employee._id].tasks++;
      }
    });

    // Milestone Breakdown
    const milestoneSummary = project.milestones.map((m) => ({
      title: m.title,
      description: m.description, // Added description
      progress: m.progress,
      status: m.status,
      link: m.link, // Added link
      feedback: m.feedback, // Added feedback
    }));

    res.json({
      name: project.name,
      status: project.status,
      statusCounts,
      memberContribution: Object.values(memberStats),
      milestones: milestoneSummary,
      tasks: tasks
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .map((t) => ({
          title: t.title,
          status: t.status,
          assignedTo: t.employee ? t.employee.fullName : "Unassigned",
          deadline: t.date, // Changing deadline to date as per schema
        })),
      totalTasks: tasks.length,
      overallProgress:
        tasks.length > 0
          ? Math.round(
              tasks.reduce((acc, t) => acc + (t.progress || 0), 0) /
                tasks.length
            )
          : 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
