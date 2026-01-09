import express from "express";
import {
  createTask,
  getEmployeeTasks,
  getTaskById,
  updateTask,
  startTask,
  stopTask,
  reviewTask,
  addTaskComment,
  deleteTaskComment,
  markTaskCommentsAsRead,
} from "../Controller/taskController.js";

const router = express.Router();

router.post("/tasks", createTask);
router.get("/tasks/:employeeId", getEmployeeTasks);
router.get("/tasks/single/:taskId", getTaskById);
router.patch("/tasks/:taskId", updateTask);
router.post("/tasks/:taskId/start", startTask);
router.post("/tasks/:taskId/stop", stopTask);
router.post("/tasks/:taskId/review", reviewTask);
router.post("/tasks/:taskId/comments", addTaskComment);
router.delete("/tasks/:taskId/comments/:commentId", deleteTaskComment);
router.patch("/tasks/:taskId/read-comments", markTaskCommentsAsRead);

export default router;
