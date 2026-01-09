import Task from "../Model/task.js";
import Employee from "../Model/employee.js";

const updateTaskTime = (task) => {
  if (task.activeSessionStart) {
    const elapsed = (new Date() - new Date(task.activeSessionStart)) / 1000;
    task.totalWorkedSeconds += elapsed;
    task.activeSessionStart = null;

    const s = Math.floor(task.totalWorkedSeconds);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    task.time = `${h}h ${m}m ${sec}s`;
  }
};

export const createTask = async (req, res) => {
  try {
    const {
      employeeId,
      title,
      description,
      time,
      date,
      projectId,
      assignedBy,
    } = req.body;
    if (!employeeId || !title) {
      return res
        .status(400)
        .json({ message: "Employee and title are required" });
    }
    const task = new Task({
      employee: employeeId,
      project: projectId || undefined,
      assignedBy: assignedBy,
      title,
      description,
      time,
      date: date || undefined,
    });
    await task.save();
    res.status(201).json({ message: "Task assigned successfully", task });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getEmployeeTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ employee: req.params.employeeId }).sort({
      createdAt: -1,
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId).populate(
      "comments.sender",
      "fullName"
    );
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { status, progress, feedback } = req.body;
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // Only update time (stop session) if status works explicitly changed
    // OR if progress is 100 (which implies completion/review)
    if (status !== undefined || progress === 100) {
      updateTaskTime(task);
    }

    if (status !== undefined) task.status = status;
    if (feedback !== undefined) task.feedback = feedback;
    if (req.body.submissionLink !== undefined)
      task.submissionLink = req.body.submissionLink;
    if (progress !== undefined) {
      task.progress = progress;
      if (progress === 100 && task.status !== "Completed") {
        task.status = "Under Review";
      }
    }

    await task.save();
    if (task.status === "Under Review" || task.status === "Late Submission") {
      const io = req.app.get("io");
      if (io)
        io.emit("notification_update", { type: "task", taskId: task._id });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const startTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.status = "In Progress";
    task.activeSessionStart = new Date();
    await task.save();

    res.json({ message: "Task started", task });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const stopTask = async (req, res) => {
  try {
    const { action } = req.body;
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    updateTaskTime(task);

    if (action === "Complete") {
      const now = new Date();
      const dueDate = task.date ? new Date(task.date) : null;
      // Set to Late Submission if overdue, otherwise Under Review
      if (dueDate && now > dueDate) {
        task.status = "Late Submission";
      } else {
        task.status = "Under Review";
      }
      task.progress = 100;
    } else {
      task.status = "Pending";
    }

    await task.save();
    if (task.status === "Under Review" || task.status === "Late Submission") {
      const io = req.app.get("io");
      if (io)
        io.emit("notification_update", { type: "task", taskId: task._id });
    }
    res.json({
      message: `Task ${action === "Complete" ? "sent for review" : "dropped"}`,
      task,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const reviewTask = async (req, res) => {
  try {
    const { action, feedback, progress } = req.body;
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    updateTaskTime(task);

    if (action === "approve") {
      task.status = "Completed";
      task.progress = 100;
      task.feedback = feedback || "Task approved";
    } else if (action === "reject") {
      task.status = "Revision Required";
      if (progress !== undefined) {
        task.progress = progress;
      }
      task.feedback = feedback || "Changes requested";
    }

    await task.save();
    res.json({ message: `Task ${action}d successfully`, task });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const addTaskComment = async (req, res) => {
  try {
    const { senderId, text } = req.body;
    const { taskId } = req.params;

    if (!senderId || !text) {
      return res.status(400).json({ message: "Sender and text are required" });
    }

    const task = await Task.findById(taskId).populate(
      "comments.sender",
      "fullName"
    );
    if (!task) return res.status(404).json({ message: "Task not found" });

    const newComment = { sender: senderId, text };
    task.comments.push(newComment);

    // Set unread flags based on sender
    const sender = await Employee.findById(senderId);
    if (sender) {
      if (sender.designation === "Admin") {
        task.unreadEmployee = true;
      } else {
        task.unreadAdmin = true;
      }
    }

    await task.save();

    // Re-populate to get the latest comment with sender details
    await task.populate("comments.sender", "fullName text createdAt");
    const latestComment = task.comments[task.comments.length - 1];

    const io = req.app.get("io");
    if (io) {
      io.emit("task_comment", {
        taskId,
        comment: latestComment,
      });

      if (task.unreadAdmin || task.unreadEmployee) {
        io.emit("task_notification", {
          taskId,
          employeeId: task.employee.toString(),
          message: `New message on task: ${task.title}`,
        });
      }
    }

    res.status(201).json({ message: "Comment added", comment: latestComment });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteTaskComment = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;
    const { userId } = req.body; // Requester's ID

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const comment = task.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Check permissions: Admin or Sender
    const requester = await Employee.findById(userId);
    const isAdmin = requester?.designation === "Admin";
    const isSender = String(comment.sender) === String(userId);

    if (!isAdmin && !isSender) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    task.comments.pull({ _id: commentId });
    await task.save();

    res.json({ message: "Comment deleted successfully", taskId, commentId });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const markTaskCommentsAsRead = async (req, res) => {
  try {
    const { side } = req.body; // 'admin' or 'employee'
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (side === "admin") {
      task.unreadAdmin = false;
    } else {
      task.unreadEmployee = false;
    }

    await task.save();
    res.json({ message: "Comments marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Helper for logout logic
export const stopActiveTask = async (employeeId) => {
  const task = await Task.findOne({
    employee: employeeId,
    status: "In Progress",
    activeSessionStart: { $ne: null },
  });

  if (task) {
    updateTaskTime(task);
    task.status = "Pending";
    await task.save();
  }
};
