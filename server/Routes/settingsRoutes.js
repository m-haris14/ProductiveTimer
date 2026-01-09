import express from "express";
import {
  getSettings,
  updateSettings,
  getHolidays,
  addHoliday,
  deleteHoliday,
} from "../Controller/settingsController.js";

const router = express.Router();

// Weekly Offs
router.get("/config", getSettings);
router.put("/config", updateSettings);

// Holidays
router.get("/holidays", getHolidays);
router.post("/holidays", addHoliday);
router.delete("/holidays/:id", deleteHoliday);

export default router;
