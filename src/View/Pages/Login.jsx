import React from "react";

const Login = () => {
  return (
      <div className="min-h-screen w-full gap-1 flex flex-col items-center justify-center bg-[#1b1f3a]">
        <h1>yugffgjgfug</h1>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Non, qui.</p>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet, velit.</p>
        <p className="text-6xl font-bold text-white text-center ">
          Ten Bit Solutions
        </p>
        <p className="text-lg text-gray-300 text-center mb-9">
          Employee Production Management System
        </p>
        <div
          className="relative w-[33%] rounded-xl border border-gray-400 border-t-4
         
         shadow-[0_0_40px_rgba(99,102,241,0.4)]"
        >
          <div className="rounded-2xl bg-[#1b1f3a] px-8 py-8">
            <h1 className="text-4xl font-bold text-white text-center">
              Login
            </h1>
            <p className="text-gray-300 text-center text-lg mb-12">
              Enter your account credentials to login
            </p>

            <div className="mb-2">
              <input
                type="text"
                placeholder="Enter Userame"
                className="w-full px-4 py-3 rounded-xl
                bg-[#232861 border-b-2 border-[#2f357a]
                text-white placeholder-gray-400
                focus: outline-none focus:border-blue-400"
              />
            </div>

            <div className="mb-6">
              <input
                type="password"
                placeholder="Enter Password"
                className="w-full px-4 py-3 rounded-xl
                bg-[#232861 border-b-2 border-[#2f357a]
                text-white placeholder-gray-400
                focus: outline-none focus:border-blue-400"
              />
            </div>

            <button
              className="
              w-full py-3 rounded-xl font-semibold text-white text-xl cursor-pointer
              bg-[linear-gradient(90deg,#3b82f6,#7c3aed)]
              hover:bg-[linear-gradient(90deg,#2563eb,#6d28d9)]
              transition-all duration-300
              shadow-lg 
            "
            >
              Login
            </button>
          </div>
        </div>
      </div>
  );
};

export default Login;
