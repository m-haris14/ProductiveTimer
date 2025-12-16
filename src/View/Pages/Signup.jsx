import React from 'react'

const Signup = () => {
  return (
    <>
    <div className="min-h-screen flex items-center justify-center bg-[#1f2241]">
        <div className='w-full max-w-md bg-[#1b1f3a] rounded-4xl border-4 border-white shadow-lg p-8'>
            {/* Heading h1 tag */}
            <h1 className='text-6xl font-bold text-gray-400 text-center mb-2'>Ten bit</h1>
            <h1 className='text-2xl font-bold text-gray-400 text-center mb-2'>Employee Time Management System</h1>
            
            {/* Name Input */}

            <input
            type='text'
            placeholder='Enter Your Name'
            className='w-full mb-4  py-3 rounded-xl
            bg-transparent  border border-[#2d325f]
            text-white text-3xl placeholder-gray-400 placeholder:text-center
            focous: outline-none focus:border-yellow-400'
            />

            {/* user name input */}

            <input
            type='text'
            placeholder='Enter Username'
            className='w-full mb-4 py-3 rounded-xl
            bg-transparent border border-[#2d325f]
            text-white text-3xl placeholder-gray-400 placeholder:text-center
            focous: outline-none focus:border-yellow-400'
            />

            {/* Password */}

            <input
            type='password'
            placeholder='Enter Password'
            className='w-full mb-4 py-3 rounded-xl
            bg-transparent border border-[#2d325f]
            text-white text-3xl placeholder-gray-400 placeholder: text-center
            focous: outline-none focus:border-yellow-400'
            />

            {/* button */}

            <button className='w-full bg-yellow-400 hover:bg-yellow-500
            text-[#1f2241] font-bold py-3 rounded-xl transition text-2xl'>
                Sign Up
                
            </button>

        </div>

    </div>
    
    </>
  )
}

export default Signup