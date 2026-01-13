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
  const [pendingIdleRequests, setPendingIdleRequests] = useState([]);
  const [loadingIdle, setLoadingIdle] = useState(false);

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

    const fetchPendingIdleRequests = async () => {
      try {
        setLoadingIdle(true);
        const res = await axios.get(`${API_BASE_URL}/admin/idle/pending`);
        setPendingIdleRequests(res.data);
        setLoadingIdle(false);
      } catch (err) {
        console.error("Error fetching pending idle requests:", err);
        setLoadingIdle(false);
      }
    };

    fetchStats();
    fetchPendingIdleRequests();

    // Socket Listener for Real-time Updates
    const onAttendanceUpdate = (data) => {
      console.log("[Admin Dashboard] Socket update received:", data);
      fetchStats();
    };

    const onIdleRequestCreated = (data) => {
      console.log("[Admin Dashboard] New idle request:", data);
      fetchPendingIdleRequests();
    };

    const onIdleApprovalUpdate = (data) => {
      console.log("[Admin Dashboard] Idle approval update:", data);
      fetchPendingIdleRequests();
      fetchStats(); // Refresh stats after approval
    };

    import("../../../socket").then(({ socket }) => {
      socket.on("attendance_update", onAttendanceUpdate);
      socket.on("idle_request_created", onIdleRequestCreated);
      socket.on("idle_approval_update", onIdleApprovalUpdate);
    });

    const interval = setInterval(fetchStats, 30000); // 30s polling fallback
    return () => {
      clearInterval(interval);
      import("../../../socket").then(({ socket }) => {
        socket.off("attendance_update", onAttendanceUpdate);
        socket.off("idle_request_created", onIdleRequestCreated);
        socket.off("idle_approval_update", onIdleApprovalUpdate);
      });
    };
  }, []);

  const handleIdleApproval = async (idleId, approved) => {
    try {
      const adminId = localStorage.getItem("userId"); // Get admin ID from localStorage
      await axios.post(`${API_BASE_URL}/admin/idle/approve/${idleId}`, {
        approved,
        adminId,
      });
      // Refresh the list
      const res = await axios.get(`${API_BASE_URL}/admin/idle/pending`);
      setPendingIdleRequests(res.data);
    } catch (err) {
      console.error("Error handling idle approval:", err);
      alert(err.response?.data?.message || "Failed to process request");
    }
  };

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

        {/* Donut Chart */}<div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 lg:col-span-4">
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
      <div>
        {pendingIdleRequests.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    ⚠️
                  </div>
                  <div>
                    <h2 className="text-sm font-black text-gray-800 uppercase tracking-widest">
                      Action Required
                    </h2>
                    <p className="text-xs text-gray-500 font-bold">Pending Idle Requests</p>
                  </div>
                </div>
                <span className="px-4 py-1.5 bg-orange-500 text-white rounded-full text-xs font-black shadow-lg shadow-orange-500/30">
                  {pendingIdleRequests.length} REQUESTS
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-gray-100">
                <table className="w-full text-sm text-gray-600">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-[11px] font-black uppercase tracking-wider">
                      <th className="p-4 text-left">Employee</th>
                      <th className="p-4 text-left">Details</th>
                      <th className="p-4 text-left">Reason</th>
                      <th className="p-4 text-center">Duration</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-50 bg-white">
                    {loadingIdle ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-400 font-bold">
                          Loading...
                        </td>
                      </tr>
                    ) : (
                      pendingIdleRequests.map((request) => (
                        <tr key={request._id} className="hover:bg-orange-50/50 transition-colors group">
                          <td className="p-4">
                            <div className="font-black text-gray-800">{request.employeeName}</div>
                            <div className="text-[10px] uppercase font-bold text-gray-400">{request.department}</div>
                          </td>
                          <td className="p-4 text-xs font-bold text-gray-400">
                            {new Date(request.startTime).toLocaleTimeString()}
                          </td>
                          <td className="p-4 max-w-xs">
                            <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 text-xs font-bold text-gray-600 italic">
                              "{request.reason}"
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className="font-black text-lg text-orange-500">
                              {Math.floor(request.duration / 60)}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase ml-1">min</span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-3 justify-center">
                              <button
                                onClick={() => handleIdleApproval(request._id, true)}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-black shadow-lg shadow-green-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                              >
                                <span>APPROVE</span>
                              </button>
                              <button
                                onClick={() => handleIdleApproval(request._id, false)}
                                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl text-xs font-black active:scale-95 transition-all cursor-pointer"
                              >
                                REJECT
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
