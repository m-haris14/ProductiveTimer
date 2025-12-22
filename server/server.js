import mongoose from "mongoose";
import cors from "cors";
import express from "express";
import path from "path";
import Employee from "./Model/employee.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
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
      });
      await adminEmployee.save();
    } else {
      console.log("✅ Admin already exists");
    }
  })
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("Hello World!");
  console.log("✅ Server running on http://localhost:5000");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const employee = await Employee.findOne({ username });
    if (!employee) return res.status(404).json({ message: "User not found" });

    const isMatch = await employee.comparePassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const { password: _, ...userData } = employee.toObject();
    res.status(200).json({ employee: userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// ADD EMPLOYEE (admin only)
app.post("/employee", async (req, res) => {
  try {
    const { fullName, username, password, designation } = req.body;

    if (!fullName || !username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await Employee.findOne({ username });
    if (exists) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const employee = new Employee({
      fullName,
      username,
      password,
      designation: designation || "Employee",
    });

    await employee.save();

    res.status(201).json({ message: "Employee added successfully" });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET ALL EMPLOYEES
app.get("/employee", async (req, res) => {
  try {
    const employees = await Employee.find().select("-password");
    res.status(200).json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.listen(5000, () =>
  console.log("✅ Server running on http://localhost:5000")
);
