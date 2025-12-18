import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = ["Dashboard", "Tasks", "Reports", "Settings", "Attendence", "login", ];

  return (
    <div className="w-74 h-screen p-5 rounded-2xl bg-[#141843] shadow-[0_0_40px_rgba(90,169,255,0.35)] text-white">
      <h1 className="text-xl font-bold mb-6">📊 Dashboard</h1>

      {menu.map((item) => {
        const path = `/${item}`;
        const isActive = location.pathname === path;

        return (
          <div
            key={item}
            onClick={() => navigate(path)}
            className={`mb-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300
              ${
                isActive
                  ? "bg-linear-to-r from-[#5aa9ff] to-[#8b5cf6]  opacity-100"
                  : "opacity-60 hover:opacity-100 hover:bg-linear-to-r hover:from-[#5aa9ff] hover:to-[#8b5cf6] hover:text-white"
              }
            `}
          >
            {item}
          </div>
        );
      })}
    </div>
  );
};

export default Sidebar;
