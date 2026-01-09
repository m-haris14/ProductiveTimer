import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CountdownTimer from "../../Components/CountdownTimer";
import axios from "axios";
import {
  FaComments,
  FaTimes,
  FaPlay,
  FaStop,
  FaInfoCircle,
  FaLink,
} from "react-icons/fa";
import { API_BASE_URL } from "../../../config";
import { useAuth } from "../../../context/AuthContext";
import DashTimer from "../../../component/Dashboard/DashTimer";
import TaskComments from "../../Components/TaskComments";
import UniversalComments from "../../Components/UniversalComments";
import { socket } from "../../../socket";

const Dashboard = ({ employeeId }) => {
  const { user } = useAuth(); // Use the useAuth hook to get user information

  const [stats, setStats] = useState({
    todayProgress: 0,
    weekProgress: 0,
    totalSecondsWeek: 0,
    totalSecondsToday: 0,
    cumulativeBreakSeconds: 0,
    cumulativeShortage: 0,
    todayRequiredSeconds: 28800, // Default 8h
  });
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeTask, setActiveTask] = useState(null); // The task currently being timed
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const currentEmployeeId = user?._id;
  const [taskTimerIcon, setTaskTimerIcon] = useState(0); // Live seconds for the round timer
  const [mainTimerStatus, setMainTimerStatus] = useState("none");

  // Fetch Stats
  const fetchStats = async () => {
    if (!user?._id) return; // Ensure user ID is available
    try {
      const [todayRes, weekRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/stats/today/${user._id}`),
        axios.get(`${API_BASE_URL}/stats/week/${user._id}`),
      ]);

      const todayProg =
        Math.min((todayRes.data.totalWorkSeconds / (8 * 3600)) * 100, 100) || 0;
      const weekProg =
        Math.min((weekRes.data.totalWorkSeconds / (40 * 3600)) * 100, 100) || 0;

      setStats({
        todayProgress: todayProg,
        weekProgress: weekProg,
        totalSecondsWeek: weekRes.data.totalWorkSeconds,
        totalSecondsToday: todayRes.data.totalWorkSeconds,
        cumulativeBreakSeconds: todayRes.data.cumulativeBreakSeconds,
        cumulativeShortage: todayRes.data.prevCumulativeShortage,
        todayRequiredSeconds: todayRes.data.todayRequiredSeconds,
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  // Fetch Tasks
  const fetchTasks = async () => {
    if (!user?._id) return; // Ensure user ID is available
    try {
      const res = await axios.get(`${API_BASE_URL}/tasks/${user._id}`);
      setTasks(res.data);
      // Check if any task is already in progress (e.g., on refresh)
      const running = res.data.find(
        (t) => t.status === "In Progress" && t.activeSessionStart
      );
      if (running) {
        setActiveTask(running);
      } else {
        setActiveTask(null);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const startTaskTimer = async (task) => {
    try {
      await axios.post(`${API_BASE_URL}/tasks/${task._id}/start`);
      fetchTasks();
    } catch (err) {
      console.error("Error starting task:", err);
    }
  };

  const stopTaskTimer = async (taskId, action) => {
    try {
      await axios.post(`${API_BASE_URL}/tasks/${taskId}/stop`, {
        action,
      });
      fetchTasks();
      setActiveTask(null);
    } catch (err) {
      console.error("Error stopping task:", err);
    }
  };

  const updateTaskStatus = async (
    taskId,
    newStatus,
    newProgress,
    submissionLink
  ) => {
    try {
      const updateData = {};
      if (newStatus !== undefined) updateData.status = newStatus;
      if (newProgress !== undefined) updateData.progress = newProgress;
      if (submissionLink !== undefined)
        updateData.submissionLink = submissionLink;

      const res = await axios.patch(
        `${API_BASE_URL}/tasks/${taskId}`,
        updateData
      );
      fetchTasks();

      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask(res.data);
      }
      if (activeTask && activeTask._id === taskId) {
        setActiveTask(res.data);
      }
    } catch (err) {
      console.error("Error updating task status/progress:", err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchTasks();

    // Socket Listener
    const onAttendanceUpdate = (data) => {
      if (user && String(data.employeeId) === String(user._id)) {
        // console.log("[Dashboard] Socket update received");
        fetchStats();
      }
    };
    const onNotification = (data) => {
      if (user && String(data.employeeId) === String(user._id)) {
        fetchTasks();
      }
    };

    socket.on("attendance_update", onAttendanceUpdate);
    socket.on("task_notification", onNotification);

    return () => {
      socket.off("attendance_update", onAttendanceUpdate);
      socket.off("task_notification", onNotification);
    };
  }, [currentEmployeeId, user]);

  const handleTimerUpdate = (data) => {
    // Optionally update stats based on real-time data from DashTimer
    // But fetchStats already covers the core stats.
    fetchStats();
    fetchTasks();
  };

  useEffect(() => {
    let interval;
    if (activeTask && activeTask.activeSessionStart) {
      const start = new Date(activeTask.activeSessionStart);

      const updateIcon = () => {
        const now = new Date();
        const sessionElapsed = Math.floor((now - start) / 1000);
        setTaskTimerIcon((activeTask.totalWorkedSeconds || 0) + sessionElapsed);
      };

      updateIcon(); // Initialize immediately
      interval = setInterval(updateIcon, 1000);
    } else {
      setTaskTimerIcon(0);
    }

    return () => clearInterval(interval);
  }, [activeTask]);

  // Auto-stop task timer if main timer is paused or stopped
  useEffect(() => {
    if (activeTask && mainTimerStatus !== "working") {
      console.log("Main timer not working, auto-stopping task...");
      stopTaskTimer(activeTask._id, "Drop");
    }
  }, [mainTimerStatus, activeTask]);

  const formatTaskTime = (totalSeconds) => {
    const s = Math.floor(totalSeconds);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    return `${String(h).padStart(2, "0")}:${String(m % 60).padStart(
      2,
      "0"
    )}:${String(s % 60).padStart(2, "0")}`;
  };

  const dashArray = 314;

  const todayOffset = dashArray - (dashArray * stats.todayProgress) / 100;
  const weekOffset = dashArray - (dashArray * stats.weekProgress) / 100;

  return (
    <div className="h-screen flex text-white">
      <div className="flex-1">
        {/* Shortage/Surplus Warning */}
        {stats.cumulativeShortage !== 0 && (
          <div
            className={`mx-6 mt-4 p-3 rounded-xl border flex items-center justify-between ${
              stats.cumulativeShortage > 0
                ? "bg-red-500/10 border-red-500/20 text-red-200"
                : "bg-green-500/10 border-green-500/20 text-green-200"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">
                {stats.cumulativeShortage > 0 ? "⚠️" : "🌟"}
              </span>
              <div>
                <p className="font-bold text-sm uppercase tracking-wide opacity-80">
                  {stats.cumulativeShortage > 0
                    ? "Work Hour Shortage"
                    : "Surplus Hours"}
                </p>
                <p className="text-xs">
                  {stats.cumulativeShortage > 0
                    ? "You are behind on your required work hours."
                    : "You have worked extra hours. Great job!"}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-mono font-bold">
                {Math.abs(stats.cumulativeShortage || 0).toFixed(1)}h
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-6 p-6 pb-0">
          <DashTimer
            employeeId={employeeId}
            onStatsUpdate={handleTimerUpdate}
            onStatusChange={setMainTimerStatus}
          />

          {activeTask ? (
            <div className="bg-[#141843] rounded-2xl p-6 shadow-[0_0_40px_rgba(90,169,255,0.35)] flex flex-col items-center justify-center text-center">
              <h2 className="text-lg mb-2 text-blue-400 font-bold uppercase tracking-wider">
                Active Task Tracking
              </h2>
              <p className="text-white text-xl font-medium mb-6">
                {activeTask.title}
              </p>

              <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                {/* Decorative background circle */}
                <div className="absolute inset-0 rounded-full border-4 border-blue-500/10 active-timer-glow"></div>
                {/* Live Timer Text */}
                <div className="z-10">
                  <span className="text-4xl font-mono font-bold text-white block">
                    {formatTaskTime(taskTimerIcon)}
                  </span>
                  <span className="text-[10px] uppercase text-blue-400 font-bold tracking-widest opacity-80">
                    Live Session
                  </span>
                </div>
                {/* Animated Progress Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="50%"
                    cy="50%"
                    r="90"
                    stroke="url(#timerGradient)"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray="565"
                    strokeDashoffset="565"
                    strokeLinecap="round"
                    className="animate-[timerProgress_60s_linear_infinite]"
                  />
                  <defs>
                    <linearGradient
                      id="timerGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#5aa9ff" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <div className="w-full mt-4 bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-400">
                    Manual Progress
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={activeTask.progress || 0}
                      onChange={(e) => {
                        const val = Math.min(
                          100,
                          Math.max(0, parseInt(e.target.value) || 0)
                        );
                        updateTaskStatus(activeTask._id, undefined, val);
                      }}
                      className="w-16 bg-blue-900/30 border border-blue-500/30 rounded px-2 py-0.5 text-center text-sm font-bold text-blue-400 focus:outline-none focus:border-blue-500"
                    />
                    <span className="text-sm font-bold text-blue-400">%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={activeTask.progress || 0}
                  onChange={(e) =>
                    updateTaskStatus(
                      activeTask._id,
                      undefined,
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full h-2 bg-blue-900/50 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              <div className="flex gap-4 w-full mt-6">
                <button
                  onClick={() => stopTaskTimer(activeTask._id, "Complete")}
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 transition-all font-bold cursor-pointer shadow-lg shadow-purple-900/20"
                >
                  ✓ Submit for Review
                </button>
                <button
                  onClick={() => stopTaskTimer(activeTask._id, "Drop")}
                  className="flex-1 py-3 rounded-xl bg-red-600/20 hover:bg-red-600 border border-red-500/30 transition-all font-bold cursor-pointer"
                >
                  ✕ Drop
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#141843] rounded-2xl p-6 shadow-[0_0_40px_rgba(90,169,255,0.35)] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl text-blue-400">📋</span>
              </div>
              <h2 className="text-xl font-bold mb-2">No Active Task</h2>
              <p className="text-gray-400 max-w-[200px]">
                Select a task from the list below to start tracking your
                progress.
              </p>
            </div>
          )}
        </div>
        <div className="mt-6 bg-[#141843] rounded-2xl p-6 shadow-[0_0_40px_rgba(90,169,255,0.35)]">
          <h2 className="text-xl mb-4 ">Task Overview</h2>
          <table className="w-full text-sm">
            <thead className="opacity-60">
              <tr className="text-left">
                <th className="pb-3 px-2">Task</th>
                <th className="pb-3 px-2">Progress</th>
                <th className="pb-3 px-2">Status</th>
                <th className="pb-3 px-2">Due</th>
                <th className="pb-3 px-2 font-mono">Time</th>
                <th className="pb-3 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length > 0 ? (
                tasks
                  .filter((t) => t.status !== "Completed")
                  .map((t, i) => (
                    <tr
                      key={i}
                      className="border-t border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors">
                            {t.title}
                          </span>
                          {t.unreadEmployee && (
                            <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
                          )}
                        </div>
                      </td>
                      <td className="px-2 min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full transition-all duration-500"
                              style={{ width: `${t.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 w-8">
                            {t.progress || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            t.status === "Completed"
                              ? "bg-green-500/20 text-green-400"
                              : t.status === "Under Review"
                              ? "bg-purple-500/20 text-purple-400"
                              : t.status === "Revision Required"
                              ? "bg-red-500/20 text-red-400"
                              : t.status === "In Progress"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="px-2 min-w-[140px]">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-slate-300">
                            {t.date ? new Date(t.date).toLocaleString() : "-"}
                          </span>
                          <CountdownTimer targetDate={t.date} />
                        </div>
                      </td>
                      <td className="px-2">{t.time || "0h 0m 0s"}</td>
                      <td className="px-2 py-4">
                        <div className="flex items-center gap-2">
                          {activeTask && activeTask._id === t._id ? (
                            <button
                              onClick={() => stopTaskTimer(t._id, "Submit")}
                              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white cursor-pointer transition-colors font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5"
                            >
                              <FaStop className="text-[10px]" /> Stop
                            </button>
                          ) : (
                            t.status !== "Completed" &&
                            t.status !== "Under Review" && (
                              <button
                                disabled={
                                  activeTask !== null ||
                                  mainTimerStatus !== "working"
                                }
                                onClick={() => startTaskTimer(t)}
                                className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                                  activeTask || mainTimerStatus !== "working"
                                    ? "bg-slate-800 text-slate-500 cursor-not-allowed opacity-50"
                                    : "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                                }`}
                                title={
                                  mainTimerStatus !== "working"
                                    ? "Start main timer first"
                                    : activeTask
                                    ? "Stop existing task first"
                                    : ""
                                }
                              >
                                <FaPlay className="text-[8px]" /> Start
                              </button>
                            )
                          )}

                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              setSelectedTask(t);
                              setChatModalOpen(true);
                              if (t.unreadEmployee) {
                                try {
                                  await axios.patch(
                                    `${API_BASE_URL}/tasks/${t._id}/read-comments`,
                                    { side: "employee" }
                                  );
                                  fetchTasks();
                                } catch (err) {
                                  console.error(
                                    "Error marking task as read:",
                                    err
                                  );
                                }
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer transition-colors font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 relative"
                          >
                            <FaComments className="text-blue-400" /> Chat
                            {t.unreadEmployee && (
                              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse border border-slate-900 shadow-[0_0_5px_rgba(244,63,94,0.6)]"></span>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              setSelectedTask(t);
                              setDetailsModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white cursor-pointer transition-colors font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5"
                          >
                            <FaInfoCircle className="text-slate-400" /> Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="4" className="py-8 text-center opacity-50">
                    No tasks assigned yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Detail Modal */}
      {detailsModalOpen && selectedTask && (
        <div className="fixed inset-0 z-110 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-white">
          <div className="bg-[#1a1f4d] border border-white/10 rounded-3xl shadow-2xl max-w-md w-full p-0 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-8 border-b border-white/5">
              <h2 className="text-2xl font-bold">{selectedTask.title}</h2>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
              <p className="text-gray-400 mb-6">
                {selectedTask.description || "No description provided."}
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-50">Status</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      selectedTask.status === "Completed"
                        ? "bg-green-500/20 text-green-400"
                        : selectedTask.status === "Under Review"
                        ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                        : selectedTask.status === "Revision Required"
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-blue-500/20 text-blue-400"
                    }`}
                  >
                    {selectedTask.status}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="opacity-50">Assigned On</span>
                  <span>
                    {new Date(selectedTask.date).toLocaleDateString()}
                  </span>
                </div>

                {selectedTask.feedback && (
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-sm">
                    <div className="text-blue-400 font-bold mb-1 uppercase text-[10px] tracking-widest">
                      Admin Feedback
                    </div>
                    <p className="text-gray-300 italic">
                      "{selectedTask.feedback}"
                    </p>
                  </div>
                )}

                {selectedTask.submissionLink && (
                  <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-sm">
                    <div className="text-emerald-400 font-bold mb-1 uppercase text-[10px] tracking-widest">
                      Deliverable Link
                    </div>
                    <a
                      href={selectedTask.submissionLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-300 underline break-all flex items-center gap-2 mt-1"
                    >
                      <FaLink className="text-[10px]" /> View Deliverable
                    </a>
                  </div>
                )}
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-2 text-sm">
                    <span className="opacity-50">Manual Progress Set</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={selectedTask.progress || 0}
                        onChange={(e) => {
                          const val = Math.min(
                            100,
                            Math.max(0, parseInt(e.target.value) || 0)
                          );
                          updateTaskStatus(selectedTask._id, undefined, val);
                        }}
                        className="w-16 bg-white/5 border border-white/10 rounded px-2 py-0.5 text-center text-sm font-bold text-blue-400 focus:outline-none focus:border-blue-500"
                      />
                      <span className="font-bold text-blue-400">%</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedTask.progress || 0}
                    onChange={(e) =>
                      updateTaskStatus(
                        selectedTask._id,
                        undefined,
                        parseInt(e.target.value)
                      )
                    }
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>

                {selectedTask.status !== "Completed" && (
                  <div className="pt-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                      Submission Link (Drive/GitHub)
                    </label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={selectedTask.submissionLink || ""}
                      onChange={(e) => {
                        const newLink = e.target.value;
                        setSelectedTask({
                          ...selectedTask,
                          submissionLink: newLink,
                        });
                        // Optionally auto-save/debounce this, but for now we'll send it on submit
                      }}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 mt-4">
                {selectedTask.status === "Under Review" ? (
                  <div className="w-full py-3 rounded-xl bg-white/5 text-center text-sm font-medium border border-white/5 opacity-60">
                    Waiting for Admin Approval...
                  </div>
                ) : (
                  selectedTask.status !== "Completed" && (
                    <button
                      onClick={() =>
                        updateTaskStatus(
                          selectedTask._id,
                          "Under Review",
                          100,
                          selectedTask.submissionLink
                        )
                      }
                      className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 transition-colors font-bold cursor-pointer shadow-lg shadow-purple-900/20"
                    >
                      🚀 Submit for Review
                    </button>
                  )
                )}

                {selectedTask.status === "Pending" && (
                  <button
                    onClick={() =>
                      updateTaskStatus(selectedTask._id, "In Progress")
                    }
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors font-bold cursor-pointer"
                  >
                    Start Task
                  </button>
                )}
                <button
                  onClick={() => {
                    setDetailsModalOpen(false);
                    setSelectedTask(null);
                  }}
                  className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Chat Modal */}
      {chatModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-100 p-4 animate-fadeIn">
          <div className="bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-white/10 overflow-hidden flex flex-col scale-in">
            <div className="p-6 bg-slate-800/50 border-b border-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Task Chat
                </h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-0.5">
                  {selectedTask.title}
                </p>
              </div>
              <button
                onClick={() => {
                  setChatModalOpen(false);
                  setSelectedTask(null);
                }}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-4 bg-slate-900">
              <UniversalComments
                type="task"
                id={selectedTask._id}
                user={user}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
