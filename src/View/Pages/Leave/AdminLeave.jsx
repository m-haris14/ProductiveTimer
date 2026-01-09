import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import { useToast } from "../../../context/ToastContext";
import { IoCheckmarkCircle, IoCloseCircle } from "react-icons/io5";

const AdminLeave = () => {
  const { showToast } = useToast();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/leave/all`);
      // Filter out admins
      const nonAdminLeaves = res.data.filter(
        (l) => l.employee?.designation !== "Admin"
      );
      setLeaves(nonAdminLeaves);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    try {
      await axios.put(`${API_BASE_URL}/leave/status/${id}`, {
        status,
      });
      fetchLeaves(); // Refresh
      showToast("Leave status updated", "success");
    } catch (err) {
      showToast("Error updating leave", "error");
    }
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-900">Leave Requests</h1>
        <p className="text-blue-400 text-sm">
          Manage employee leave applications
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-gray-50 border-b border-gray-100 uppercase text-[10px] tracking-widest font-bold text-gray-400">
            <tr>
              <th className="px-6 py-4 text-center">#</th>
              <th className="px-6 py-4 text-left">Employee</th>
              <th className="px-6 py-4 text-center">Type</th>
              <th className="px-6 py-4 text-center">Dates</th>
              <th className="px-6 py-4 text-left">Reason</th>
              <th className="px-6 py-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {leaves.map((leave, index) => (
              <tr
                key={leave._id}
                className="hover:bg-blue-50/50 transition-colors"
              >
                <td className="px-6 py-4 text-center font-bold text-gray-500">
                  {index + 1}
                </td>
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">
                    {leave.employee?.fullName}
                  </div>
                  <div className="text-xs text-gray-400">
                    {leave.employee?.department}
                  </div>
                </td>
                <td className="px-6 py-4 text-center font-medium">
                  {leave.leaveType}
                </td>
                <td className="px-6 py-4 text-center text-gray-500">
                  {new Date(leave.fromDate).toLocaleDateString()} <br /> to{" "}
                  <br /> {new Date(leave.toDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-gray-600 max-w-xs">
                  {leave.reason}
                </td>
                <td className="px-6 py-4 text-center flex flex-col items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border 
                                ${
                                  leave.status === "Pending"
                                    ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                    : leave.status === "Approved"
                                    ? "bg-green-100 text-green-700 border-green-200"
                                    : "bg-red-100 text-red-700 border-red-200"
                                }`}
                  >
                    {leave.status}
                  </span>

                  {leave.status === "Pending" && (
                    <div className="flex justify-center gap-2 mt-1">
                      <button
                        onClick={() =>
                          handleStatusUpdate(leave._id, "Approved")
                        }
                        className="text-green-500 hover:text-green-600 bg-green-50 p-2 rounded-full transition-all hover:scale-110"
                        title="Approve"
                      >
                        <IoCheckmarkCircle size={20} />
                      </button>
                      <button
                        onClick={() =>
                          handleStatusUpdate(leave._id, "Rejected")
                        }
                        className="text-red-500 hover:text-red-600 bg-red-50 p-2 rounded-full transition-all hover:scale-110"
                        title="Reject"
                      >
                        <IoCloseCircle size={20} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {leaves.length === 0 && !loading && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-400">
                  No requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLeave;
