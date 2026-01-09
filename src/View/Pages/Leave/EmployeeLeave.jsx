import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import { useAuth } from "../../../context/AuthContext";
import {
  FaRegCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaCalendarPlus,
  FaHistory,
  FaPlus,
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";

const EmployeeLeave = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [formData, setFormData] = useState({
    leaveType: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (user?._id) {
      fetchLeaves();
    }
  }, [user]);

  const fetchLeaves = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/leave/my/${user._id}`);
      setLeaves(response.data);
    } catch (error) {
      console.error("Error fetching leaves:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await axios.post(`${API_BASE_URL}/leave/apply`, {
        employeeId: user._id,
        ...formData,
      });
      setMessage("Leave applied successfully!");
      setFormData({ leaveType: "", fromDate: "", toDate: "", reason: "" });
      fetchLeaves();
      setTimeout(() => {
        setShowModal(false);
        setMessage("");
      }, 1500);
    } catch (error) {
      setMessage("Error applying for leave.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" text-white">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
              <FaCalendarPlus className="text-purple-400" />
              Leave Management
            </h1>
            <p className="text-slate-400 mt-1">
              Track your leave history and status
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <FaPlus />
            Apply Leave
          </button>
        </div>

        {/* Leave History Table (Full Width) */}
        <div className="bg-[#141843] rounded-2xl p-6 shadow-xl border border-white/5 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-6 text-xl font-semibold text-purple-300">
            <FaHistory />
            <h2>Leave History</h2>
          </div>

          <div className="flex-1 overflow-auto rounded-xl border border-white/5 bg-[#0b0e2b]/50">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#0b0e2b] text-slate-400 sticky top-0">
                <tr>
                  <th className="p-4 font-medium">Type</th>
                  <th className="p-4 font-medium">Dates</th>
                  <th className="p-4 font-medium">Reason</th>
                  <th className="p-4 font-medium">Applied On</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leaves.length > 0 ? (
                  leaves.map((leave) => (
                    <tr
                      key={leave._id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4 font-medium text-blue-200">
                        {leave.leaveType}
                      </td>
                      <td className="p-4 text-slate-300 text-sm">
                        <div className="flex flex-col">
                          <span>
                            {new Date(leave.fromDate).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-slate-500">to</span>
                          <span>
                            {new Date(leave.toDate).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-300 text-sm max-w-xs truncate">
                        {leave.reason}
                      </td>
                      <td className="p-4 text-slate-400 text-sm">
                        {new Date(leave.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                            leave.status === "Approved"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : leave.status === "Rejected"
                              ? "bg-red-500/10 text-red-400 border-red-500/20"
                              : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                          }`}
                        >
                          {leave.status === "Approved" && <FaCheckCircle />}
                          {leave.status === "Rejected" && <FaTimesCircle />}
                          {leave.status === "Pending" && <FaHourglassHalf />}
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">
                      No leave history found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#141843] w-full max-w-lg rounded-2xl shadow-2xl border border-white/10 overflow-hidden transform transition-all scale-100 animate-scaleIn relative">
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0b0e2b]/50">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <FaRegCalendarAlt className="text-blue-400" />
                Apply for Leave
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/5"
              >
                <IoClose size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Leave Type
                  </label>
                  <select
                    name="leaveType"
                    value={formData.leaveType}
                    onChange={handleChange}
                    className="w-full bg-[#0b0e2b] border border-slate-700 text-slate-200 rounded-lg p-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Sick">Sick Leave</option>
                    <option value="Casual">Casual Leave</option>
                    <option value="Annual">Annual Leave</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      From Date
                    </label>
                    <input
                      type="date"
                      name="fromDate"
                      value={formData.fromDate}
                      onChange={handleChange}
                      className="w-full bg-[#0b0e2b] border border-slate-700 text-slate-200 rounded-lg p-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all block"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      To Date
                    </label>
                    <input
                      type="date"
                      name="toDate"
                      value={formData.toDate}
                      onChange={handleChange}
                      className="w-full bg-[#0b0e2b] border border-slate-700 text-slate-200 rounded-lg p-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all block"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Reason
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Why do you need leave?"
                    className="w-full bg-[#0b0e2b] border border-slate-700 text-slate-200 rounded-lg p-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 h-24 resize-none transition-all"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-white shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${
                    loading
                      ? "bg-slate-600 cursor-not-allowed"
                      : "bg-linear-to-r from-blue-500 to-indigo-600 hover:shadow-blue-500/25"
                  }`}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : "Submit Application"}
                </button>

                {message && (
                  <div
                    className={`p-3 rounded-lg text-sm font-medium text-center ${
                      message.includes("Error")
                        ? "bg-red-500/10 text-red-400 border border-red-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    {message}
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeLeave;
