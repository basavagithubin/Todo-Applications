import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  useEffect(() => {
    const onDoc = (e) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])
  const initials = (user?.name || '?').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()
  return (
    <header className="navbar">
      <div className="brand"><Link to="/dashboard">Todo<span>Pro</span></Link></div>
      {/* navlinks removed as per request; use avatar dropdown instead */}
      <div className="spacer" />
      <div className="navactions">
        <button className="btn btn-ghost" onClick={toggle}>{theme === 'dark' ? 'Light' : 'Dark'}</button>
        <div className="menuwrap" ref={menuRef}>
          <button className="avatar-btn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
            <div className="avatar">{initials}</div>
          </button>
          {open && (
            <div className="menu">
              <button className="menu-item" onClick={() => { setOpen(false); navigate('/dashboard') }}>Dashboard</button>
              <button className="menu-item" onClick={() => { setOpen(false); navigate('/todos') }}>Todos</button>
              {user?.role === 'superadmin' && (
                <button className="menu-item" onClick={() => { setOpen(false); navigate('/admin') }}>Admin</button>
              )}
              <div className="menu-sep" />
              <button className="menu-item danger" onClick={() => { setOpen(false); logout() }}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
