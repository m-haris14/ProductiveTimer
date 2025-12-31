import React, { useState } from "react";

const AdminReports = () => {
  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const employees = [
    {
      id: 1,
      name: "Ali Khan",
      department: "Development",
      currentTask: "Dashboard UI",
      present: true,
      inOffice: true,
      completed: 70,
      today: "3h",
      week: "18h",
      month: "65h",
      attendance: "Present",
    },
    {
      id: 2,
      name: "Ahmed Raza",
      department: "Design",
      currentTask: "Landing Page",
      present: true,
      inOffice: false,
      completed: 45,
      today: "2h",
      week: "14h",
      month: "50h",
      attendance: "Present",
    },
    {
      id: 3,
      name: "Usman Ali",
      department: "QA",
      currentTask: "Testing Module",
      present: false,
      inOffice: false,
      completed: 90,
      today: "0h",
      week: "22h",
      month: "80h",
      attendance: "Absent",
    },
  ];

  const presentEmployees = employees.filter((e) => e.present);
  const inOfficeEmployees = presentEmployees.filter((e) => e.inOffice);
  const notInOfficeEmployees = presentEmployees.filter((e) => !e.inOffice);

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-gray-800 p-6">
      <h1 className="text-4xl font-bold text-blue-700">
        Reports
        <p className="text-blue-400 text-base mb-8 font-normal">You can See Employees Daily Reports</p>
        </h1>
      {/* ===== Search ===== */}
      <input
        type="text"
        placeholder="Search employee..."
        className="w-full mb-6 p-3 rounded-lg bg-white border border-gray-300 outline-none focus:ring-2 focus:ring-blue-400"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ===== Summary Cards ===== */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div
          className="bg-linear-to-br from-emerald-50 to-emerald-100 
p-5 rounded-2xl shadow border border-emerald-200"
        >
          <p className="text-sm text-emerald-700">Present Employees</p>
          <p className="text-3xl font-bold text-emerald-900">
            {presentEmployees.length}
          </p>
        </div>

        <div
          className="bg-linear-to-br from-sky-50 to-sky-100 
p-5 rounded-2xl shadow border border-sky-200"
        >
          <p className="text-sm text-sky-700">In Office</p>
          <p className="text-3xl font-bold text-sky-900">
            {inOfficeEmployees.length}
          </p>
        </div>

        <div
          className="bg-lineat-to-br from-amber-50 to-amber-100 
p-5 rounded-2xl shadow border border-amber-200"
        >
          <p className="text-sm text-amber-700">Not In Office</p>
          <p className="text-3xl font-bold text-amber-900">
            {notInOfficeEmployees.length}
          </p>
        </div>

        <div
          className="bg-linear-to-br from-indigo-50 to-indigo-100 
p-5 rounded-2xl shadow border border-indigo-200"
        >
          <p className="text-sm text-indigo-700">Project Completion</p>
          <p className="text-3xl font-bold text-indigo-900">78%</p>
        </div>
      </div>

      {/* ===== Table ===== */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Department</th>
              <th className="p-3 text-left">Current Task</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((emp, index) => (
              <tr key={emp.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{index + 1}</td>
                <td
                  className="p-3 text-blue-600 font-medium cursor-pointer"
                  onClick={() => setSelectedEmployee(emp)}
                >
                  {emp.name}
                </td>
                <td className="p-3">{emp.department}</td>
                <td className="p-3">{emp.currentTask}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== Modal ===== */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl rounded-2xl p-6 relative shadow-2xl">
            {/* Close */}
            <button
              onClick={() => setSelectedEmployee(null)}
              className="absolute top-4 right-4 text-xl text-gray-500 hover:text-black"
            >
              ✕
            </button>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold">{selectedEmployee.name}</h2>
              <p className="text-sm text-gray-500">
                {selectedEmployee.department} • {selectedEmployee.currentTask}
              </p>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">Task Progress</span>
                <span>{selectedEmployee.completed}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full"
                  style={{ width: `${selectedEmployee.completed}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Remaining: {100 - selectedEmployee.completed}%
              </p>
            </div>

            {/* History Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-xl text-center">
                <p className="text-xs text-gray-500">Today</p>
                <p className="text-lg font-bold">{selectedEmployee.today}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl text-center">
                <p className="text-xs text-gray-500">This Week</p>
                <p className="text-lg font-bold">{selectedEmployee.week}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl text-center">
                <p className="text-xs text-gray-500">This Month</p>
                <p className="text-lg font-bold">{selectedEmployee.month}</p>
              </div>
            </div>

            {/* Attendance */}
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl">
              <div>
                <p className="text-sm font-medium">Attendance</p>
                <p className="text-xs text-gray-500">Today</p>
              </div>
              <span
                className={`px-4 py-1 rounded-full text-sm font-semibold ${
                  selectedEmployee.attendance === "Present"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {selectedEmployee.attendance}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
