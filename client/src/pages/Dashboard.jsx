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
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} stroke="var(--border)" strokeWidth={stroke} fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${dash} ${circ - dash}`} transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="12" fill="var(--text)">{pct}%</text>
    </svg>
  )
}

const KPI = ({ title, value, delta, color, percent }) => (
  <div className="bg-[var(--panel)] border border-[var(--border)] rounded-2xl p-4 shadow grid gap-2">
    <div className="flex items-center justify-between">
      <span className="text-[var(--muted)]">{title}</span>
      <Ring value={typeof percent === 'number' ? Math.max(0, Math.min(100, percent)) : 75} color={color} />
    </div>
    <div className="text-2xl font-extrabold">{value}</div>
    <div className="text-sm">
      <span className="text-primary font-semibold">{delta}</span>
      <span className="text-[var(--muted)] ml-1">this month</span>
    </div>
  </div>
)

const Bars = ({ data }) => {
  const max = Math.max(1, ...data)
  return (
    <div className="h-64 grid items-end gap-6 grid-cols-4 px-2">
      {data.map((v, i) => {
        const h = Math.max(16, Math.round((v / max) * 220))
        const colors = ['#8dd3e6', '#6366f1', '#22c55e', '#8b5cf6']
        return <div key={i} className="w-16 mx-auto rounded-xl" style={{ height: h, background: colors[i % colors.length] }} />
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
    <div className="max-w-[1200px] mx-auto p-4 grid gap-4">
      <div className="flex items-center gap-3">
        <div className="text-2xl font-extrabold">Dashboard</div>
        <div className="ml-auto flex items-center gap-3 w-full max-w-[420px]">
          <input className="w-full rounded-xl px-3 py-2 bg-[var(--panel)] border border-[var(--border)] outline-none" placeholder="Search..." />
          <div className="w-9 h-9 rounded-full bg-[var(--border)]" />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 md:grid-cols-2 sm:grid-cols-1">
        <KPI title="Sales" value={stats?.completed ?? '—'} delta={growthDelta} color="#22c55e" percent={pctCompleted} />
        <KPI title="Orders" value={stats?.pending ?? '—'} delta={growthDelta} color="#10b981" percent={pctPending} />
        <KPI title="Invoices" value={stats?.total ?? '—'} delta={growthDelta} color="#3b82f6" percent={Math.min(100, (barData.slice(-1)[0] || 0) * 10)} />
        <KPI title="Payments" value={stats?.overdue ?? '—'} delta={growthDelta} color="#8b5cf6" percent={pctOverdue} />
      </div>

      <div className="flex items-center gap-2">
        <Link to="/todos" className="px-3 py-1.5 rounded-full bg-[var(--panel)] border border-[var(--border)]">All</Link>
        <Link to="/todos?status=pending" className="px-3 py-1.5 rounded-full bg-[rgba(245,158,11,.15)] border border-[rgba(245,158,11,.25)]">Pending</Link>
        <Link to="/todos?status=completed" className="px-3 py-1.5 rounded-full bg-[rgba(34,197,94,.15)] border border-[rgba(34,197,94,.25)]">Completed</Link>
        <Link to="/todos?overdue=true" className="px-3 py-1.5 rounded-full bg-[rgba(239,68,68,.15)] border border-[rgba(239,68,68,.25)]">Overdue</Link>
        <Link to="/todos?today=true" className="px-3 py-1.5 rounded-full bg-[var(--panel)] border border-[var(--border)]">Today</Link>
      </div>

      <div className="grid grid-cols-3 gap-4 md:grid-cols-1">
        <div className="col-span-2 bg-[var(--panel)] border border-[var(--border)] rounded-2xl p-5 shadow grid gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Sales</h3>
            <Link className="text-primary" to="/todos">View All</Link>
          </div>
          <Bars data={barData} />
          <div className="grid grid-cols-4 text-center text-[var(--muted)] text-sm">
            <span>Sales</span><span>Visits</span><span>Income</span><span>Revenue</span>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="bg-[var(--panel)] border border-[var(--border)] rounded-2xl p-4 shadow grid gap-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Transactions</h3>
              <Link className="text-primary" to="/todos">View All</Link>
            </div>
            <ul className="grid gap-3">
              {recent.map(t => (
                <li key={t._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group cursor-default">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      t.priority === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' :
                      t.priority === 'medium' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30' :
                      'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                    }`}>
                      {t.priority === 'high' ? '!' : t.priority === 'medium' ? '•' : '✓'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[180px] group-hover:text-blue-600 transition-colors">{t.title}</div>
                      <div className="text-xs text-[var(--muted)] flex items-center gap-1">
                         <span>{new Date(t.createdAt).toLocaleDateString(undefined, { month:'short', day:'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      t.status === 'completed' 
                        ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                        : 'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                </li>
              ))}
              {!recent.length && <li className="text-[var(--muted)] text-center py-4">No recent activity</li>}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-[#1f7a68] to-[#2dbb95] rounded-2xl p-6 text-white grid gap-2">
            <div className="text-2xl font-extrabold">Design Smarter</div>
            <div className="opacity-90">Faster. Make things Better</div>
            <div className="flex gap-2 mt-2">
              <Link to="/todos" className="bg-white/20 hover:bg-white/30 rounded-xl px-4 py-2">View All</Link>
              <Link to="/todos" className="bg-white text-black rounded-xl px-4 py-2">Order Now</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
