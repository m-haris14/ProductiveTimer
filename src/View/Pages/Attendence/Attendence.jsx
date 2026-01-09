import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import { useAuth } from "../../../context/AuthContext";
import AttendenceCard from "../../../component/Attendence/AttendenceCard";

const Attendance = () => {
  const { user } = useAuth();
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    leaves: 0,
    late: 0,
  });

  useEffect(() => {
    if (user?._id) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch History
      const historyRes = await axios.get(
        `${API_BASE_URL}/attendance/my/${user._id}`
      );
      setAttendanceHistory(historyRes.data);

      // Fetch Stats
      const statsRes = await axios.get(
        `${API_BASE_URL}/stats/report/${user._id}`
      );

      setStats({
        present: historyRes.data.filter(
          (r) => r.status === "working" || r.status === "checked-out"
        ).length,
        absent: 0, // Placeholder
        leaves: statsRes.data.attendance.leaves,
        late: statsRes.data.attendance.late,
      });
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString) => {
    // Keep date format simple as per original design or standard YYYY-MM-DD
    // Original was "2025-01-01", let's match that style or readable date
    return new Date(dateString).toLocaleDateString("en-CA"); // YYYY-MM-DD format
  };

  return (
    <div className="text-white">
      <div className="w-full flex gap-6 mb-8">
        <AttendenceCard
          title="Present Days"
          value={stats.present}
          color="bg-blue-500/20 text-blue-400"
        />

        <AttendenceCard
          title="Absent Days"
          value={stats.absent}
          color="bg-red-500/20 text-red-400"
        />

        <AttendenceCard
          title="Leaves"
          value={stats.leaves}
          color="bg-purple-500/20 text-purple-400"
        />

        <AttendenceCard
          title="Late Days"
          value={stats.late}
          color="bg-indigo-500/20 text-indigo-400"
        />
      </div>

      {/* ===== Attendance Table ===== */}
      <div className="bg-[#141857] rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Attendance Details</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-300 border-b border-white/10">
                <th className="py-3">Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Total Work</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {attendanceHistory.length > 0 ? (
                attendanceHistory.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="py-3">{formatDate(item.date)}</td>
                    <td>{formatTime(item.firstCheckIn)}</td>
                    <td>{formatTime(item.lastCheckOut)}</td>
                    <td>
                      {(() => {
                        const seconds = item.workDuration || 0;
                        const h = Math.floor(seconds / 3600);
                        const m = Math.floor((seconds % 3600) / 60);
                        const s = Math.floor(seconds % 60);

                        const requiredSeconds =
                          (item.requiredHours || 8) * 3600;
                        const isShort = seconds < requiredSeconds;

                        return (
                          <span
                            className={`font-bold ${
                              isShort ? "text-red-400" : "text-green-400"
                            }`}
                          >
                            {`${h}h ${m}m ${s}s`}
                          </span>
                        );
                      })()}
                    </td>
                    <td>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          item.status === "working" ||
                          item.status === "checked-out"
                            ? "bg-green-500/20 text-green-400"
                            : item.status === "late"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : item.status === "leave"
                            ? "bg-purple-500/20 text-purple-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {/* Map internal status to display status if needed */}
                        {item.status === "working" ||
                        item.status === "checked-out"
                          ? "Present"
                          : item.status.charAt(0).toUpperCase() +
                            item.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-4 text-center text-gray-400">
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;
