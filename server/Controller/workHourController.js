import WorkHourRequirement from "../Model/workHourRequirement.js";
import Employee from "../Model/employee.js";
import { getTodayStart } from "../Utils/dateUtils.js";

// Set new required hours for an employee
// This effectively creates a new requirement version starting from today
export const setEmployeeRequiredHours = async (req, res) => {
  try {
    const { employeeId, dailyRequiredHours } = req.body;
    const today = getTodayStart();

    // 1. Find the currently active requirement
    const currentReq = await WorkHourRequirement.findOne({
      employee: employeeId,
      effectiveTo: null,
    });

    // If there's an existing active requirement
    if (currentReq) {
      // If the effectiveFrom is today, we can just update it because it hasn't guided any past days yet
      // (assuming we handle this before attendance is finalized for today, but simplest is to just update)
      if (currentReq.effectiveFrom.getTime() === today.getTime()) {
        currentReq.dailyRequiredHours = dailyRequiredHours;
        await currentReq.save();
      } else {
        // It was effective from a past date, so we close it
        // Determine the valid until date. Since new rule starts today, old rule ends yesterday EOD (or just simply "before today")
        // We'll set effectiveTo to today, meaning it stops being exclusive active BEFORE today's calculations?
        // Actually, let's say effectiveTo is NULL means active.
        // If we set effectiveTo = today, it means it is valid UP TO today (exclusive or inclusive? Let's say exclusive of the new start date).
        // Let's stick to: effectiveTo = today.
        currentReq.effectiveTo = today;
        await currentReq.save();

        // Create new requirement
        const newReq = new WorkHourRequirement({
          employee: employeeId,
          dailyRequiredHours,
          effectiveFrom: today,
        });
        await newReq.save();
      }
    } else {
      // No current requirement (first time), create one
      const newReq = new WorkHourRequirement({
        employee: employeeId,
        dailyRequiredHours,
        effectiveFrom: today,
      });
      await newReq.save();
    }

    // Update the caching field in Employee model for quick access
    await Employee.findByIdAndUpdate(employeeId, {
      currentDailyRequiredHours: dailyRequiredHours,
    });

    res.json({ message: "Work hour requirement updated successfully" });
  } catch (error) {
    console.error("Error setting work hours:", error);
    res.status(500).json({ message: "Server error setting work hours" });
  }
};

// Get current requirement for an employee
export const getEmployeeRequiredHours = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const requirement = await WorkHourRequirement.findOne({
      employee: employeeId,
      effectiveTo: null,
    });

    res.json({
      dailyRequiredHours: requirement ? requirement.dailyRequiredHours : 8,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error fetching work hours" });
  }
};

// Get requirements history for an employee
export const getEmployeeRequirementHistory = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const history = await WorkHourRequirement.find({
      employee: employeeId,
    }).sort({ effectiveFrom: -1 });

    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching history" });
  }
};
