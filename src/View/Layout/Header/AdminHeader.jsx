import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { MdOutlineDashboard } from "react-icons/md";
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

const AdminHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };



  return (
    <header className="w-full h-14 flex items-center justify-end px-6
      bg-linear-to-r from-[#5aa9ff] to-[#4f8dff] shadow-sm">

      <div className="flex items-center gap-5 text-white ">

        <IoHelpCircleOutline size={20} className="cursor-pointer opacity-90 hover:opacity-100" />

        <div className="relative cursor-pointer">
          <IoNotificationsOutline size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>

        <span className="h-6 w-px bg-white/40"></span>

        <div className="flex items-center gap-3">
          <p className="text-sm">
            Welcome&nbsp;
            <span className="font-semibold">
              {user?.fullName || "Employee"}
            </span>
          </p>

          <img
            src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
            alt="Profile"
            className="w-9 h-9 rounded-full border-2 border-white object-cover"
          />
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
