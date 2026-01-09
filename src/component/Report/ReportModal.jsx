import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const ReportModal = ({ employee, onClose }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (employee?._id) {
      axios
        .get(`${API_BASE_URL}/stats/report/${employee._id}`)
        .then((res) => {
          setStats(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [employee]);

  if (!employee) return null;

  const trendData = stats
    ? {
        labels: stats.attendance.trend.map((t) => t.date),
        datasets: [
          {
            label: "Productive",
            data: stats.attendance.trend.map((t) => t.workHrs),
            backgroundColor: "#00d2ff", // Vibrant Cyan
            borderRadius: 4,
            stack: "stack0",
          },
          {
            label: "Break",
            data: stats.attendance.trend.map((t) => t.breakHrs),
            backgroundColor: "#ff0080", // Vibrant Magenta
            borderRadius: 4,
            stack: "stack0",
          },
        ],
      }
    : null;

  const trendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
        labels: {
          color: "#94a3b8",
          font: { size: 10, weight: "bold" },
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { color: "#ffffff", font: { size: 10, weight: "bold" } },
      },
      y: {
        stacked: true,
        grid: { color: "rgba(255,255,255,0.1)" },
        ticks: { color: "#ffffff", font: { size: 10, weight: "bold" } },
      },
    },
  };

  const donutData = stats
    ? {
        labels: stats.tasks.projectAllocation.map((p) => p.name),
        datasets: [
          {
            data: stats.tasks.projectAllocation.map((p) => p.totalSeconds),
            backgroundColor: [
              "#00d2ff", // Cyan
              "#ff0080", // Magenta
              "#7cfc00", // LawnGreen
              "#ffcc00", // Amber
              "#9d50bb", // Purpleish
              "#3a1c71", // Deep Navy
            ],
            borderWidth: 0,
            cutout: "70%",
          },
        ],
      }
    : null;

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "#ffffff",
          font: { size: 10, weight: "black" },
          padding: 15,
        },
      },
    },
  };

  const todayWorkHrs = stats
    ? (stats.attendance.todayWork / 3600).toFixed(1)
    : 0;
  const todayGoal = stats ? stats.attendance.todayRequired || 8 : 8;
  const goalPercentage = stats
    ? Math.min(100, Math.round((todayWorkHrs / todayGoal) * 100))
    : 0;

  const formatSecs = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const monthly = stats?.attendance?.monthly || {
    workSeconds: 0,
    breakSeconds: 0,
    requiredSeconds: 0,
    deficitSeconds: 0,
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-[#0a0c2e] w-full max-w-5xl rounded-4xl shadow-2xl p-0 max-h-[92vh] flex flex-col overflow-hidden text-white border border-white/10">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#141843]/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-[#5aa9ff] to-[#8b5cf6] flex items-center justify-center text-white font-black text-2xl shadow-lg border border-white/10">
              {employee.fullName.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight drop-shadow-sm">
                {employee.fullName}
              </h2>
              <p className="text-[10px] font-black text-[#5aa9ff] uppercase tracking-[0.2em] mt-0.5 opacity-80">
                {employee.designation} • {employee.department}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 text-xl font-light hover:rotate-90"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar space-y-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
              <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">
                Calibrating Data...
              </p>
            </div>
          ) : !stats ? (
            <div className="text-center text-slate-500 py-20 uppercase font-black tracking-widest text-xs">
              Protocol Error: Data Link Severed
            </div>
          ) : (
            <>
              {/* Top Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-4 bg-linear-to-br from-purple-500 to-blue-400 p-8 text-center relative overflow-hidden group shadow-2xl rounded-3xl transform hover:-translate-y-1 transition-all">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-all"></div>
                  <h3 className="text-6xl font-black text-white mb-2 drop-shadow-md">
                    {todayWorkHrs}
                  </h3>
                  <p className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em]">
                    Productive Hrs Today
                  </p>
                </div>

                <div className="md:col-span-8 bg-linear-to-br from-pink-500 to-purple-400 p-8 shadow-2xl rounded-3xl relative overflow-hidden group transform hover:-translate-y-1 transition-all">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
                      Real-time Performance Goal
                    </h3>
                    <span className="text-[10px] font-black text-white bg-white/20 px-3 py-1 rounded-full border border-white/30">
                      {goalPercentage}% Achieved
                    </span>
                  </div>
                  <div className="h-4 w-full bg-black/20 rounded-full overflow-hidden border border-white/20 shadow-inner">
                    <div
                      className="h-full bg-white transition-all duration-1000 relative shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                      style={{ width: `${goalPercentage}%` }}
                    ></div>
                  </div>
                  <div className="mt-6 flex justify-between text-[8px] font-black text-white/70 uppercase tracking-[0.2em]">
                    <span>0h Daily Start</span>
                    <span className="text-white/90">
                      {todayGoal}h Target Peak
                    </span>
                  </div>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 p-8 shadow-2xl rounded-3xl relative overflow-hidden transform hover:-translate-y-1 transition-all">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">
                    5-Day Activity Breakdown
                  </h3>
                  <div className="h-64">
                    <Bar data={trendData} options={trendOptions} />
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/10 p-8 shadow-2xl rounded-3xl relative overflow-hidden transform hover:-translate-y-1 transition-all">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">
                    Resource Allocation
                  </h3>
                  <div className="h-64 relative">
                    <Doughnut data={donutData} options={donutOptions} />
                  </div>
                </div>
              </div>

              {/* Monthly Performance Row */}
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 shadow-2xl rounded-3xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[#5aa9ff] via-[#8b5cf6] to-[#5aa9ff] opacity-60"></div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-[#8b5cf6] shadow-[0_0_10px_rgba(139,92,246,0.8)]"></span>
                  Projected Monthly Insights
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                  {[
                    {
                      label: "Work Total",
                      val: formatSecs(monthly.workSeconds),
                      sub: "Productive",
                      gradient: "from-blue-600 to-indigo-500",
                    },
                    {
                      label: "Rest Total",
                      val: formatSecs(monthly.breakSeconds),
                      sub: "Breaks Taken",
                      gradient: "from-purple-600 to-pink-500",
                    },
                    {
                      label: "Expected",
                      val: formatSecs(monthly.requiredSeconds),
                      sub: "Goal Baseline",
                      gradient: "from-slate-700 to-slate-800",
                    },
                    {
                      label: "Deficit",
                      val: formatSecs(monthly.deficitSeconds),
                      sub: "Shift Shortage",
                      gradient: "from-red-600 to-orange-500",
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-6 rounded-2xl bg-linear-to-br ${item.gradient} shadow-lg transform hover:-translate-y-1 transition-all duration-300 group`}
                    >
                      <p className="text-[8px] font-black text-white/70 uppercase tracking-[0.2em] mb-4 group-hover:text-white transition-colors">
                        {item.label}
                      </p>
                      <div className="flex flex-col">
                        <span
                          className={`text-2xl font-black text-white tracking-tight drop-shadow-sm`}
                        >
                          {item.val}
                        </span>
                        <span className="text-[7px] font-bold text-white/60 uppercase tracking-tighter mt-2 leading-none">
                          {item.sub}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attendance Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: "Leaves",
                    val: stats.attendance.leaves,
                    color: "from-red-500 to-pink-500",
                  },
                  {
                    label: "Days Late",
                    val: stats.attendance.late,
                    color: "from-orange-500 to-yellow-500",
                  },
                  {
                    label: "Performance %",
                    val: `${stats.attendance.percentage}%`,
                    color: "from-blue-500 to-cyan-400",
                  },
                  {
                    label: "Task Backlog",
                    val: stats.tasks.pending,
                    color: "from-purple-500 to-pink-500",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`bg-linear-to-br ${item.color} p-6 flex flex-col items-center justify-center rounded-3xl shadow-xl transform hover:-translate-y-1 transition-all group`}
                  >
                    <p className="text-[8px] font-black text-white/80 uppercase tracking-[0.2em] mb-2 group-hover:text-white transition-colors text-center">
                      {item.label}
                    </p>
                    <p
                      className={`text-2xl font-black text-white group-hover:scale-110 transition-transform drop-shadow-md`}
                    >
                      {item.val}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
