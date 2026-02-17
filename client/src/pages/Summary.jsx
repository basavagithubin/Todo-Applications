import { useEffect, useState } from 'react'
import api from '../services/api'
import { useNavigate } from 'react-router-dom'

const Summary = () => {
  const [stats, setStats] = useState(null)
  const [monthly, setMonthly] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/todos/summary').then(r => setStats(r.data)).catch(() => {})
    api.get('/todos/monthly?limit=6').then(r => setMonthly(r.data.data)).catch(() => {})
  }, [])

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
