import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../config";
import { useAuth } from "../../../context/AuthContext";
import {
  FaTasks,
  FaLink,
  FaCalendarCheck,
  FaProjectDiagram,
  FaComments,
  FaTimes,
} from "react-icons/fa";
import UniversalComments from "../../Components/UniversalComments";
import { socket } from "../../../socket";

const EmployeeProject = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [selectedProjectForChat, setSelectedProjectForChat] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/projects/employee/${user._id}`
        );
        setProjects(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching projects:", err);
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchProjects();
    }

    socket.on("project_comment", () => {
      fetchProjects();
    });

    return () => {
      socket.off("project_comment");
    };
  }, [user]);

  if (loading)
    return (
      <div className="p-6 text-center text-blue-400 font-bold animate-pulse">
        Loading Mission Data...
      </div>
    );

  return (
    <div className="text-white min-h-screen">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-purple-500 mb-2">
            Mission Control
          </h1>
          <p className="text-slate-400 font-medium tracking-wide">
            Your Active Project Assignments
          </p>
        </div>
        <div className="text-slate-500 font-mono text-xs">
          {projects.length} Active{" "}
          {projects.length === 1 ? "Project" : "Projects"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {projects.length === 0 ? (
          <div className="col-span-full py-20 bg-slate-900/50 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6">
              <FaProjectDiagram className="text-3xl text-slate-600" />
            </div>
            <p className="text-slate-400 text-lg font-medium">
              You are currently on Standby.
            </p>
            <p className="text-slate-600 text-sm mt-2">
              No active projects assigned to your terminal.
            </p>
          </div>
        ) : (
          projects.map((item) => (
            <div
              key={item._id}
              onClick={() => navigate(`/projects/${item._id}`)}
              className="group bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-800 hover:border-blue-500/30 transition-all duration-300 shadow-2xl shadow-black/20 overflow-hidden flex flex-col cursor-pointer"
            >
              {/* Header */}
              <div className="p-8 pb-0">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors mb-1">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                      <span className="uppercase tracking-widest">Lead:</span>
                      <span className="text-blue-400 font-bold">
                        {item.teamLead?.fullName || "Unassigned"}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-widest border ${
                      item.status === "active"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
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
                        { side: "employee" }
                      );
                    }}
                    className="relative p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-slate-400 group/chat border border-white/5"
                    title="Project Discussion"
                  >
                    <FaComments className="text-lg" />
                    {item.unreadEmployee && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-slate-900 rounded-full animate-pulse"></span>
                    )}
                  </button>
                </div>

                <p className="text-sm text-slate-400 leading-relaxed line-clamp-2 h-10 mb-6">
                  {item.description}
                </p>

                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                    <span>Overall Completion</span>
                    <span className="text-blue-400">
                      {Math.round(
                        item.milestones?.reduce(
                          (acc, m) => acc + (m.progress || 0),
                          0
                        ) / (item.milestones?.length || 1)
                      )}
                      %
                    </span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-linear-to-r from-blue-500 to-purple-600 transition-all duration-1000 ease-out"
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
              </div>

              {/* Milestones List */}
              <div className="flex-1 bg-slate-950/30 border-t border-slate-800 p-6 space-y-3">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <FaTasks className="text-blue-500" /> Key Milestones
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {item.milestones?.map((m) => (
                    <div
                      key={m._id}
                      className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 hover:bg-slate-800/80 transition-colors"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-bold text-slate-200">
                          {m.title}
                        </span>
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
                            m.status === "Completed"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : m.status === "Under Review"
                              ? "bg-purple-500/10 text-purple-400"
                              : m.status === "Rejected"
                              ? "bg-rose-500/10 text-rose-400"
                              : "bg-slate-700/50 text-slate-400"
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              m.status === "Completed"
                                ? "bg-emerald-500"
                                : "bg-blue-500"
                            }`}
                            style={{ width: `${m.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 w-8 text-right">
                          {m.progress}%
                        </span>
                      </div>

                      {m.link && (
                        <a
                          href={m.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-blue-400 flex items-center gap-1.5 hover:text-blue-300 mt-3 font-medium transition-colors"
                        >
                          <FaLink size={10} /> View Deliverable
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Info */}
              <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                <span>
                  {new Date(item.startDate).toLocaleDateString()} —{" "}
                  {new Date(item.endDate).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <FaCalendarCheck />{" "}
                  {Math.ceil(
                    (new Date(item.endDate) - new Date()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  Days Left
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Project Chat Modal */}
      {chatModalOpen && selectedProjectForChat && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-2xl flex items-center justify-center z-70 p-4">
          <div className="bg-slate-900 w-full max-w-2xl rounded-[32px] shadow-2xl border border-white/10 overflow-hidden">
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-slate-950/50">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  <FaComments className="text-blue-500" /> Discussion
                </h2>
                <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase tracking-[0.2em]">
                  {selectedProjectForChat.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setChatModalOpen(false);
                  setSelectedProjectForChat(null);
                }}
                className="text-slate-500 hover:text-white transition-colors p-3 hover:bg-white/5 rounded-2xl"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-4 bg-slate-950">
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

export default EmployeeProject;
