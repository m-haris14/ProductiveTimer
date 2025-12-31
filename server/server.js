import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import Employee from "./Model/employee.js";
import Attendance from "./Model/attendance.js";

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

mongoose
  .connect("mongodb://localhost:27017/productiveTimer")
  .then(async () => {
    console.log("✅ MongoDB Connected");

    const defaultAdmin = await Employee.findOne({ username: "haris" });
    if (!defaultAdmin) {
      const adminEmployee = new Employee({
        fullName: "Haris",
        username: "haris",
        password: "haris",
        designation: "Admin",
        role: "admin",
      });
      await adminEmployee.save();
      console.log("✅ Admin created");
    }
  })
  .catch((err) => console.log(err));

app.get("/", (req, res) => res.send("Server running"));
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const employee = await Employee.findOne({ username });
  if (!employee) return res.status(404).json({ message: "User not found" });
  const isMatch = await employee.comparePassword(password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
  const { password: _, ...userData } = employee.toObject();
  res.status(200).json({ employee: userData });
});

app.post("/employee", async (req, res) => {
  try {
    const { fullName, username, password, designation } = req.body;
    if (!fullName || !username || !password)
      return res.status(400).json({ message: "All fields required" });
    const exists = await Employee.findOne({ username });
    if (exists) return res.status(400).json({ message: "Username exists" });
    const employee = new Employee({
      fullName,
      username,
      password,
      designation,
    });
    await employee.save();
    res.status(201).json({ message: "Employee added" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/employee", async (req, res) => {
  const employees = await Employee.find().select("-password");
  res.status(200).json(employees);
});

// Helper to get today's start
const getTodayStart = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// ----------------- START WORK -----------------
app.post("/timer/start", async (req, res) => {
  try {
    const { employeeId } = req.body;
    const today = getTodayStart();

    let attendance = await Attendance.findOne({
      employee: employeeId,
      date: today,
    });
    if (!attendance) {
      attendance = new Attendance({
        employee: employeeId,
        date: today,
        firstCheckIn: new Date(),
      });
    }

    if (attendance.status === "working") {
      return res.status(400).json({ message: "Already working" });
    }

    // If switching from break, finalize break duration
    if (attendance.status === "break") {
      const remaining = 60 - attendance.breakDuration;
      const elapsed =
        (Date.now() - attendance.lastStatusChange.getTime()) / 1000;
      attendance.breakDuration += Math.max(0, Math.min(elapsed, remaining));
    }

    attendance.status = "working";
    attendance.lastStatusChange = new Date();
    await attendance.save();

    res.json({ message: "Work started", attendance });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------- TAKE BREAK -----------------
app.post("/timer/stop", async (req, res) => {
  try {
    const { employeeId } = req.body;
    const today = getTodayStart();

    let attendance = await Attendance.findOne({
      employee: employeeId,
      date: today,
    });
    if (!attendance || attendance.status !== "working") {
      return res.status(400).json({ message: "Not working" });
    }

    // Finalize work duration
    const elapsed = (Date.now() - attendance.lastStatusChange.getTime()) / 1000;
    attendance.workDuration += elapsed;

    attendance.status = "break";
    attendance.lastStatusChange = new Date();
    await attendance.save();

    res.json({ message: "Break started", attendance });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------- CHECK OUT -----------------
app.post("/timer/checkout", async (req, res) => {
  try {
    const { employeeId } = req.body;
    const today = getTodayStart();

    let attendance = await Attendance.findOne({
      employee: employeeId,
      date: today,
    });
    if (!attendance)
      return res.status(404).json({ message: "No attendance today" });

    // Finalize current status duration if active
    if (attendance.status !== "none") {
      const elapsed =
        (Date.now() - attendance.lastStatusChange.getTime()) / 1000;
      if (attendance.status === "working") {
        attendance.workDuration += elapsed;
      } else if (attendance.status === "break") {
        const remaining = 60 - attendance.breakDuration;
        attendance.breakDuration += Math.max(0, Math.min(elapsed, remaining));
      }
    }

    attendance.status = "none";
    attendance.lastStatusChange = new Date();
    attendance.lastCheckOut = new Date();
    await attendance.save();

    res.json({ message: "Checked out", attendance });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------- GET ACTIVE TIMER -----------------
app.get("/timer/active/:employeeId", async (req, res) => {
  const today = getTodayStart();
  const attendance = await Attendance.findOne({
    employee: req.params.employeeId,
    date: today,
    status: "working",
  });
  if (!attendance) return res.json(null);
  const elapsedSeconds = Math.floor(
    (Date.now() - attendance.lastStatusChange.getTime()) / 1000
  );
  res.json({ elapsedSeconds });
});

// ----------------- GET ACTIVE BREAK -----------------
app.get("/break/active/:employeeId", async (req, res) => {
  const today = getTodayStart();
  const attendance = await Attendance.findOne({
    employee: req.params.employeeId,
    date: today,
    status: "break",
  });
  if (!attendance) return res.json(null);
  const elapsedSeconds = Math.floor(
    (Date.now() - attendance.lastStatusChange.getTime()) / 1000
  );
  res.json({ elapsedSeconds: Math.min(elapsedSeconds, 60) });
});

// ----------------- GET STATS TODAY -----------------
app.get("/stats/today/:employeeId", async (req, res) => {
  try {
    const today = getTodayStart();
    const attendance = await Attendance.findOne({
      employee: req.params.employeeId,
      date: today,
    });
    if (!attendance) {
      return res.json({
        totalWorkSeconds: 0,
        totalBreakSeconds: 0,
        cumulativeWorkSeconds: 0,
        cumulativeBreakSeconds: 0,
        totalDailySeconds: 0,
        remainingBreakSeconds: 60,
      });
    }

    let liveWork = attendance.workDuration;
    let liveBreak = attendance.breakDuration;
    const elapsed = (Date.now() - attendance.lastStatusChange.getTime()) / 1000;

    if (attendance.status === "working") {
      liveWork += elapsed;
    } else if (attendance.status === "break") {
      liveBreak += Math.min(elapsed, 60 - attendance.breakDuration);
    }

    res.json({
      totalWorkSeconds: liveWork,
      totalBreakSeconds: liveBreak,
      cumulativeWorkSeconds: attendance.workDuration,
      cumulativeBreakSeconds: attendance.breakDuration,
      totalDailySeconds: liveWork + liveBreak,
      remainingBreakSeconds: Math.max(0, 60 - liveBreak),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------- GET STATS WEEK -----------------
app.get("/stats/week/:employeeId", async (req, res) => {
  try {
    const startOfWeek = new Date();
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const records = await Attendance.find({
      employee: req.params.employeeId,
      date: { $gte: startOfWeek },
    });

    const totalWorkSeconds = records.reduce(
      (acc, r) => acc + (r.workDuration || 0),
      0
    );
    res.json({ totalWorkSeconds });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(5000, () =>
  console.log("✅ Server running on http://localhost:5000")
);
