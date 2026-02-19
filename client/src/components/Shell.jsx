import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

const Shell = () => {
  return (
    <>
      <Navbar />
      <div className="container">
        <Outlet />
      </div>
    </>
  )
}

export default Shell
