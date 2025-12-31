import React from "react";

const AdminDashboard = () => {
  const stats = [
    { title: "Total Enrollments", value: 93, color: "from-purple-500 to-blue-400" },
    { title: "Currently Active", value: 1, color: "from-pink-500 to-purple-400" },
    { title: "Currently Idle", value: 0, color: "from-green-400 to-teal-400" },
    { title: "Currently Offline", value: 6, color: "from-orange-400 to-yellow-400" },
    { title: "Absent", value: 85, color: "from-red-400 to-pink-400" },
    { title: "Suspended", value: 1, color: "from-sky-400 to-blue-500" },
  ];

  return (
    <div className="p-6 bg-[#f3f4f6] min-h-screen">

      {/* Title */}
      <h1 className="text-4xl font-bold text-blue-700">
        Admin Dashboard
      <p className="text-blue-400 text-base mb-8 font-normal">You Can See About Our Compnay</p>
      </h1>

      {/* Top Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mt-4 mb-6">
        {stats.map((item, index) => (
          <div
            key={index}
            className={`rounded-lg p-4 text-white bg-linear-to-r ${item.color} shadow`}
          >
            <h2 className="text-3xl font-bold">{item.value}</h2>
            <p className="text-sm opacity-90">{item.title}</p>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Donut Chart (SMALLER) */}
        <div className="bg-white rounded-lg p-4 shadow lg:col-span-4">
          <h2 className="text-sm font-medium text-blue-600 mb-4 text-center">
            Today Activity Snapshot
          </h2>

          <div className="flex justify-center items-center">
            <div
              className="relative w-48 h-48 rounded-full
              bg-[conic-gradient(#2563eb_0deg_240deg,#eab308_240deg_300deg,#22c55e_300deg_360deg)]"
            >
              <div className="absolute inset-6 bg-white rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Activity Breakdown Table (BIGGER) */}
        <div className="bg-white rounded-lg p-4 shadow lg:col-span-8">
          <h2 className="text-sm font-medium text-blue-600 mb-4 text-center">
            Activity Break Down
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-600">
              <thead>
                <tr className="bg-gray-100 text-blue-600">
                  <th className="p-2 text-left">Activity</th>
                  <th className="p-2">Today</th>
                  <th className="p-2">Yesterday</th>
                  <th className="p-2">This week</th>
                </tr>
              </thead>

              <tbody>
                {[
                  ["Office Hours", "31:32:02 hr", "58:42:53 hr", "113:10:39 hr"],
                  ["Active Hours", "01:09:43 hr (3.68%)", "00:42:15 hr (1.82%)", "03:32:20 hr (3.13%)"],
                  ["Idle Hours", "30:22:19 hr (96.32%)", "58:00:38 hr (98.18%)", "109:38:19 hr (96.87%)"],
                  ["Productive Hours", "01:03:11 hr (5.04%)", "00:39:16 hr (3.72%)", "03:03:47 hr (3.14%)"],
                  ["Non-Productive Hours", "00:00:00 hr (0.00%)", "00:00:00 hr (0.00%)", "00:01:44 hr (0.18%)"],
                  ["Neutral Hours", "00:06:32 hr (1.56%)", "00:02:59 hr (2.49%)", "00:26:49 hr (2.81%)"],
                ].map((row, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-2 text-blue-500">{row[0]}</td>
                    <td className="p-2 text-center">{row[1]}</td>
                    <td className="p-2 text-center">{row[2]}</td>
                    <td className="p-2 text-center">{row[3]}</td>
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
