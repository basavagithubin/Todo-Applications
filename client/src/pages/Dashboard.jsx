import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import { Link } from 'react-router-dom'

const Ring = ({ value, color = 'var(--primary)' }) => {
  const size = 56
  const stroke = 6
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, value))
  const dash = (pct / 100) * circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="transform -rotate-90 transition-all duration-1000 ease-out">
      <circle cx={size/2} cy={size/2} r={r} stroke="currentColor" strokeWidth={stroke} fill="none" className="text-gray-200 dark:text-gray-700/30" />
      <circle 
        cx={size/2} 
        cy={size/2} 
        r={r} 
        stroke={color} 
        strokeWidth={stroke} 
        fill="none" 
        strokeLinecap="round" 
        strokeDasharray={`${dash} ${circ - dash}`} 
        className="transition-all duration-1000 ease-out"
      />
      <text 
        x="50%" 
        y="50%" 
        dominantBaseline="middle" 
        textAnchor="middle" 
        fontSize="12" 
        fill="currentColor" 
        className="transform rotate-90 font-bold text-gray-700 dark:text-gray-200"
      >
        {pct}%
      </text>
    </svg>
  )
}

const KPI = ({ title, value, delta, color, percent, icon }) => (
  <div className="glass-panel p-6 rounded-3xl hover:-translate-y-1 transition-all duration-300 group">
    <div className="flex items-center justify-between mb-4">
      <div className="p-3 rounded-2xl bg-gray-50/50 dark:bg-gray-800/30 backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <Ring value={typeof percent === 'number' ? Math.max(0, Math.min(100, percent)) : 0} color={color} />
    </div>
    <div className="space-y-1">
      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</div>
      <div className="text-3xl font-black text-gray-800 dark:text-white tracking-tight">{value}</div>
    </div>
    <div className="mt-3 flex items-center text-sm">
      <span className="text-primary-600 dark:text-primary-400 font-bold bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-lg border border-primary-100 dark:border-primary-800/30">
        {delta}
      </span>
      <span className="text-gray-400 ml-2">vs last month</span>
    </div>
  </div>
)

const Bars = ({ data }) => {
  const max = Math.max(1, ...data)
  return (
    <div className="h-64 grid items-end gap-4 grid-cols-4 px-2">
      {data.map((v, i) => {
        const h = Math.max(16, Math.round((v / max) * 100))
        // Gradient colors for bars
        const gradients = [
          'linear-gradient(to top, #00C853, #69F0AE)',
          'linear-gradient(to top, #FF6D00, #FF9E80)',
          'linear-gradient(to top, #2962FF, #82B1FF)',
          'linear-gradient(to top, #AA00FF, #EA80FC)'
        ]
        return (
          <div key={i} className="group relative flex flex-col items-center gap-2 h-full justify-end">
            <div 
              className="w-full max-w-[40px] rounded-t-xl transition-all duration-500 ease-out hover:opacity-90 relative overflow-hidden"
              style={{ 
                height: `${h}%`, 
                background: gradients[i % gradients.length],
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }} 
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            </div>
            <span className="text-xs font-medium text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6">
              {v}
            </span>
          </div>
        )
      })}
    </div>
  )
}

