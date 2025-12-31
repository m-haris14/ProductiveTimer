import React from "react";

const AdminSettings = () => {
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-blue-700 mb-6">
        Settings
        <p className="text-blue-400 text-base mb-8 font-normal">You Can Change Your profile Picture, Name or Password</p>
        </h1>

      <div className="bg-white rounded-xl shadow p-6 max-w-3xl">
        <General />
      </div>
    </div>
  );
};

/* ===== General Section ===== */
const General = () => (
  <div className="space-y-8 ">
    
    {/* Profile */}
    <div className="flex items-center gap-5">
      <img
        src="https://i.pravatar.cc/120"
        className="w-24 h-24 rounded-full border"
        alt="profile"
      />
      <div>
        <button className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100 transition">
          Upload Photo
        </button>
        <p className="text-xs text-gray-500 mt-2">
          JPG, PNG up to 2MB
        </p>
      </div>
    </div>

    {/* Info */}
    <Item title="Name" value="Haris Admin" />
    <Item title="Email" value="admin@productivetimer.com" />
    <Item title="Language" value="English (US)" />
  </div>
);

/* ===== Item ===== */
const Item = ({ title, value }) => (
  <div className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-3">
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="font-medium">{value}</p>
    </div>
    <button className="text-blue-600 text-sm hover:underline">
      Edit
    </button>
  </div>
);

export default AdminSettings;
