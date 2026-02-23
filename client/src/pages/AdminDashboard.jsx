import { useEffect, useState } from 'react'
import api from '../services/api'
import { toast } from 'react-hot-toast'

const StatCard = ({ title, value, color, icon }) => (
  <div className="glass-panel p-6 rounded-3xl hover:-translate-y-1 transition-all duration-300 group">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600 dark:text-${color.split('-')[1]}-400 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
    </div>
    <div className="space-y-1">
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</div>
      <div className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">{value}</div>
    </div>
  </div>
)

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
    if (!window.confirm('Are you sure you want to delete this user?')) return
    await api.delete(`/admin/user/${id}`)
    load()
    loadTodos()
  }

  if (!stats) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
          Admin Console
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">System overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          color="bg-blue-500"
          icon={<svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
        />
        <StatCard 
          title="Active Users" 
          value={stats.activeUsers} 
          color="bg-green-500"
          icon={<svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard 
          title="Total Todos" 
          value={stats.totalTodos} 
          color="bg-purple-500"
          icon={<svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <StatCard 
          title="Completion Rate" 
          value={`${Math.round((stats.completedTodos / stats.totalTodos) * 100) || 0}%`} 
          color="bg-orange-500"
          icon={<svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Users List */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col h-[600px]">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </span>
            User Management
          </h3>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {users.map(u => (
              <div key={u._id} className="group p-4 rounded-2xl bg-white/50 dark:bg-gray-800/30 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold text-white ${
                      u.isBlocked ? 'bg-gray-400' : 'bg-gradient-to-br from-primary-500 to-primary-600'
                    }`}>
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800 dark:text-gray-200">{u.name}</div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                    u.isBlocked 
                      ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' 
                      : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {u.isBlocked ? 'Blocked' : u.role}
                  </span>
                </div>
                
                <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button 
                    onClick={() => setFilterUser(u._id)}
                    className="flex-1 btn btn-ghost text-xs py-1.5"
                  >
                    View Tasks
                  </button>
                  {u.isBlocked ? (
                    <button onClick={() => unblock(u._id)} className="flex-1 btn bg-green-50 text-green-600 hover:bg-green-100 text-xs py-1.5">Unblock</button>
                  ) : (
                    <button onClick={() => block(u._id)} className="flex-1 btn bg-orange-50 text-orange-600 hover:bg-orange-100 text-xs py-1.5">Block</button>
                  )}
                  <button onClick={() => removeUser(u._id)} className="flex-1 btn btn-danger text-xs py-1.5">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Todos List */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col h-[600px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <span className="p-2 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </span>
              Task Inspector
            </h3>
            <select 
              className="input py-1.5 px-3 text-sm w-48"
              value={filterUser} 
              onChange={(e) => setFilterUser(e.target.value)}
            >
              <option value="">All Users</option>
              {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {todos.map(t => (
              <div key={t._id} className="p-4 rounded-2xl bg-white/50 dark:bg-gray-800/30 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-md transition-all duration-300">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-bold text-gray-800 dark:text-gray-200 line-clamp-1">{t.title}</div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                      <span className="font-medium text-primary-600 dark:text-primary-400">@{t.user?.name}</span>
                      <span>•</span>
                      <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                    t.status === 'completed' 
                      ? 'bg-green-50 text-green-600 border-green-200' 
                      : 'bg-orange-50 text-orange-600 border-orange-200'
                  }`}>
                    {t.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`w-2 h-2 rounded-full ${
                    t.priority === 'high' ? 'bg-red-500' : t.priority === 'medium' ? 'bg-orange-500' : 'bg-blue-500'
                  }`} />
                  <span className="text-xs font-medium text-gray-500 capitalize">{t.priority} Priority</span>
                </div>
              </div>
            ))}
            {!todos.length && (
              <div className="text-center py-12 text-gray-400">
                No tasks found for selected filter
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
