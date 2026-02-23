import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useLocation } from 'react-router-dom'

const Header = () => {
  const { user } = useAuth()
  const { theme, toggle } = useTheme()
  const location = useLocation()

  const getTitle = () => {
    if (location.pathname.startsWith('/dashboard')) return 'Dashboard'
    if (location.pathname.startsWith('/todos')) return 'My Tasks'
    if (location.pathname.startsWith('/admin')) return 'Admin Console'
    return 'TodoPro'
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[var(--bg)]/80 backdrop-blur-md border-b border-[var(--border)] md:px-8">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">
          {getTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={toggle}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-[var(--muted)] transition-colors"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          )}
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-[var(--border)]">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-semibold text-[var(--text)]">{user?.name}</div>
            <div className="text-xs text-[var(--muted)] capitalize">{user?.role}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/20">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
