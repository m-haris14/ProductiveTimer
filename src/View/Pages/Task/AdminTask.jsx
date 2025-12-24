import React, { useState } from "react";

const AdminTask = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: "Ali Khan",
      department: "Development",
      totalTime: "8h",
      timeSpent: "5h 20m",
      breakTime: "40m",
      taskTime: "4h 40m",
      taskStatus: "In Progress",
      action: "Working",
      tasks: [
        {
          title: "Login Page UI",
          status: "Completed",
          time: "2025-09-20",
          timeSpent: "2h 30m",
        },
        {
          title: "API Integration",
          status: "In Progress",
          time: "2025-09-22",
          timeSpent: "1h 15m",
        },
      ],
    },
    {
      id: 2,
      name: "Ahmed Raza",
      department: "Design",
      totalTime: "8h",
      timeSpent: "7h",
      breakTime: "30m",
      taskTime: "6h 30m",
      taskStatus: "Completed",
      action: "Completed",
      tasks: [
        {
          title: "Dashboard Design",
          status: "Completed",
          time: "2025-09-18",
          timeSpent: "2h 30m",
        },
        {
          title: "Icons Setup",
          status: "Completed",
          time: "2025-09-19",
          timeSpent: "1h 15m",
        },
      ],
    },
  ]);

  const [newTask, setNewTask] = useState({
    employeeId: "",
    title: "",
    date: "",
    timeSpent: "",
  });

  const handleAddTask = () => {
    if (
      !newTask.employeeId ||
      !newTask.title ||
      !newTask.date ||
      !newTask.timeSpent
    ) {
      alert("Please fill all fields");
      return;
    }

    setEmployees((prev) =>
      prev.map((emp) =>
        emp.id === Number(newTask.employeeId)
          ? {
              ...emp,
              tasks: [
                ...emp.tasks,
                {
                  title: newTask.title,
                  status: "In Progress",
                  time: newTask.date,
                  timeSpent: newTask.timeSpent,
                },
              ],
            }
          : emp
      )
    );

    setAssignModalOpen(false);
    setNewTask({
      employeeId: "",
      title: "",
      date: "",
      timeSpent: "",
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* ===== Header ===== */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">
          Admin Task Management
        </h1>

        <button
          onClick={() => setAssignModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
        >
          + Assign Task
        </button>
      </div>

      {/* ===== MAIN TABLE ===== */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm text-gray-700">
          <thead className="bg-blue-100 text-blue-800">
            <tr>
              <th className="px-4 py-3 text-center">Employee</th>
              <th className="px-4 py-3 text-center">Department</th>
              <th className="px-4 py-3 text-center">Total Time</th>
              <th className="px-4 py-3 text-center">Time Spent</th>
              <th className="px-4 py-3 text-center">Break</th>
              <th className="px-4 py-3 text-center">Task Time</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((emp) => (
              <tr
                key={emp.id}
                onClick={() => setSelectedEmployee(emp)}
                className="border-b hover:bg-blue-50 cursor-pointer"
              >
                <td className="px-4 py-3 text-center font-medium">
                  {emp.name}
                </td>
                <td className="px-4 py-3 text-center">
                  {emp.department}
                </td>
                <td className="px-4 py-3 text-center">
                  {emp.totalTime}
                </td>
                <td className="px-4 py-3 text-center">
                  {emp.timeSpent}
                </td>
                <td className="px-4 py-3 text-center">
                  {emp.breakTime}
                </td>
                <td className="px-4 py-3 text-center">
                  {emp.taskTime}
                </td>
                <td className="px-4 py-3 text-center">
                  {emp.taskStatus}
                </td>
                <td className="px-4 py-3 text-center font-semibold text-blue-600">
                  {emp.action}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== TASK LIST MODAL ===== */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-3xl rounded-xl p-6 shadow-xl">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold text-blue-700">
                Tasks Assigned to {selectedEmployee.name}
              </h2>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-gray-500 hover:text-red-500 text-xl"
              >
                ✕
              </button>
            </div>

            <table className="w-full text-sm text-gray-700">
              <thead className="bg-sky-100 text-sky-800">
                <tr>
                  <th className="px-4 py-3 text-center">Task</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Due Date</th>
                  <th className="px-4 py-3 text-center">Time Spent</th>
                </tr>
              </thead>

              <tbody>
                {selectedEmployee.tasks.map((task, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-3 text-center">
                      {task.title}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {task.status}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {task.time}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {task.timeSpent}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== ASSIGN TASK MODAL ===== */}
      {assignModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-md rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-blue-700 mb-4">
              Assign New Task
            </h2>

            <select
              className="w-full border px-3 py-2 rounded mb-3"
              value={newTask.employeeId}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  employeeId: e.target.value,
                })
              }
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Task Title"
              className="w-full border px-3 py-2 rounded mb-3"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
            />

            <input
              type="date"
              className="w-full border px-3 py-2 rounded mb-3"
              value={newTask.date}
              onChange={(e) =>
                setNewTask({ ...newTask, date: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Time Spent (e.g 1h 30m)"
              className="w-full border px-3 py-2 rounded mb-4"
              value={newTask.timeSpent}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  timeSpent: e.target.value,
                })
              }
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setAssignModalOpen(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleAddTask}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTask;
