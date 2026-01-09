import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import { useToast } from "../../../context/ToastContext";
import { useAuth } from "../../../context/AuthContext";
import AttendenceCard from "../../../component/Attendence/AttendenceCard";
import CountdownTimer from "../../Components/CountdownTimer";
import {
  FaPlay,
  FaStop,
  FaPaperPlane,
  FaProjectDiagram,
  FaLink,
} from "react-icons/fa";

const Task = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submissionLink, setSubmissionLink] = useState("");
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [taskToSubmit, setTaskToSubmit] = useState(null);
  const [counts, setCounts] = useState({
    complete: 0,
    inProgress: 0,
    pending: 0,
  });

  useEffect(() => {
    if (user?._id) {
      fetchData();
    }
  }, [user?._id]);

  const fetchData = async () => {
    try {
      const [taskRes, projRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/tasks/${user._id}`),
        axios.get(`${API_BASE_URL}/projects`),
      ]);

      setTasks(taskRes.data);
      setProjects(projRes.data);

      const stats = taskRes.data.reduce(
        (acc, t) => {
          if (t.status === "Completed") acc.complete++;
          else if (
            t.status === "In Progress" ||
            t.status === "Revision Required" ||
            t.status === "Under Review"
          )
            acc.inProgress++;
          else acc.pending++;
          return acc;
        },
        { complete: 0, inProgress: 0, pending: 0 }
      );

      setCounts(stats);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const updateTaskProgress = async (taskId, progress) => {
    try {
      const res = await axios.patch(`${API_BASE_URL}/tasks/${taskId}`, {
        progress,
      });
      fetchData();
      if (selectedTask && selectedTask._id === taskId) {
        setSelectedTask(res.data);
      }
    } catch (err) {
      console.error("Error updating progress:", err);
    }
  };

  const handleStartTask = async (taskId) => {
    try {
      await axios.post(`${API_BASE_URL}/tasks/${taskId}/start`);
      fetchData();
    } catch (err) {
      showToast("Failed to start task session.", "error");
    }
  };

  const handleStopTask = async (taskId) => {
    try {
      await axios.post(`${API_BASE_URL}/tasks/${taskId}/stop`, {
        action: "Pause",
      });
      fetchData();
    } catch (err) {
      showToast("Failed to pause task.", "error");
    }
  };

  const handleSubmitDeliverable = async () => {
    if (!submissionLink) {
      showToast(
        "Please provide a deliverable link or summary of work.",
        "warning"
      );
      return;
    }

    try {
      await axios.patch(`${API_BASE_URL}/tasks/${selectedTask._id}`, {
        status: "Under Review",
        progress: 100,
        submissionLink: submissionLink,
      });
      fetchData();
      setSelectedTask(null);
      setTaskToSubmit(null);
      setIsSubmitModalOpen(false);
      setSubmissionLink("");
      showToast("Deliverable submitted for audit.", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to submit deliverable.", "error");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "In Progress":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "Under Review":
        return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
      case "Revision Required":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
    }
  };

  return (
    <div className="text-white p-2">
      <div className="w-full flex gap-4 mb-8">
        <AttendenceCard
          title="Tasks Completed"
          value={counts.complete.toString()}
          color="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
        />
        <AttendenceCard
          title="Active Operations"
          value={counts.inProgress.toString()}
          color="bg-blue-500/10 text-blue-400 border border-blue-500/20"
        />
        <AttendenceCard
          title="Strategy Pipeline"
          value={counts.pending.toString()}
          color="bg-amber-500/10 text-amber-400 border border-amber-500/20"
        />
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden shadow-2xl shadow-indigo-500/10">
        <table className="w-full text-xs">
          <thead className="bg-slate-900/80 text-slate-400 font-black uppercase tracking-widest border-b border-slate-800">
            <tr>
              <th className="px-6 py-5 text-left">Objective Path</th>
              <th className="px-6 py-5 text-left">Project Bind</th>
              <th className="px-6 py-5 text-center">Status Matrix</th>
              <th className="px-6 py-5 text-center">Worked Output</th>
              <th className="px-6 py-5 text-center">Status Tag</th>
              <th className="px-6 py-5 text-center">Control</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <tr
                  key={task._id}
                  className="hover:bg-indigo-500/5 transition duration-300"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-200">{task.title}</div>
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="text-[10px] text-slate-500 uppercase tracking-tighter">
                        Due:{" "}
                        {task.date ? new Date(task.date).toLocaleString() : "-"}
                      </div>
                      <CountdownTimer targetDate={task.date} />
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <FaProjectDiagram className="text-[10px]" />
                      <span className="font-medium">
                        {projects.find((p) => p._id === task.project)?.name ||
                          "Direct Objective"}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3 justify-center">
                      <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-indigo-500 to-blue-500"
                          style={{ width: `${task.progress || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] font-black text-slate-400">
                        {task.progress || 0}%
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-center font-mono font-bold text-indigo-400">
                    {task.time || "0h 0m 0s"}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${getStatusStyle(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center gap-2">
                      {task.status === "Pending" ||
                      task.status === "Revision Required" ? (
                        <button
                          onClick={() => handleStartTask(task._id)}
                          className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500 transition-all cursor-pointer"
                        >
                          <FaPlay />
                        </button>
                      ) : task.status === "In Progress" ? (
                        <button
                          onClick={() => handleStopTask(task._id)}
                          className="p-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500 transition-all cursor-pointer"
                        >
                          <FaStop />
                        </button>
                      ) : null}
                      {(task.status === "In Progress" ||
                        task.status === "Revision Required") && (
                        <button
                          onClick={() => {
                            setTaskToSubmit(task);
                            setIsSubmitModalOpen(true);
                          }}
                          className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500 transition-all cursor-pointer"
                          title="Submit for Review"
                        >
                          <FaPaperPlane />
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedTask(task)}
                        className="px-4 py-1.5 rounded-lg text-[10px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/20 uppercase tracking-widest cursor-pointer"
                      >
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="px-5 py-20 text-center text-slate-500 italic"
                >
                  No strategic objectives assigned to your terminal.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedTask && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center">
              <div>
                <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">
                  Objective Intel
                </div>
                <h2 className="text-2xl font-black">{selectedTask.title}</h2>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    Status Matrix
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${getStatusStyle(
                      selectedTask.status
                    )}`}
                  >
                    {selectedTask.status}
                  </span>
                </div>
                <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                    Time Logged
                  </div>
                  <p className="text-sm font-bold text-indigo-400 font-mono">
                    {selectedTask.time || "0h 0m 0s"}
                  </p>
                </div>
              </div>

              {selectedTask.feedback && (
                <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                  <div className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1">
                    Audit Pivot Feedback
                  </div>
                  <p className="text-xs text-rose-200 italic font-medium leading-relaxed">
                    "{selectedTask.feedback}"
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    Manual Progress Alignment
                  </span>
                  <span className="text-xs font-bold text-indigo-400">
                    {selectedTask.progress || 0}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedTask.progress || 0}
                  onChange={(e) =>
                    setSelectedTask({
                      ...selectedTask,
                      progress: parseInt(e.target.value),
                    })
                  }
                  onMouseUp={(e) =>
                    updateTaskProgress(
                      selectedTask._id,
                      parseInt(e.target.value)
                    )
                  }
                  onTouchEnd={(e) =>
                    updateTaskProgress(
                      selectedTask._id,
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">
                  Scope Briefing
                </div>
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  "{selectedTask.description}"
                </p>
              </div>

              {selectedTask.status !== "Completed" &&
                selectedTask.status !== "Under Review" && (
                  <div className="space-y-4 pt-4 border-t border-slate-800">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                        Work Submission Link (Drive/Docs/URL)
                      </label>
                      <div className="relative">
                        <FaLink className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                        <input
                          type="text"
                          placeholder="https://drive.google.com/..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                          value={submissionLink}
                          onChange={(e) => setSubmissionLink(e.target.value)}
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleSubmitDeliverable}
                      className="w-full py-4 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                    >
                      <FaPaperPlane className="text-[10px]" /> Deploy
                      Deliverable
                    </button>
                  </div>
                )}

              {(selectedTask.status === "Under Review" ||
                selectedTask.status === "Completed") &&
                selectedTask.submissionLink && (
                  <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                    <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">
                      Live Deliverable Ref
                    </div>
                    <a
                      href={selectedTask.submissionLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-emerald-200 underline break-all flex items-center gap-2"
                    >
                      <FaLink /> {selectedTask.submissionLink}
                    </a>
                  </div>
                )}
            </div>
            <div className="p-6 bg-slate-950/50 flex justify-end">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-6 py-2 text-[10px] font-black text-slate-500 hover:text-slate-300 transition-all uppercase tracking-widest"
              >
                Terminate Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Submission Modal */}
      {isSubmitModalOpen && taskToSubmit && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => {
            setIsSubmitModalOpen(false);
            setTaskToSubmit(null);
          }}
        >
          <div
            className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <div>
                <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">
                  Task Completion
                </div>
                <h2 className="text-xl font-black">Submit for Review</h2>
              </div>
              <button
                onClick={() => {
                  setIsSubmitModalOpen(false);
                  setTaskToSubmit(null);
                }}
                className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                  Objective
                </div>
                <p className="text-sm font-bold text-slate-200">
                  {taskToSubmit.title}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">
                  Work Submission Link (Drive/Docs/URL)
                </label>
                <div className="relative">
                  <FaLink className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                  <input
                    type="text"
                    placeholder="https://drive.google.com/..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-3 pl-11 pr-4 text-xs focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                    value={submissionLink}
                    onChange={(e) => setSubmissionLink(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              <button
                onClick={async () => {
                  if (!submissionLink) {
                    showToast(
                      "Please provide a deliverable link or summary of work.",
                      "warning"
                    );
                    return;
                  }
                  try {
                    await axios.patch(
                      `${API_BASE_URL}/tasks/${taskToSubmit._id}`,
                      {
                        status: "Under Review",
                        progress: 100,
                        submissionLink: submissionLink,
                      }
                    );
                    fetchData();
                    setIsSubmitModalOpen(false);
                    setTaskToSubmit(null);
                    setSubmissionLink("");
                    showToast("Deliverable submitted for audit.", "success");
                  } catch (err) {
                    showToast("Failed to submit deliverable.", "error");
                  }
                }}
                className="w-full py-4 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
              >
                <FaPaperPlane className="text-[10px]" /> Deploy Deliverable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Task;
