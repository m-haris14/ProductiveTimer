import React, { useState } from "react";

const AdminTask = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const [employees, setEmployees] = useState([
    {
      id: 1,
      name: "Ali Khan",
      department: "Development",
      tasks: [
        {
          title: "Login Page UI",
          status: "Completed",
          dueDate: "2025-09-20",
          description: "Create responsive login UI",
        },
        {
          title: "API Integration",
          status: "In Progress",
          dueDate: "2025-09-22",
          description: "Integrate authentication APIs",
        },
      ],
    },
    {
      id: 2,
      name: "Ahmed Raza",
      department: "Design",
      tasks: [
        {
          title: "Dashboard Design",
          status: "In Progress",
          dueDate: "2025-09-25",
          description: "Design admin dashboard layout",
        },
      ],
    },
  ]);

  const [newTask, setNewTask] = useState({
    employeeId: "",
    title: "",
    dueDate: "",
    description: "",
  });

  // ===== Helpers =====
  const getPendingTask = (tasks) =>
    tasks.find((t) => t.status !== "Completed");

  const getPendingCount = (tasks) =>
    tasks.filter((t) => t.status !== "Completed").length;

  // ===== Add Task =====
  const handleAddTask = () => {
    if (
      !newTask.employeeId ||
      !newTask.title ||
      !newTask.dueDate ||
      !newTask.description
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
                  dueDate: newTask.dueDate,
                  description: newTask.description,
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
      dueDate: "",
      description: "",
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* ===== Header ===== */}
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold text-blue-700">
          Admin Task Management
        <p className="text-blue-400 text-base font-normal">You Can See Employees Task</p>
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
              <th className="px-4 py-3 text-center">Due Date</th>
              <th className="px-4 py-3 text-center">Pending</th>
              <th className="px-4 py-3 text-center">View</th>
            </tr>
          </thead>

          <tbody>
            {employees.map((emp) => {
              const pendingTask = getPendingTask(emp.tasks);
              const pendingCount = getPendingCount(emp.tasks);

              return (
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

                  {/* Due Date */}
                  <td className="px-4 py-3 text-center">
                    {pendingTask ? pendingTask.dueDate : "-"}
                  </td>

                  {/* Pending */}
                  <td className="px-4 py-3 text-center">
                    {pendingCount > 0 ? (
                      <span className="text-orange-600 font-semibold">
                        {pendingCount} Pending
                      </span>
                    ) : (
                      <span className="text-green-600 font-semibold">
                        Completed
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <button className="px-3 py-1 rounded hover:bg-gray-500 hover:text-white">
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ===== EMPLOYEE TASK MODAL ===== */}
      {selectedEmployee && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-4xl rounded-xl p-6 shadow-xl">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold text-blue-700">
                Tasks - {selectedEmployee.name}
              </h2>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="text-xl"
              >
                ✕
              </button>
            </div>

            <table className="w-full text-sm">
              <thead className="bg-sky-100">
                <tr>
                  <th className="py-2 text-center">Task</th>
                  <th className="py-2 text-center">Status</th>
                  <th className="py-2 text-center">Due Date</th>
                  <th className="py-2 text-center">Description</th>
                </tr>
              </thead>

              <tbody>
                {selectedEmployee.tasks.map((task, index) => (
                  <tr
                    key={index}
                    onClick={() => setSelectedTask(task)}
                    className="border-b hover:bg-gray-100 cursor-pointer"
                  >
                    <td className="py-2 text-center">{task.title}</td>
                    <td className="py-2 text-center">{task.status}</td>
                    <td className="py-2 text-center">{task.dueDate}</td>
                    <td className="py-2 text-center">
                      {task.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== TASK DETAIL MODAL ===== */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-md rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-2">
              {selectedTask.title}
            </h2>

            <p className="mb-1">
              <strong>Due Date:</strong> {selectedTask.dueDate}
            </p>

            <p className="mb-1">
              <strong>Status:</strong>{" "}
              <span
                className={
                  selectedTask.status === "Completed"
                    ? "text-green-600"
                    : "text-orange-600"
                }
              >
                {selectedTask.status}
              </span>
            </p>

            <p className="mt-3 text-gray-700">
              {selectedTask.description}
            </p>

            <button
              onClick={() => setSelectedTask(null)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ===== ASSIGN TASK MODAL ===== */}
      {assignModalOpen && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white w-[90%] max-w-md rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4">
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
              value={newTask.dueDate}
              onChange={(e) =>
                setNewTask({ ...newTask, dueDate: e.target.value })
              }
            />

            <textarea
              placeholder="Task Description"
              className="w-full border px-3 py-2 rounded mb-4"
              value={newTask.description}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  description: e.target.value,
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
