import React from "react";
import { Outlet } from "react-router-dom";

import AdminHeader from "./Header/AdminHeader";
import AdminSidebar from "./Sidebar/AdminSidebar";

const AdminLayout = () => {
  return (
    <div className="flex h-screen">
      <div className="w-[24%]">
        <AdminSidebar />
      </div>

      <div className="w-full flex flex-col">
        <AdminHeader />
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
