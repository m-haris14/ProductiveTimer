import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../context/ToastContext";
import { MdOutlineDashboard, MdCameraAlt } from "react-icons/md";
import { FaRegCalendarAlt } from "react-icons/fa"; // Added FaRegCalendarAlt
import {
  IoPersonAddOutline,
  IoSettingsOutline,
  IoLogOutOutline,
  IoBriefcaseOutline,
} from "react-icons/io5";
import { RiFileList3Line } from "react-icons/ri";
import { TfiAnnouncement } from "react-icons/tfi";
import axios from "axios";
import { API_BASE_URL } from "../../../config";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, updateUser } = useAuth();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
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

  const getPageInfo = (pathname) => {
    switch (pathname) {
      case "/":
        return { title: "Dashboard", icon: <MdOutlineDashboard size={24} /> };
      case "/register":
        return {
          title: "Add Employee",
          icon: <IoPersonAddOutline size={24} />,
        };
      case "/pomodoro":
        return { title: "Pomodoro", icon: <RiFileList3Line size={24} /> };
      case "/projects":
        return { title: "Projects", icon: <IoBriefcaseOutline size={24} /> };
      case "/reports":
        return { title: "Reports", icon: <RiFileList3Line size={24} /> };
      case "/leave":
        return {
          title: "Leave Management",
          icon: <FaRegCalendarAlt size={24} className="text-yellow-400" />,
        };
      case "/tasks":
        return { title: "Tasks", icon: <RiFileList3Line size={24} /> };
      case "/attendance":
        return { title: "Attendance", icon: <TfiAnnouncement size={24} /> };
      case "/login":
        return { title: "Login", icon: <TfiAnnouncement size={24} /> };
      case "/settings":
        return { title: "Settings", icon: <IoSettingsOutline size={24} /> };
      default:
        return { title: "Dashboard", icon: <MdOutlineDashboard size={24} /> };
    }
  };

  const { title, icon } = getPageInfo(location.pathname);

  return (
    <div className="flex justify-between items-center bg-[#141843] p-3 rounded-xl shadow-lg shadow-blue-500/10 mx-6 mt-4 mb-2">
      {/* Left: Page Title & Icon */}
      <div className="flex items-center gap-3 text-white pl-2">
        <span className="text-[#5aa9ff]">{icon}</span>
        <h1 className="text-xl font-bold tracking-wide">{title}</h1>
      </div>

      {/* Right: Employee Info */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-lg font-semibold text-white">
              {user?.fullName.charAt(0).toUpperCase() +
                user?.fullName.slice(1) || "Employee"}
            </p>
          </div>
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
              className="w-10 h-10 rounded-full border-2 border-[#5aa9ff] p-0.5 object-cover"
              onClick={() => fileInputRef.current.click()}
            />
            <div
              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => fileInputRef.current.click()}
            >
              <MdCameraAlt className="text-white w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="h-6 w-px bg-gray-700"></div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 group cursor-pointer"
          title="Logout"
        >
          <IoLogOutOutline
            size={20}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Header;
