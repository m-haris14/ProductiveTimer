import Attendance from "../Model/attendance.js";
import Employee from "../Model/employee.js";
import Task from "../Model/task.js";
import Leave from "../Model/leave.js";
import Settings from "../Model/settings.js";
import Holiday from "../Model/holiday.js";
import { getTodayStart } from "../Utils/dateUtils.js";
import { stopActiveTask } from "./taskController.js";

export const startTimer = async (req, res) => {
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

      // Snapshot required hours from employee profile
      const emp = await Employee.findById(employeeId);
      if (emp) {
        attendance.requiredHours = emp.currentDailyRequiredHours || 8;
      }
    }

    if (attendance.status === "working") {
      return res.status(400).json({ message: "Already working" });
    }

    if (attendance.status === "checked-out") {
      return res.status(403).json({
        message:
          "You have already checked out for today. Please wait until tomorrow.",
      });
    }

    if (attendance.status === "break" || attendance.status === "stopped") {
      const elapsed =
        (Date.now() - attendance.lastStatusChange.getTime()) / 1000;
      if (attendance.status === "break") {
        const remaining = 3600 - attendance.breakDuration;
        attendance.breakDuration += Math.max(0, Math.min(elapsed, remaining));
      }
    }

    attendance.status = "working";
    attendance.lastStatusChange = new Date();
    await attendance.save();

    res.json({ message: "Work started/resumed", attendance });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const stopTimer = async (req, res) => {
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

    const elapsed = (Date.now() - attendance.lastStatusChange.getTime()) / 1000;
    attendance.workDuration += elapsed;

    attendance.status = "break";
    attendance.lastStatusChange = new Date();
    await attendance.save();

    res.json({ message: "Break started", attendance });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const pauseTimer = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const today = getTodayStart();

    let attendance = await Attendance.findOne({
      employee: employeeId,
      date: today,
    });
    if (
      !attendance ||
      (attendance.status !== "working" && attendance.status !== "break")
    ) {
      return res.status(400).json({ message: "No active session to stop" });
    }

    const elapsed = (Date.now() - attendance.lastStatusChange.getTime()) / 1000;
    if (attendance.status === "working") {
      attendance.workDuration += elapsed;
    } else if (attendance.status === "break") {
      const remaining = 3600 - attendance.breakDuration;
      attendance.breakDuration += Math.max(0, Math.min(elapsed, remaining));
    }

    attendance.status = "stopped";
    attendance.lastStatusChange = new Date();
    await attendance.save();

    res.json({ message: "Timer stopped", attendance });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const checkout = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const today = getTodayStart();

    let attendance = await Attendance.findOne({
      employee: employeeId,
      date: today,
    });
    if (!attendance)
      return res.status(404).json({ message: "No attendance today" });

    if (attendance.status !== "none" && attendance.status !== "checked-out") {
      const elapsed =
        (Date.now() - attendance.lastStatusChange.getTime()) / 1000;
      if (attendance.status === "working") {
        attendance.workDuration += elapsed;
      } else if (attendance.status === "break") {
        const remaining = 3600 - attendance.breakDuration;
        attendance.breakDuration += Math.max(0, Math.min(elapsed, remaining));
      }
    }

    attendance.status = "checked-out";
    attendance.lastStatusChange = new Date();
    attendance.lastCheckOut = new Date();
    // --- Shortage Calculation ---
    // Only calculate if we are genuinely checking out for the day
    const requiredSeconds = (attendance.requiredHours || 8) * 3600;
    const totalWorkedSeconds = attendance.workDuration; // Updated above
    const shortageSeconds = requiredSeconds - totalWorkedSeconds;
    const shortageHours = shortageSeconds / 3600;

    attendance.hoursShortage = shortageHours;

    // Calculate Cumulative
    // Find latest previous record
    const lastRecord = await Attendance.findOne({
      employee: employeeId,
      date: { $lt: today },
    }).sort({ date: -1 });

    const prevCumulative = lastRecord ? lastRecord.cumulativeShortage || 0 : 0;
    attendance.cumulativeShortage = prevCumulative + shortageHours;

    await attendance.save();

    res.json({ message: "Checked out", attendance });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getActiveTimer = async (req, res) => {
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
};

export const getActiveBreak = async (req, res) => {
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
  res.json({ elapsedSeconds: Math.min(elapsedSeconds, 3600) });
};

export const getCurrentStatus = async (req, res) => {
  const today = getTodayStart();
  const attendance = await Attendance.findOne({
    employee: req.params.employeeId,
    date: today,
  });
  if (!attendance) return res.json({ status: "none" });
  res.json({ status: attendance.status });
};

export const getStatsToday = async (req, res) => {
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
        remainingBreakSeconds: 3600,
        cumulativeShortage: 0,
        todayRequiredSeconds: 8 * 3600,
      });
    }

    let liveWork = attendance.workDuration;
    let liveBreak = attendance.breakDuration;
    const elapsed = (Date.now() - attendance.lastStatusChange.getTime()) / 1000;

    if (attendance.status === "working") {
      liveWork += elapsed;
    } else if (attendance.status === "break") {
      liveBreak += Math.min(elapsed, 3600 - attendance.breakDuration);
    }

    const requiredSeconds = (attendance.requiredHours || 8) * 3600;

    // Get previous cumulative shortage (from last record before today)
    const lastRecord = await Attendance.findOne({
      employee: req.params.employeeId,
      date: { $lt: today },
    }).sort({ date: -1 });
    const prevCumulative = lastRecord ? lastRecord.cumulativeShortage || 0 : 0;

    res.json({
      totalWorkSeconds: liveWork,
      totalBreakSeconds: liveBreak,
      cumulativeWorkSeconds: attendance.workDuration,
      cumulativeBreakSeconds: attendance.breakDuration,
      totalDailySeconds: liveWork + liveBreak,
      remainingBreakSeconds: Math.max(0, 3600 - liveBreak),
      todayRequiredSeconds: requiredSeconds,
      prevCumulativeShortage: Number(prevCumulative) || 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllAttendanceAdmin = async (req, res) => {
  try {
    const today = getTodayStart();
    const dayOfWeek = today.getDay();

    // 1. Fetch Config & Holidays for today
    const [settings, holiday] = await Promise.all([
      Settings.findOne({ effectiveTo: null }),
      Holiday.findOne({
        date: today,
        effectiveFrom: { $lte: today },
      }),
    ]);

    const isWeeklyOff = settings?.weeklyOffs?.includes(dayOfWeek);

    // 2. Fetch Employees & Records
    // Exclude admins from the report
    const employees = await Employee.find({ designation: { $ne: "Admin" } });
    const attendanceRecords = await Attendance.find({ date: today });

    // Fetch all tasks for all employees
    const tasks = await Task.find({}).sort({ createdAt: -1 });

    const data = employees.map((emp) => {
      const record = attendanceRecords.find(
        (r) => r.employee.toString() === emp._id.toString()
      );

      // --- Calculate Employee's Task Stats ---
      const empTasks = tasks.filter(
        (t) => t.employee.toString() === emp._id.toString()
      );
      const totalTasks = empTasks.length;
      const completedTasks = empTasks.filter(
        (t) => t.status === "Completed"
      ).length;
      const completionPercentage =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const currentTaskObj = empTasks.find((t) => t.status === "In Progress");
      const currentTask = currentTaskObj
        ? currentTaskObj.title
        : "No active task";

      // --- Calculate Attendance Stats ---
      let status = "none";
      let workDuration = 0;
      let breakDuration = 0;
      let firstCheckIn = null;
      let lastCheckOut = null;
      let inOffice = false;

      if (record) {
        status = record.status;
        workDuration = record.workDuration;
        breakDuration = record.breakDuration;
        firstCheckIn = record.firstCheckIn;
        lastCheckOut = record.lastCheckOut;

        // Calculate live duration if active
        const elapsed = (Date.now() - record.lastStatusChange.getTime()) / 1000;
        if (record.status === "working") {
          workDuration += elapsed;
          inOffice = true;
        } else if (record.status === "break") {
          breakDuration += Math.min(elapsed, 3600 - record.breakDuration);
          inOffice = true;
        } else if (record.status === "stopped") {
          if (!record.lastCheckOut) inOffice = true;
        }
      } else {
        // No record exists today - check system configuration
        if (holiday) {
          status = "Holiday";
        } else if (isWeeklyOff) {
          status = "Weekly Off";
        } else {
          status = "Absent";
        }
      }

      // Format durations for display
      const formatDuration = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return `${h}h ${m}m`;
      };

      const displayStatus =
        status === "none"
          ? "Not Started"
          : status.charAt(0).toUpperCase() + status.slice(1);

      return {
        id: emp._id,
        name: emp.fullName,
        department: emp.department || "N/A",
        currentTask,
        present: !!record,
        inOffice,
        completed: completionPercentage,
        today: formatDuration(workDuration),
        week: "0h",
        month: "0h",
        attendance: displayStatus,
        status,
        workDuration,
        breakDuration,
        firstCheckIn,
        lastCheckOut,
        requiredHours: record
          ? record.requiredHours
          : emp.currentDailyRequiredHours || 8,
      };
    });

    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getEmployeeReportStats = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const today = getTodayStart();

    // --- Resource Fetching ---
    const [emp, attendanceRecords, approvedLeaves, settings] =
      await Promise.all([
        Employee.findById(employeeId),
        Attendance.find({ employee: employeeId }),
        Leave.find({ employee: employeeId, status: "Approved" }),
        Settings.findOne({ effectiveTo: null }),
      ]);

    const joiningDate = emp?.joiningDate || emp?.createdAt || new Date();
    const startDate = new Date(joiningDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(today);

    const holidays = await Holiday.find({
      date: { $gte: startDate, $lte: endDate },
    });

    const weeklyOffs = settings?.weeklyOffs || [0];

    // --- Task Stats ---
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const tasks = await Task.find({ employee: employeeId }).populate("project");

    const completedMonth = tasks.filter(
      (t) => t.status === "Completed" && t.updatedAt >= startOfMonth
    ).length;

    const completedWeek = tasks.filter(
      (t) => t.status === "Completed" && t.updatedAt >= startOfWeek
    ).length;

    const pendingTasks = tasks.filter((t) => t.status !== "Completed").length;

    // --- Project-wise Allocation ---
    const projectAllocationMap = {};
    tasks.forEach((t) => {
      const projectName = t.project?.name || "Independent Tasks";
      projectAllocationMap[projectName] =
        (projectAllocationMap[projectName] || 0) + (t.totalWorkedSeconds || 0);
    });

    const projectAllocation = Object.entries(projectAllocationMap).map(
      ([name, totalSeconds]) => ({
        name,
        totalSeconds,
        percentage: 0,
      })
    );

    const totalProjectSeconds = projectAllocation.reduce(
      (acc, p) => acc + p.totalSeconds,
      0
    );
    projectAllocation.forEach((p) => {
      p.percentage =
        totalProjectSeconds > 0
          ? Math.round((p.totalSeconds / totalProjectSeconds) * 100)
          : 0;
    });

    // --- Monthly Stats ---
    const monthRecords = attendanceRecords.filter(
      (r) => r.date >= startOfMonth
    );
    const monthlyWorkSeconds = monthRecords.reduce(
      (acc, r) => acc + (r.workDuration || 0),
      0
    );
    const monthlyBreakSeconds = monthRecords.reduce(
      (acc, r) => acc + (r.breakDuration || 0),
      0
    );

    let monthlyRequiredDays = 0;
    const currentMonthEnd = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    );
    const iterateEnd = today < currentMonthEnd ? today : currentMonthEnd;

    for (
      let d = new Date(startOfMonth);
      d <= iterateEnd;
      d.setDate(d.getDate() + 1)
    ) {
      const isOff = weeklyOffs.includes(d.getDay());
      const isHoliday = holidays.some(
        (h) => new Date(h.date).toDateString() === d.toDateString()
      );
      if (!isOff && !isHoliday) {
        monthlyRequiredDays++;
      }
    }
    const avgRequiredHours = emp.currentDailyRequiredHours || 8;
    const monthlyRequiredSeconds =
      monthlyRequiredDays * avgRequiredHours * 3600;

    // --- Daily Productivity Trends ---
    const last5Days = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      d.setHours(0, 0, 0, 0);
      last5Days.push(d);
    }

    const attendanceLast5 = await Attendance.find({
      employee: employeeId,
      date: { $in: last5Days },
    });

    const trendData = last5Days.map((date) => {
      const record = attendanceLast5.find(
        (r) => r.date.toDateString() === date.toDateString()
      );
      return {
        date: date.toLocaleDateString("en-US", {
          month: "2-digit",
          day: "2-digit",
        }),
        workHrs: record ? Number((record.workDuration / 3600).toFixed(1)) : 0,
        breakHrs: record ? Number((record.breakDuration / 3600).toFixed(1)) : 0,
        requiredHrs: record ? record.requiredHours : 8,
      };
    });

    // --- Attendance Stats Calculation ---
    const totalPresentDays = attendanceRecords.filter(
      (r) => r.workDuration > 0 || r.status === "leave"
    ).length;

    let workingDaysTotal = 0;
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const isOff = weeklyOffs.includes(d.getDay());
      const isHoliday = holidays.some(
        (h) => new Date(h.date).toDateString() === d.toDateString()
      );
      if (!isOff && !isHoliday) {
        workingDaysTotal++;
      }
    }

    const attendancePercentage =
      workingDaysTotal > 0
        ? Math.round((totalPresentDays / workingDaysTotal) * 100)
        : 100;

    let totalLeavesCount = 0;
    approvedLeaves.forEach((leave) => {
      const start = new Date(leave.fromDate);
      const end = new Date(leave.toDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      totalLeavesCount += diffDays;
    });

    const totalAllocatedLeaves = 18;
    const remainingLeaves = Math.max(
      0,
      totalAllocatedLeaves - totalLeavesCount
    );

    let daysLate = 0;
    attendanceRecords.forEach((record) => {
      if (record.firstCheckIn) {
        const checkIn = new Date(record.firstCheckIn);
        if (
          checkIn.getHours() > 9 ||
          (checkIn.getHours() === 9 && checkIn.getMinutes() > 30)
        ) {
          daysLate++;
        }
      }
    });

    res.json({
      tasks: {
        completedMonth,
        completedWeek,
        pending: pendingTasks,
        projectAllocation,
      },
      attendance: {
        leaves: totalLeavesCount,
        remainingLeaves,
        late: daysLate,
        leftEarly: 0,
        percentage: Math.min(100, attendancePercentage),
        cumulativeShortage:
          attendanceRecords[attendanceRecords.length - 1]?.cumulativeShortage ||
          0,
        trend: trendData,
        todayRequired:
          attendanceRecords.find(
            (r) => r.date.toDateString() === today.toDateString()
          )?.requiredHours || 8,
        todayWork:
          attendanceRecords.find(
            (r) => r.date.toDateString() === today.toDateString()
          )?.workDuration || 0,
        monthly: {
          workSeconds: monthlyWorkSeconds,
          breakSeconds: monthlyBreakSeconds,
          requiredSeconds: monthlyRequiredSeconds,
          deficitSeconds: Math.max(
            0,
            monthlyRequiredSeconds - monthlyWorkSeconds
          ),
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getStatsWeek = async (req, res) => {
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
};

export const logoutStop = async (req, res) => {
  try {
    const { employeeId } = req.body;
    const today = getTodayStart();

    const attendance = await Attendance.findOne({
      employee: employeeId,
      date: today,
    });

    if (
      attendance &&
      (attendance.status === "working" || attendance.status === "break")
    ) {
      const now = new Date();
      const elapsed = (now - new Date(attendance.lastStatusChange)) / 1000;
      if (attendance.status === "working") {
        attendance.workDuration += elapsed;
      } else if (attendance.status === "break") {
        attendance.breakDuration += elapsed;
      }
      attendance.status = "stopped";
      attendance.lastStatusChange = now;
      await attendance.save();
    }

    // 2. Stop Task Timer (Modularized call)
    await stopActiveTask(employeeId);

    res.json({ message: "All timers stopped successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error during logout stop" });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const today = getTodayStart();
    const totalEnrollments = await Employee.countDocuments({
      designation: { $ne: "Admin" },
    });

    const attendanceToday = await Attendance.find({ date: today });

    let active = 0;
    let idle = 0;
    let offline = 0;

    // Active = working or break
    // Idle = stopped
    // Offline = checked-out or not started (not in attendanceToday)

    attendanceToday.forEach((record) => {
      if (record.status === "working" || record.status === "break") {
        active++;
      } else if (record.status === "stopped") {
        idle++;
      } else if (record.status === "checked-out") {
        offline++;
      }
    });

    // Offline also includes those who have no record for today
    const employeesWithRecord = attendanceToday.length;
    offline += totalEnrollments - employeesWithRecord;

    res.json({
      totalEnrollments,
      active,
      idle,
      offline,
      absent: 0, // Placeholder
      suspended: 0, // Placeholder
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyAttendance = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const records = await Attendance.find({ employee: employeeId }).sort({
      date: -1,
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const processMachineEvent = async (deviceUserId, recordTime, io) => {
  try {
    // console.log(`[ZK Event] Processing event for User ID: ${deviceUserId} at ${recordTime}`);

    // 1. Find Employee
    const employee = await Employee.findOne({
      machineId: Number(deviceUserId),
    });
    if (!employee) {
      // console.log(`[ZK Event] ❌ No employee found for machine ID ${deviceUserId}`);
      return;
    }

    const employeeId = employee._id;
    const today = getTodayStart(); // 00:00:00 today

    // Ignore old events (older than 60 minutes to account for time drift)
    const now = Date.now();
    const eventTime = new Date(recordTime).getTime();
    const timeDiffMinutes = (now - eventTime) / 1000 / 60;

    // console.log(`[ZK Event] Time Check: ...`);

    if (timeDiffMinutes > 60) {
      // console.log(`[ZK Event] ⚠️ Event too old...`);
      return;
    }

    // 2. Find Today's Attendance
    let attendance = await Attendance.findOne({
      employee: employeeId,
      date: today,
    });

    // 3. Logic: Toggle Status
    // If no record -> Create & Start
    // If working -> Stop (Break/Pause)
    // If stopped/break -> Start (Resume)

    if (!attendance) {
      console.log(
        `[ZK Event] -> New Day Entry: Starting Work for ${employee.fullName}`
      );
      attendance = new Attendance({
        employee: employeeId,
        date: today,
        firstCheckIn: new Date(),
        status: "working",
        lastStatusChange: new Date(),
        requiredHours: employee.currentDailyRequiredHours || 8,
      });
      await attendance.save();

      if (io) {
        console.log(`[ZK Socket] Emitting START for ${employee.fullName}`);
        io.emit("attendance_update", {
          employeeId: employeeId.toString(),
          status: "working",
          type: "start",
          serverTime: new Date(),
          statusChangedAt: new Date(),
        });
      }
      return;
    }

    // Debounce: Ignore if status changed less than 1 second ago
    // This prevents double-taps on the machine from toggling immediately
    const secondsSinceLastChange =
      (Date.now() - new Date(attendance.lastStatusChange).getTime()) / 1000;
    if (secondsSinceLastChange < 1) {
      // console.log(`[ZK Event] ⚠️ Debounce...`);
      return;
    }

    if (attendance.status === "working") {
      // TOGGLE TO STOP/BREAK
      console.log(
        `[ZK Event] -> currently WORKING. Toggling to STOP for ${employee.fullName}`
      );

      const elapsed =
        (Date.now() - attendance.lastStatusChange.getTime()) / 1000;
      attendance.workDuration += elapsed;

      // We'll set it to "stopped" (Idle) by default for machine toggle
      // Unless they are on a break? Let's stick to "stopped" which pauses timer.
      attendance.status = "stopped";
      attendance.lastStatusChange = new Date();
      await attendance.save();

      // Stop any active tasks if necessary
      await stopActiveTask(employeeId);

      if (io) {
        console.log(`[ZK Socket] Emitting STOP for ${employee.fullName}`);
        io.emit("attendance_update", {
          employeeId: employeeId.toString(),
          status: "stopped",
          type: "stop",
          serverTime: new Date(),
          statusChangedAt: new Date(),
        });
      }
    } else {
      // TOGGLE TO START/RESUME
      console.log(
        `[ZK Event] -> currently ${attendance.status}. Toggling to WORKING for ${employee.fullName}`
      );

      // If they were on break, calculate break duration
      if (attendance.status === "break") {
        const elapsed =
          (Date.now() - attendance.lastStatusChange.getTime()) / 1000;
        const remaining = 3600 - attendance.breakDuration;

        attendance.breakDuration += Math.max(0, Math.min(elapsed, remaining));
      } else if (attendance.status === "stopped") {
        // just resuming
      } else if (attendance.status === "checked-out") {
        // Re-joining after checkout? Allow it.
      }

      attendance.status = "working";
      attendance.lastStatusChange = new Date();
      await attendance.save();

      if (io) {
        console.log(`[ZK Socket] Emitting RESUME for ${employee.fullName}`);
        io.emit("attendance_update", {
          employeeId: employeeId.toString(),
          status: "working",
          type: "resume",
          serverTime: new Date(),
          statusChangedAt: new Date(),
        });
      }
    }
  } catch (error) {
    console.error(`[ZK Event] Error processing event:`, error);
  }
};

import { getAttendanceLogs } from "../Utils/zkTecoManager.js";

export const syncMachineAttendance = async (req, res) => {
  try {
    const settings = await Settings.findOne({ effectiveTo: null });

    const machineIp = settings?.machineIp || req.body.ip || "192.168.1.222";
    const machinePort = settings?.machinePort || req.body.port || 4370;

    // START OF USER MODIFICATION: Disable historical sync for "From Now On" mode
    // We return EARLY to avoid connecting to the machine and breaking the Real-time socket.
    console.log(
      "[Sync] 'Real-time Toggle Mode' is active. Skipping manual sync entirely."
    );
    return res.json({
      message:
        "Sync disabled in Real-time mode to prevent connection conflicts.",
      logsProcessed: 0,
      newRecords: 0,
      skipped: 0,
    });
    // END OF USER MODIFICATION

    console.log(`Connecting to ZKTeco at ${machineIp}:${machinePort}...`);
    const logs = await getAttendanceLogs(machineIp, machinePort);

    // Safety check - ensure logs is an array
    if (!logs || !Array.isArray(logs)) {
      console.log(`No logs returned from machine or invalid format`);
      return res.json({
        message: "Sync completed but no logs found",
        logsProcessed: 0,
        newRecords: 0,
        skipped: 0,
      });
    }

    // START OF USER MODIFICATION: Removed redundant check
    // END OF USER MODIFICATION

    console.log(`Fetched ${logs.length} logs from machine.`);

    let syncedCount = 0;
    let skippedCount = 0;
    const today = getTodayStart();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log(
      `[Sync] Today's date range: ${today.toISOString()} to ${tomorrow.toISOString()}`
    );

    // Group logs by employee and date
    const logsByEmployee = {};
    let todayLogsCount = 0;

    for (const log of logs) {
      const deviceUserId = Number(log.deviceUserId);
      const recordTime = new Date(log.recordTime);

      console.log(
        `[Sync] Processing log: deviceUserId=${deviceUserId}, recordTime=${recordTime.toISOString()}`
      );

      // ONLY process today's logs (ignore old historical data)
      if (recordTime < today || recordTime >= tomorrow) {
        console.log(
          `[Sync] Skipping log - not from today (${recordTime.toISOString()})`
        );
        continue;
      }

      todayLogsCount++;
      console.log(
        `[Sync] Log is from today! Looking for employee with machineId: ${deviceUserId}`
      );

      // Match employee by Machine ID
      const employee = await Employee.findOne({ machineId: deviceUserId });

      if (!employee) {
        console.log(
          `[Sync] ❌ Skipped log - no employee found with machineId: ${deviceUserId}`
        );
        skippedCount++;
        continue;
      }

      console.log(
        `[Sync] ✅ Found employee: ${employee.fullName} (machineId: ${deviceUserId})`
      );

      const empId = employee._id.toString();
      if (!logsByEmployee[empId]) {
        logsByEmployee[empId] = {
          employee: employee,
          logs: [],
        };
      }
      logsByEmployee[empId].logs.push(recordTime);
    }

    console.log(`[Sync] Total logs from today: ${todayLogsCount}`);
    console.log(
      `[Sync] Employees with logs: ${Object.keys(logsByEmployee).length}`
    );

    // Process each employee's logs
    for (const empId in logsByEmployee) {
      const { employee, logs: empLogs } = logsByEmployee[empId];

      console.log(
        `[Sync] Processing ${employee.fullName}: ${empLogs.length} log(s)`
      );

      // Sort logs by time
      empLogs.sort((a, b) => a - b);

      const firstCheckIn = empLogs[0];
      const lastLog = empLogs[empLogs.length - 1];

      console.log(
        `[Sync] First check-in: ${firstCheckIn.toLocaleTimeString()}, Last log: ${lastLog.toLocaleTimeString()}`
      );

      const dateStart = new Date(firstCheckIn);
      dateStart.setHours(0, 0, 0, 0);

      let attendance = await Attendance.findOne({
        employee: employee._id,
        date: dateStart,
      });

      if (!attendance) {
        // Create new attendance record
        console.log(
          `[Sync] Creating NEW attendance record for ${employee.fullName}`
        );
        attendance = new Attendance({
          employee: employee._id,
          date: dateStart,
          firstCheckIn: firstCheckIn,
          requiredHours: employee.currentDailyRequiredHours || 8,
        });
        syncedCount++;
      } else {
        // Update existing record - ensure we have the earliest check-in
        console.log(
          `[Sync] Updating EXISTING attendance record for ${employee.fullName}`
        );
        if (firstCheckIn < attendance.firstCheckIn) {
          attendance.firstCheckIn = firstCheckIn;
        }
      }

      // Determine status based on number of logs
      if (empLogs.length === 1) {
        // Only one log = employee checked in, start timer
        console.log(`[Sync] Setting status to WORKING (only 1 log)`);
        attendance.status = "working";
        attendance.lastStatusChange = firstCheckIn;
      } else {
        // Multiple logs = employee scanned again, STOP timer (not checkout)
        // Calculate work duration up to the last scan
        console.log(
          `[Sync] Setting status to STOPPED (${empLogs.length} logs) - employee paused timer`
        );

        // Calculate total work duration by summing up all the intervals
        let totalWorkSeconds = attendance.workDuration || 0;

        // If currently working, add the time since last status change
        if (attendance.status === "working") {
          const workingSince = new Date(attendance.lastStatusChange);
          const stoppedAt = lastLog;
          const workDuration = Math.floor((stoppedAt - workingSince) / 1000);
          totalWorkSeconds += workDuration;

          console.log(
            `[Sync] Adding work duration: ${workDuration}s (from ${workingSince.toLocaleTimeString()} to ${stoppedAt.toLocaleTimeString()})`
          );
        }

        attendance.workDuration = totalWorkSeconds;
        attendance.status = "stopped";
        attendance.lastStatusChange = lastLog;

        console.log(
          `[Sync] Employee ${
            employee.fullName
          }: Timer stopped at ${lastLog.toLocaleTimeString()}, total work: ${
            attendance.workDuration
          }s`
        );
      }

      await attendance.save();
      console.log(`[Sync] ✅ Saved attendance for ${employee.fullName}`);
    }

    res.json({
      message: "Sync successful",
      logsProcessed: logs.length,
      newRecords: syncedCount,
      skipped: skippedCount,
    });
  } catch (error) {
    console.error("Sync Error:", error);
    res.status(500).json({
      message: "Failed to sync with machine",
      error: error.message,
      details:
        "Check server console for more information. Ensure the device is reachable and the IP/Port are correct.",
    });
  }
};
