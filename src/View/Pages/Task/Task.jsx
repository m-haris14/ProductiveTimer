import React, { useState } from "react";

const Task = () => {
  const [selectedTask, setSelectedTask] = useState(null);

  const tasks = [
    {
      id: 1,
      title: "Dashboard UI Design",
      dueDate: "2025-01-05",
      status: "In Progress",
      description:
        "Create a responsive dashboard UI using React and TailwindCSS with dark theme support.",
    },
    {
      id: 2,
      title: "Attendance Module Fix",
      dueDate: "2025-01-08",
      status: "Pending",
      description:
        "Fix bugs in attendance calculation and ensure correct working hours are shown.",
    },
    {
      id: 3,
      title: "Task Report Page",
      dueDate: "2025-01-12",
      status: "Completed",
      description:
        "Develop a task report page for employees with charts and summary.",
    },
  ];

  /* ===== Status Colors (Theme Based) ===== */
  const getStatusStyle = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-500/15 text-emerald-400";
      case "In Progress":
        return "bg-blue-500/15 text-blue-400";
      default:
        return "bg-yellow-500/15 text-yellow-400";
    }
  };

  return (
    <div className="min-h-screen p-6 bg-[#0b1028] text-gray-200">
      {/* ===== Page Title ===== */}
      <h1 className="text-2xl font-semibold mb-6">My Tasks</h1>

      {/* ===== Task Table Card ===== */}
      <div className="bg-[#121845] rounded-2xl shadow-[0_0_40px_rgba(99,102,241,0.25)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#0f153a] text-gray-400">
            <tr>
              <th className="px-5 py-4 text-left">Task</th>
              <th className="px-5 py-4 text-left">Due Date</th>
              <th className="px-5 py-4 text-left">Description</th>
              <th className="px-5 py-4 text-center">Status</th>
              <th className="px-5 py-4 text-center">View</th>
            </tr>
          </thead>

          <tbody>
            {tasks.map((task) => (
              <tr
                key={task.id}
                className="border-t border-white/5 hover:bg-white/5 transition"
              >
                <td className="px-5 py-4 font-medium">
                  {task.title}
                </td>

                <td className="px-5 py-4 text-gray-400">
                  {task.dueDate}
                </td>

                <td className="px-5 py-4 text-gray-400 max-w-xs truncate">
                  {task.description}
                </td>

                <td className="px-5 py-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                </td>

                <td className="px-5 py-4 text-center">
                  <button
                    onClick={() => setSelectedTask(task)}
                    className="px-4 py-1.5 rounded-lg text-xs text-white
                    bg-linear-to-r from-blue-500 to-purple-500
                    hover:opacity-90 transition"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== Modal ===== */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#121845] w-full max-w-md rounded-2xl p-6
            shadow-[0_0_50px_rgba(99,102,241,0.35)]">
            
            <h2 className="text-xl font-semibold mb-2">
              {selectedTask.title}
            </h2>

            <p className="text-sm text-gray-400 mb-2">
              Due Date:
              <span className="text-gray-200 ml-1">
                {selectedTask.dueDate}
              </span>
            </p>

            <p className="text-sm text-gray-400 mb-4">
              Status:
              <span
                className={`ml-2 px-3 py-1 rounded-full text-xs ${getStatusStyle(
                  selectedTask.status
                )}`}
              >
                {selectedTask.status}
              </span>
            </p>

            <p className="text-sm text-gray-300 leading-relaxed">
              {selectedTask.description}
            </p>

            <div className="mt-6 text-right">
              <button
                onClick={() => setSelectedTask(null)}
                className="px-5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Task;
