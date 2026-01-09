import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { useConfirm } from "../../../context/ConfirmContext";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaEye,
  FaTasks,
  FaLink,
  FaCheckCircle,
  FaTimesCircle,
  FaPaperPlane,
  FaComments,
} from "react-icons/fa";
import UniversalComments from "../../Components/UniversalComments";
import { socket } from "../../../socket";

const AdminProject = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentProject, setCurrentProject] = useState(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [selectedProjectForChat, setSelectedProjectForChat] = useState(null);

  const isAdmin = user?.designation === "Admin";

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    teamLead: "",
    members: [],
    startDate: "",
    endDate: "",
    status: "active",
  });

  const [milestoneUpdate, setMilestoneUpdate] = useState({
    projectId: null,
    milestoneId: null,
    progress: 0,
    link: "",
    weightage: 0,
  });

  const [milestoneForm, setMilestoneForm] = useState({
    title: "",
    description: "",
    weightage: 0,
  });

  const [isMilestoneEdit, setIsMilestoneEdit] = useState(false);
  const [editingMilestoneId, setEditingMilestoneId] = useState(null);

  const [rejectionModal, setRejectionModal] = useState({
    isOpen: false,
    projectId: null,
    milestoneId: null,
    reason: "",
  });

  useEffect(() => {
    fetchData();

    socket.on("project_comment", () => {
      fetchData(); // Refresh to update notification badges
    });

    return () => {
      socket.off("project_comment");
    };
  }, []);

  const fetchData = async () => {
    try {
      let projRes;
      if (isAdmin) {
        projRes = await axios.get(`${API_BASE_URL}/projects`);
      } else {
        projRes = await axios.get(`${API_BASE_URL}/projects/tl/${user._id}`);
      }

      const empRes = await axios.get(`${API_BASE_URL}/employees`);
      setProjects(projRes.data);
      setEmployees(empRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "teamLead") {
      setFormData({
        ...formData,
        [name]: value,
        members: formData.members.filter((id) => id !== value),
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const toggleMember = (empId) => {
    setFormData((prev) => {
      const isSelected = prev.members.includes(empId);
      const newMembers = isSelected
        ? prev.members.filter((id) => id !== empId)
        : [...prev.members, empId];
      return { ...prev, members: newMembers };
    });
  };

  const openAddModal = () => {
    if (!isAdmin) return;
    setIsEdit(false);
    setFormData({
      name: "",
      description: "",
      teamLead: "",
      members: [],
      startDate: "",
      endDate: "",
      status: "active",
    });
    setShowModal(true);
  };

  const openEditModal = (project) => {
    if (!isAdmin) return;
    setIsEdit(true);
    setCurrentProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      teamLead: project.teamLead?._id || "",
      members: project.members?.map((m) => m._id) || [],
      startDate: project.startDate ? project.startDate.split("T")[0] : "",
      endDate: project.endDate ? project.endDate.split("T")[0] : "",
      status: project.status,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await axios.patch(
          `${API_BASE_URL}/projects/${currentProject._id}`,
          formData
        );
        showToast("Project updated successfully!", "success");
      } else {
        await axios.post(`${API_BASE_URL}/projects`, formData);
        showToast("Project created successfully!", "success");
      }
      fetchData();
      setShowModal(false);
    } catch (error) {
      console.error("Error saving project:", error);
      showToast("Error saving project.", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    const isConfirmed = await confirm(
      "This action will permanently remove this project and all associated data from the mission console. Proceed?",
      "Decommission Project"
    );
    if (isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/projects/${id}`);
        fetchData();
        showToast("Project deleted successfully!", "success");
      } catch (err) {
        console.error("Error deleting project:", err);
        showToast("Error deleting project.", "error");
      }
    }
  };

  const handleAddMilestone = async (e) => {
    e.preventDefault();
    try {
      if (isMilestoneEdit) {
        await axios.patch(
          `${API_BASE_URL}/projects/${selectedProjectId}/milestones/${editingMilestoneId}`,
          milestoneForm
        );
        showToast("Milestone updated.", "success");
      } else {
        await axios.post(
          `${API_BASE_URL}/projects/${selectedProjectId}/milestones`,
          milestoneForm
        );
        showToast("Milestone added to protocol.", "success");
      }
      fetchData();
      setShowMilestoneModal(false);
      setMilestoneForm({ title: "", description: "" });
      setIsMilestoneEdit(false);
      setEditingMilestoneId(null);
    } catch (err) {
      console.error("Error saving milestone:", err);
      showToast("Operation failed.", "error");
    }
  };

  const openEditMilestoneModal = (project, milestone) => {
    setSelectedProjectId(project._id);
    setMilestoneForm({
      title: milestone.title,
      description: milestone.description,
    });
    setIsMilestoneEdit(true);
    setEditingMilestoneId(milestone._id);
    setShowMilestoneModal(true);
  };

  const handleDeleteMilestone = async (projectId, milestoneId) => {
    const isConfirmed = await confirm(
      "Are you sure you want to delete this milestone? This action cannot be undone.",
      "Delete Milestone"
    );
    if (isConfirmed) {
      try {
        await axios.delete(
          `${API_BASE_URL}/projects/${projectId}/milestones/${milestoneId}`
        );
        showToast("Milestone deleted.", "success");
        fetchData();
      } catch (err) {
        console.error(err);
        showToast("Error deleting milestone.", "error");
      }
    }
  };

  const handleApproveMilestone = async (projectId, milestoneId, action) => {
    try {
      if (action === "reject") {
        setRejectionModal({
          isOpen: true,
          projectId,
          milestoneId,
          reason: "",
        });
        return;
      }

      const status = "Completed";
      await axios.patch(
        `${API_BASE_URL}/projects/${projectId}/milestones/${milestoneId}`,
        { status, progress: 100 }
      );
      fetchData();
      showToast("Milestone approved!", "success");
    } catch (err) {
      console.error("Error approving milestone:", err);
      showToast("Error updating milestone status.", "error");
    }
  };

  const handleConfirmRejection = async () => {
    try {
      if (!rejectionModal.reason.trim()) {
        showToast("Please provide a reason for rejection.", "error");
        return;
      }

      await axios.patch(
        `${API_BASE_URL}/projects/${rejectionModal.projectId}/milestones/${rejectionModal.milestoneId}`,
        {
          status: "Rejected",
          feedback: rejectionModal.reason,
          progress: 90,
        }
      );
      fetchData();
      setRejectionModal({
        isOpen: false,
        projectId: null,
        milestoneId: null,
        reason: "",
      });
      showToast("Milestone rejected with feedback.", "success");
    } catch (err) {
      console.error(err);
      showToast("Error rejecting milestone.", "error");
    }
  };

  const handleSubmitMilestoneUpdate = async (projectId, milestoneId) => {
    try {
      if (
        !milestoneUpdate.link ||
        milestoneUpdate.projectId !== projectId ||
        milestoneUpdate.milestoneId !== milestoneId
      ) {
        showToast("Please set progress and provide deliverable link.", "error");
        return;
      }
      await axios.patch(
        `${API_BASE_URL}/projects/${projectId}/milestones/${milestoneId}`,
        {
          status: "Under Review",
          progress: milestoneUpdate.progress,
          link: milestoneUpdate.link,
        }
      );
      fetchData();
      setMilestoneUpdate({
        projectId: null,
        milestoneId: null,
        progress: 0,
        link: "",
      });
      showToast("Milestone updated and sent for audit.", "success");
    } catch (err) {
      console.error(err);
      showToast("Error submitting milestone update.", "error");
    }
  };

  if (loading)
    return (
      <div className="p-6 text-center text-blue-600 font-bold">
        Loading Projects...
      </div>
    );

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-blue-700">Company Project</h1>
          <p className="text-blue-400 font-medium">
            Manage projects and track milestones
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-900/10 hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <FaPlus /> Add New Project
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
          >
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-bold text-slate-800">
                  {item.name}
                </h3>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-black ${
                    item.status === "active"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                  }`}
                >
                  {item.status}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProjectForChat(item);
                    setChatModalOpen(true);
                    // Mark as read
                    axios.patch(
                      `${API_BASE_URL}/projects/${item._id}/read-comments`,
                      { side: "admin" }
                    );
                  }}
                  className="relative p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-slate-600 group/chat"
                  title="Project Discussion"
                >
                  <FaComments />
                  {item.unreadAdmin && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                  )}
                </button>
              </div>

              <p className="text-sm text-slate-500 line-clamp-2 mb-4">
                {item.description}
              </p>

              <div className="space-y-2 mb-6 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Team Lead:</span>
                  <span className="font-bold text-slate-700">
                    {item.teamLead?.fullName || "Unassigned"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Team Members:</span>
                  <span className="font-bold text-slate-700">
                    {item.members?.length || 0} Employees
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Timeline:</span>
                  <span className="font-bold text-slate-700">
                    {item.startDate
                      ? new Date(item.startDate).toLocaleDateString()
                      : "-"}{" "}
                    to{" "}
                    {item.endDate
                      ? new Date(item.endDate).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  <span>Overall Milestone Progress</span>
                  <span>
                    {Math.round(
                      item.milestones?.reduce(
                        (acc, m) => acc + (m.progress || 0),
                        0
                      ) / (item.milestones?.length || 1)
                    )}
                    %
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{
                      width: `${Math.round(
                        item.milestones?.reduce(
                          (acc, m) => acc + (m.progress || 0),
                          0
                        ) / (item.milestones?.length || 1)
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="border-t border-slate-50 pt-4 space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <FaTasks className="text-blue-500" /> Milestones & Reviews
                </h4>
                <div className="space-y-2">
                  {item.milestones?.map((m) => (
                    <div
                      key={m._id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-100"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-slate-700">
                          {m.title}
                        </span>
                        <div className="flex items-center gap-2">
                          {(isAdmin || item.teamLead?._id === user?._id) && (
                            <>
                              <button
                                onClick={() => openEditMilestoneModal(item, m)}
                                className="text-slate-400 hover:text-blue-500 transition-colors"
                                title="Edit Milestone"
                              >
                                <FaEdit size={10} />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteMilestone(item._id, m._id)
                                }
                                className="text-slate-400 hover:text-red-500 transition-colors"
                                title="Delete Milestone"
                              >
                                <FaTrash size={10} />
                              </button>
                            </>
                          )}
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                              m.status === "Completed"
                                ? "bg-green-100 text-green-700"
                                : m.status === "Under Review"
                                ? "bg-purple-100 text-purple-700"
                                : m.status === "Rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-slate-200 text-slate-500"
                            }`}
                          >
                            {m.status}
                          </span>
                        </div>
                      </div>

                      {m.description && (
                        <p className="text-[10px] text-slate-500 mb-2 italic">
                          {m.description}
                        </p>
                      )}

                      {m.weightage > 0 && (
                        <div className="mb-2">
                          <span className="text-[9px] font-black uppercase text-purple-600 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded">
                            Weight: {m.weightage}%
                          </span>
                        </div>
                      )}

                      {m.feedback && m.status === "Rejected" && (
                        <div className="mb-2 p-2 bg-red-50 border border-red-100 rounded text-[9px] text-red-700">
                          <span className="font-bold">Admin Feedback:</span>{" "}
                          {m.feedback}
                        </div>
                      )}

                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-400"
                            style={{ width: `${m.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-mono">
                          {m.progress}%
                        </span>
                      </div>

                      {isAdmin && m.status === "Under Review" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleApproveMilestone(item._id, m._id, "approve")
                            }
                            className="flex-1 py-1 bg-green-500 text-white text-[10px] font-bold rounded hover:bg-green-600 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleApproveMilestone(item._id, m._id, "reject")
                            }
                            className="flex-1 py-1 bg-red-500 text-white text-[10px] font-bold rounded hover:bg-red-600 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {!isAdmin &&
                        (m.status === "Pending" || m.status === "Rejected") &&
                        item.teamLead?._id === user?._id && (
                          <div className="mt-2 pt-2 border-t border-slate-100 space-y-2">
                            <input
                              type="text"
                              placeholder="Submission Link (URL)"
                              className="w-full px-2 py-1 text-[10px] border border-slate-200 rounded"
                              onChange={(e) =>
                                setMilestoneUpdate({
                                  ...milestoneUpdate,
                                  projectId: item._id,
                                  milestoneId: m._id,
                                  link: e.target.value,
                                })
                              }
                            />
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                className="flex-1 h-1 bg-slate-200 rounded-full appearance-none accent-blue-500"
                                onChange={(e) =>
                                  setMilestoneUpdate({
                                    ...milestoneUpdate,
                                    projectId: item._id,
                                    milestoneId: m._id,
                                    progress: parseInt(e.target.value),
                                  })
                                }
                              />
                              <button
                                onClick={() =>
                                  handleSubmitMilestoneUpdate(item._id, m._id)
                                }
                                className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                              >
                                <FaPaperPlane size={10} />
                              </button>
                            </div>
                          </div>
                        )}

                      {m.link && (
                        <a
                          href={m.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-blue-500 flex items-center gap-1 hover:underline mt-1 bg-blue-50 p-1 rounded"
                        >
                          <FaLink size={10} /> View Deliverable
                        </a>
                      )}
                    </div>
                  ))}

                  {(isAdmin || item.teamLead?._id === user?._id) && (
                    <button
                      onClick={() => {
                        setSelectedProjectId(item._id);
                        setShowMilestoneModal(true);
                      }}
                      className="w-full py-2 border-2 border-dashed border-slate-100 rounded-xl text-[10px] font-bold text-slate-400 hover:border-blue-100 hover:text-blue-500 transition-all"
                    >
                      + Add New Milestone
                    </button>
                  )}
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between">
                <button
                  onClick={() => openEditModal(item)}
                  className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <FaTrash />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Project Modal */}
      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-[65%] rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {isEdit ? "Update Project" : "New Project"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-8 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">
                    Project Title
                  </label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Project Name"
                    className="w-full px-4 py-2 border border-slate-100 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">
                    Project Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Detailed description..."
                    rows="3"
                    className="w-full px-4 py-2 border border-slate-100 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">
                      Team Commander
                    </label>
                    <select
                      name="teamLead"
                      value={formData.teamLead}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-100 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                      required
                    >
                      <option value="">Select Lead</option>
                      {employees
                        .filter(
                          (emp) =>
                            emp.designation?.toLowerCase().trim() !== "admin"
                        )
                        .map((emp) => (
                          <option key={emp._id} value={emp._id}>
                            {emp.fullName} ({emp.designation})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-100 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                    >
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="on hold">On Hold</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-100 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">
                      Deadline
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-slate-100 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1.5 block">
                    Create Team
                  </label>
                  <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-100 scrollbar-thin scrollbar-thumb-slate-200">
                    {employees
                      .filter(
                        (emp) =>
                          emp.designation?.toLowerCase().trim() ===
                            "employee" && emp._id !== formData.teamLead
                      )
                      .map((emp) => {
                        const isSelected = formData.members.includes(emp._id);
                        return (
                          <label
                            key={emp._id}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border-b border-transparent cursor-pointer transition-all ${
                              isSelected
                                ? "bg-blue-50 border-blue-100"
                                : "hover:bg-white"
                            }`}
                          >
                            <div className="relative flex items-center justify-center">
                              <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                checked={isSelected}
                                onChange={() => toggleMember(emp._id)}
                              />
                            </div>
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                                isSelected
                                  ? "bg-blue-600 text-white"
                                  : "bg-slate-200 text-slate-500"
                              }`}
                            >
                              {emp.fullName.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-bold text-slate-700 truncate">
                                {emp.fullName}
                              </p>
                              <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest leading-none">
                                {emp.department} • {emp.designation}
                              </p>
                            </div>
                            {isSelected && (
                              <span className="text-[10px] font-black text-blue-600 uppercase tracking-tighter bg-blue-100 px-2 py-0.5 rounded-full">
                                Selected
                              </span>
                            )}
                          </label>
                        );
                      })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4"></div>
                <button
                  type="submit"
                  className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all mt-4"
                >
                  {isEdit ? "Update Project" : "Add Project"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Milestone Modal */}
      {showMilestoneModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 bg-slate-100 flex justify-between items-center">
              <h2 className="text-sm font-black uppercase text-slate-500 tracking-widest">
                {isMilestoneEdit ? "Edit Milestone" : "Add Strategic Milestone"}
              </h2>
              <button
                onClick={() => {
                  setShowMilestoneModal(false);
                  setIsMilestoneEdit(false);
                  setEditingMilestoneId(null);
                  setMilestoneForm({ title: "", description: "" });
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <div className="p-8">
              <form onSubmit={handleAddMilestone} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">
                    Milestone Title
                  </label>
                  <input
                    value={milestoneForm.title}
                    onChange={(e) =>
                      setMilestoneForm({
                        ...milestoneForm,
                        title: e.target.value,
                      })
                    }
                    placeholder="Phase name..."
                    className="w-full px-4 py-2 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">
                    Detailed Description
                  </label>
                  <textarea
                    value={milestoneForm.description}
                    onChange={(e) =>
                      setMilestoneForm({
                        ...milestoneForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Deliverables and goals..."
                    rows="3"
                    className="w-full px-4 py-2 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block">
                    Weightage (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={milestoneForm.weightage}
                    onChange={(e) =>
                      setMilestoneForm({
                        ...milestoneForm,
                        weightage: e.target.value,
                      })
                    }
                    placeholder="E.g. 25"
                    className="w-full px-4 py-2 border border-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-400 transition-all font-bold text-slate-600"
                  />
                  <p className="text-[9px] text-slate-400 mt-1 italic">
                    How much impact this milestone has on total project
                    progress.
                  </p>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-900 transition-all"
                >
                  {isMilestoneEdit ? "Update Milestone" : "Set Milestone"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Rejection Modal */}
      {rejectionModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                <FaTimesCircle className="text-red-500 text-2xl" />
              </div>
              <h2 className="text-xl font-black text-slate-800 mb-2 uppercase tracking-tight">
                Revision Required
              </h2>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Please explain why this milestone requires revision. Your
                feedback will be shared with the team operative.
              </p>

              <textarea
                autoFocus
                value={rejectionModal.reason}
                onChange={(e) =>
                  setRejectionModal({
                    ...rejectionModal,
                    reason: e.target.value,
                  })
                }
                placeholder="Explain the required changes..."
                rows="4"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-700 outline-none focus:ring-2 focus:ring-red-100 focus:border-red-200 transition-all resize-none mb-6"
              />

              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setRejectionModal({ ...rejectionModal, isOpen: false })
                  }
                  className="flex-1 py-3.5 rounded-2xl bg-slate-100 text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRejection}
                  className="flex-1 py-3.5 rounded-2xl bg-red-500 text-white text-xs font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-xl shadow-red-500/20"
                >
                  Reject Milestone
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Chat Modal */}
      {chatModalOpen && selectedProjectForChat && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl flex items-center justify-center z-60 p-4">
          <div className="bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-800">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <FaComments className="text-blue-400" /> Project Discussion
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-mono uppercase tracking-widest">
                  {selectedProjectForChat.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setChatModalOpen(false);
                  setSelectedProjectForChat(null);
                }}
                className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-xl"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-slate-900">
              <UniversalComments
                type="project"
                id={selectedProjectForChat._id}
                user={user}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProject;
