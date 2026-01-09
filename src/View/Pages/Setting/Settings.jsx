import React, { useState } from "react";
import { API_BASE_URL } from "../../../config";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";

const Settings = () => {
  const { user, updateUser } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [username, setUsername] = useState(user?.username || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      return setMessage({ text: "Passwords don't match", type: "error" });
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      // In this app, we're doing a simple update.
      // Ideally we'd verify current password on backend first.
      const res = await axios.patch(`${API_BASE_URL}/profile/${user._id}`, {
        fullName,
        username,
        password: newPassword || undefined,
        currentPassword: currentPassword || undefined,
      });

      if (res.status === 200) {
        setMessage({ text: "Profile updated successfully!", type: "success" });
        updateUser(res.data.employee);
        setNewPassword("");
        setConfirmPassword("");
        setCurrentPassword("");
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Update failed",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-white p-4">
      <h1 className="text-3xl font-black mb-8 uppercase tracking-tighter text-blue-400">
        Personal Settings
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ===== Profile Card ===== */}
        <div className="bg-[#141857] rounded-3xl p-8 shadow-2xl border border-white/5 backdrop-blur-sm transform transition-all hover:border-blue-500/30">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></span>
            Identity Profile
          </h2>

          <div className="flex items-center gap-6 mb-8">
            {user?.profilePicture ? (
              <img
                src={`${API_BASE_URL}${user.profilePicture}`}
                alt="Profile"
                className="w-24 h-24 rounded-full border-4 border-indigo-500/50 object-cover shadow-2xl"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-indigo-500/50 bg-indigo-900/50 flex items-center justify-center text-3xl font-black text-blue-300 shadow-2xl">
                {fullName.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-xs font-black text-blue-400 uppercase tracking-widest">
                Public Username
              </p>
              <p className="text-lg font-bold">@{username}</p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-1">
                Display Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-4 rounded-2xl bg-[#0f1235]/80 border border-white/5 focus:bg-[#0f1235] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-1">
                Username ID
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-4 rounded-2xl bg-[#0f1235]/80 border border-white/5 focus:bg-[#0f1235] focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium"
              />
            </div>
          </div>
        </div>

        {/* ===== Password Card ===== */}
        <div className="bg-[#141857] rounded-3xl p-8 shadow-2xl border border-white/5 backdrop-blur-sm transform transition-all hover:border-pink-500/30">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-8 flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]"></span>
            Security Credentials
          </h2>

          <div className="space-y-5">
            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-1">
                Current Password
              </label>
              <input
                type="password"
                placeholder="Current secret key"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-4 rounded-2xl bg-[#0f1235]/80 border border-white/5 focus:bg-[#0f1235] focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-[#0f1235]/80 border border-white/5 focus:bg-[#0f1235] focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all font-medium"
                  placeholder="Create new"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2 block ml-1">
                  Confirm Target
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-[#0f1235]/80 border border-white/5 focus:bg-[#0f1235] focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all font-medium"
                  placeholder="Repeat new"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4">
            {message.text && (
              <div
                className={`p-4 rounded-2xl text-xs font-black text-center uppercase tracking-widest border animate-pulse ${
                  message.type === "success"
                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              onClick={handleUpdate}
              disabled={loading}
              className={`py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl transition-all transform active:scale-95 ${
                loading
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-[linear-gradient(45deg,#4f46e5,#9333ea)] hover:shadow-indigo-500/20"
              }`}
            >
              {loading ? "Transmitting Data..." : "Sync Profile Updates"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
