import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { MdOutlineDashboard, MdCameraAlt } from "react-icons/md";
import {
  IoPersonAddOutline,
  IoSettingsOutline,
  IoLogOutOutline,
  IoMenuOutline,
  IoExpandOutline,
  IoHelpCircleOutline,
  IoNotificationsOutline,
} from "react-icons/io5";
import { RiFileList3Line } from "react-icons/ri";
import { TfiAnnouncement } from "react-icons/tfi";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import { socket } from "../../../socket";

const AdminHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, updateUser } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);
  const [notifications, setNotifications] = React.useState([]);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      console.log(
        "[Notifications] Fetching from:",
        `${API_BASE_URL}/admin/pending-reviews`
      );
      const res = await axios.get(`${API_BASE_URL}/admin/pending-reviews`);
      console.log("[Notifications] Data received:", res.data);
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  React.useEffect(() => {
    console.log("[Notifications] User object:", user);
    if (user?.role === "admin" || user?.designation === "Admin") {
      fetchNotifications();

      const onUpdate = (data) => {
        console.log("[Notifications] Real-time update signal received:", data);
        fetchNotifications();

        // Only show toast for new review items if possible, or a general message
        if (data?.type === "task") {
          showToast(
            `New task submitted for review: ${data.title || "Review Task"}`,
            "info"
          );
        } else if (data?.type === "milestone") {
          showToast(`Project milestone submitted for review.`, "info");
        }
      };

      socket.on("task_notification", onUpdate);
      socket.on("attendance_update", onUpdate);
      socket.on("project_comment", onUpdate);
      socket.on("notification_update", onUpdate);

      return () => {
        socket.off("task_notification", onUpdate);
        socket.off("attendance_update", onUpdate);
        socket.off("project_comment", onUpdate);
        socket.off("notification_update", onUpdate);
      };
    }
  }, [user]);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleNotificationClick = (notif) => {
    setShowNotifications(false);
    if (notif.type === "task") {
      navigate("/admintask", { state: { taskId: notif._id } });
    } else if (notif.type === "milestone") {
      navigate(`/projects/${notif.projectId}`, {
        state: { milestoneId: notif._id },
      });
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/employees/${user._id}/profile-picture`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // Update user context with new profile picture
      updateUser({ ...user, profilePicture: res.data.profilePicture });
      showToast("Profile picture updated!", "success");
    } catch (err) {
      console.error("Upload failed", err);
      showToast("Failed to upload profile picture.", "error");
    }
  };

  return (
    <header
      className="w-full h-14 flex items-center justify-end px-6
      bg-linear-to-r from-[#5aa9ff] to-[#4f8dff] shadow-sm"
    >
      <div className="flex items-center gap-5 text-white ">
        <IoHelpCircleOutline
          size={20}
          className="cursor-pointer opacity-90 hover:opacity-100"
        />

        <div className="relative" ref={dropdownRef}>
          <div
            className="cursor-pointer opacity-90 hover:opacity-100 p-1 rounded-full hover:bg-white/10 transition-colors"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <IoNotificationsOutline size={22} title="Review Notifications" />
            {notifications.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 rounded-full text-[10px] font-bold flex items-center justify-center border border-white shadow-sm animate-bounce">
                {notifications.length}
              </span>
            )}
          </div>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 origin-top-right">
              <div className="p-4 bg-slate-50 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest">
                  Review Queue
                </h3>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                  {notifications.length} Pending
                </span>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notif, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleNotificationClick(notif)}
                      className="p-4 hover:bg-blue-50/50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors group"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">
                          {notif.type}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {new Date(notif.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {notif.title}
                      </h4>
                      <p className="text-[10px] text-gray-500 mt-0.5 italic">
                        {notif.type === "task"
                          ? `From: ${notif.employeeName}`
                          : `Project: ${notif.projectName}`}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 opacity-40">
                      <IoNotificationsOutline
                        size={24}
                        className="text-gray-400"
                      />
                    </div>
                    <p className="text-xs text-gray-400 font-medium">
                      All caught up! No items to review.
                    </p>
                  </div>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-3 bg-slate-50 border-t border-gray-100 text-center">
                  <button
                    onClick={() => {
                      if (notifications[0].type === "task")
                        navigate("/admin/tasks");
                      else navigate(`/projects/${notifications[0].projectId}`);
                      setShowNotifications(false);
                    }}
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Manage All Reviews
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <span className="h-6 w-px bg-white/40"></span>

        <div className="flex items-center gap-3">
          <p className="text-sm">
            Welcome&nbsp;
            <span className="font-semibold">{user?.fullName || "Admin"}</span>
          </p>

          <div className="relative group cursor-pointer">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <img
              src={
                user?.profilePicture
                  ? `${API_BASE_URL}${user.profilePicture}`
                  : "https://i.pravatar.cc/150?u=a042581f4e29026024d"
              }
              alt="Profile"
              className="w-9 h-9 rounded-full border-2 border-white object-cover"
              onClick={() => fileInputRef.current.click()}
            />
            <div
              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => fileInputRef.current.click()}
            >
              <MdCameraAlt className="text-white w-3 h-3" />
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1 px-3 py-1 rounded-md border
          text-sm hover:bg-white/20 transition cursor-pointer"
        >
          <IoLogOutOutline size={18} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
