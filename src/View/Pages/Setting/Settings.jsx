import React, { useState } from "react";

const Settings = () => {
  const [name, setName] = useState("Ali");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [previewImage, setPreviewImage] = useState(
    "https://i.pravatar.cc/150"
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen p-6 bg-linear-to-br from-[#0f1235] via-[#141857] to-[#1b1f6b] text-white">

      {/* ===== Page Header ===== */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-gray-300 text-sm">
          Manage your account settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ===== Profile Card ===== */}
        <div className="bg-[#141857] rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Profile</h2>

          <div className="flex items-center gap-5 mb-6">
            <img
              src={previewImage}
              alt="Profile"
              className="w-24 h-24 rounded-full border-4 border-indigo-500 object-cover"
            />

            <div>
              <label className="cursor-pointer inline-block px-4 py-2 rounded-lg bg-linear-to-r from-blue-500 to-indigo-500 text-sm font-medium hover:opacity-90">
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-300">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-2 p-3 rounded-xl bg-[#0f1235] border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button className="mt-5 px-6 py-3 rounded-xl bg-linear-to-r from-indigo-500 to-purple-500 font-medium hover:opacity-90">
            Save Profile
          </button>
        </div>

        {/* ===== Password Card ===== */}
        <div className="bg-[#141857] rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Change Password</h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-300">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full mt-2 p-3 rounded-xl bg-[#0f1235] border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-300">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full mt-2 p-3 rounded-xl bg-[#0f1235] border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm text-gray-300">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full mt-2 p-3 rounded-xl bg-[#0f1235] border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button className="mt-5 px-6 py-3 rounded-xl bg-linear-to-r from-pink-500 to-purple-500 font-medium hover:opacity-90">
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
