import React from "react";

const Dashboard = () => {
  return (
    <div className="h-screen flex text-white">
      <div className="flex-1">
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-[#141843] rounded-2xl p-6 shadow-[0_0_40px_rgba(90,169,255,0.35)]">
            <h2 className="text-lg mb-4">⏱ Timer</h2>

            <div className="text-center">
              <h1 className="text-5xl font-bold">00:42:35</h1>
              <p className="mt-2 opacity-70">Working on: New Design</p>
            </div>

            <div className="flex gap-4 mt-6">
              <button className="flex-1 py-3 rounded-xl bg-linear-to-r from-[#5aa9ff] to-[#3b82f6]">
                ⏸
              </button>
              <button className="flex-1 py-3 rounded-xl bg-linear-to-r from-[#7c3aed] to-[#8b5cf6]">
                ⏹
              </button>
            </div>
          </div>

          <div className="bg-[#141843] rounded-2xl p-6 shadow-[0_0_40px_rgba(90,169,255,0.35)]">
            <h2 className="text-lg mb-6">Productivity Stats</h2>

            <div className="flex justify-around">
              <div className="text-center">
                <svg width="120" height="120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#1e245c"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#5aa9ff"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray="314"
                    strokeDashoffset="50"
                    strokeLinecap="round"
                  />
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="22"
                  >
                    84
                  </text>
                </svg>
                <p className="mt-2">Today</p>
              </div>
              <div className="text-center">
                <svg width="120" height="120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#1e245c"
                    strokeWidth="10"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#8b5cf6"
                    strokeWidth="10"
                    fill="none"
                    strokeDasharray="314"
                    strokeDashoffset="30"
                    strokeLinecap="round"
                  />
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="22"
                  >
                    90
                  </text>
                </svg>
                <p className="mt-2">This Week</p>
              </div>
            </div>

            <p className="mt-6 text-center opacity-70">27 hrs Worked</p>
          </div>
        </div>

        <div className="mt-6 bg-[#141843] rounded-2xl p-6 shadow-[0_0_40px_rgba(90,169,255,0.35)]">
          <h2 className="text-xl mb-4 ">Task Overview</h2>

          <table className="w-full text-sm">
            <thead className="opacity-60">
              <tr className="text-left text-lg">
                <th>Task</th>
                <th>Status</th>
                <th>Time</th>
                <th>View</th>
              </tr>
            </thead>

            <tbody>
              {[
                ["UI Design", "In Progress", "2 hrs 15 mins"],
                ["Code Review", "Completed", "1 hr 10 mins"],
                ["Meeting with Team", "In Progress", "45 mins"],
                ["Test New Feature", "Pending", "30 mins"],
              ].map((t, i) => (
                <tr key={i} className="border-t border-white/10">
                  <td className="py-3">{t[0]}</td>
                  <td>{t[1]}</td>
                  <td>{t[2]}</td>
                  <td>
                    <button className="px-4 py-1 rounded-lg bg-linear-to-r from-[#5aa9ff] to-[#8b5cf6] cursor-pointer">
                      View
                    </button>
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

export default Dashboard;
