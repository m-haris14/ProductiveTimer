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

    const defaultAdmin = await Employee.findOne({ employeeId: "EMP000" });
    if (!defaultAdmin) {
      const adminEmployee = new Employee({
        employeeId: "EMP000",
        employeeName: "Uzair",
        email: "uzair@gmail.com",
        password: "EMP000",
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
    console.log("✅ Server running on http://localhost:5000")
}); 

app.listen(5000, () =>
  console.log("✅ Server running on http://localhost:5000")
);