import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import { useToast } from "../../../context/ToastContext";
import { useConfirm } from "../../../context/ConfirmContext";
import { useAuth } from "../../../context/AuthContext";
import { FaTrash } from "react-icons/fa";

const AdminAttendance = () => {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  // Settings & Holidays
  const [settings, setSettings] = useState({ weeklyOffs: [0] }); // Default Sunday
  const [holidays, setHolidays] = useState([]);
  const [configModalOpen, setConfigModalOpen] = useState(false);

  // Calendar Modal State
  const [selectedEmployeeForHistory, setSelectedEmployeeForHistory] =
    useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const fetchAttendance = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/attendance/all`);
      setAttendance(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      showToast("Error fetching attendance data", "error");
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const [settingsRes, holidaysRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/config`),
        axios.get(`${API_BASE_URL}/holidays`),
      ]);
      setSettings(settingsRes.data);
      setHolidays(holidaysRes.data);
    } catch (err) {
      console.error("Error fetching settings:", err);
      showToast("Error fetching settings", "error");
    }
  };

  useEffect(() => {
    fetchAttendance();
    fetchSettings();

    // Socket Listener for Real-time Updates
    const onAttendanceUpdate = (data) => {
      // console.log("[Admin Attendance] Socket update received:", data);
      fetchAttendance(); // Refresh table data
    };

    import("../../../socket").then(({ socket }) => {
      socket.on("attendance_update", onAttendanceUpdate);
    });

    // --- Live Ticker ---
    // This increments the duration locally so the UI feels real-time
    const ticker = setInterval(() => {
      setAttendance((prev) =>
        prev.map((att) => {
          const status = att.status?.toLowerCase();
          if (status === "working") {
            return { ...att, workDuration: (att.workDuration || 0) + 1 };
          } else if (status === "break") {
            const currentBreak = att.breakDuration || 0;
            if (currentBreak < 60) {
              return { ...att, breakDuration: currentBreak + 1 };
            }
          }
          return att;
        })
      );
    }, 1000);

    return () => {
      clearInterval(ticker);
      import("../../../socket").then(({ socket }) => {
        socket.off("attendance_update", onAttendanceUpdate);
      });
    };
  }, []);

  // --- Configuration Handlers ---
  const handleSaveSettings = async (data) => {
    try {
      // data can be array of offs, or object with ip/port/offs
      // If array, wrap it. If object, send as is.
      const payload = Array.isArray(data) ? { weeklyOffs: data } : data;
      await axios.put(`${API_BASE_URL}/config`, payload);
      fetchSettings();
      showToast("Settings saved successfully", "success");
    } catch (err) {
      console.error("Error saving settings:", err);
      showToast("Error saving settings", "error");
    }
  };

  const handleAddHoliday = async (name, date) => {
    try {
      await axios.post(`${API_BASE_URL}/holidays`, { name, date });
      fetchSettings();
      showToast("Holiday added successfully", "success");
    } catch (err) {
      console.error("Error adding holiday:", err);
      showToast("Error adding holiday", "error");
    }
  };

  const handleDeleteHoliday = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/holidays/${id}`);
      fetchSettings();
      showToast("Holiday deleted successfully", "success");
    } catch (err) {
      console.error("Error deleting holiday:", err);
      showToast("Error deleting holiday", "error");
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || seconds < 0) return "0h 0m 0s";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "--:--";
    return new Date(dateStr).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // --- Calendar Logic ---
  const handleViewHistory = async (employee) => {
    try {
      const empRes = await axios.get(
        `${API_BASE_URL}/employees/${employee.id}`
      );
      const fullEmployee = { ...employee, ...empRes.data.employee };

      setSelectedEmployeeForHistory(fullEmployee);

      const res = await axios.get(
        `${API_BASE_URL}/attendance/my/${employee.id}`
      );
      setHistoryData(res.data);
    } catch (error) {
      console.error("Error fetching history/details:", error);
      showToast("Error fetching employee history", "error");
    }
  };

  const closeHistoryModal = () => {
    setSelectedEmployeeForHistory(null);
    setHistoryData([]);
    setCurrentMonth(new Date()); // Reset to today
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentMonth(newDate);
  };

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = firstDayOfMonth.getDay(); // 0 is Sunday

    const days = [];
    // Padding for empty slots before first day
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-28 bg-gray-50/50"></div>);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Actual days
    for (let d = 1; d <= daysInMonth; d++) {
      const currentDayDate = new Date(year, month, d);
      const isFuture = currentDayDate > today;
      const isToday = currentDayDate.getTime() === today.getTime();

      // Joining Date Logic:
      // 1. Explicit joiningDate
      // 2. createdAt (Registration Date)
      // 3. Fallback to epoch 0
      let dateSource =
        selectedEmployeeForHistory?.joiningDate ||
        selectedEmployeeForHistory?.createdAt ||
        0;
      const joiningDate = new Date(dateSource);

      // Normalize joining date to start of day
      joiningDate.setHours(0, 0, 0, 0);

      // Find record
      const record = historyData.find((r) => {
        const rDate = new Date(r.date);
        return (
          rDate.getFullYear() === year &&
          rDate.getMonth() === month &&
          rDate.getDate() === d
        );
      });

      // --- Logic Decision Tree ---
      let statusColor = "bg-white border-gray-100 text-gray-400"; // Lighter default
      let statusText = "";
      let checkInTime = "";
      let checkOutTime = "";
      let durationStr = "";

      const dayOfWeek = currentDayDate.getDay();
      const isWeeklyOff = settings?.weeklyOffs?.includes(dayOfWeek);
      const holiday = holidays.find((h) => {
        const hDate = new Date(h.date);
        return (
          hDate.getFullYear() === year &&
          hDate.getMonth() === month &&
          hDate.getDate() === d
        );
      });

      // 1. Before Joining
      if (currentDayDate < joiningDate) {
        statusColor = "bg-gray-100/30 border-gray-100 text-gray-300";
        statusText = "Not Joined";
      }
      // 2. Record Exists (Present/Working/Leave)
      else if (record) {
        if (record.status === "working" || record.workDuration > 0) {
          statusColor =
            "bg-green-50/80 border-green-200 text-green-700 shadow-[inset_0_0_15px_rgba(34,197,94,0.05)]";
          statusText = "Present";
          if (record.firstCheckIn)
            checkInTime = formatTime(record.firstCheckIn);
          if (record.lastCheckOut)
            checkOutTime = formatTime(record.lastCheckOut);

          if (record.workDuration > 0) {
            const h = Math.floor(record.workDuration / 3600);
            const m = Math.floor((record.workDuration % 3600) / 60);
            durationStr = `${h}h ${m}m`;
          }

          // Late Check
          const checkIn = new Date(record.firstCheckIn);
          if (
            checkIn.getHours() > 9 ||
            (checkIn.getHours() === 9 && checkIn.getMinutes() > 30)
          ) {
            statusColor =
              "bg-yellow-50/80 border-yellow-200 text-yellow-700 shadow-[inset_0_0_15px_rgba(234,179,8,0.05)]";
            statusText = "Late";
          }
        } else if (record.status === "leave") {
          statusColor =
            "bg-blue-50/80 border-blue-200 text-blue-700 shadow-[inset_0_0_15px_rgba(59,130,246,0.05)]";
          statusText = "Leave";
        } else if (
          record.status === "checked-out" &&
          record.workDuration === 0
        ) {
          // Checked out without work - treat as absent if past
          if (!isFuture) {
            statusColor = "bg-red-50/80 border-red-200 text-red-700";
            statusText = "Absent";
          }
        }
      }
      // 3. Holiday (Show even for future)
      else if (holiday) {
        statusColor =
          "bg-pink-50/80 border-pink-200 text-pink-600 shadow-[inset_0_0_15px_rgba(236,72,153,0.05)]";
        statusText = holiday.name;
      }
      // 4. Weekly Off (Show even for future)
      else if (isWeeklyOff) {
        statusColor = "bg-indigo-50/50 border-indigo-100 text-indigo-400";
        statusText = "Weekly Off";
      }
      // 5. Future (Not Off, Not Holiday, No Record)
      else if (isFuture) {
        statusColor = "bg-white border-gray-100 text-gray-200";
        statusText = "";
      }
      // 6. Absent (Past, No Record, Not Off, Not Holiday)
      else {
        statusColor =
          "bg-red-50/80 border-red-200 text-red-700 shadow-[inset_0_0_15px_rgba(239,68,68,0.05)]";
        statusText = "Absent";
      }

      days.push(
        <div
          key={d}
          className={`h-28 p-3 border rounded-2xl flex flex-col justify-between text-[10px] transition-all hover:shadow-lg hover:-translate-y-1 ${statusColor} ${
            isToday
              ? "ring-2 ring-blue-500 ring-offset-2 scale-[1.02] z-10 bg-white"
              : ""
          }`}
        >
          <div className="flex justify-between items-start">
            <span
              className={`font-black text-sm ${
                isToday ? "text-blue-600" : "opacity-60"
              }`}
            >
              {d}
            </span>
            {statusText && (
              <span className="font-black uppercase tracking-widest text-[8px] px-2 py-0.5 rounded-full bg-white/50 border border-current/10">
                {statusText}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1 text-right w-full">
            {checkInTime && (
              <div className="flex justify-between w-full items-center">
                <span className="opacity-40 font-bold uppercase text-[7px] tracking-widest">
                  In
                </span>
                <span className="font-mono font-bold text-gray-700">
                  {checkInTime}
                </span>
              </div>
            )}

            {checkOutTime && (
              <div className="flex justify-between w-full items-center">
                <span className="opacity-40 font-bold uppercase text-[7px] tracking-widest">
                  Out
                </span>
                <span className="font-mono font-bold text-gray-700">
                  {checkOutTime}
                </span>
              </div>
            )}

            {durationStr && (
              <div className="mt-1 pt-1 border-t border-current/5 flex justify-between w-full items-center">
                <span className="opacity-40 font-bold uppercase text-[7px] tracking-widest">
                  Total
                </span>
                <span className="font-black font-mono text-green-600 text-[11px]">
                  {durationStr}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  if (loading && attendance.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-xl font-bold text-blue-600 animate-pulse">
          Loading Attendance Data...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* ================= HEADING ================= */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-blue-700">
            Attendance Report
          </h1>
          <p className="text-blue-400 mt-1 font-medium">
            Real-time attendance monitoring.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              const isConfirmed = await confirm(
                "Sync data from ZKTeco Machine (192.168.1.222)? This might take a moment.",
                "ZKTeco Machine Sync"
              );
              if (!isConfirmed) return;

              try {
                // You can make IP/Port dynamic by adding them to SettingsSchema later
                // For now, using defaults handled by backend
                showToast("Starting Sync...", "info");
                const res = await axios.post(`${API_BASE_URL}/attendance/sync`);
                const msg = `Sync Complete!\n\nProcessed: ${
                  res.data.logsProcessed
                } logs\nNew Records: ${res.data.newRecords}\nSkipped: ${
                  res.data.skipped || 0
                } (no matching employee)`;
                showToast(msg, "success");
                fetchAttendance();
              } catch (err) {
                console.error("Sync failed:", err);
                const errorMsg =
                  err.response?.data?.error ||
                  err.response?.data?.message ||
                  err.message ||
                  "Unknown error";
                showToast(`Sync failed: ${errorMsg}`, "error");
              }
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 border border-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-sm transition-all shadow-blue-500/20"
          >
            <span>🔄</span> Sync Machine
          </button>
          <button
            onClick={() => setConfigModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 shadow-sm transition-all"
          >
            <span>⚙️</span> Configuration
          </button>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-widest font-bold">
            <tr>
              <th className="px-6 py-4 text-center">#</th>
              <th className="px-6 py-4 text-left">Name</th>
              <th className="px-6 py-4 text-center">Status</th>
              <th className="px-6 py-4 text-center">Check-In</th>
              <th className="px-6 py-4 text-center">Working Time</th>
              <th className="px-6 py-4 text-center">Break</th>
              <th className="px-6 py-4 text-center">Check-Out</th>
              <th className="px-6 py-4 text-center">History</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {attendance.map((att, index) => (
              <tr
                key={att.id}
                className="hover:bg-blue-50/30 transition-colors"
              >
                <td className="px-6 py-4 text-center font-bold text-gray-500">
                  {index + 1}
                </td>
                <td className="px-6 py-4 font-bold text-gray-800">
                  {att.name}
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                      att.status === "working" || att.status === "Working"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : att.status === "break" || att.status === "Break"
                        ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                        : att.status === "Holiday"
                        ? "bg-pink-100 text-pink-700 border border-pink-200"
                        : att.status === "Weekly Off"
                        ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                        : att.status === "checked-out" ||
                          att.status === "Checked-out"
                        ? "bg-gray-100 text-gray-600 border border-gray-200"
                        : "bg-red-50 text-red-300 border border-red-100"
                    }`}
                  >
                    {att.status === "none"
                      ? "Not Started"
                      : att.attendance || att.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center font-medium text-gray-500">
                  {formatTime(att.firstCheckIn)}
                </td>
                <td className="px-6 py-4 text-center">
                  {(() => {
                    const seconds = att.workDuration || 0;
                    const h = Math.floor(seconds / 3600);
                    const m = Math.floor((seconds % 3600) / 60);
                    const s = Math.floor(seconds % 60);

                    const requiredSeconds = (att.requiredHours || 8) * 3600;
                    // Only show red/green if there is some activity or explicit check
                    // Actually, user wants to see "Short".
                    const isShort = seconds < requiredSeconds;

                    // For admin view, maybe we only highlight red if Checked-Out and Short?
                    // Or always? User instructions "color to show if its time is short or not" implies state.
                    // Matches Employee view logic: Always show red if under hours.

                    return (
                      <span
                        className={`font-mono font-bold ${
                          isShort ? "text-red-500" : "text-green-600"
                        }`}
                      >
                        {`${h}h ${m}m ${s}s`}
                      </span>
                    );
                  })()}
                </td>
                <td className="px-6 py-4 text-center font-mono text-purple-600">
                  {formatDuration(att.breakDuration)}
                </td>
                <td className="px-6 py-4 text-center font-medium text-gray-500">
                  {formatTime(att.lastCheckOut)}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleViewHistory(att)}
                    className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-bold text-xs transition-colors"
                  >
                    View History
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= CALENDAR MODAL ================= */}
      {selectedEmployeeForHistory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">
                  {selectedEmployeeForHistory.name}
                </h2>
                <p className="opacity-80 text-sm flex items-center gap-2">
                  Attendance History
                  <span className="ml-2 opacity-60 text-xs font-normal flex items-center gap-2">
                    Joined:{" "}
                    {new Date(
                      selectedEmployeeForHistory.joiningDate ||
                        selectedEmployeeForHistory.createdAt ||
                        0
                    ).toLocaleDateString()}
                  </span>
                </p>
              </div>
              <button
                onClick={closeHistoryModal}
                className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Controls */}
            <div className="p-4 flex justify-between items-center border-b border-gray-100">
              <button
                onClick={() => changeMonth(-1)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-600"
              >
                ← Prev
              </button>
              <h3 className="text-xl font-bold text-gray-800">
                {currentMonth.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <button
                onClick={() => changeMonth(1)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-600"
              >
                Next →
              </button>
            </div>

            {/* Grid Header */}
            <div className="grid grid-cols-7 bg-gray-50 text-center py-2 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>

            {/* Grid Body */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-7 gap-2">{renderCalendar()}</div>
            </div>

            {/* Legend */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-4 text-xs font-medium justify-center flex-wrap">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>{" "}
                Present
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div> Late
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div> Leave
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-pink-500"></div> Holiday
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-purple-300"></div>{" "}
                Weekly Off
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-400"></div> Absent
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= CONFIG MODAL ================= */}
      {configModalOpen && (
        <SettingsModal
          initialSettings={settings}
          holidays={holidays}
          onClose={() => setConfigModalOpen(false)}
          onSaveSettings={handleSaveSettings}
          onAddHoliday={handleAddHoliday}
          onDeleteHoliday={handleDeleteHoliday}
        />
      )}
    </div>
  );
};

// --- Sub-component for Settings Modal ---
const SettingsModal = ({
  initialSettings,
  holidays,
  onClose,
  onSaveSettings,
  onAddHoliday,
  onDeleteHoliday,
}) => {
  const [localOffs, setLocalOffs] = useState(initialSettings.weeklyOffs || []);
  const [machineIp, setMachineIp] = useState(
    initialSettings.machineIp || "192.168.1.222"
  );
  const [machinePort, setMachinePort] = useState(
    initialSettings.machinePort || 4370
  );
  const [newHolidayName, setNewHolidayName] = useState("");
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ text: "", type: "" });

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const toggleOff = (dayIndex) => {
    if (localOffs.includes(dayIndex)) {
      setLocalOffs(localOffs.filter((d) => d !== dayIndex));
    } else {
      setLocalOffs([...localOffs, dayIndex]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage({ text: "", type: "" });
    try {
      await onSaveSettings({
        weeklyOffs: localOffs,
        machineIp,
        machinePort: Number(machinePort),
      });
      setSaveMessage({
        text: "Settings saved successfully!",
        type: "success",
      });
      setTimeout(() => setSaveMessage({ text: "", type: "" }), 3000);
    } catch (err) {
      setSaveMessage({
        text: "Failed to save settings. Check DB connection.",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-200">
        {/* Compact Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Attendance Settings
            </h2>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
              Weekly Offs & Holidays
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors text-gray-400"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8 custom-scrollbar">
          {saveMessage.text && (
            <div
              className={`p-3 rounded-lg text-[10px] font-bold text-center border uppercase tracking-widest ${
                saveMessage.type === "success"
                  ? "bg-green-50 text-green-600 border-green-100"
                  : "bg-red-50 text-red-600 border-red-100"
              }`}
            >
              {saveMessage.text}
            </div>
          )}

          {/* Weekly Offs Section */}
          <section>
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
              Operational Days
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {dayNames.map((name, idx) => (
                <button
                  key={name}
                  onClick={() => toggleOff(idx)}
                  className={`px-2 py-2 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                    localOffs.includes(idx)
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {name.slice(0, 3)}
                </button>
              ))}
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className={`mt-4 w-full py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-[0.15em] text-white transition-all ${
                saving
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 shadow-md active:scale-[0.98]"
              }`}
            >
              {saving ? "Saving..." : "Apply Settings"}
            </button>
          </section>

          {/* Machine Connection Section */}
          <section>
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
              Biometric Device
            </h3>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">
                  IP Address
                </label>
                <input
                  type="text"
                  value={machineIp}
                  onChange={(e) => setMachineIp(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono outline-none focus:border-blue-500 transition-all"
                  placeholder="192.168.1.222"
                />
              </div>
              <div className="w-24">
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">
                  Port
                </label>
                <input
                  type="number"
                  value={machinePort}
                  onChange={(e) => setMachinePort(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono outline-none focus:border-blue-500 transition-all"
                  placeholder="4370"
                />
              </div>
            </div>
            <p className="text-[9px] text-gray-400 mt-2 ml-1">
              Configure ZKTeco attendance machine connection
            </p>
          </section>

          {/* Holidays Section */}
          <section>
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
              Public Holidays
            </h3>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6 space-y-3">
              <div className="grid grid-cols-1 gap-2">
                <input
                  type="text"
                  placeholder="Event Name (e.g. Eid)"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-blue-500 transition-all placeholder:text-gray-300"
                  value={newHolidayName}
                  onChange={(e) => setNewHolidayName(e.target.value)}
                />
                <input
                  type="date"
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold outline-none focus:border-blue-500 transition-all"
                  value={newHolidayDate}
                  onChange={(e) => setNewHolidayDate(e.target.value)}
                />
              </div>
              <button
                onClick={() => {
                  if (newHolidayName && newHolidayDate) {
                    onAddHoliday(newHolidayName, newHolidayDate);
                    setNewHolidayName("");
                    setNewHolidayDate("");
                  }
                }}
                className="w-full py-2 bg-gray-800 text-white rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-black transition-all"
              >
                + Add Exception
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              {holidays.length === 0 && (
                <div className="text-center py-6 text-gray-400 text-[10px] font-bold uppercase tracking-widest italic opacity-50">
                  No holidays recorded
                </div>
              )}
              {holidays.map((h) => (
                <div
                  key={h._id}
                  className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-500 flex items-center justify-center font-black text-xs">
                      {new Date(h.date).getDate()}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 text-[11px] uppercase tracking-tight">
                        {h.name}
                      </div>
                      <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                        {new Date(h.date).toLocaleDateString(undefined, {
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteHoliday(h._id)}
                    className="w-8 h-8 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-lg flex items-center justify-center transition-all border border-red-100"
                    title="Delete Exception"
                  >
                    <FaTrash size={10} />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminAttendance;
