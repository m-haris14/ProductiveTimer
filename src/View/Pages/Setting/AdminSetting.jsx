import React, { useState } from "react";
import { API_BASE_URL } from "../../../config";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";

const AdminSettings = () => {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || "Admin");
  const [username, setUsername] = useState(user?.username || "admin");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await axios.patch(
        `${API_BASE_URL}/profile/${user._id}`, // Use consistent endpoint
        {
          fullName,
          username,
          password: password || undefined,
          currentPassword: currentPassword || undefined,
        }
      );

      if (res.status === 200) {
        setMessage({ text: "Profile updated successfully!", type: "success" });
        updateUser(res.data.employee); // Fixed: updateUser instead of setUser
        setPassword("");
        setCurrentPassword("");
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Failed to update profile",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-blue-700 mb-6">
        Account Settings
        <p className="text-blue-400 text-base mb-8 font-normal">
          Manage your administrator profile and credentials.
        </p>
      </h1>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-2xl transform transition-all">
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-xl text-sm font-bold text-center border ${
              message.type === "success"
                ? "bg-green-50 text-green-600 border-green-100"
                : "bg-red-50 text-red-600 border-red-100"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="flex items-center gap-6 mb-8 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
            {user?.profilePicture ? (
              <img
                src={`${API_BASE_URL}${user.profilePicture}`}
                alt="Profile"
                className="w-20 h-20 rounded-full bg-blue-600 object-cover shadow-lg shadow-blue-500/20"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-500/20">
                {fullName.charAt(0)}
              </div>
            )}
            <div>
              <h3 className="font-black text-gray-800 text-lg uppercase tracking-tight">
                System Administrator
              </h3>
              <p className="text-blue-500 text-sm font-bold uppercase tracking-widest opacity-70">
                Role: {user?.designation}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Full Display Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-5 py-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-gray-700"
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Current Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-5 py-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-gray-700"
                placeholder="Enter username"
              />
            </div>

            <div className="pt-2 border-t border-gray-50 mt-2 space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Current Password (Required for changes)
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-gray-700"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  New Password (Optional)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3.5 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-gray-700"
                  placeholder="•••••••• (Leave blank to keep current)"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-black text-white uppercase tracking-widest text-sm shadow-xl transition-all transform hover:-translate-y-1 active:scale-[0.98] ${
                loading
                  ? "bg-gray-400"
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
              }`}
            >
              {loading ? "Processing..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
