import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


import Employee from "./Model/employee.js";
import employeeRoutes from "./Routes/employeeRoutes.js";
import attendanceRoutes from "./Routes/attendanceRoutes.js";
import taskRoutes from "./Routes/taskRoutes.js";
import leaveRoutes from "./Routes/leaveRoutes.js";
import settingsRoutes from "./Routes/settingsRoutes.js";
import workHourRoutes from "./Routes/workHourRoutes.js";
import projectRoutes from "./Routes/projectRoutes.js";
import adminRoutes from "./Routes/adminRoutes.js";
import { initRealtimeService } from "./Services/zkRealtimeService.js";

import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      callback(null, origin || true);
    },
    credentials: true,
  },
});
app.set("io", io);

app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, origin || true);
    },
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use(express.static(path.join(__dirname, "../dist")));


// Database Connection & Admin Initialization
mongoose
  .connect(
    "mongodb+srv://screenmr1409_db_user:timeprovider@cluster0.9cxyxo9.mongodb.net/productiveTimer?appName=Cluster0"
  )
  .then(async () => {
    console.log("✅ MongoDB Connected");

    // Initialize ZKTeco Realtime Service with Socket.IO
    initRealtimeService(io);

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
    } else {
      if (defaultAdmin.role !== "admin") {
        defaultAdmin.role = "admin";
        await defaultAdmin.save();
        console.log("✅ Admin role updated to admin");
      }
      console.log("✅ Admin already exists");
    }
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Routes
app.use(employeeRoutes);
app.use(attendanceRoutes);
app.use(taskRoutes);
app.use(leaveRoutes);
app.use(settingsRoutes);
app.use(workHourRoutes);
app.use(projectRoutes);
app.use(adminRoutes);

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, "0.0.0.0", () =>
  console.log(
    `✅ Server running on http://192.168.1.231:${PORT} (Socket.IO Enabled)`
  )
);

