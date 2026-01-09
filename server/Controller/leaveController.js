import Leave from "../Model/leave.js";
import Attendance from "../Model/attendance.js";

// Apply for Leave
export const applyLeave = async (req, res) => {
  try {
    const { employeeId, leaveType, fromDate, toDate, reason } = req.body;

    const newLeave = new Leave({
      employee: employeeId,
      leaveType,
      fromDate,
      toDate,
      reason,
    });

    await newLeave.save();
    res.status(201).json({
      message: "Leave application submitted successfully",
      leave: newLeave,
    });
  } catch (error) {
    console.error("Error applying for leave:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get My Leaves (Employee)
export const getMyLeaves = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const leaves = await Leave.find({ employee: employeeId }).sort({
      createdAt: -1,
    });
    res.status(200).json(leaves);
  } catch (error) {
    console.error("Error fetching my leaves:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get All Leaves (Admin)
export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("employee", "fullName department designation")
      .sort({ createdAt: -1 });
    res.status(200).json(leaves);
  } catch (error) {
    console.error("Error fetching all leaves:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update Leave Status (Admin)
export const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedLeave = await Leave.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedLeave) {
      return res.status(404).json({ message: "Leave application not found" });
    }

    // If approved, mark attendance
    if (status === "Approved") {
      const start = new Date(updatedLeave.fromDate);
      const end = new Date(updatedLeave.toDate);
      const dates = [];

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(new Date(d));
      }

      console.log(
        `[Leave] Processing ${dates.length} dates for approved leave.`
      );

      for (const date of dates) {
        // Set to midnight UTC or local?
        // The Attendance model defaults date to midnight. We should ensure consistency.
        // Assuming dates from frontend/DB are already compatible or we rely on 'date-only' concept.
        // We'll trust the date object for now but zero out time if needed.
        const workDate = new Date(date);
        workDate.setHours(0, 0, 0, 0);

        console.log(
          `[Leave] Checking date: ${workDate.toISOString()} for Employee: ${
            updatedLeave.employee
          }`
        );

        // Check if attendance exists
        const exists = await Attendance.findOne({
          employee: updatedLeave.employee,
          date: workDate,
        });

        console.log(`[Leave] Exists? ${!!exists}`);

        if (!exists) {
          // Create attendance record
          console.log(
            `[Leave] Creating new leave record for ${workDate.toISOString()}`
          );
          const att = new Attendance({
            employee: updatedLeave.employee,
            date: workDate,
            status: "leave",
            firstCheckIn: workDate, // Mark as if they checked in at start of day? Or just null?
            lastCheckOut: workDate,
            // Maybe set duration to 8h if paid leave? Or 0.
            // User said "mark on attendance". Usually implies 'Present' or 'Leave'.
            // Since we have specific status 'leave', dashboard can render it special.
            status: "leave",
            firstCheckIn: workDate,
            lastCheckOut: workDate,
            requiredHours: 0, // No work required on leave days
          });
          await att.save();
        } else {
          // If exists, update status?
          // e.g. maybe they started working then took leave?
          // For now, only create if not exists to avoid overwriting work data.
          if (exists.status === "none") {
            console.log(`[Leave] Updating existing 'none' record to 'leave'`);
            exists.status = "leave";
            await exists.save();
          } else {
            console.log(`[Leave] Skipped. Status is: ${exists.status}`);
          }
        }
      }
    }

    if (!updatedLeave) {
      return res.status(404).json({ message: "Leave application not found" });
    }

    res
      .status(200)
      .json({ message: "Leave status updated", leave: updatedLeave });
  } catch (error) {
    console.error("Error updating leave status:", error);
    res.status(500).json({ message: "Server error" });
  }
};
