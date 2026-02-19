import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'

const Summary = () => {
  const [stats, setStats] = useState(null)
  const [monthly, setMonthly] = useState([])
  const [from, setFrom] = useState(() => {
    const d = new Date()
    const day = d.getDay() || 7
    const start = new Date(d)
    start.setDate(d.getDate() - (day - 1))
    start.setHours(0,0,0,0)
    return start.toISOString().slice(0,10)
  })
  const [to, setTo] = useState(() => {
    const d = new Date()
    const day = d.getDay() || 7
    const end = new Date(d)
    end.setDate(d.getDate() + (7 - day))
    end.setHours(23,59,59,999)
    return end.toISOString().slice(0,10)
  })
  const [weekItems, setWeekItems] = useState([])
  const [hoverKey, setHoverKey] = useState(null)
  const [selectedKey, setSelectedKey] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/todos/summary').then(r => setStats(r.data)).catch(() => {})
    api.get('/todos/monthly?limit=6').then(r => setMonthly(r.data.data)).catch(() => {})
  }, [])

  const loadRange = async (f, t) => {
    const startISO = new Date(f + 'T00:00:00').toISOString()
    const endISO = new Date(t + 'T23:59:59').toISOString()
    try {
      const r = await api.get(`/todos?startDate=${encodeURIComponent(startISO)}&endDate=${encodeURIComponent(endISO)}&limit=500`)
      setWeekItems(r.data.items || [])
    } catch {}
  }
  useEffect(() => { loadRange(from, to) }, [from, to])

  const days = useMemo(() => {
    const start = new Date(from + 'T00:00:00')
    const end = new Date(to + 'T00:00:00')
    const arr = []
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      arr.push(new Date(d))
    }
    return arr
  }, [from, to])
  const grouped = useMemo(() => {
    const g = {}
    for (const t of weekItems) {
      const dt = new Date(t.startDate || t.createdAt)
      const key = dt.toISOString().slice(0,10)
      if (!g[key]) g[key] = []
      g[key].push(t)
    }
    return g
  }, [weekItems])
  const maxCount = useMemo(() => Math.max(1, ...days.map(d => (grouped[d.toISOString().slice(0,10)] || []).length)), [days, grouped])
  useEffect(() => {
    const first = days.find(d => (grouped[d.toISOString().slice(0,10)] || []).length > 0)
    const k = first ? first.toISOString().slice(0,10) : null
    setSelectedKey(k)
    setHoverKey(k)
  }, [from, to, weekItems.length])

  const goOverdue = () => navigate('/todos?overdue=true')
  const goToday = () => {
    const d = new Date()
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString()
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).toISOString()
    navigate(`/todos?startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`)
  }

  return (
    <div style={{display:'grid', gap:'1rem'}}>
      {!stats ? <div className="skeleton" /> : (
        <>
          <div className="grid">
            <div className="card"><h3>Total</h3><strong>{stats.total}</strong></div>
            <div className="card"><h3>Completed</h3><strong className="pill low">{stats.completed}</strong></div>
            <div className="card"><h3>Pending</h3><strong className="pill medium">{stats.pending}</strong></div>
            <div className="card"><h3>Overdue</h3><strong className="pill high">{stats.overdue}</strong></div>
            <div className="card"><h3>Today</h3><strong className="pill date">{stats.dueToday}</strong></div>
            <div className="card"><h3>Completion</h3><strong>{stats.completionRate}%</strong></div>
          </div>
          {!!monthly.length && (
            <div className="card">
              <h3>Last 6 Months</h3>
              <div style={{display:'grid',gridTemplateColumns:`repeat(${monthly.length},1fr)`,gap:8,alignItems:'end',height:160}}>
                {monthly.map(m => {
                  const max = Math.max(...monthly.map(x=>x.total)) || 1
                  const h = Math.max(6, Math.round((m.total/max)*130))
                  return (
                    <div key={m._id} style={{display:'grid',gap:6,justifyItems:'center'}}>
                      <div style={{width:18,height:h,background:'var(--primary)',borderRadius:6}} title={`${m._id} • ${m.total}`}/>
                      <small className="subtitle">{m._id.slice(5)}</small>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
          <div className="card">
            <h3>Weekly Analysis</h3>
            <div className="toolbar">
              <input className="input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              <input className="input" type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} />
            </div>
            <div className="analysis-grid">
              <div className="analysis-chart">
              <svg role="img" aria-label="Weekly tasks chart" viewBox="0 0 720 220" style={{width:'100%', height:220}}>
                {(() => {
                  const padding = 32
                  const w = 720 - padding * 2
                  const h = 220 - padding * 2
                  const step = days.length > 1 ? w / (days.length - 1) : 0
                  const points = days.map((d, i) => {
                    const key = d.toISOString().slice(0,10)
                    const count = (grouped[key] || []).length
                    const x = padding + i * step
                    const y = padding + (h - (count / maxCount) * h)
                    return { x, y, key, count, date: d }
                  })
                  const path = points.map(p => `${p.x},${p.y}`).join(' ')
                  return (
                    <> 
                      <rect x="1" y="1" width="718" height="218" rx="12" ry="12" fill="transparent" stroke="var(--border)"/>
                      <polyline points={path} fill="none" stroke="var(--success)" strokeWidth="3" />
                      {points.map((p) => {
                        const active = (hoverKey || selectedKey) === p.key
                        return (
                        <g key={p.key} onMouseEnter={() => setHoverKey(p.key)} onMouseLeave={() => setHoverKey(null)} onClick={() => setSelectedKey(p.key)} style={{cursor:'pointer'}}>
                          <circle cx={p.x} cy={p.y} r={active ? 6 : 5} fill={active ? 'var(--primary)' : 'var(--success)'} />
                          <text x={p.x} y={220-10} textAnchor="middle" fontSize="10" fill="var(--muted)">
                            {String(p.date.getMonth()+1).padStart(2,'0')}/{String(p.date.getDate()).padStart(2,'0')}
                          </text>
                        </g>
                        )})}
                    </>
                  )
                })()}
              </svg>
              </div>
              <div className="analysis-list">
                <div className="analysis-header">
                  <strong>Tasks</strong>
                </div>
                <ul className="list compact" style={{marginTop:'.5rem'}}>
                  {(() => {
                    const fallback = days.find(d => (grouped[d.toISOString().slice(0,10)] || []).length > 0)
                    const key = hoverKey || selectedKey || (fallback ? fallback.toISOString().slice(0,10) : null)
                    const list = (grouped[key] || [])
                    if (!list.length) return <li className="item"><div className="title"><span>No tasks in range</span></div></li>
                    return list.slice(0,8).map(t => (
                      <li key={t._id} className="item">
                        <div className="title"><span>{t.title}</span><small className={`pill ${t.status === 'completed' ? 'low' : 'medium'}`}>{t.status}</small></div>
                        <div className="subtitle">{t.priority}{t.startDate ? ` • ${new Date(t.startDate).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}` : ''}</div>
                      </li>
                    ))
                  })()}
                </ul>
              </div>
            </div>
          </div>
          <div className="toolbar">
            <button className="btn" onClick={() => navigate('/todos')}>Open Todos</button>
            <button className="btn" onClick={goOverdue}>View Overdue</button>
            <button className="btn" onClick={goToday}>Due Today</button>
          </div>
        </>
      )}
    </div>
  )
}

export default Summary
