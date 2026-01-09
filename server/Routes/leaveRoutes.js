import express from "express";
import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus,
} from "../Controller/leaveController.js";

const router = express.Router();

router.post("/leave/apply", applyLeave);
router.get("/leave/my/:employeeId", getMyLeaves);
router.get("/leave/all", getAllLeaves);
router.put("/leave/status/:id", updateLeaveStatus);

export default router;
