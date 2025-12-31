import React, { useState } from "react";

const AdminProject = () => {
  const [projects, setProjects] = useState([
    {
      name: "Test dev Emp project 725",
      assignees: "2 Employees",
      modules: "1 Modules",
      tasks: "1 Tasks",
      start: "2023-05-24",
      end: "2029-12-01",
      time: "00:00:00",
      progress: 0,
      status: "active",
    },
    {
      name: "Test dev Emp project 531",
      assignees: "2 Employees",
      modules: "1 Modules",
      tasks: "1 Tasks",
      start: "2023-05-23",
      end: "2029-12-01",
      time: "00:00:00",
      progress: 0,
      status: "active",
    },
    {
      name: "testing",
      assignees: "3 Employees",
      modules: "1 Modules",
      tasks: "1 Tasks",
      start: "2023-05-20",
      end: "2023-05-20",
      time: "00:00:00",
      progress: 0,
      status: "pending",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    assignees: "",
    modules: "",
    tasks: "",
    start: "",
    end: "",
    status: "active",
  });

  // input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // open add modal
  const openAddModal = () => {
    setIsEdit(false);
    setFormData({
      name: "",
      assignees: "",
      modules: "",
      tasks: "",
      start: "",
      end: "",
      status: "active",
    });
    setShowModal(true);
  };

  // open edit modal
  const openEditModal = (project, index) => {
    setIsEdit(true);
    setEditIndex(index);
    setFormData(project);
    setShowModal(true);
  };

  // add / update project
  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEdit) {
      const updated = [...projects];
      updated[editIndex] = formData;
      setProjects(updated);
    } else {
      setProjects([
        ...projects,
        {
          ...formData,
          time: "00:00:00",
          progress: 0,
        },
      ]);
    }

    setShowModal(false);
  };

  // delete project
  const handleDelete = (index) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      setProjects(projects.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-12">
        <h1 className="text-4xl font-bold text-blue-700">
          Projects List
          <p className="text-blue-400 text-base font-normal">You Can See Company Projects</p>
        </h1>

        <div className="flex gap-2">
          <select className="border px-3 py-2 rounded text-sm">
            <option>Select Status</option>
            <option>Active</option>
            <option>Pending</option>
          </select>

          <button
            onClick={openAddModal}
            className="bg-blue-500 text-white px-4 py-2 rounded text-sm"
          >
            Add Project Detail
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="p-3 text-left">Project Name</th>
              <th className="p-3">Assignees</th>
              <th className="p-3">Modules</th>
              <th className="p-3">Tasks</th>
              <th className="p-3">Start Date</th>
              <th className="p-3">End Date</th>
              <th className="p-3">Total Time</th>
              <th className="p-3">Progress(%)</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {projects.map((item, index) => (
              <tr
                key={index}
                className="border-b hover:bg-gray-50"
              >
                <td className="p-3 text-blue-600 font-medium cursor-pointer">
                  {item.name}
                </td>
                <td className="p-3 text-center text-blue-500">
                  {item.assignees}
                </td>
                <td className="p-3 text-center text-blue-500">
                  {item.modules}
                </td>
                <td className="p-3 text-center text-blue-500">
                  {item.tasks}
                </td>
                <td className="p-3 text-center">{item.start}</td>
                <td className="p-3 text-center">{item.end}</td>
                <td className="p-3 text-center">{item.time}</td>
                <td className="p-3 text-center">{item.progress}</td>
                <td className="p-3 text-center">
                  <span
                    className={`w-3 h-3 inline-block rounded ${
                      item.status === "active"
                        ? "bg-green-500"
                        : "bg-yellow-400"
                    }`}
                  ></span>
                </td>
                <td className="p-3 text-center flex justify-center gap-2">
                  <button
                    onClick={() => openEditModal(item, index)}
                    className="text-green-600"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="text-red-600"
                  >
                    🗑️
                  </button>
                  <button className="text-gray-600">👁️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">
              {isEdit ? "Edit Project" : "Add Project"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Project Name"
                className="w-full border px-3 py-2 rounded"
                required
              />

              <input
                name="assignees"
                value={formData.assignees}
                onChange={handleChange}
                placeholder="Assignees"
                className="w-full border px-3 py-2 rounded"
              />

              <input
                name="modules"
                value={formData.modules}
                onChange={handleChange}
                placeholder="Modules"
                className="w-full border px-3 py-2 rounded"
              />

              <input
                name="tasks"
                value={formData.tasks}
                onChange={handleChange}
                placeholder="Tasks"
                className="w-full border px-3 py-2 rounded"
              />

              <div className="flex gap-2">
                <input
                  type="date"
                  name="start"
                  value={formData.start}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
                <input
                  type="date"
                  name="end"
                  value={formData.end}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
              </select>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  {isEdit ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProject;
