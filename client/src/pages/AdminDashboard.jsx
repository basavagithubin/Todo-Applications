import { useEffect, useState } from 'react'
import api from '../services/api'
import { toast } from 'react-hot-toast'

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [todos, setTodos] = useState([])
  const [filterUser, setFilterUser] = useState('')

  const load = async () => {
    try {
      const [a, u] = await Promise.all([api.get('/admin/analytics'), api.get('/admin/users')])
      setStats(a.data)
      setUsers(u.data.users)
    } catch {
      toast.error('Failed to load admin data')
    }
  }

  const loadTodos = async () => {
    try {
      const r = await api.get('/admin/todos', { params: filterUser ? { user: filterUser } : {} })
      setTodos(r.data.items)
    } catch {
      toast.error('Failed to load todos')
    }
  }

  useEffect(() => {
    let cancelled = false
    Promise.all([api.get('/admin/analytics'), api.get('/admin/users')]).then(([a,u]) => {
      if (cancelled) return
      setStats(a.data)
      setUsers(u.data.users)
    }).catch(() => { toast.error('Failed to load admin data') })
    return () => { cancelled = true }
  }, [])
  useEffect(() => {
    let cancelled = false
    api.get('/admin/todos', { params: filterUser ? { user: filterUser } : {} }).then(r => {
      if (!cancelled) setTodos(r.data.items)
    }).catch(() => { toast.error('Failed to load todos') })
    return () => { cancelled = true }
  }, [filterUser])

  const block = async (id) => {
    await api.patch(`/admin/block/${id}`)
    load()
  }
  const unblock = async (id) => {
    await api.patch(`/admin/unblock/${id}`)
    load()
  }
  const removeUser = async (id) => {
    await api.delete(`/admin/user/${id}`)
    load()
    loadTodos()
  }

  return (
    <div className="space-y-6">
        {!stats ? <div className="centered">Loading...</div> : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card"><h3>Total Users</h3><strong>{stats.totalUsers}</strong></div>
              <div className="card"><h3>Active Users</h3><strong>{stats.activeUsers}</strong></div>
              <div className="card"><h3>Blocked Users</h3><strong>{stats.blockedUsers}</strong></div>
              <div className="card"><h3>Total Todos</h3><strong>{stats.totalTodos}</strong></div>
              <div className="card"><h3>Completed</h3><strong className="pill low">{stats.completedTodos}</strong></div>
              <div className="card"><h3>Pending</h3><strong className="pill high">{stats.pendingTodos}</strong></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3>Users</h3>
                <ul className="list">
                  {users.map(u => (
                    <li key={u._id} className="item">
                      <div className="title"><span>{u.name} ({u.email})</span><small className={`pill ${u.isBlocked ? 'high' : 'low'}`}>{u.isBlocked ? 'blocked' : u.role}</small></div>
                      <div className="actions">
                        {u.isBlocked ? <button className="btn" onClick={() => unblock(u._id)}>Unblock</button> : <button className="btn" onClick={() => block(u._id)}>Block</button>}
                        <button className="btn" onClick={() => removeUser(u._id)}>Delete</button>
                        <button className="btn" onClick={() => setFilterUser(u._id)}>Filter Todos</button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card">
                <h3>Todos</h3>
                <div className="toolbar">
                  <select className="input" value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
                    <option value="">All Users</option>
                    {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                  </select>
                </div>
                <ul className="list">
                  {todos.map(t => (
                    <li key={t._id} className="item">
                      <div className="title"><span>{t.title}</span><small className={`pill ${t.status === 'completed' ? 'low' : 'high'}`}>{t.status}</small></div>
                      <div className="subtitle">{t.user?.name} • {t.priority}{t.dueDate ? ` • ${new Date(t.dueDate).toLocaleDateString()}` : ''}</div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
    </div>
  )
}

export default AdminDashboard
