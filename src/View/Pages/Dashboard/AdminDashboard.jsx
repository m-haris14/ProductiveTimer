import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../config";

const AdminDashboard = () => {
  const [statsData, setStatsData] = useState({
    totalEnrollments: 0,
    active: 0,
    idle: 0,
    offline: 0,
    absent: 0,
    suspended: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/admin/stats`);
        setStatsData(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching admin stats:", err);
        setLoading(false);
      }
    };

    fetchStats();

    // Socket Listener for Real-time Updates
    const onAttendanceUpdate = (data) => {
      console.log("[Admin Dashboard] Socket update received:", data);
      fetchStats();
    };

    import("../../../socket").then(({ socket }) => {
      socket.on("attendance_update", onAttendanceUpdate);
    });

    const interval = setInterval(fetchStats, 30000); // 30s polling fallback
    return () => {
      clearInterval(interval);
      import("../../../socket").then(({ socket }) => {
        socket.off("attendance_update", onAttendanceUpdate);
      });
    };
  }, []);

  const stats = [
    {
      title: "Total Enrollments",
      value: statsData.totalEnrollments,
      color: "from-purple-500 to-blue-400",
    },
    {
      title: "Currently Active",
      value: statsData.active,
      color: "from-pink-500 to-purple-400",
    },
    {
      title: "Currently Idle",
      value: statsData.idle,
      color: "from-green-400 to-teal-400",
    },
    {
      title: "Currently Offline",
      value: statsData.offline,
      color: "from-orange-400 to-yellow-400",
    },
    {
      title: "Absent",
      value: statsData.absent,
      color: "from-red-400 to-pink-400",
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Title */}
      <h1 className="text-4xl font-bold text-blue-700">
        Admin Dashboard
        <p className="text-blue-400 text-base mb-8 font-normal">
          You Can See About Our Company Activity
        </p>
      </h1>

      {/* Top Cards */}
      <div className="flex justify-between gap-4 mt-4 mb-6">
        {stats.map((item, index) => (
          <div
            key={index}
            className={`w-full rounded-xl p-5 text-white bg-linear-to-br ${item.color} shadow-lg shadow-indigo-500/10 transform hover:-translate-y-1 transition-all duration-300`}
          >
            <h2 className="text-3xl font-black">{item.value}</h2>
            <p className="text-xs font-bold uppercase tracking-wider opacity-80 mt-1">
              {item.title}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Donut Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 lg:col-span-4">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 text-center">
            Activity Snapshot
          </h2>

          <div className="flex justify-center items-center py-4">
            <div
              className="relative w-48 h-48 rounded-full shadow-inner
              bg-[conic-gradient(#3b82f6_0deg_180deg,#eab308_180deg_270deg,#22c55e_270deg_360deg)]"
            >
              <div className="absolute inset-10 bg-white rounded-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">
                    Live
                  </p>
                  <p className="text-xl font-black text-blue-600">Active</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-4 text-[10px] font-bold uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span> Working
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Break
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Idle
            </div>
          </div>
        </div>

        {/* Activity Breakdown Table */}
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 lg:col-span-8">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 text-center">
            Activity Summary
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-600">
              <thead>
                <tr className="bg-gray-50 text-blue-600 text-[11px] font-black uppercase tracking-wider">
                  <th className="p-4 text-left">Metric</th>
                  <th className="p-4 text-center">Current Total</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-50">
                {[
                  ["Total Workforce", statsData.totalEnrollments, "Enrolled"],
                  ["Active Sessions", statsData.active, "Live Now"],
                  ["Idle Employees", statsData.idle, "Paused"],
                  ["Offline Users", statsData.offline, "Inactive"],
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 font-bold text-blue-500">{row[0]}</td>
                    <td className="p-4 text-center font-black text-gray-800 text-lg">
                      {row[1]}
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase">
                        {row[2]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
