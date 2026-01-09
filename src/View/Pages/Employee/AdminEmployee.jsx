import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import { FaUserPlus, FaTrash, FaEdit, FaChartBar } from "react-icons/fa";
import { IoStatsChart } from "react-icons/io5";
import ReportModal from "../../../component/Report/ReportModal";
import { useToast } from "../../../context/ToastContext";
import { useConfirm } from "../../../context/ConfirmContext";

const AdminEmployee = () => {
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [employees, setEmployees] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedEmployeeForReport, setSelectedEmployeeForReport] =
    useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    password: "",
    designation: "Employee",
    department: "",
    dailyRequiredHours: 8,
  });

  const fetchEmployees = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/employees`);
      setEmployees(response.data);

      try {
        const attResponse = await axios.get(`${API_BASE_URL}/attendance/all`);
        // Create a map of employee ID -> status
        const attMap = {};
        if (Array.isArray(attResponse.data)) {
          attResponse.data.forEach((att) => {
            attMap[att.id] = att.status; // 'working', 'break', or undefined/null
          });
        }
        setAttendanceData(attMap);
      } catch (attErr) {
        console.error("Error fetching attendance status:", attErr);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // search filter
  const filteredEmployees = employees.filter((emp) =>
    `${emp.fullName} ${emp.username} ${emp.designation} ${emp.department || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // input handler
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setFormData({
      fullName: "",
      username: "",
      password: "",
      designation: "Employee",
      department: "",
      dailyRequiredHours: 8,
      machineId: "",
    });
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEditModal = (emp) => {
    setFormData({
      fullName: emp.fullName,
      username: emp.username,
      password: "", // Leave blank to keep unchanged
      designation: emp.designation || "Employee",
      department: emp.department || "",
      dailyRequiredHours: emp.currentDailyRequiredHours || 8,
      machineId: emp.machineId || "",
    });
    setEditingId(emp._id);
    setIsEditMode(true);
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (isEditMode) {
        // UPDATE
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password; // Don't send empty password

        const response = await axios.put(
          `${API_BASE_URL}/employees/${editingId}`,
          updateData
        );

        if (response.status === 200) {
          showToast("Employee updated successfully!", "success");
          fetchEmployees();
          setTimeout(() => {
            setShowModal(false);
            setIsEditMode(false);
            setEditingId(null);
          }, 1500);
        }
      } else {
        // CREATE
        const response = await axios.post(
          `${API_BASE_URL}/employees`,
          formData
        );

        if (response.status === 201) {
          showToast("Employee added successfully!", "success");
          fetchEmployees();
          setTimeout(() => {
            setShowModal(false);
          }, 1500);
        }
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message);
      } else {
        setError("Network error");
      }
    }
  };

  const handleDeleteEmployee = async (id, name) => {
    const isConfirmed = await confirm(
      `Are you sure you want to delete employee "${name}"? This action cannot be undone.`,
      "Delete Account"
    );
    if (isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/employees/${id}`);
        showToast("Employee deleted successfully!", "success");
        fetchEmployees(); // Refresh list
      } catch (err) {
        console.error("Error deleting employee:", err);
        showToast(
          err.response?.data?.message || "Error deleting employee",
          "error"
        );
      }
    }
  };

  if (loading && employees.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-xl font-bold text-blue-600 animate-pulse">
          Loading Employees...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-blue-700">Employee BioData</h1>
          <p className="text-blue-400 mt-1 font-medium italic">
            Manage and monitor employee details.
          </p>
        </div>

        <div className="flex gap-4">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-4 pr-10 py-2.5 rounded-xl border border-blue-100 bg-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none w-72 text-sm transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300">
              🔍
            </span>
          </div>

          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/10 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
          >
            + Add Employee
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 mb-6">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-400 uppercase text-[10px] tracking-widest font-bold">
            <tr>
              <th className="px-4 py-4 text-center">#</th>
              <th className="px-4 py-4 text-left">Full Name</th>
              <th className="px-4 py-4 text-center">Username</th>
              <th className="px-4 py-4 text-center">Department</th>
              <th className="px-4 py-4 text-center">Designation</th>
              <th className="px-4 py-4 text-center">Report</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {filteredEmployees.map((emp) => (
              <tr
                key={emp._id}
                className="hover:bg-blue-50/30 transition-colors"
              >
                <td className="px-6 py-4 text-center font-bold text-gray-500">
                  {employees.indexOf(emp) + 1}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {emp.fullName.charAt(0)}
                    </div>
                    <span className="font-bold text-gray-800">
                      {emp.fullName}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center font-medium text-gray-500">
                  @{emp.username}
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="font-semibold text-gray-600 italic">
                    {emp.department || "No Dept."}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                      emp.designation === "Admin"
                        ? "bg-purple-100 text-purple-700 border border-purple-200"
                        : "bg-blue-100 text-blue-700 border border-blue-200"
                    }`}
                  >
                    {emp.designation || "Employee"}
                  </span>
                </td>

                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {(() => {
                      const status = attendanceData[emp._id];
                      let colorClass = "bg-gray-400";
                      let textClass = "text-gray-500";
                      let label = "Offline";
                      let animate = false;

                      if (status === "working") {
                        colorClass = "bg-green-500";
                        textClass = "text-green-600";
                        label = "Active";
                        animate = true;
                      } else if (status === "break") {
                        colorClass = "bg-yellow-500";
                        textClass = "text-yellow-600";
                        label = "On Break";
                        animate = true;
                      } else if (status === "leave") {
                        colorClass = "bg-red-500";
                        textClass = "text-red-600";
                        label = "On Leave";
                        animate = false;
                      }

                      return (
                        <>
                          <span className="relative flex h-2 w-2">
                            {animate && (
                              <span
                                className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colorClass} opacity-75`}
                              ></span>
                            )}
                            <span
                              className={`relative inline-flex rounded-full h-2 w-2 ${colorClass}`}
                            ></span>
                          </span>
                          <span
                            className={`text-[11px] font-bold uppercase ${textClass}`}
                          >
                            {label}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </td>

                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleDeleteEmployee(emp._id, emp.fullName)}
                    className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors mr-2"
                    title="Delete Employee"
                  >
                    <FaTrash size={16} />{" "}
                    {/* Slightly smaller icon for delete */}
                  </button>
                  <button
                    onClick={() => openEditModal(emp)}
                    className="text-yellow-500 hover:text-yellow-700 bg-yellow-50 hover:bg-yellow-100 p-2 rounded-lg transition-colors mr-2"
                    title="Edit Employee"
                  >
                    <FaEdit size={20} />
                  </button>
                  <button
                    onClick={() => setSelectedEmployeeForReport(emp)}
                    className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors"
                    title="View Report"
                  >
                    <IoStatsChart size={20} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredEmployees.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-12 text-center text-gray-400 italic"
                >
                  No employees found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-0 overflow-hidden transform scale-100 transition-transform max-h-[90vh] flex flex-col">
            <div
              className={`px-6 py-4 text-white flex justify-between items-center ${
                isEditMode ? "bg-yellow-600" : "bg-blue-600"
              }`}
            >
              <h2 className="text-xl font-bold">
                {isEditMode ? "Edit Employee" : "Add New Employee"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setIsEditMode(false);
                  setEditingId(null);
                }}
                className="text-white/60 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg text-center font-medium">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-100 text-green-600 text-sm rounded-lg text-center font-medium">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                    Full Name
                  </label>
                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Enter Full Name"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                    Username
                  </label>
                  <input
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Create a unique username"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                    Initial Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all"
                    required={!isEditMode}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                    Designation
                  </label>
                  <select
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all"
                  >
                    <option value="Employee">Employee</option>
                    <option value="Team Lead">Team Lead</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                    Department
                  </label>
                  <input
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g. Engineering, HR, Sales"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                    Daily Required Hours
                  </label>
                  <input
                    type="number"
                    name="dailyRequiredHours"
                    value={formData.dailyRequiredHours || ""}
                    onChange={handleChange}
                    placeholder="8"
                    min="1"
                    max="24"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">
                    Biometric Machine ID
                  </label>
                  <input
                    type="number"
                    name="machineId"
                    value={formData.machineId || ""}
                    onChange={handleChange}
                    placeholder="e.g. 101"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setIsEditMode(false);
                      setEditingId(null);
                    }}
                    className="flex-1 px-4 py-3 border border-gray-100 rounded-xl font-bold text-gray-400 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 px-4 py-3 text-white rounded-xl font-bold shadow-lg transition-all hover:-translate-y-0.5 ${
                      isEditMode
                        ? "bg-yellow-600 hover:bg-yellow-700 shadow-yellow-900/10"
                        : "bg-blue-600 hover:bg-blue-700 shadow-blue-900/10"
                    }`}
                  >
                    {isEditMode ? "Update Account" : "Create Account"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {selectedEmployeeForReport && (
        <ReportModal
          employee={selectedEmployeeForReport}
          onClose={() => setSelectedEmployeeForReport(null)}
        />
      )}
    </div>
  );
};

export default AdminEmployee;
