import React from 'react'
import Navbar from '../navbar'
import { Outlet } from 'react-router'

const MainLayout = () => {
  return (
    <main>
        <Navbar />
        <div className='mx-auto max-w-7xl p-4'>
           <Outlet />
        </div> 
    </main>
  )
}

export default MainLayout