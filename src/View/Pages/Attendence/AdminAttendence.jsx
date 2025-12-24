import React, { useState } from "react";

const AdminAttendance = () => {
  const [activeTab, setActiveTab] = useState("present");
  const [search, setSearch] = useState("");
  const [tableTitle, setTableTitle] = useState("Present Employees");

  const employees = [
    {
      name: "Ahmad Ali",
      presentDays: 18,
      absentDays: 6,
      arrivalStatus: "onTime",
      workStatus: "fullTime",
      personalLeave: [{ from: "Apr 12", to: "Apr 12" }],
      medicalLeave: [{ from: "Apr 15", to: "Apr 15" }],
    },
    {
      name: "Usman Khan",
      presentDays: 20,
      absentDays: 4,
      arrivalStatus: "late",
      workStatus: "earlyLeave",
      personalLeave: [],
      medicalLeave: [],
    },
    {
      name: "Ali Raza",
      presentDays: 22,
      absentDays: 2,
      arrivalStatus: "onTime",
      workStatus: "fullTime",
      personalLeave: [],
      medicalLeave: [],
    },
    {
      name: "Hassan Ahmed",
      presentDays: 16,
      absentDays: 8,
      arrivalStatus: "late",
      workStatus: "earlyLeave",
      personalLeave: [{ from: "Apr 10", to: "Apr 11" }],
      medicalLeave: [],
    },
    {
      name: "Bilal Khan",
      presentDays: 21,
      absentDays: 3,
      arrivalStatus: "onTime",
      workStatus: "fullTime",
      personalLeave: [],
      medicalLeave: [{ from: "Apr 18", to: "Apr 18" }],
    },
    {
      name: "Saad Malik",
      presentDays: 19,
      absentDays: 5,
      arrivalStatus: "late",
      workStatus: "fullTime",
      personalLeave: [],
      medicalLeave: [],
    },
    {
      name: "Umar Farooq",
      presentDays: 23,
      absentDays: 1,
      arrivalStatus: "onTime",
      workStatus: "fullTime",
      personalLeave: [],
      medicalLeave: [],
    },
    {
      name: "Zain Abbas",
      presentDays: 17,
      absentDays: 7,
      arrivalStatus: "late",
      workStatus: "earlyLeave",
      personalLeave: [],
      medicalLeave: [],
    },
    {
      name: "Hamza Tariq",
      presentDays: 20,
      absentDays: 4,
      arrivalStatus: "onTime",
      workStatus: "fullTime",
      personalLeave: [{ from: "Apr 22", to: "Apr 22" }],
      medicalLeave: [],
    },
    {
      name: "Fahad Noor",
      presentDays: 18,
      absentDays: 6,
      arrivalStatus: "late",
      workStatus: "earlyLeave",
      personalLeave: [],
      medicalLeave: [{ from: "Apr 16", to: "Apr 17" }],
    },
  ];

  /* ================= COUNTS ================= */
  const counts = {
    total: employees.length,
    present: employees.filter(e => e.presentDays > 0).length,
    absent: employees.filter(e => e.absentDays > 0).length,
    personal: employees.filter(e => e.personalLeave.length > 0).length,
    medical: employees.filter(e => e.medicalLeave.length > 0).length,
    onTime: employees.filter(e => e.arrivalStatus === "onTime").length,
    earlyLeave: employees.filter(e => e.workStatus === "earlyLeave").length,
    fullTime: employees.filter(e => e.workStatus === "fullTime").length,
  };

  /* ================= FILTER ================= */
  const filteredEmployees = employees
    .filter(emp =>
      emp.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter(emp => {
      if (activeTab === "total") return true;
      if (activeTab === "present") return emp.presentDays > 0;
      if (activeTab === "absent") return emp.absentDays > 0;
      if (activeTab === "personal") return emp.personalLeave.length > 0;
      if (activeTab === "medical") return emp.medicalLeave.length > 0;
      if (activeTab === "onTime") return emp.arrivalStatus === "onTime";
      if (activeTab === "earlyLeave") return emp.workStatus === "earlyLeave";
      if (activeTab === "fullTime") return emp.workStatus === "fullTime";
      return true;
    });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">
        Admin Attendance Dashboard
      </h1>

      {/* SEARCH */}
      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search employee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-96 px-4 py-2 border rounded-lg"
        />
      </div>

      {/* TOP SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card title="Present" value={counts.present} color="bg-green-500"
          onClick={() => { setActiveTab("present"); setTableTitle("Present Employees"); }} />
        <Card title="Absent" value={counts.absent} color="bg-red-500"
          onClick={() => { setActiveTab("absent"); setTableTitle("Absent Employees"); }} />
        <Card title="Personal Leave" value={counts.personal} color="bg-orange-500"
          onClick={() => { setActiveTab("personal"); setTableTitle("Personal Leave"); }} />
        <Card title="Medical Leave" value={counts.medical} color="bg-blue-500"
          onClick={() => { setActiveTab("medical"); setTableTitle("Medical Leave"); }} />
      </div>

      {/* BOTTOM SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card title="On Time" value={counts.onTime} color="bg-emerald-600"
          onClick={() => { setActiveTab("onTime"); setTableTitle("On Time Employees"); }} />
        <Card title="Early Leave" value={counts.earlyLeave} color="bg-rose-600"
          onClick={() => { setActiveTab("earlyLeave"); setTableTitle("Early Leave Employees"); }} />
        <Card title="Full Time" value={counts.fullTime} color="bg-indigo-600"
          onClick={() => { setActiveTab("fullTime"); setTableTitle("Full Time Employees"); }} />
        <Card title="Total Employees" value={counts.total} color="bg-slate-700"
          onClick={() => { setActiveTab("total"); setTableTitle("All Employees"); }} />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow p-6 overflow-x-auto">
        <h2 className="text-xl font-bold mb-4">{tableTitle}</h2>

        <table className="w-full border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 text-left">Employee</th>
              <th className="p-3">Present</th>
              <th className="p-3">Absent</th>
              <th className="p-3">Arrival</th>
              <th className="p-3">Work Status</th>
              <th className="p-3">Personal Leave</th>
              <th className="p-3">Medical Leave</th>
              {activeTab === "total" && (
                <>
                  <th className="p-3">Today Status</th>
                  <th className="p-3">Leave Reason</th>
                </>
              )}
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.map((emp, i) => (
              <tr key={i} className="border-t">
                <td className="p-3 font-medium">{emp.name}</td>
                <td className="p-3 text-center">{emp.presentDays}</td>
                <td className="p-3 text-center">{emp.absentDays}</td>
                <td className="p-3 text-center">
                  {emp.arrivalStatus === "onTime" ? "On Time" : "Late"}
                </td>
                <td className="p-3 text-center">
                  {emp.workStatus === "fullTime" ? "Full Time" : "Early Leave"}
                </td>
                <td className="p-3 text-sm text-orange-600">
                  {emp.personalLeave.length
                    ? emp.personalLeave.map((l, i) => <div key={i}>{l.from} → {l.to}</div>)
                    : "-"}
                </td>
                <td className="p-3 text-sm text-blue-600">
                  {emp.medicalLeave.length
                    ? emp.medicalLeave.map((l, i) => <div key={i}>{l.from} → {l.to}</div>)
                    : "-"}
                </td>

                {activeTab === "total" && (
                  <>
                    <td className="p-3 text-center">
                      {emp.absentDays > 0 ? "Absent" : "Present"}
                    </td>
                    <td className="p-3 text-center">
                      {emp.personalLeave.length > 0
                        ? "Personal"
                        : emp.medicalLeave.length > 0
                        ? "Medical"
                        : "-"}
                    </td>
                  </>
                )}
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
    className={`${color} text-white p-5 rounded-xl cursor-pointer hover:scale-105 transition`}
  >
    <h2 className="text-sm font-semibold">{title}</h2>
    <p className="text-2xl font-bold">{value}</p>
  </div>
);

export default AdminAttendance;
