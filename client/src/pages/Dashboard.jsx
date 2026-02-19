import { useEffect, useMemo, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const { theme, toggle: toggleTheme } = useTheme()
  const [items, setItems] = useState([])
  const [stats, setStats] = useState(null)
  const [monthly, setMonthly] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', priority: 'medium', dueDate: '', tags: '' })
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', sort: 'createdAt:desc' })
  const [trash, setTrash] = useState(false)
  const [selected, setSelected] = useState([])
  const query = useMemo(() => {
    const q = new URLSearchParams()
    q.set('page', String(page))
    if (filters.search) q.set('search', filters.search)
    if (filters.status) q.set('status', filters.status)
    if (filters.priority) q.set('priority', filters.priority)
    if (filters.sort) q.set('sort', filters.sort)
    return q.toString()
  }, [page, filters])

  const load = async () => {
    setLoading(true)
    try {
      if (trash) {
        const r = await api.get('/todos/trash')
        setItems(r.data.items)
        setPages(1)
      } else {
        const r = await api.get(`/todos?${query}`)
        setItems(r.data.items)
        setPages(r.data.pages)
      }
    } catch (e) {
      toast.error('Failed to load todos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [query, trash])

  useEffect(() => {
    if (!trash) {
      api.get('/todos/summary').then(r => setStats(r.data)).catch(() => {})
      api.get('/todos/monthly?limit=6').then(r => setMonthly(r.data.data)).catch(() => {})
    }
  }, [trash, items.length])

  const add = async () => {
    if (!form.title) return
    const payload = { title: form.title, priority: form.priority, dueDate: form.dueDate || undefined, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] }
    const optimistic = [{ ...payload, _id: Math.random().toString(), status: 'pending', createdAt: new Date().toISOString() }, ...items]
    setItems(optimistic)
    setForm({ title: '', priority: 'medium', dueDate: '', tags: '' })
    try {
      await api.post('/todos', payload)
      load()
    } catch (e) {
      toast.error('Failed to create')
      load()
    }
  }

  const toggle = async (id, status) => {
    const prev = items
    setItems(items.map((t) => (t._id === id ? { ...t, status } : t)))
    try {
      await api.patch(`/todos/${id}/status`, { status })
    } catch (e) {
      setItems(prev)
      toast.error('Failed to update')
    }
  }

  const remove = async (id) => {
    const prev = items
    setItems(items.filter((t) => t._id !== id))
    try {
      await api.delete(`/todos/${id}`)
    } catch (e) {
      setItems(prev)
      toast.error('Failed to delete')
    }
  }

  const restore = async (id) => {
    try {
      await api.patch(`/todos/${id}/restore`)
      load()
    } catch (e) {
      toast.error('Failed to restore')
    }
  }

  const toggleSelect = (id, checked) => {
    setSelected((cur) => checked ? [...new Set([...cur, id])] : cur.filter(x => x !== id))
  }
  const bulkDelete = async () => {
    const ids = selected
    setSelected([])
    for (const id of ids) await remove(id)
  }
  const bulkComplete = async () => {
    const ids = selected
    setSelected([])
    for (const id of ids) await toggle(id, 'completed')
  }
  const filterToday = () => {
    const d = new Date()
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString()
    const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).toISOString()
    setPage(1)
    setFilters({ ...filters, startDate: start, endDate: end })
  }
  const filterOverdue = () => {
    setPage(1)
    setFilters({ ...filters, overdue: 'true' })
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <h3>Todos</h3>
        <p>{user?.name}</p>
        <button className="btn" onClick={logout}>Logout</button>
        {user?.role === 'superadmin' && <Link className="btn" to="/admin">Admin</Link>}
        <button className="btn" onClick={toggleTheme}>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</button>
      </aside>
      <main className="content">
        {!trash && stats && (
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
                <div style={{display:'grid',gridTemplateColumns:`repeat(${monthly.length},1fr)`,gap:8,alignItems:'end',height:140}}>
                  {monthly.map(m => {
                    const max = Math.max(...monthly.map(x=>x.total)) || 1
                    const h = Math.max(6, Math.round((m.total/max)*120))
                    return (
                      <div key={m._id} style={{display:'grid',gap:6,justifyItems:'center'}}>
                        <div style={{width:16,height:h,background:'var(--primary)',borderRadius:6}} title={`${m._id} • ${m.total}`}/>
                        <small className="subtitle">{m._id.slice(5)}</small>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </>
        )}
        <div className="toolbar">
          <input className="input" placeholder="Search" value={filters.search} onChange={(e) => { setPage(1); setFilters({ ...filters, search: e.target.value }) }} />
          <select className="input" value={filters.status} onChange={(e) => { setPage(1); setFilters({ ...filters, status: e.target.value }) }}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          <select className="input" value={filters.priority} onChange={(e) => { setPage(1); setFilters({ ...filters, priority: e.target.value }) }}>
            <option value="">Any priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select className="input" value={filters.sort} onChange={(e) => { setPage(1); setFilters({ ...filters, sort: e.target.value }) }}>
            <option value="createdAt:desc">Newest</option>
            <option value="createdAt:asc">Oldest</option>
            <option value="priority:asc">Priority A-Z</option>
            <option value="title:asc">Title A-Z</option>
          </select>
          <button className="btn" onClick={() => { setFilters({ search:'', status:'', priority:'', sort:'createdAt:desc' }); setPage(1); }}>Clear</button>
          <button className="btn" onClick={() => setTrash(!trash)}>{trash ? 'Back to List' : 'Open Trash'}</button>
          <button className="btn" onClick={filterOverdue}>Overdue</button>
          <button className="btn" onClick={filterToday}>Due Today</button>
        </div>
        {!!selected.length && !trash && (
          <div className="toolbar">
            <span className="subtitle">{selected.length} selected</span>
            <button className="btn" onClick={bulkComplete}>Mark Completed</button>
            <button className="btn" onClick={bulkDelete}>Delete</button>
            <button className="btn" onClick={() => setSelected([])}>Clear</button>
          </div>
        )}
        <div className="new">
          <input className="input" placeholder="New todo title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="input" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          <input className="input" placeholder="tags, comma,separated" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button className="btn btn-primary" onClick={add}>Add</button>
        </div>
        {loading ? <div className="skeleton" /> : (
          <ul className="list">
            {items.map((t) => (
              <li key={t._id} className={`item ${t.status}`}>
                <div className="title">
                  {!trash && <input type="checkbox" checked={selected.includes(t._id)} onChange={(e) => toggleSelect(t._id, e.target.checked)} />}
                  <input type="checkbox" checked={t.status === 'completed'} onChange={(e) => toggle(t._id, e.target.checked ? 'completed' : 'pending')} />
                  <span>{t.title}</span>
                  <small className={`pill ${t.priority}`}>{t.priority}</small>
                  {t.dueDate && <small className="pill date">{new Date(t.dueDate).toLocaleDateString()}</small>}
                  {Array.isArray(t.tags) && t.tags.map((tag, i) => <span key={i} className="tag">{tag}</span>)}
                </div>
                <div className="actions">
                  {trash ? (
                    <button className="btn" onClick={() => restore(t._id)}>Restore</button>
                  ) : (
                    <button className="btn" onClick={() => remove(t._id)}>Delete</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        <div className="pagination">
          <button className="btn" disabled={page <= 1 || trash} onClick={() => setPage(page - 1)}>Prev</button>
          <span>{page}/{pages}</span>
          <button className="btn" disabled={page >= pages || trash} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
