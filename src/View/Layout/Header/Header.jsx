import React from 'react';
import { useLocation } from 'react-router-dom';
import { MdOutlineDashboard } from "react-icons/md";
import { IoPersonAddOutline, IoSettingsOutline, IoLogOutOutline } from "react-icons/io5";
import { RiFileList3Line } from "react-icons/ri";
import { TfiAnnouncement } from "react-icons/tfi";

const Header = () => {
    const location = useLocation();

    const getPageInfo = (pathname) => {
        switch (pathname) {
            case '/': 
                return { title: 'Dashboard', icon: <MdOutlineDashboard size={24} /> };
            case '/register': 
                return { title: 'Add Employee', icon: <IoPersonAddOutline size={24} /> };
            case '/pomodoro': 
                return { title: 'Pomodoro', icon: <RiFileList3Line size={24} /> };
            case '/reports': 
                return { title: 'Reports', icon: <RiFileList3Line size={24} /> };
            case '/tasks': 
                return { title: 'Tasks', icon: <RiFileList3Line size={24} /> };
            case '/attendance': 
                return { title: 'Attendance', icon: <TfiAnnouncement size={24} /> };
            case '/login': 
                return { title: 'Login', icon: <TfiAnnouncement size={24} /> };
            case '/settings': 
                return { title: 'Settings', icon: <IoSettingsOutline size={24} /> };
            default: 
                return { title: 'Dashboard', icon: <MdOutlineDashboard size={24} /> };
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
                        <p className="text-sm font-semibold text-white">Muhammad Ali</p>
                    </div>
                    <img
                        src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
                        alt="Profile"
                        className="w-10 h-10 rounded-full border-2 border-[#5aa9ff] p-0.5 object-cover"
                    />
                </div>

                <div className="h-6 w-px bg-gray-700"></div>

                <button 
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-300 group"
                    title="Logout"
                >
                    <IoLogOutOutline size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                    <span className="text-sm font-medium">Logout</span>
                </button>
            </div>
        </div>
    )
}

export default Header