const Dashboard = () => {
  const [stats, setStats] = useState(null)
  const [monthly, setMonthly] = useState([])
  const [recent, setRecent] = useState([])

  useEffect(() => {
    api.get('/todos/summary').then(r => setStats(r.data)).catch(() => {})
    api.get('/todos/monthly?limit=4').then(r => setMonthly(r.data.data || [])).catch(() => {})
    api.get('/todos?limit=5&sort=createdAt:desc').then(r => setRecent(r.data.items || [])).catch(() => {})
  }, [])

  const barData = useMemo(() => {
    const arr = monthly.map(m => m.total)
    return arr.length ? arr.slice(-4) : [4, 8, 5, 9]
  }, [monthly])

  const growthDelta = useMemo(() => {
    if (monthly.length >= 2) {
      const a = monthly[monthly.length - 1].total || 0
      const b = monthly[monthly.length - 2].total || 1
      const g = Math.round(((a - b) / Math.max(1, b)) * 100)
      return `${g >= 0 ? '+' : ''}${g}%`
    }
    return '+0%'
  }, [monthly])

  const total = stats?.total || 0
  const pctCompleted = total ? Math.round(((stats?.completed || 0) / total) * 100) : 0
  const pctPending = total ? Math.round(((stats?.pending || 0) / total) * 100) : 0
  const pctOverdue = total ? Math.round(((stats?.overdue || 0) / total) * 100) : 0

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 font-medium">Overview of your productivity</p>
        </div>
        <div className="relative group w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            className="block w-full pl-10 pr-3 py-3 border-none rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl shadow-lg shadow-gray-200/20 dark:shadow-black/20 focus:ring-2 focus:ring-primary-500/50 transition-all duration-300 placeholder-gray-400 text-gray-700 dark:text-gray-200" 
            placeholder="Search tasks, analytics..." 
          />
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPI 
          title="Total Tasks" 
          value={stats?.total ?? '—'} 
          delta={growthDelta} 
          color="#3b82f6" 
          percent={Math.min(100, (barData.slice(-1)[0] || 0) * 10)}
          icon={<svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
        />
        <KPI 
          title="Completed" 
          value={stats?.completed ?? '—'} 
          delta={growthDelta} 
          color="#00C853" 
          percent={pctCompleted}
          icon={<svg className="w-6 h-6 text-[#00C853]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KPI 
          title="Pending" 
          value={stats?.pending ?? '—'} 
          delta={growthDelta} 
          color="#FF6D00" 
          percent={pctPending}
          icon={<svg className="w-6 h-6 text-[#FF6D00]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <KPI 
          title="Overdue" 
          value={stats?.overdue ?? '—'} 
          delta={growthDelta} 
          color="#EF4444" 
          percent={pctOverdue}
          icon={<svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-3 p-1.5 glass-panel rounded-2xl w-fit">
        {[
          { to: '/todos', label: 'All Tasks', color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
          { to: '/todos?status=pending', label: 'Pending', color: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400' },
          { to: '/todos?status=completed', label: 'Completed', color: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
          { to: '/todos?overdue=true', label: 'Overdue', color: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' },
          { to: '/todos?today=true', label: "Today's Focus", color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' }
        ].map((link, i) => (
          <Link 
            key={i} 
            to={link.to} 
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-105 ${link.color} border border-transparent hover:border-current hover:shadow-lg`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Charts & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analytics Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Productivity Trends</h3>
              <p className="text-sm text-gray-500">Monthly task completion rates</p>
            </div>
            <Link className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center gap-1 transition-colors" to="/todos">
              View Report
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
          <div className="flex-1 flex items-end justify-center py-4">
            <Bars data={barData} />
          </div>
          <div className="grid grid-cols-4 text-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
            {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((label, i) => (
              <span key={i} className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
            ))}
          </div>
        </div>

        {/* Recent Activity & Promo */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-3xl flex-1">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Recent Activity</h3>
              <Link className="text-primary-600 hover:text-primary-700 font-semibold text-sm" to="/todos">View All</Link>
            </div>
            <ul className="space-y-3">
              {recent.map(t => (
                <li key={t._id} className="group flex items-center justify-between p-3 rounded-2xl hover:bg-white/50 dark:hover:bg-gray-700/30 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all duration-300">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow-sm transition-transform group-hover:scale-110 ${
                      t.priority === 'high' ? 'bg-gradient-to-br from-red-400 to-red-600 text-white' :
                      t.priority === 'medium' ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                      'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
                    }`}>
                      {t.priority === 'high' ? '!' : t.priority === 'medium' ? '•' : '✓'}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-gray-800 dark:text-gray-200 truncate group-hover:text-primary-600 transition-colors">{t.title}</div>
                      <div className="text-xs text-gray-500 font-medium">
                         {new Date(t.createdAt).toLocaleDateString(undefined, { month:'short', day:'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                    t.status === 'completed' 
                      ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:border-green-800' 
                      : 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800'
                  }`}>
                    {t.status}
                  </span>
                </li>
              ))}
              {!recent.length && (
                <li className="flex flex-col items-center justify-center py-8 text-center text-gray-400">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <p>No recent activity</p>
                </li>
              )}
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-3xl p-6 text-white shadow-2xl group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00C853] to-[#009624] transition-all duration-500 group-hover:scale-105" />
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-black/10 rounded-full blur-2xl" />
            
            <div className="relative z-10">
              <div className="text-2xl font-black mb-1">Go Premium</div>
              <div className="opacity-90 font-medium mb-4">Unlock advanced analytics & themes</div>
              <div className="flex gap-3">
                <Link to="/todos" className="flex-1 text-center bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-xl px-4 py-2.5 font-bold transition-all hover:scale-105 border border-white/10">
                  Explore
                </Link>
                <Link to="/todos" className="flex-1 text-center bg-white text-[#00C853] hover:bg-gray-50 rounded-xl px-4 py-2.5 font-bold shadow-lg transition-all hover:scale-105">
                  Upgrade
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
