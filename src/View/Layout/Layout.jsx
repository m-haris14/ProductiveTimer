import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar/Sidebar";
import Header from "./Header/Header";

const Layout = () => {
  return (
    <div className="flex h-screen">
      <div className="w-[24%]">
        <Sidebar />
      </div>

      <div className="w-full flex flex-col">
        <Header />
        <div className="p-6 flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
