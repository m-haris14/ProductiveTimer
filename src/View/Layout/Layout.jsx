import React from 'react'
import Sidebar from './Sidebar/Sidebar'
import Header from './Header/Header'

const Layout = ({children}) => {
  return (
    <div className='flex'>
      <div className='w-[25%]'>
        <Sidebar/>
      </div>
      <div className='w-full'>
      
      <Header/>      
      
      <div>{children}</div>
      </div>
      </div>
  )
}

export default Layout