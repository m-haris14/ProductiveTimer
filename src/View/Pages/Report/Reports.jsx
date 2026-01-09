import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import { useAuth } from "../../../context/AuthContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Reports = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user?._id) {
      axios
        .get(`${API_BASE_URL}/stats/report/${user._id}`)
        .then((res) => setStats(res.data))
        .catch((err) => console.error(err));
    }
  }, [user]);

  if (!stats)
    return (
      <div className="min-h-screen bg-[#0f153a] flex items-center justify-center p-6">
        <div className="text-white font-black animate-pulse uppercase tracking-[0.3em] text-xs">
          Loading Analytics...
        </div>
      </div>
    );

  const { tasks, attendance } = stats;

  // Chart 1: Activity Type Trend (Stacked Bar)
  const trendData = {
    labels: attendance.trend.map((t) => t.date),
    datasets: [
      {
        label: "Productive",
        data: attendance.trend.map((t) => t.workHrs),
        backgroundColor: "#00d2ff", // Vibrant Cyan
        borderRadius: 4,
        stack: "stack0",
      },
      {
        label: "Break",
        data: attendance.trend.map((t) => t.breakHrs),
        backgroundColor: "#ff0080", // Vibrant Magenta
        borderRadius: 4,
        stack: "stack0",
      },
    ],
  };

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

  // Chart 2: Category Allocation (Donut)
  const donutData = {
    labels: tasks.projectAllocation.map((p) => p.name),
    datasets: [
      {
        data: tasks.projectAllocation.map((p) => p.totalSeconds),
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
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "#ffffff",
          font: { size: 10, weight: "black" },
          padding: 20,
        },
      },
    },
  };

  const todayWorkHrs = (attendance.todayWork / 3600).toFixed(1);
  const todayGoal = attendance.todayRequired || 8;
  const goalPercentage = Math.min(
    100,
    Math.round((todayWorkHrs / todayGoal) * 100)
  );

  const formatSecs = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const monthly = attendance.monthly || {
    workSeconds: 0,
    breakSeconds: 0,
    requiredSeconds: 0,
    deficitSeconds: 0,
  };

  return (
    <div className=" text-white space-y-8 animate-fadeIn">
      {/* Header Stat row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Metric 1: Productive Hrs/Day */}
        <div className="lg:col-span-3 bg-linear-to-br from-purple-500 to-blue-400 p-6 flex flex-col items-center justify-center text-center shadow-xl shadow-blue-500/20 rounded-2xl relative overflow-hidden group transform hover:-translate-y-1 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-all"></div>
          <h2 className="text-6xl font-black text-white mb-2 drop-shadow-md">
            {todayWorkHrs}
          </h2>
          <p className="text-[10px] font-black text-white/80 uppercase tracking-[0.2em] mb-6">
            Productive Hrs Today
          </p>
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/30 backdrop-blur-sm">
            <span className="text-white text-[9px] font-black uppercase tracking-widest">
              Daily Target: {todayGoal}h
            </span>
          </div>
        </div>

        {/* Metric 2: Activity vs Goal Gauge */}
        <div className="lg:col-span-4 bg-linear-to-br from-pink-500 to-purple-400 p-6 shadow-xl shadow-purple-500/20 rounded-2xl relative overflow-hidden group transform hover:-translate-y-1 transition-all">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80">
              Daily Output Progress
            </h3>
            <span className="text-[10px] font-black text-white bg-white/20 px-3 py-1 rounded-full border border-white/30">
              {goalPercentage}% Complete
            </span>
          </div>

          <div className="relative pt-2">
            <div className="h-4 w-full bg-black/20 rounded-full overflow-hidden border border-white/20 shadow-inner">
              <div
                className="h-full bg-white transition-all duration-1000 relative shadow-[0_0_15px_rgba(255,255,255,0.5)]"
                style={{ width: `${goalPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="mt-6 flex justify-between items-center text-[8px] font-black uppercase tracking-[0.2em] text-white/70">
            <span>0h Start</span>
            <span className="text-white/90">{todayGoal}h Goal Achieved</span>
          </div>
        </div>

        {/* Metric 3: Dougnut Category Allocation */}
        <div className="lg:col-span-5 bg-white/10 backdrop-blur-md border border-white/10 p-6 shadow-2xl rounded-2xl relative overflow-hidden transform hover:-translate-y-1 transition-all">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
            Project Allocation
          </h3>
          <div className="h-40 relative">
            <Doughnut data={donutData} options={donutOptions} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Trend Bar Chart */}
        <div className="xl:col-span-7 bg-white/10 backdrop-blur-md border border-white/10 p-8 shadow-2xl rounded-2xl relative overflow-hidden transform hover:-translate-y-1 transition-all">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">
            5-Day Activity Trend
          </h3>
          <div className="h-64">
            <Bar data={trendData} options={trendOptions} />
          </div>
        </div>

        {/* Project Breakdown List */}
        <div className="xl:col-span-5 bg-white/10 backdrop-blur-md border border-white/10 p-8 shadow-2xl rounded-2xl relative overflow-hidden transform hover:-translate-y-1 transition-all">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8">
            Top Project Contribution
          </h3>
          <div className="space-y-6">
            {tasks.projectAllocation.map((p, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest truncate">
                    {p.name}
                  </div>
                  <div className="text-[10px] font-black text-[#5aa9ff] tracking-widest">
                    {p.percentage}%
                  </div>
                </div>
                <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden border border-white/5 shadow-inner">
                  <div
                    className="h-full bg-linear-to-r from-[#5aa9ff] to-[#8b5cf6] transition-all duration-1000"
                    style={{ width: `${p.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {tasks.projectAllocation.length === 0 && (
              <div className="text-center text-slate-500 py-12 italic text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">
                Data insights pending
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Statistics Row */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 shadow-2xl rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-[#5aa9ff] via-[#8b5cf6] to-[#5aa9ff] opacity-60"></div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-8 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[#8b5cf6] shadow-[0_0_10px_rgba(139,92,246,0.8)]"></span>
          Monthly Performance Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
          {[
            {
              label: "Productive Time",
              val: formatSecs(monthly.workSeconds),
              sub: "Total Worked",
              gradient: "from-blue-600 to-indigo-500",
            },
            {
              label: "Rest Time",
              val: formatSecs(monthly.breakSeconds),
              sub: "Total Break",
              gradient: "from-purple-600 to-pink-500",
            },
            {
              label: "Goal Requirement",
              val: formatSecs(monthly.requiredSeconds),
              sub: "Target Baseline",
              gradient: "from-slate-700 to-slate-800",
            },
            {
              label: "Time Deficit",
              val: formatSecs(monthly.deficitSeconds),
              sub: "Hours Shortage",
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
                <span className="text-[8px] font-bold text-white/60 uppercase tracking-tighter mt-2 leading-none">
                  {item.sub}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legacy Stats Footer (Leaves/Late) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Leaves",
            val: attendance.leaves,
            color: "from-red-500 to-pink-500",
          },
          {
            label: "Remaining",
            val: attendance.remainingLeaves,
            color: "from-green-500 to-teal-500",
          },
          {
            label: "Days Late",
            val: attendance.late,
            color: "from-orange-500 to-yellow-500",
          },
          {
            label: "Shortage (Hrs)",
            val: (attendance.cumulativeShortage / 3600).toFixed(1),
            color: "from-indigo-600 to-blue-500",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className={`bg-linear-to-br ${item.color} p-6 flex flex-col items-center justify-center rounded-2xl shadow-xl transform hover:-translate-y-1 transition-all group`}
          >
            <p className="text-[9px] font-black text-white/80 uppercase tracking-[0.2em] mb-2 group-hover:text-white transition-colors text-center">
              {item.label}
            </p>
            <p className="text-2xl font-black text-white group-hover:scale-110 transition-transform drop-shadow-md">
              {item.val}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
