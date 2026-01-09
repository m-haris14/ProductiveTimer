import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import {
  FaTasks,
  FaPlus,
  FaCalendarCheck,
  FaUser,
  FaProjectDiagram,
  FaComments,
  FaTimes,
  FaInfoCircle,
  FaLink,
} from "react-icons/fa";
import CountdownTimer from "../../Components/CountdownTimer";
import TaskComments from "../../Components/TaskComments";
import UniversalComments from "../../Components/UniversalComments";
import { socket } from "../../../socket";
const AdminTask = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const autoOpenRef = useRef(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [chatModalOpen, setChatModalOpen] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [empRes, projRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/employees`),
        axios.get(`${API_BASE_URL}/projects`),
      ]);

      const employeesData = empRes.data.filter(
        (e) =>
          e.designation?.toLowerCase().trim() !== "admin" &&
          e.designation?.toLowerCase().trim() !== "team lead"
      );
      setProjects(projRes.data);

      const employeesWithTasks = await Promise.all(
        employeesData.map(async (emp) => {
          try {
            const taskRes = await axios.get(`${API_BASE_URL}/tasks/${emp._id}`);
            return {
              ...emp,
              id: emp._id,
              name: emp.fullName,
              tasks: taskRes.data.map((t) => ({
                ...t,
                dueDate: new Date(t.date).toLocaleDateString(),
              })),
            };
          } catch (err) {
            return { ...emp, id: emp._id, name: emp.fullName, tasks: [] };
          }
        })
      );

      setEmployees(employeesWithTasks);

      if (selectedEmployee) {
        const updatedEmp = employeesWithTasks.find(
          (e) => e.id === selectedEmployee.id
        );
        if (updatedEmp) setSelectedEmployee(updatedEmp);
      }
      if (selectedTask) {
        const allTasks = employeesWithTasks.flatMap((e) => e.tasks);
        const updatedTask = allTasks.find((t) => t._id === selectedTask._id);
        if (updatedTask) setSelectedTask(updatedTask);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching admin data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);

    const onNotification = (data) => {
      fetchData(); // Refresh to show badge
    };
    socket.on("task_notification", onNotification);

    return () => {
      clearInterval(interval);
      socket.off("task_notification", onNotification);
    };
  }, [selectedEmployee?.id, selectedTask?._id]);

  // Handle auto-open task from notification
  useEffect(() => {
    if (employees.length > 0 && location.state?.taskId) {
      const taskId = location.state.taskId;

      if (autoOpenRef.current === taskId) return;

      let foundEmp = null;
      let foundTask = null;

      employees.forEach((emp) => {
        const task = emp.tasks.find((t) => t._id === taskId);
        if (task) {
          foundEmp = emp;
          foundTask = task;
        }
      });

      if (foundEmp && foundTask) {
        autoOpenRef.current = taskId;
        setSelectedEmployee(foundEmp);
        setSelectedTask(foundTask);
        setAuditModalOpen(true);

        // Clear state to avoid reopening on refresh
        window.history.replaceState({}, document.title);
      }
    }
  }, [employees, location.state]);

  const [newTask, setNewTask] = useState({
    employeeId: "",
    projectId: "",
    title: "",
    dueDate: "",
    description: "",
  });

  const getPendingTask = (tasks) => tasks.find((t) => t.status !== "Completed");
  const getPendingCount = (tasks) =>
    tasks.filter((t) => t.status !== "Completed").length;

  const handleAddTask = async () => {
    if (
      !newTask.employeeId ||
      !newTask.title ||
      !newTask.dueDate ||
      !newTask.description
    ) {
      showToast("Please fill all required fields", "warning");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/tasks`, {
        employeeId: newTask.employeeId,
        projectId: newTask.projectId,
        assignedBy: user?._id,
        title: newTask.title,
        description: newTask.description,
        date: newTask.dueDate,
      });

      await fetchData();
      setAssignModalOpen(false);
      setNewTask({
        employeeId: "",
        projectId: "",
        title: "",
        dueDate: "",
        description: "",
      });
      showToast("Task assigned successfully!", "success");
    } catch (err) {
      console.error("Error adding task:", err);
      showToast("Failed to assign task.", "error");
    }
  };

  const updateTaskProgress = async (taskId, newProgress) => {
    try {
      await axios.patch(`${API_BASE_URL}/tasks/${taskId}`, {
        progress: newProgress,
      });
      await fetchData();
    } catch (err) {
      console.error("Error updating admin progress:", err);
    }
  };

  const handleReview = async (action) => {
    if (action === "reject" && !reviewFeedback) {
      showToast("Please provide feedback for changes.", "warning");
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/tasks/${selectedTask._id}/review`, {
        action,
        feedback: reviewFeedback,
      });

      await fetchData();
      setReviewFeedback("");
      if (action === "approve") setSelectedTask(null);
      showToast(
        `Task ${action === "approve" ? "approved" : "rejected"} successfully!`,
        "success"
      );
    } catch (err) {
      console.error("Error during review:", err);
      showToast("Failed to process review.", "error");
    }
  };

  if (loading)
    return (
      <div className="p-6 text-center text-blue-600 font-bold">
        Loading Console...
      </div>
    );

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold text-blue-700">Task Tracking</h1>
          <p className="text-blue-400 font-medium">
            Assign, track, and review employee tasks
          </p>
        </div>

        <button
          onClick={() => setAssignModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-900/10 hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <FaPlus /> Assign Task
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-sm text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-100 uppercase text-[10px] tracking-widest font-black text-slate-400">
            <tr>
              <th className="px-6 py-4 text-center">#</th>
              <th className="px-6 py-4 text-left">Employee</th>
              <th className="px-6 py-4 text-center">Department</th>
              <th className="px-6 py-4 text-center">Deadline</th>
              <th className="px-6 py-4 text-center">Assigned Task</th>
              <th className="px-6 py-4 text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {employees.map((emp, idx) => {
              const pendingTask = getPendingTask(emp.tasks);
              const pendingCount = getPendingCount(emp.tasks);

              return (
                <tr
                  key={emp.id}
                  onClick={() => setSelectedEmployee(emp)}
                  className="hover:bg-blue-50/30 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 text-center font-bold text-slate-300">
                    {idx + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-slate-800">{emp.name}</div>
                      {emp.tasks.some((t) => t.unreadAdmin) && (
                        <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-tight">
                      {emp.designation}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-slate-500 font-medium">
                    {emp.department}
                  </td>
                  <td className="px-6 py-4 text-center text-slate-500 font-mono">
                    {pendingTask ? pendingTask.dueDate : "-"}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {pendingCount > 0 ? (
                      <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-amber-200">
                        {pendingCount} Task
                      </span>
                    ) : (
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase border border-emerald-200">
                        No Task
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="px-4 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg font-bold text-[10px] transition-all uppercase tracking-widest border border-blue-100">
                      Audit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedEmployee && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={() => setSelectedEmployee(null)}
        >
          <div
            className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 bg-slate-800 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center text-2xl font-black">
                  {selectedEmployee.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-black">
                    {selectedEmployee.name}
                  </h2>
                  <p className="text-blue-400 font-bold uppercase text-xs tracking-widest">
                    {selectedEmployee.department} Operations
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase text-[9px] font-black tracking-widest">
                    <tr>
                      <th className="py-4 text-center">#</th>
                      <th className="py-4 text-left px-4">Task Name</th>
                      <th className="py-4 text-center">Project/Task Bind</th>
                      <th className="py-4 text-center">Status</th>
                      <th className="py-4 text-center">Time Spend</th>
                      <th className="py-4 text-center">Deadline</th>
                      <th className="py-4 text-right px-4">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-50">
                    {selectedEmployee.tasks.map((task, index) => (
                      <tr
                        key={task._id}
                        onClick={() => {
                          setSelectedTask(task);
                          setAuditModalOpen(true);
                        }}
                        className="hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <td className="py-4 text-center font-bold text-slate-300 font-mono text-xs">
                          {(index + 1).toString().padStart(2, "0")}
                        </td>
                        <td className="py-4 px-4 max-w-xs">
                          <div className="flex items-center gap-2">
                            <div className="font-bold text-slate-800 truncate">
                              {task.title}
                            </div>
                            {task.unreadAdmin && (
                              <span
                                className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                                title="New message"
                              ></span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 line-clamp-1">
                            {task.description}
                          </div>
                        </td>
                        <td className="py-4 text-center">
                          {projects.find((p) => p._id === task.project)?.name ||
                            "-"}
                        </td>
                        <td className="py-4 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${
                                task.status === "Completed"
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                  : task.status === "Under Review"
                                  ? "bg-purple-50 text-purple-600 border-purple-100"
                                  : task.status === "Revision Required"
                                  ? "bg-rose-50 text-rose-600 border-rose-100"
                                  : "bg-slate-50 text-slate-500 border-slate-100"
                              }`}
                            >
                              {task.status}
                            </span>
                            <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500"
                                style={{ width: `${task.progress || 0}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-center font-mono font-bold text-blue-600 text-xs">
                          {task.time || "0h 0m 0s"}
                        </td>
                        <td className="py-4 text-center font-bold text-slate-500 text-xs">
                          <div className="flex flex-col items-center gap-1">
                            <span>
                              {task.date
                                ? new Date(task.date).toLocaleString()
                                : "-"}
                            </span>
                            <CountdownTimer targetDate={task.date} />
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                setSelectedTask(task);
                                setChatModalOpen(true);
                                if (task.unreadAdmin) {
                                  try {
                                    await axios.patch(
                                      `${API_BASE_URL}/tasks/${task._id}/read-comments`,
                                      { side: "admin" }
                                    );
                                    fetchData();
                                  } catch (err) {
                                    console.error(
                                      "Error marking task as read:",
                                      err
                                    );
                                  }
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer transition-colors font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 relative border border-slate-200"
                            >
                              <FaComments className="text-blue-500" /> Chat
                              {task.unreadAdmin && (
                                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse border border-white shadow-[0_0_5px_rgba(244,63,94,0.6)]"></span>
                              )}
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTask(task);
                                setAuditModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer transition-colors font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 shadow-sm shadow-blue-200"
                            >
                              <FaInfoCircle className="text-blue-100" /> Audit
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {auditModalOpen && selectedTask && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-60 p-4 animate-fadeIn"
          onClick={() => {
            setAuditModalOpen(false);
            setSelectedTask(null);
          }}
        >
          <div
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <FaTasks className="text-blue-500" />
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Task Detail
                  </h4>
                </div>
                <h2 className="text-2xl font-black text-slate-800">
                  {selectedTask.title}
                </h2>
              </div>
              <button
                onClick={() => {
                  setAuditModalOpen(false);
                  setSelectedTask(null);
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors p-2"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-8 space-y-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                    Deadline
                  </p>
                  <p className="text-xs font-bold text-slate-700">
                    {selectedTask.dueDate}
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">
                    Time Spend
                  </p>
                  <p className="text-xs font-bold text-blue-600 font-mono">
                    {selectedTask.time || "0h 0m 0s"}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-2">
                  Progress
                </p>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black text-slate-800 w-10">
                    {selectedTask.progress || 0}%
                  </span>
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-700"
                      style={{ width: `${selectedTask.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                <p className="text-[9px] font-black text-blue-400 uppercase mb-2">
                  Task Description
                </p>
                <p className="text-sm text-slate-600 leading-relaxed font-medium italic">
                  "{selectedTask.description}"
                </p>
              </div>

              {selectedTask.feedback && (
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                  <p className="text-[9px] font-black text-rose-500 uppercase mb-1">
                    Previous Feedback
                  </p>
                  <p className="text-xs text-rose-600 italic">
                    "{selectedTask.feedback}"
                  </p>
                </div>
              )}

              {selectedTask.submissionLink && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <p className="text-[9px] font-black text-emerald-500 uppercase mb-1">
                    Deliverable Link
                  </p>
                  <a
                    href={selectedTask.submissionLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-600 underline break-all flex items-center gap-2"
                  >
                    <FaLink className="text-[10px]" />{" "}
                    {selectedTask.submissionLink}
                  </a>
                </div>
              )}

              {selectedTask.status === "Under Review" && (
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">
                      Audit Commentary
                    </label>
                    <textarea
                      placeholder="Enter detailed feedback for task adjustment..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all mr-0"
                      rows="3"
                      value={reviewFeedback}
                      onChange={(e) => setReviewFeedback(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleReview("approve")}
                      className="flex-1 bg-emerald-600 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all"
                    >
                      Certify Task
                    </button>
                    <button
                      onClick={() => handleReview("reject")}
                      className="flex-1 bg-rose-600 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-all"
                    >
                      Request Pivot
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 flex justify-end">
              <button
                onClick={() => {
                  setAuditModalOpen(false);
                  setSelectedTask(null);
                }}
                className="px-6 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {assignModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-70 p-4  animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden h-[90vh] flex flex-col w-[55%] scale-in">
            <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black">Task Assignment</h2>
                <p className="text-xs opacity-70 font-bold uppercase tracking-widest">
                  Define Project and Task Bind
                </p>
              </div>
              <button
                onClick={() => setAssignModalOpen(false)}
                className="bg-white/10 hover:bg-white/20 p-3 rounded-xl transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-8 space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">
                      Assign To
                    </label>
                    <select
                      className="w-full bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      value={newTask.employeeId}
                      onChange={(e) =>
                        setNewTask({ ...newTask, employeeId: e.target.value })
                      }
                    >
                      <option value="">Select Associate</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.designation})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">
                      Project/Task Bind
                    </label>
                    <select
                      className="w-full bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      value={newTask.projectId}
                      onChange={(e) =>
                        setNewTask({ ...newTask, projectId: e.target.value })
                      }
                    >
                      <option value="">Independent Task</option>
                      {projects.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">
                      Task Name
                    </label>
                    <input
                      type="text"
                      placeholder="Short task title..."
                      className="w-full bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      value={newTask.title}
                      onChange={(e) =>
                        setNewTask({ ...newTask, title: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">
                      Task Deadline
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                      value={newTask.dueDate}
                      onChange={(e) =>
                        setNewTask({ ...newTask, dueDate: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-1.5 block">
                    Task Description
                  </label>
                  <textarea
                    placeholder="Provide full context and deliverables expectations..."
                    className="w-full bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                    rows="4"
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask({ ...newTask, description: e.target.value })
                    }
                  />
                </div>
              </div>

              <button
                onClick={handleAddTask}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all mt-6"
              >
                Assign Task
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Chat Modal */}
      {chatModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-100 p-4 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col scale-in">
            <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                  Operational Chat
                </h3>
                <p className="text-[10px] opacity-70 uppercase tracking-widest font-black mt-0.5">
                  Task: {selectedTask.title}
                </p>
              </div>
              <button
                onClick={() => {
                  setChatModalOpen(false);
                  setSelectedTask(null);
                }}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors text-white/70 hover:text-white"
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

export default AdminTask;
