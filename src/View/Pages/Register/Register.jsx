import React, { useState } from "react";
import axios from "axios";

const Register = () => {
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAddEmployee = async (e) => {
    e.preventDefault(); // prevent form submission reload
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("http://localhost:5000/employee", {
        fullName,
        username,
        password,
        designation: "Employee",
      });

      if (response.status === 201) {
        setSuccess("Employee added successfully!");
        setUsername("");
        setFullName("");
        setPassword("");
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message);
      } else {
        setError("Network error");
      }
    }
  };

  return (
    <div className="w-full mt-4 flex flex-col items-center justify-center">
      <div className="relative w-[53%] rounded-xl border border-blue-400 border-t-4 shadow-[0_0_40px_rgba(99,102,241,0.4)]">
        <div className="rounded-2xl bg-[#1b1f3a] px-8 py-8">
          <form onSubmit={handleAddEmployee}>
            <h1 className="text-4xl font-bold text-white text-center">
              Add Employee
            </h1>
            <p className="text-gray-300 text-center text-lg mb-6">
              Fill in employee details
            </p>

            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            {success && (
              <p className="text-green-500 text-center mb-4">{success}</p>
            )}

            <div className="mb-2">
              <input
                type="text"
                placeholder="Enter Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl
              bg-[#232861] border-b-2 border-[#2f357a]
              text-white placeholder-gray-400
              focus:outline-none focus:border-blue-400"
              />
            </div>

            <div className="mb-2">
              <input
                type="username"
                placeholder="Enter Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl
              bg-[#232861] border-b-2 border-[#2f357a]
              text-white placeholder-gray-400
              focus:outline-none focus:border-blue-400"
              />
            </div>

            <div className="mb-6">
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl
              bg-[#232861] border-b-2 border-[#2f357a]
              text-white placeholder-gray-400
              focus:outline-none focus:border-blue-400"
              />
            </div>

            <button
              type="submit"
              className="
            w-full py-3 rounded-xl font-semibold text-white text-xl cursor-pointer
            bg-[linear-gradient(90deg,#3b82f6,#7c3aed)]
            hover:bg-[linear-gradient(90deg,#2563eb,#6d28d9)]
            transition-all duration-400
            shadow-lg 
          "
            >
              Add Employee
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
