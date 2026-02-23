import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import MobileNav from './MobileNav'

const Shell = () => {
  return (
    <div className="layout relative overflow-hidden">
      {/* Animated Background Shapes */}
      <div className="floating-shape bg-primary-400/30 w-96 h-96 top-0 -left-20 animate-float" />
      <div className="floating-shape bg-secondary-400/30 w-80 h-80 bottom-0 -right-20 animate-float" style={{ animationDelay: '2s' }} />
      <div className="floating-shape bg-primary-300/20 w-64 h-64 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-float" style={{ animationDelay: '4s' }} />

      <Sidebar />
      <main className="flex-1 flex flex-col min-h-screen bg-transparent transition-colors duration-300 z-10 gap-6 pr-6">
        <Header />
        <div className="content px-6 pb-6">
          <Outlet />
        </div>
        <MobileNav />
      </main>
    </div>
  )
}

export default Shell
