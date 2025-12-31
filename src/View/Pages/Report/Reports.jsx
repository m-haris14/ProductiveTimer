import React from "react";

const Reports = () => {
  return (
    <div className="p-6 min-h-screen bg-[#0b1028] text-gray-200">
      {/* Page Title */}
      <h1 className="text-2xl font-semibold mb-6">Reports</h1>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* ================= TASKS REPORT ================= */}
        <div className="bg-[#121845] rounded-2xl p-6 shadow-[0_0_40px_rgba(99,102,241,0.25)]">
          <h2 className="text-lg font-semibold mb-5">Tasks Report</h2>

          {/* Top Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#0f153a] rounded-xl p-4 border border-white/5">
              <p className="text-sm text-gray-400">
                Completed This Month
              </p>
              <h3 className="text-2xl font-bold text-blue-400">
                20
              </h3>
            </div>

            <div className="bg-[#0f153a] rounded-xl p-4 border border-white/5">
              <p className="text-sm text-gray-400">
                Completed This Week
              </p>
              <h3 className="text-2xl font-bold text-purple-400">
                5
              </h3>
            </div>

            <div className="bg-[#0f153a] rounded-xl p-4 border border-white/5">
              <p className="text-sm text-gray-400">
                Pending Tasks
              </p>
              <h3 className="text-2xl font-bold text-yellow-400">
                4
              </h3>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-[#0f153a] rounded-xl p-4 border border-white/5">
            <p className="text-sm text-gray-400 mb-4">
              Weekly Completed Tasks
            </p>

            <div className="h-48 flex items-end gap-4">
              {[8, 12, 13, 15, 14].map((value, index) => (
                <div
                  key={index}
                  className="flex-1 flex flex-col items-center"
                >
                  <div
                    className="w-full rounded-lg bg-linear-to-t from-blue-500 to-purple-500"
                    style={{ height: `${value * 10}px` }}
                  />
                  <span className="text-xs mt-2 text-gray-400">
                    Week {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= ATTENDANCE REPORT ================= */}
        <div className="bg-[#121845] rounded-2xl p-6 shadow-[0_0_40px_rgba(139,92,246,0.25)]">
          <h2 className="text-lg font-semibold mb-5">
            Attendance Report
          </h2>

          {/* Attendance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-[#0f153a] rounded-xl p-4 border border-white/5">
              <p className="text-sm text-gray-400">
                Total Leaves Taken
              </p>
              <h3 className="text-2xl font-bold text-red-400">
                2
              </h3>
            </div>

            <div className="bg-[#0f153a] rounded-xl p-4 border border-white/5">
              <p className="text-sm text-gray-400">
                Remaining Leaves
              </p>
              <h3 className="text-2xl font-bold text-green-400">
                8
              </h3>
            </div>

            <div className="bg-[#0f153a] rounded-xl p-4 border border-white/5">
              <p className="text-sm text-gray-400">
                Days Late
              </p>
              <h3 className="text-2xl font-bold text-orange-400">
                3
              </h3>
            </div>

            <div className="bg-[#0f153a] rounded-xl p-4 border border-white/5">
              <p className="text-sm text-gray-400">
                Days Left Early
              </p>
              <h3 className="text-2xl font-bold text-purple-400">
                1
              </h3>
            </div>
          </div>

          {/* Circular Chart */}
          <div className="bg-[#0f153a] rounded-xl p-6 border border-white/5 flex items-center justify-center">
            <div className="relative w-44 h-44 rounded-full
              bg-linear-to-tr from-blue-500 via-purple-500 to-pink-500
              flex items-center justify-center">
              
              <div className="w-28 h-28 rounded-full bg-[#121845]
                flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">
                  80%
                </span>
                <span className="text-xs text-gray-400">
                  Present
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
