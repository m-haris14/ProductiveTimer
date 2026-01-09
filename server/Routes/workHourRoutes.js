import express from "express";
import {
  setEmployeeRequiredHours,
  getEmployeeRequiredHours,
  getEmployeeRequirementHistory,
} from "../Controller/workHourController.js";

const router = express.Router();

router.post("/work-hours", setEmployeeRequiredHours); // Changed from /set
router.get("/work-hours/:employeeId", getEmployeeRequiredHours);
router.get("/work-hours/history/:employeeId", getEmployeeRequirementHistory);

export default router;
