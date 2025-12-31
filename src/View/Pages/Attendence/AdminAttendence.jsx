import React, { useState } from "react";

const AdminAttendance = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [tableTitle, setTableTitle] = useState("All Employees");
  const [search, setSearch] = useState("");

  // 🔹 dropdown states (instead of checkboxes)
  const [statusRule, setStatusRule] = useState("all");
  const [departmentRule, setDepartmentRule] = useState("all");

  /* ================= EMPLOYEES DATA ================= */
  const employees = [
    {
      name: "Ahmad Ali",
      department: "Development",
      checkIn: "09:00 AM",
      checkOut: "05:00 PM",
      hours: "8h",
      status: "present",
      reason: "-",
    },
    {
      name: "Usman Khan",
      department: "Design",
      checkIn: "10:20 AM",
      checkOut: "05:00 PM",
      hours: "6h 40m",
      status: "late",
      reason: "Traffic issue",
    },
    {
      name: "Ali Raza",
      department: "HR",
      checkIn: "-",
      checkOut: "-",
      hours: "0h",
      status: "absent",
      reason: "No intimation",
    },
    {
      name: "Hassan Ahmed",
      department: "Development",
      checkIn: "-",
      checkOut: "-",
      hours: "0h",
      status: "leave",
      reason: "Medical leave",
    },
    {
      name: "Bilal Khan",
      department: "Finance",
      checkIn: "09:05 AM",
      checkOut: "05:00 PM",
      hours: "7h 55m",
      status: "present",
      reason: "-",
    },
    {
      name: "Saad Malik",
      department: "Marketing",
      checkIn: "10:45 AM",
      checkOut: "04:30 PM",
      hours: "5h 45m",
      status: "late",
      reason: "Client meeting",
    },
    {
      name: "Umar Farooq",
      department: "IT Support",
      checkIn: "09:00 AM",
      checkOut: "05:00 PM",
      hours: "8h",
      status: "present",
      reason: "-",
    },
    {
      name: "Zain Abbas",
      department: "Sales",
      checkIn: "-",
      checkOut: "-",
      hours: "0h",
      status: "absent",
      reason: "No notice",
    },
  ];

  /* ================= COUNTS ================= */
  const counts = {
    present: employees.filter(e => e.status === "present").length,
    absent: employees.filter(e => e.status === "absent").length,
    late: employees.filter(e => e.status === "late").length,
    leave: employees.filter(e => e.status === "leave").length,
  };

  /* ================= UNIQUE DEPARTMENTS ================= */
  const departments = ["all", ...new Set(employees.map(e => e.department))];

  /* ================= FILTER LOGIC ================= */
  const filteredEmployees = employees
    .filter(emp => {
      if (!search) return true;

      const keyword = search.toLowerCase();

      const matchName = emp.name.toLowerCase().includes(keyword);
      const matchStatus =
        statusRule === "all" ? true : emp.status === statusRule;
      const matchDepartment =
        departmentRule === "all"
          ? true
          : emp.department === departmentRule;

      return matchName && matchStatus && matchDepartment;
    })
    .filter(emp => {
      if (activeTab === "all") return true;
      return emp.status === activeTab;
    });

  return (
    <div className="p-6 bg-slate-100 min-h-screen">

      {/* ================= HEADING ================= */}
      <h1 className="text-4xl font-bold text-blue-700 mb-6">
        Admin Attendance
        <p className="text-blue-400 mb-8 text-base font-normal">
          You Can See Employees Attendance
        </p>
      </h1>

      {/* ================= TOP CARDS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card title="Present Employees" value={counts.present} color="bg-emerald-600"
          onClick={() => { setActiveTab("present"); setTableTitle("Present Employees"); }} />

        <Card title="Absent Employees" value={counts.absent} color="bg-rose-600"
          onClick={() => { setActiveTab("absent"); setTableTitle("Absent Employees"); }} />

        <Card title="Late Employees" value={counts.late} color="bg-amber-600"
          onClick={() => { setActiveTab("late"); setTableTitle("Late Employees"); }} />

        <Card title="On Leave Employees" value={counts.leave} color="bg-sky-600"
          onClick={() => { setActiveTab("leave"); setTableTitle("On Leave Employees"); }} />
      </div>

      {/* ================= SEARCH + DROPDOWNS ================= */}
      <div className="bg-white p-4 rounded-2xl shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">

          {/* SEARCH (WIDE) */}
          <input
            type="text"
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-3/5 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-400"
          />

          {/* STATUS DROPDOWN (SMALL) */}
          <select
            value={statusRule}
            onChange={(e) => setStatusRule(e.target.value)}
            className="w-full md:w-1/5 px-3 py-2 border rounded-xl"
          >
            <option value="all">All Status</option>
            <option value="present">Present</option>
            <option value="late">Late</option>
            <option value="absent">Absent</option>
            <option value="leave">Leave</option>
          </select>

          {/* DEPARTMENT DROPDOWN (SMALL) */}
          <select
            value={departmentRule}
            onChange={(e) => setDepartmentRule(e.target.value)}
            className="w-full md:w-1/5 px-3 py-2 border rounded-xl"
          >
            {departments.map((dep, i) => (
              <option key={i} value={dep}>
                {dep === "all" ? "All Departments" : dep}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold mb-4">{tableTitle}</h2>

        <table className="w-full">
          <thead className="bg-slate-200">
            <tr>
              <th className="p-3 text-left">Employee Name</th>
              <th className="p-3">Department</th>
              <th className="p-3">Check In</th>
              <th className="p-3">Check Out</th>
              <th className="p-3">Working Hours</th>
              <th className="p-3">Status</th>
              <th className="p-3">Reason</th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.map((emp, i) => (
              <tr key={i} className="border-t text-center">
                <td className="p-3 text-left font-medium">{emp.name}</td>
                <td className="p-3">{emp.department}</td>
                <td className="p-3">{emp.checkIn}</td>
                <td className="p-3">{emp.checkOut}</td>
                <td className="p-3">{emp.hours}</td>
                <td className="p-3 capitalize font-semibold">{emp.status}</td>
                <td className="p-3">{emp.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

/* ================= CARD ================= */
const Card = ({ title, value, color, onClick }) => (
  <div
    onClick={onClick}
    className={`${color} text-white p-5 rounded-2xl cursor-pointer hover:scale-105 transition`}
  >
    <h2 className="text-sm font-semibold">{title}</h2>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default AdminAttendance;
