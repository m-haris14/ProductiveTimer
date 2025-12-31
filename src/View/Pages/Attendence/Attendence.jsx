import React from "react";

const Attendance = () => {
  const attendanceData = [
    {
      date: "2025-01-01",
      checkIn: "09:05 AM",
      checkOut: "05:00 PM",
      status: "Present",
    },
    {
      date: "2025-01-02",
      checkIn: "09:30 AM",
      checkOut: "05:10 PM",
      status: "Late",
    },
    {
      date: "2025-01-03",
      checkIn: "-",
      checkOut: "-",
      status: "Leave",
    },
    {
      date: "2025-01-04",
      checkIn: "-",
      checkOut: "-",
      status: "Absent",
    },
    {
      date: "2025-01-05",
      checkIn: "09:00 AM",
      checkOut: "04:45 PM",
      status: "Present",
    },
  ];

  return (
    <div className="min-h-screen p-6 bg-linear-to-br from-[#0f1235] via-[#141857] to-[#1b1f6b] text-white">

      {/* ===== Page Header ===== */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Attendance</h1>
        <p className="text-gray-300 text-sm">
          Monthly attendance overview
        </p>
      </div>

      {/* ===== Admin Style Summary Cards ===== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">

        <AdminCard
          title="Present Days"
          value="20"
          // color="bg-blue-500/20 text-blue-400"
        />

        <AdminCard
          title="Absent Days"
          value="4"
          // color="bg-red-500/20 text-red-400"
        />

        <AdminCard
          title="Leaves"
          value="3"
          // color="bg-purple-500/20 text-purple-400"
        />

        <AdminCard
          title="Late Days"
          value="5"
          // color="bg-indigo-500/20 text-indigo-400"
        />

      </div>

      {/* ===== Attendance Table ===== */}
      <div className="bg-[#141857] rounded-2xl shadow-lg p-6">
        <h2 className="text-lg font-semibold mb-4">
          Attendance Details
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-300 border-b border-white/10">
                <th className="py-3">Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {attendanceData.map((item, index) => (
                <tr
                  key={index}
                  className="border-b border-white/5 hover:bg-white/5 transition"
                >
                  <td className="py-3">{item.date}</td>
                  <td>{item.checkIn}</td>
                  <td>{item.checkOut}</td>
                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === "Present"
                          ? "bg-green-500/20 text-green-400"
                          : item.status === "Late"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : item.status === "Leave"
                          ? "bg-purple-500/20 text-purple-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
};

/* ===== Admin Style Card ===== */
const AdminCard = ({ title, value, color }) => (
  <div className="bg-[#141857] rounded-2xl p-6 shadow-lg flex items-center gap-5">

    {/* Left Colored Box */}
    <div
      className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold ${color}`}
    >
      {value}
    </div>

    {/* Right Content */}
    <div>
      <h3 className="text-sm text-gray-300">{title}</h3>
      <p className="text-xs text-gray-400 mt-1">
        This Month
      </p>
    </div>

  </div>
);

export default Attendance;
