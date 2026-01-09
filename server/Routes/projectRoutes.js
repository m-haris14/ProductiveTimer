import express from "express";
import {
  createProject,
  getAllProjects,
  getTeamLeadProjects,
  updateProject,
  addMilestone,
  updateMilestone,
  deleteMilestone,
  getProjectStats,
  getEmployeeProjects,
  getProjectById,
  addProjectComment,
  deleteProjectComment,
  markProjectCommentsAsRead,
  getDetailedProjectReport,
} from "../Controller/projectController.js";

const router = express.Router();

router.post("/projects", createProject);
router.get("/projects", getAllProjects);
router.get("/projects/tl/:teamLeadId", getTeamLeadProjects);
router.get("/projects/employee/:employeeId", getEmployeeProjects);
router.get("/projects/:projectId", getProjectById);
router.patch("/projects/:projectId", updateProject);
router.post("/projects/:projectId/milestones", addMilestone);
router.patch("/projects/:projectId/milestones/:milestoneId", updateMilestone);
router.delete("/projects/:projectId/milestones/:milestoneId", deleteMilestone);
router.get("/projects/:projectId/stats", getProjectStats);
router.post("/projects/:projectId/comments", addProjectComment);
router.delete("/projects/:projectId/comments/:commentId", deleteProjectComment);
router.patch("/projects/:projectId/read-comments", markProjectCommentsAsRead);
router.get("/projects/:projectId/detailed-report", getDetailedProjectReport);

export default router;
