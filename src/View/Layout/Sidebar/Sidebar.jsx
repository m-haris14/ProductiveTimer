import { MdOutlineDashboard } from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";
import { IoPersonAddOutline, IoSettingsOutline } from "react-icons/io5";
import { RiFileList3Line } from "react-icons/ri";
import { TfiAnnouncement } from "react-icons/tfi";
import { SiTimescale } from "react-icons/si";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    { text: "Dashboard", icon: <MdOutlineDashboard size={20} />, path: "/" },
    {
      text: "Add Employee",
      icon: <IoPersonAddOutline size={20} />,
      path: "/register",
    },
    {
      text: "Pomodoro",
      icon: <RiFileList3Line size={20} />,
      path: "/pomodoro",
    },
    { text: "Reports", icon: <RiFileList3Line size={20} />, path: "/reports" },
    { text: "Tasks", icon: <RiFileList3Line size={20} />, path: "/tasks" },
    {
      text: "Attendence",
      icon: <TfiAnnouncement size={20} />,
      path: "/attendence",
    },
    {
      text: "Settings",
      icon: <IoSettingsOutline size={20} />,
      path: "/settings",
    },
  ];

  return (
    <div className="w-74 h-screen p-5 bg-[#141843] shadow-[0_0_40px_rgba(90,169,255,0.35)] text-white">
      <h1 className="text-2xl flex items-center gap-2 font-bold mb-6"><SiTimescale/> Productive Timer</h1>

      {menu.map((item, index) => {
        const path = item.path;
        const isActive = location.pathname === path;

        return (
          <div
            key={index}
            onClick={() => navigate(path)}
            className={`mb-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 flex items-center gap-3
              ${
                isActive
                  ? "bg-linear-to-r from-[#5aa9ff] to-[#8b5cf6]  opacity-100"
                  : "opacity-60 hover:opacity-100 hover:bg-linear-to-r hover:from-[#5aa9ff] hover:to-[#8b5cf6] hover:text-white"
              }
            `}
          >
            {item.icon}
            <span className="font-medium">{item.text}</span>
          </div>
        );
      })}
    </div>
  );
};

export default Sidebar;
