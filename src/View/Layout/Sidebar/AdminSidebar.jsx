import { MdOutlineDashboard } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";
import { IoPersonAddOutline, IoSettingsOutline } from "react-icons/io5";
import { RiFileList3Line } from "react-icons/ri";
import { TfiAnnouncement } from "react-icons/tfi";
import { SiTimescale } from "react-icons/si";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    { text: "Admin Dashboard", icon: <MdOutlineDashboard size={18} />, path: "/" },
    {
      text: "Add Employee",
      icon: <IoPersonAddOutline size={18} />,
      path: "/register",
    },
    {
      text: "Pomodoro",
      icon: <RiFileList3Line size={18} />,
      path: "/pomodoro",
    },
    { text: "Reports", icon: <RiFileList3Line size={18} />, path: "/reports" },
    { text: "Tasks", icon: <RiFileList3Line size={18} />, path: "/tasks" },
    {
      text: "Attendence",
      icon: <TfiAnnouncement size={18} />,
      path: "/attendence",
    },
    {
      text: "Settings",
      icon: <IoSettingsOutline size={18} />,
      path: "/settings",
    },
  ];

  return (
    <div className="w-72 h-screen px-4 py-5 bg-[#f3f4f6] border-r border-gray-200">

      {/* Logo */}
      <h1 className="text-xl flex items-center gap-2 font-bold text-[#2563eb] mb-6">
        <SiTimescale className="text-[#2563eb]" />
        Productive Timer
      </h1>

      {/* Menu */}
      {menu.map((item, index) => {
        const isActive = location.pathname === item.path;

        return (
          <div
            key={index}
            onClick={() => navigate(item.path)}
            className={`mb-2 px-4 py-2 rounded-lg cursor-pointer flex items-center gap-3
              transition-all duration-200
              ${
                isActive
                  ? "bg-[#e0ecff] text-[#2563eb] font-medium"
                  : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
              }
            `}
          >
            <span
              className={`${
                isActive ? "text-[#2563eb]" : "text-gray-500"
              }`}
            >
              {item.icon}
            </span>

            <span className="text-sm">{item.text}</span>
          </div>
        );
      })}
    </div>
  );
};

export default AdminSidebar;
