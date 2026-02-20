import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import MobileNav from './MobileNav'

const Shell = () => {
  return (
    <div className="layout">
      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen bg-[var(--bg)] transition-colors duration-300">
        <Header />
        <div className="content">
          <Outlet />
        </div>
        <MobileNav />
      </main>
    </div>
  )
}

export default Shell
