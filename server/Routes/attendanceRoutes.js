import express from "express";
import {
  startTimer,
  stopTimer,
  pauseTimer,
  checkout,
  getActiveTimer,
  getActiveBreak,
  getActiveIdle,
  getCurrentStatus,
  getStatsToday,
  getAllAttendanceAdmin,
  getStatsWeek,
  logoutStop,
  getAdminStats,
  getEmployeeReportStats,
  getMyAttendance,
  syncMachineAttendance,
  startIdleTimer,
  resumeFromIdle,
} from "../Controller/attendanceController.js";

const router = express.Router();

router.post("/timer/start", startTimer);
router.post("/timer/stop", stopTimer);
router.post("/timer/pause", pauseTimer);
router.post("/timer/checkout", checkout);
router.post("/timer/logout-stop", logoutStop);
router.post("/attendance/sync", syncMachineAttendance);
router.post("/timer/idle/start", startIdleTimer);
router.post("/timer/idle/resume", resumeFromIdle);

router.get("/timer/active/:employeeId", getActiveTimer);
router.get("/break/active/:employeeId", getActiveBreak);
router.get("/idle/active/:employeeId", getActiveIdle);
router.get("/timer/status/:employeeId", getCurrentStatus);
router.get("/stats/today/:employeeId", getStatsToday);
router.get("/stats/week/:employeeId", getStatsWeek);
router.get("/attendance/all", getAllAttendanceAdmin);
router.get("/admin/stats", getAdminStats);
router.get("/stats/report/:employeeId", getEmployeeReportStats);
router.get("/attendance/my/:employeeId", getMyAttendance);

export default router;
