import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../../../config";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import {
  FaArrowLeft,
  FaTasks,
  FaUsers,
  FaPlus,
  FaLink,
  FaCalendarAlt,
  FaPaperPlane,
  FaComments,
} from "react-icons/fa";
import UniversalComments from "../../Components/UniversalComments";
import { socket } from "../../../socket";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const scrollOnceRef = useRef(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    employeeId: "",
    dueDate: "",
  });

  // Milestone Modal State
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [milestoneData, setMilestoneData] = useState({
    link: "",
    status: "Under Review",
  });

  const [chatModalOpen, setChatModalOpen] = useState(false);

  useEffect(() => {
    fetchProjectDetails();

    socket.on("project_comment", (data) => {
      if (String(data.projectId) === String(projectId)) {
        fetchProjectDetails();
      }
    });

    return () => {
      socket.off("project_comment");
    };
  }, [projectId]);

  // Handle auto-scroll to milestone
  useEffect(() => {
    if (!loading && project && location.state?.milestoneId) {
      const milestoneId = location.state.milestoneId;

      if (scrollOnceRef.current === milestoneId) return;

      setTimeout(() => {
        const element = document.getElementById(milestoneId);
        if (element) {
          scrollOnceRef.current = milestoneId;
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add(
            "ring-2",
            "ring-blue-500",
            "ring-offset-4",
            "ring-offset-slate-950"
          );
          setTimeout(() => {
            element.classList.remove(
              "ring-2",
              "ring-blue-500",
              "ring-offset-4",
              "ring-offset-slate-950"
            );
          }, 3000);
        }
        // Clear state
        window.history.replaceState({}, document.title);
      }, 500);
    }
  }, [loading, project, location.state]);

  const fetchProjectDetails = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/projects/${projectId}`);
      setProject(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching project details:", err);
      setLoading(false);
    }
  };

  const isTeamLead = user?._id === project?.teamLead?._id;

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/tasks`, {
        ...newTask,
        date: newTask.dueDate, // Map dueDate to date expected by backend
        projectId: projectId,
        assignedBy: user._id,
      });
      setShowTaskModal(false);
      setNewTask({ title: "", description: "", employeeId: "", dueDate: "" });
      fetchProjectDetails(); // Refresh list
      showToast("Task assigned successfully within project scope.", "success");
    } catch (err) {
      console.error("Error creating task:", err);
      showToast("Failed to assign task.", "error");
    }
  };

  // Countdown Component
  const CountdownTimer = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState("");
    const [isOverdue, setIsOverdue] = useState(false);

    useEffect(() => {
      const calculateTime = () => {
        if (!targetDate) return;
        const now = new Date();
        const target = new Date(targetDate);
        const diff = target - now;

        if (diff <= 0) {
          setIsOverdue(true);
          setTimeLeft("Overdue");
          return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        } else {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        }
      };

      calculateTime();
      const timer = setInterval(calculateTime, 1000);
      return () => clearInterval(timer);
    }, [targetDate]);

    return (
      <span
        className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
          isOverdue
            ? "bg-red-500/10 text-red-400 animate-pulse"
            : "bg-blue-500/10 text-blue-400"
        }`}
      >
        {timeLeft || "Calculating..."}
      </span>
    );
  };

  const handleTaskReview = async (taskId, action) => {
    try {
      await axios.post(`${API_BASE_URL}/tasks/${taskId}/review`, {
        action,
        feedback: action === "reject" ? "Revision Requested by Team Lead" : "",
      });
      fetchProjectDetails();
    } catch (err) {
      console.error("Error reviewing task:", err);
      showToast("Failed to review task.", "error");
    }
  };

  const openMilestoneModal = (milestone) => {
    setSelectedMilestone(milestone);
    setMilestoneData({ link: milestone.link || "", status: "Under Review" });
    setShowMilestoneModal(true);
  };

  const handleMilestoneSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(
        `${API_BASE_URL}/projects/${projectId}/milestones/${selectedMilestone._id}`,
        {
          link: milestoneData.link,
          status: "Under Review",
          progress: 100, // Assuming submission implies 100% completion for review
        }
      );
      setShowMilestoneModal(false);
      fetchProjectDetails();
      showToast("Milestone deliverable submitted for Admin review.", "success");
    } catch (err) {
      console.error("Error submitting milestone:", err);
      showToast("Failed to submit milestone.", "error");
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center text-blue-400 font-bold animate-pulse">
        Loading Command Center...
      </div>
    );

  if (!project)
    return (
      <div className="flex h-screen items-center justify-center text-red-400 font-bold">
        Project Not Found or Access Denied.
      </div>
    );

  return (
    <div className="min-h-screen text-white pb-20">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors text-sm font-bold uppercase tracking-widest"
        >
          <FaArrowLeft /> Back to Mission Control
        </button>
        <div className="flex justify-between items-end">
          <div>
            <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">
              Project Command Scope
            </div>
            <h1 className="text-4xl font-black text-white">{project.name}</h1>
          </div>
          <div className="text-right">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                project.status === "active"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              }`}
            >
              {project.status}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Overview & actions */}
        <div className="space-y-6">
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-800 p-6 shadow-xl">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">
              Mission Brief
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              {project.description}
            </p>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-3">
                <span className="text-slate-500">Lead Commander</span>
                <span className="font-bold text-blue-400">
                  {project.teamLead?.fullName}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-3">
                <span className="text-slate-500">Timeline</span>
                <span className="font-mono text-slate-300 text-xs">
                  {new Date(project.startDate).toLocaleDateString()} —{" "}
                  {new Date(project.endDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Project Chat Button */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-blue-500/20 p-6 shadow-xl border-dashed">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">
              Project Communication
            </h3>
            <button
              onClick={() => {
                setChatModalOpen(true);
                // Mark as read based on role
                const side =
                  user.designation === "Admin" ? "admin" : "employee";
                axios.patch(
                  `${API_BASE_URL}/projects/${projectId}/read-comments`,
                  { side }
                );
              }}
              className="w-full py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-widest transition-all border border-white/5 flex items-center justify-center gap-3 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-linear-to-r from-blue-600/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <FaComments className="text-blue-500 text-lg" />
              Open Discussion
              {((project.unreadAdmin && user.designation === "Admin") ||
                (project.unreadEmployee && user.designation !== "Admin")) && (
                <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></span>
              )}
            </button>
            <p className="text-[10px] text-slate-500 mt-4 text-center leading-relaxed">
              Real-time channel for team coordination and admin feedback.
            </p>
          </div>

          {/* Team Roster */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-800 p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <FaUsers className="text-blue-500" /> Task Force
              </h3>
              <span className="text-xs font-mono text-slate-500">
                {project.members?.length} Operatives
              </span>
            </div>
            <div className="space-y-2">
              {project.members?.map((m) => (
                <div
                  key={m._id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800"
                >
                  <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-[10px] font-bold">
                    {m.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-200">
                      {m.fullName}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {m.designation}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TL Action Area */}
          {isTeamLead && (
            <button
              onClick={() => setShowTaskModal(true)}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group"
            >
              <FaPlus className="group-hover:rotate-90 transition-transform" />
              Assign New Task
            </button>
          )}
        </div>

        {/* Right Col: Milestones & Tasks */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-800 p-8 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <FaTasks className="text-blue-500" /> Milestone Progression
              </h3>
            </div>

            <div className="space-y-4">
              {project.milestones?.length === 0 ? (
                <div className="text-center py-10 text-slate-500 italic text-sm">
                  No milestones defined for this operation.
                </div>
              ) : (
                project.milestones?.map((m) => (
                  <div
                    key={m._id}
                    id={m._id}
                    className="p-5 bg-slate-950/30 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-md font-bold text-white mb-1">
                          {m.title}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {m.description}
                        </p>
                      </div>
                      <span
                        className={`text-[9px] font-black px-2 py-1 rounded uppercase tracking-wider ${
                          m.status === "Completed"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : m.status === "Under Review"
                            ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>

                    {m.description && (
                      <p className="text-[11px] text-slate-400 mb-2 italic">
                        {m.description}
                      </p>
                    )}

                    {m.feedback && m.status === "Rejected" && (
                      <div className="mb-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] text-rose-300">
                        <span className="font-black text-rose-500 uppercase tracking-widest mr-2">
                          Revision Required:
                        </span>
                        {m.feedback}
                      </div>
                    )}

                    <div className="mt-4">
                      <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                        <span>Progress</span>
                        <span>{m.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full bg-blue-500 transition-all duration-500"
                          style={{ width: `${m.progress}%` }}
                        ></div>
                      </div>

                      {/* TL Actions for Milestone */}
                      {isTeamLead && m.status !== "Completed" && (
                        <button
                          onClick={() => openMilestoneModal(m)}
                          className="w-full py-2 rounded-lg bg-slate-800 hover:bg-purple-600/20 hover:text-purple-400 text-slate-400 text-[10px] font-bold uppercase tracking-widest transition-all border border-slate-700 hover:border-purple-500/30 flex items-center justify-center gap-2"
                        >
                          <FaLink /> Submit Deliverable
                        </button>
                      )}

                      {m.link && (
                        <div className="mt-2 text-[10px] text-blue-400 flex items-center gap-2">
                          <FaLink />{" "}
                          <span className="truncate max-w-[200px]">
                            {m.link}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* New Section: Task List (Directive Log) */}
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-800 p-8 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <FaTasks className="text-purple-500" /> Directive Log
              </h3>
              <span className="text-xs font-mono text-slate-500">
                {project.tasks?.length || 0} Missions
              </span>
            </div>

            <div className="space-y-3">
              {project.tasks?.length === 0 ? (
                <div className="text-center py-10 text-slate-500 italic text-sm">
                  No tasks assigned in this scope yet.
                </div>
              ) : (
                project.tasks?.map((task) => (
                  <div
                    key={task._id}
                    className="p-4 bg-slate-950/30 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                          <span className="text-[10px] font-mono text-slate-400">
                            {task.employee?.fullName || "Unassigned"}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1">
                          <FaCalendarAlt size={10} />
                          {new Date(task.date).toLocaleDateString()}
                        </span>
                        <CountdownTimer targetDate={task.date} />
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-black px-2.5 py-1 rounded uppercase tracking-wider ${
                        task.status === "Completed"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : task.status === "In Progress"
                          ? "bg-blue-500/10 text-blue-400"
                          : task.status === "Under Review"
                          ? "bg-purple-500/10 text-purple-400"
                          : task.status === "Late Submission"
                          ? "bg-orange-500/10 text-orange-400 animate-pulse border border-orange-500/20"
                          : task.status === "Revision Required"
                          ? "bg-rose-500/10 text-rose-400"
                          : "bg-slate-700/20 text-slate-500"
                      }`}
                    >
                      {task.status}
                    </span>

                    {/* TL Task Review Actions */}
                    {isTeamLead &&
                      (task.status === "Under Review" ||
                        task.status === "Late Submission") && (
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() =>
                              handleTaskReview(task._id, "approve")
                            }
                            className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors"
                            title="Approve Task"
                          >
                            <FaCalendarAlt />{" "}
                            {/* Reusing icon for checkmark visual if needed or just color */}
                          </button>
                          <button
                            onClick={() => handleTaskReview(task._id, "reject")}
                            className="p-2 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                            title="Reject Task"
                          >
                            <FaPlus className="rotate-45" /> {/* Close icon */}
                          </button>
                        </div>
                      )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showTaskModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowTaskModal(false)}
        >
          <div
            className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-800 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-black text-white uppercase tracking-widest">
                Deploy Directive
              </h2>
              <button
                onClick={() => setShowTaskModal(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                  placeholder="Operation Name..."
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                  Description
                </label>
                <textarea
                  required
                  rows="3"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none resize-none"
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  placeholder="Briefing details..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                    Assign Operative
                  </label>
                  <select
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none"
                    value={newTask.employeeId}
                    onChange={(e) =>
                      setNewTask({ ...newTask, employeeId: e.target.value })
                    }
                  >
                    <option value="">Select Member</option>
                    {project.members
                      ?.filter((m) => m._id !== user._id)
                      .map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.fullName}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                    Target Date
                  </label>
                  <input
                    type="datetime-local"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                    value={newTask.dueDate}
                    onChange={(e) =>
                      setNewTask({ ...newTask, dueDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-4 mt-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all"
              >
                Initialize Task
              </button>
            </form>
          </div>
        </div>
      )}

      {showMilestoneModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowMilestoneModal(false)}
        >
          <div
            className="bg-slate-900 w-full max-w-md rounded-3xl border border-slate-800 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h2 className="text-lg font-black text-white uppercase tracking-widest">
                Submit Milestone
              </h2>
              <button
                onClick={() => setShowMilestoneModal(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleMilestoneSubmit} className="p-6 space-y-4">
              <div>
                <h3 className="text-md font-bold text-white mb-1">
                  {selectedMilestone?.title}
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  {selectedMilestone?.description}
                </p>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5 block">
                  Deliverable URL (GDrive/Doc)
                </label>
                <div className="relative">
                  <FaLink className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm" />
                  <input
                    type="text"
                    required
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                    value={milestoneData.link}
                    onChange={(e) =>
                      setMilestoneData({
                        ...milestoneData,
                        link: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-4 mt-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center gap-2"
              >
                <FaPaperPlane className="text-xs" /> Submit for Review
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Project Chat Modal */}
      {chatModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-lg flex items-center justify-center z-50 p-4"
          onClick={() => setChatModalOpen(false)}
        >
          <div
            className="bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-white/10 h-[97vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 pl-8 pr-8 border-b border-white/10 flex justify-between items-center bg-slate-950/50">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  <FaComments className="text-blue-500" /> Discussion
                </h2>
                <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase tracking-[0.2em]">
                  {project.name}
                </p>
              </div>
              <button
                onClick={() => setChatModalOpen(false)}
                className="text-slate-500 hover:text-white transition-colors p-3 hover:bg-white/5 rounded-2xl"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-slate-950">
              <UniversalComments type="project" id={projectId} user={user} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
