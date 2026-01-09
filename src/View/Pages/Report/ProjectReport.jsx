import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
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
  Filler,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import {
  FaProjectDiagram,
  FaCheckCircle,
  FaClock,
  FaUsers,
  FaChartLine,
  FaRocket,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaList,
  FaArrowUp,
  FaBolt,
} from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

const ProjectReport = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/projects`).then((res) => {
      setProjects(res.data);
      if (res.data.length > 0) setSelectedProjectId(res.data[0]._id);
    });
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      setLoading(true);
      axios
        .get(`${API_BASE_URL}/projects/${selectedProjectId}/detailed-report`)
        .then((res) => {
          setReport(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [selectedProjectId]);

  if (!report && !loading)
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 text-slate-400 font-medium">
        <FaProjectDiagram className="text-4xl mb-4 opacity-20" />
        <p className="tracking-widest uppercase text-xs font-bold">
          Select a project to view diagnostic report
        </p>
      </div>
    );

  // Chart Configs
  const statusColors = {
    Pending: "#cbd5e1", // slate-300
    "In Progress": "#00d2ff", // Cyan
    "Under Review": "#fbbf24", // Amber
    "Revision Required": "#ff0080", // Magenta
    Completed: "#7cfc00", // Lime
    "Late Submission": "#f43f5e", // Rose
  };

  const statusData = report
    ? {
        labels: Object.keys(report.statusCounts),
        datasets: [
          {
            data: Object.values(report.statusCounts),
            backgroundColor: Object.keys(report.statusCounts).map(
              (status) => statusColors[status] || "#94a3b8" // Default to slate-400
            ),
            borderWidth: 0,
            hoverOffset: 10,
            cutout: "85%",
            borderRadius: 20,
          },
        ],
      }
    : null;

  const memberData = report
    ? {
        labels: report.memberContribution.map((m) => m.name.split(" ")[0]), // Use first name
        datasets: [
          {
            label: "Hours Contributed",
            data: report.memberContribution.map((m) => m.hours.toFixed(1)),
            backgroundColor: (context) => {
              const chart = context.chart;
              const { ctx, chartArea } = chart;
              if (!chartArea) return null;
              const gradient = ctx.createLinearGradient(
                0,
                chartArea.bottom,
                0,
                chartArea.top
              );
              gradient.addColorStop(0, "#00d2ff20");
              gradient.addColorStop(1, "#00d2ff");
              return gradient;
            },
            borderRadius: 12,
            barThickness: 40,
            borderSkipped: false,
          },
        ],
      }
    : null;

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#64748b", // slate-500
          font: { size: 11, weight: "600", family: "'Inter', sans-serif" },
          padding: 24,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)", // slate-900
        padding: 16,
        titleFont: { size: 13, weight: "bold" },
        bodyFont: { size: 12 },
        cornerRadius: 12,
        displayColors: true,
        boxPadding: 6,
        caretSize: 8,
      },
    },
    scales: {
      y: {
        grid: { color: "#f1f5f9", drawBorder: false, tickLength: 0 }, // slate-100
        ticks: {
          color: "#94a3b8",
          font: { size: 11, weight: "500" },
          padding: 10,
        }, // slate-400
        border: { display: false },
      },
      x: {
        grid: { display: false },
        ticks: { color: "#64748b", font: { size: 11, weight: "600" } }, // slate-500
        border: { display: false },
      },
    },
    layout: { padding: 0 },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#64748b", // slate-500
          font: { size: 11, weight: "600", family: "'Inter', sans-serif" },
          padding: 24,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(15, 23, 42, 0.9)", // slate-900
        padding: 16,
        titleFont: { size: 13, weight: "bold" },
        bodyFont: { size: 12 },
        cornerRadius: 12,
        displayColors: true,
        boxPadding: 6,
        caretSize: 8,
      },
    },
    cutout: "75%",
    layout: { padding: 0 },
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 p-6 lg:p-12 space-y-10 animate-fadeIn font-sans selection:bg-[#ff0080]/20">
      {/* Header & Selector */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white/80 backdrop-blur-xl border border-white/50 p-1 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] gap-6 sticky top-6 z-30 ring-1 ring-slate-900/5 transition-all">
        <div className="flex items-center gap-5 p-5">
          <div className="relative group">
            <div className="absolute inset-0 bg-[#ff0080]/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-60"></div>
            <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center border border-slate-100 shadow-lg relative z-10 transition-transform group-hover:scale-105">
              <FaProjectDiagram className="text-2xl text-[#ff0080]" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">
              Project Pulse
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00d2ff] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00d2ff]"></span>
              </span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                Diagnostic Control Center
              </p>
            </div>
          </div>
        </div>

        <div className="relative group p-2 pr-6">
          <select
            className="appearance-none bg-slate-50 border-none hover:bg-slate-100 text-slate-700 font-bold rounded-2xl px-6 py-4 pr-12 focus:outline-none focus:ring-4 focus:ring-[#ff0080]/10 transition-all cursor-pointer min-w-[280px] shadow-inner text-sm"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-8 flex items-center text-slate-500">
            <FaClock className="text-[#ff0080] text-sm animate-pulse" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-[60vh] gap-8">
          <div className="relative">
            <div className="w-20 h-20 border-[6px] border-slate-100 border-t-[#ff0080] rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
              <FaRocket className="text-[#ff0080] text-sm" />
            </div>
          </div>
          <p className="text-xs font-black text-slate-300 uppercase tracking-[0.3em] animate-pulse">
            Syncing Project Data...
          </p>
        </div>
      ) : (
        report && (
          <div className="space-y-10">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Overall Health */}
              <div className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group relative overflow-hidden hover:-translate-y-1">
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">
                      Health Score
                    </h3>
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">
                      {report.overallProgress}
                      <span className="text-lg text-slate-400 align-top ml-1">
                        %
                      </span>
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <FaBolt className="text-[#ff0080] text-lg" />
                  </div>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden relative z-10">
                  <div
                    className="bg-[#ff0080] h-2 rounded-full shadow-[0_0_10px_#ff008080]"
                    style={{ width: `${report.overallProgress}%` }}
                  ></div>
                </div>
                {/* Decoration */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-pink-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              </div>

              {/* Active Tasks */}
              <div className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group relative overflow-hidden hover:-translate-y-1">
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">
                      Active Tasks
                    </h3>
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">
                      {report.totalTasks}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-cyan-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <FaCheckCircle className="text-[#00d2ff] text-lg" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 relative z-10">
                  <span className="w-2 h-2 rounded-full bg-[#00d2ff]"></span>
                  <span className="text-slate-700">
                    {report.statusCounts["In Progress"] || 0}
                  </span>{" "}
                  Currently Active
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-cyan-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              </div>

              {/* Velocity */}
              <div className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group relative overflow-hidden hover:-translate-y-1">
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">
                      Completed
                    </h3>
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">
                      {report.statusCounts.Completed || 0}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-lime-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <FaChartLine className="text-[#7cfc00] text-lg" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 relative z-10">
                  <FaArrowUp className="text-[#7cfc00]" />
                  Successful Deliveries
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-lime-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              </div>

              {/* Team */}
              <div className="bg-white p-6 rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.02)] border border-slate-100 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all group relative overflow-hidden hover:-translate-y-1">
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-2">
                      Contributors
                    </h3>
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">
                      {report.memberContribution.length}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <FaUsers className="text-[#ffcc00] text-lg" />
                  </div>
                </div>
                <div className="flex items-center -space-x-3 mt-2 relative z-10 pl-2">
                  {report.memberContribution.slice(0, 4).map((m, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-white border-[3px] border-white flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-sm"
                      title={m.name}
                    >
                      {m.name.charAt(0)}
                    </div>
                  ))}
                  {report.memberContribution.length > 4 && (
                    <div className="w-8 h-8 rounded-full bg-slate-100 border-[3px] border-white flex items-center justify-center text-[10px] font-bold text-slate-400 shadow-sm">
                      +{report.memberContribution.length - 4}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-amber-50 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Task Status Doughnut */}
              <div className="lg:col-span-4 bg-white border border-slate-100/50 p-8 rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.02)] hover:shadow-lg transition-all duration-500">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <FaProjectDiagram /> Task Distribution
                  </h3>
                </div>
                <div className="h-64 relative flex items-center justify-center">
                  {report.totalTasks > 0 ? (
                    <>
                      <Doughnut data={statusData} options={doughnutOptions} />
                      {/* Center Text Trick */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                          <span className="block text-4xl font-black text-slate-800 tracking-tighter">
                            {report.totalTasks}
                          </span>
                          <span className="text-[9px] uppercase font-black text-slate-400 tracking-[0.2em]">
                            Total
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center opacity-40">
                      <FaExclamationTriangle className="text-4xl text-slate-300 mx-auto mb-2" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        No Tasks Distribution
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Member Contribution Bar */}
              <div className="lg:col-span-8 bg-white border border-slate-100/50 p-8 rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.02)] hover:shadow-lg transition-all duration-500">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <FaUsers /> Team Velocity (Total Hours)
                  </h3>
                  <div className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Lifetime Performance
                  </div>
                </div>
                <div className="h-64 flex items-center justify-center">
                  {report.memberContribution.length > 0 &&
                  report.totalTasks > 0 ? (
                    <Bar data={memberData} options={barOptions} />
                  ) : (
                    <div className="text-center opacity-40">
                      <FaChartLine className="text-4xl text-slate-300 mx-auto mb-2" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        No Velocity Data
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Milestones Timeline */}
            <div className="bg-white border border-slate-100/50 rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.02)] overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <FaCalendarAlt /> Milestones
                </h3>
                <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">
                  {report.milestones.length} Defined
                </span>
              </div>

              <div>
                {report.milestones.length > 0 ? (
                  <div className="divide-y divide-slate-50">
                    {report.milestones.map((m, i) => (
                      <div
                        key={i}
                        className="p-8 flex flex-col md:flex-row items-center gap-8 hover:bg-slate-50/50 transition-colors group"
                      >
                        <div className="flex-1 w-full">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="font-bold text-slate-800 text-base group-hover:text-[#ff0080] transition-colors mb-1">
                                {m.title}
                              </h4>
                              {m.description && (
                                <p className="text-xs font-medium text-slate-400 leading-relaxed max-w-xl">
                                  {m.description}
                                </p>
                              )}
                              {m.link && (
                                <a
                                  href={m.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] font-bold text-[#00d2ff] hover:text-[#0080ff] mt-2 inline-flex items-center gap-1 transition-colors"
                                >
                                  View Deliverable{" "}
                                  <FaArrowUp className="rotate-45" />
                                </a>
                              )}
                            </div>
                            <span
                              className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg tracking-wider border shadow-sm ${
                                m.status === "Completed"
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                  : m.status === "Pending"
                                  ? "bg-amber-50 text-amber-600 border-amber-100"
                                  : m.status === "Rejected"
                                  ? "bg-rose-50 text-rose-600 border-rose-100"
                                  : "bg-slate-50 text-slate-500 border-slate-100"
                              }`}
                            >
                              {m.status}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden shadow-inner">
                            <div
                              className={`h-full rounded-full transition-all duration-1000 shadow-sm ${
                                m.status === "Completed"
                                  ? "bg-emerald-400"
                                  : "bg-linear-to-r from-[#ff0080] to-[#00d2ff]"
                              }`}
                              style={{ width: `${m.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="hidden md:block w-32 text-right">
                          <span className="text-2xl font-black text-slate-800 tracking-tighter">
                            {m.progress}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-16 text-center flex flex-col items-center gap-6 text-slate-300">
                    <FaExclamationTriangle className="text-4xl opacity-50" />
                    <p className="text-sm font-bold uppercase tracking-widest">
                      No milestones established
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Task List */}
            {report.tasks && (
              <div className="bg-white border border-slate-100/50 rounded-3xl shadow-[0_2px_20px_rgb(0,0,0,0.02)] overflow-hidden">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                    <FaList /> Recent Task Activity
                  </h3>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">
                    {report.tasks.length} Logged
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                          Task Details
                        </th>
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                          Assignee
                        </th>
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                          Status
                        </th>
                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">
                          Deadline
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {report.tasks.map((task, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          <td className="p-6 text-sm font-bold text-slate-700 group-hover:text-[#ff0080] transition-colors">
                            {task.title}
                          </td>
                          <td className="p-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-linear-to-br from-slate-100 to-slate-200 border border-white shadow-sm flex items-center justify-center text-[10px] font-black text-slate-500">
                                {task.assignedTo.charAt(0)}
                              </div>
                              <span className="text-sm font-bold text-slate-600">
                                {task.assignedTo}
                              </span>
                            </div>
                          </td>
                          <td className="p-6">
                            <span
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-sm ${
                                task.status === "Completed"
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                  : task.status === "In Progress"
                                  ? "bg-cyan-50 text-cyan-600 border-cyan-100"
                                  : task.status === "Revision Required"
                                  ? "bg-rose-50 text-rose-600 border-rose-100"
                                  : "bg-slate-50 text-slate-500 border-slate-100"
                              }`}
                            >
                              {task.status}
                            </span>
                          </td>
                          <td className="p-6 text-xs font-bold text-slate-400 font-mono">
                            {task.deadline
                              ? new Date(task.deadline).toLocaleDateString()
                              : "---"}
                          </td>
                        </tr>
                      ))}
                      {report.tasks.length === 0 && (
                        <tr>
                          <td
                            colSpan="4"
                            className="p-12 text-center text-slate-400 font-bold uppercase tracking-widest text-xs"
                          >
                            No activity recorded
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default ProjectReport;
