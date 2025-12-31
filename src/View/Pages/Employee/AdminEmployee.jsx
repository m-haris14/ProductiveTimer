import React, { useState } from "react";

const AdminEmployee = () => {
  const [employees, setEmployees] = useState([
    {
      name: "Asit Kumar Das",
      email: "asitdas@globussoft.in",
      role: "Employee",
      department: "Testing",
      location: "Bhilai",
      contact: "91-898094233",
      status: "active",
    },
    {
      name: "Ali Khan",
      email: "ali@company.com",
      role: "Developer",
      department: "Development",
      location: "Lahore",
      contact: "92-3001234567",
      status: "active",
    },
  ]);

  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    department: "",
    location: "",
    contact: "",
    status: "active",
  });

  // search filter
  const filteredEmployees = employees.filter((emp) =>
    `${emp.name} ${emp.email} ${emp.role}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // input handler
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setIsEdit(false);
    setFormData({
      name: "",
      email: "",
      role: "",
      department: "",
      location: "",
      contact: "",
      status: "active",
    });
    setShowModal(true);
  };

  const openEditModal = (emp, index) => {
    setIsEdit(true);
    setEditIndex(index);
    setFormData(emp);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isEdit) {
      const updated = [...employees];
      updated[editIndex] = formData;
      setEmployees(updated);
    } else {
      setEmployees([...employees, formData]);
    }

    setShowModal(false);
  };

  const handleDelete = (index) => {
    if (window.confirm("Delete this employee?")) {
      setEmployees(employees.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold text-blue-700">
          Employee List
          <p className="text-blue-400 text-base font-normal">You Can See Compnay Employees And Their Biodata</p>
        </h1>

        <div className="flex gap-2">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded text-sm w-64"
          />

          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm"
          >
            Add Employee
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Department</th>
              <th className="p-3">Location</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.map((emp, index) => (
              <tr
                key={index}
                className="border-b hover:bg-gray-50"
              >
                <td className="p-3 font-medium text-blue-600">
                  {emp.name}
                </td>
                <td className="p-3 text-center">{emp.email}</td>
                <td className="p-3 text-center">{emp.role}</td>
                <td className="p-3 text-center">{emp.department}</td>
                <td className="p-3 text-center">{emp.location}</td>
                <td className="p-3 text-center">{emp.contact}</td>

                <td className="p-3 text-center">
                  <span
                    className={`inline-block w-3 h-3 rounded ${
                      emp.status === "active"
                        ? "bg-green-500"
                        : "bg-yellow-400"
                    }`}
                  ></span>
                </td>

                <td className="p-3 flex justify-center gap-2">
                  <button
                    onClick={() => openEditModal(emp, index)}
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
                </td>
              </tr>
            ))}

            {filteredEmployees.length === 0 && (
              <tr>
                <td
                  colSpan="8"
                  className="p-4 text-center text-gray-500"
                >
                  No employee found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold mb-4 text-center">
              {isEdit ? "Edit Employee" : "Add Employee"}
            </h2>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-2 gap-3"
            >
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
                className="border px-3 py-2 rounded col-span-2"
                required
              />

              <input
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="border px-3 py-2 rounded col-span-2"
                required
              />

              <input
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="Role"
                className="border px-3 py-2 rounded"
              />

              <input
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Department"
                className="border px-3 py-2 rounded"
              />

              <input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Location"
                className="border px-3 py-2 rounded"
              />

              <input
                name="contact"
                value={formData.contact}
                onChange={handleChange}
                placeholder="Contact"
                className="border px-3 py-2 rounded"
              />

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="border px-3 py-2 rounded col-span-2"
              >
                <option value="active">Active</option>
                <option value="pending">Pending</option>
              </select>

              <div className="col-span-2 flex justify-end gap-2 mt-3">
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

export default AdminEmployee;
