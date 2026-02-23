import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Sidebar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  
  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
    )},
    { to: '/todos', label: 'My Tasks', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
    )},
  ]

  if (user?.role === 'superadmin') {
    links.push({ to: '/admin', label: 'Admin', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
    )})
  }

  return (
    <aside className="sidebar">
      <div className="p-6">
        <Link to="/dashboard" className="flex items-center gap-3 text-2xl font-extrabold tracking-tight">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30 transform transition-transform hover:scale-110 hover:rotate-3">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">TodoPro</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {links.map(link => {
          const active = location.pathname.startsWith(link.to)
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-4 py-3 min-h-[48px] rounded-xl transition-all duration-300 group relative overflow-hidden ${
                active 
                  ? 'bg-gradient-to-r from-primary-500/15 to-transparent text-primary-600 dark:text-primary-400 font-bold shadow-sm' 
                  : 'text-[var(--muted)] hover:bg-gray-50/50 hover:text-[var(--text)] dark:hover:bg-gray-800/50 hover:pl-6'
              }`}
            >
              {active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 rounded-r-full animate-slide-in-left" />}
              <span className={`transition-colors duration-300 ${active ? 'text-primary-600 dark:text-primary-400' : 'group-hover:text-secondary-500'}`}>
                {link.icon}
              </span>
              <span className="relative z-10">{link.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-[var(--border)]">
        <button 
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
