import express from "express";
import {
  login,
  createEmployee,
  getEmployees,
  updateProfile,
  getEmployeeById,
  deleteEmployee,
  uploadProfilePicture,
} from "../Controller/employeeController.js";

import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

// Helper to get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

router.post("/login", login);
router.post("/employees", createEmployee);
router.get("/employees", getEmployees);
router.patch("/profile/:employeeId", updateProfile);
router.get("/employees/:employeeId", getEmployeeById);
router.put("/employees/:employeeId", updateProfile);
router.delete("/employees/:employeeId", deleteEmployee);
router.post(
  "/employees/:employeeId/profile-picture",
  upload.single("image"),
  uploadProfilePicture
);

export default router;
