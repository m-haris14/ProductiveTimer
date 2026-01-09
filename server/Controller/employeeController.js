import Employee from "../Model/employee.js";
import WorkHourRequirement from "../Model/workHourRequirement.js";
import { getTodayStart } from "../Utils/dateUtils.js";

export const login = async (req, res) => {
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
    res.status(500).json({ message: "Server error" });
  }
};

export const createEmployee = async (req, res) => {
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
      department: req.body.department,
      currentDailyRequiredHours: req.body.dailyRequiredHours || 8,
      machineId: req.body.machineId,
    });
    await employee.save();

    // Create initial work hour requirement
    const workReq = new WorkHourRequirement({
      employee: employee._id,
      dailyRequiredHours: req.body.dailyRequiredHours || 8,
      effectiveFrom: getTodayStart(),
    });
    await workReq.save();

    res.status(201).json({ message: "Employee added" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find().select("-password");
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullName, username, password } = req.body;
    const employeeId = req.params.employeeId;

    const employee = await Employee.findById(employeeId);
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });

    if (fullName) employee.fullName = fullName;
    if (username) {
      const exists = await Employee.findOne({
        username,
        _id: { $ne: employeeId },
      });
      if (exists)
        return res.status(400).json({ message: "Username already taken" });
      employee.username = username;
    }

    if (password) {
      if (req.body.currentPassword) {
        const isMatch = await employee.comparePassword(
          req.body.currentPassword
        );
        if (!isMatch) {
          return res
            .status(400)
            .json({ message: "Incorrect current password" });
        }
      }
      employee.password = password;
    }
    if (req.body.department) employee.department = req.body.department;
    if (req.body.joiningDate) employee.joiningDate = req.body.joiningDate;
    if (req.body.machineId) employee.machineId = req.body.machineId;

    // Admin-only fields (Assuming the caller is admin, which middleware ensures usually,
    // but here we trust the endpoint usage for now or check user role if available in req)
    if (req.body.designation) employee.designation = req.body.designation;

    if (req.body.dailyRequiredHours) {
      const newHours = Number(req.body.dailyRequiredHours);
      // If hours changed, create a new requirement version
      if (employee.currentDailyRequiredHours !== newHours) {
        employee.currentDailyRequiredHours = newHours;

        const workReq = new WorkHourRequirement({
          employee: employee._id,
          dailyRequiredHours: newHours,
          effectiveFrom: getTodayStart(),
        });
        await workReq.save();
      }
    }

    await employee.save();

    const { password: _, ...userData } = employee.toObject();
    res.status(200).json({ message: "Profile updated", employee: userData });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.employeeId).select(
      "-password"
    );
    if (!employee)
      return res.status(404).json({ message: "Employee not found" });
    res.json({ employee });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findByIdAndDelete(employeeId);

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    // Optional: Delete related data (Attendance, Tasks, etc.) if needed.
    // For now, we keep them or let DB rules handle it.
    // Usually, we might want to cascade delete or keep for records.
    // Given the request is simple "delete button", we just delete the user.

    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const uploadProfilePicture = async (req, res) => {
  try {
    const { employeeId } = req.params;
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const imagePath = `/uploads/${req.file.filename}`;
    const employee = await Employee.findByIdAndUpdate(
      employeeId,
      { profilePicture: imagePath },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.status(200).json({
      message: "Profile picture updated",
      profilePicture: imagePath,
    });
  } catch (error) {
    console.error("Profile picture upload error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
