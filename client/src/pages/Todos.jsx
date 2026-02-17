import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { toast } from 'react-hot-toast'

const Todos = () => {
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', priority: 'medium', startDate: '', tags: '', status: 'pending' })
  const [filters, setFilters] = useState({
    search: params.get('search') || '',
    status: params.get('status') || '',
    priority: params.get('priority') || '',
    sort: params.get('sort') || 'createdAt:desc',
    startDate: params.get('startDate') || '',
    endDate: params.get('endDate') || '',
    overdue: params.get('overdue') || ''
  })
  const [trash, setTrash] = useState(false)
  const [selected, setSelected] = useState([])
  const [tab, setTab] = useState(() => (filters.status === 'completed' ? 'completed' : filters.status === 'pending' ? 'pending' : 'all'))
  const [openProgress, setOpenProgress] = useState({})
  const [progressInput, setProgressInput] = useState({})
  const query = useMemo(() => {
    const q = new URLSearchParams()
    q.set('page', String(page))
    q.set('limit', '12')
    if (filters.search) q.set('search', filters.search)
    if (filters.status) q.set('status', filters.status)
    if (filters.priority) q.set('priority', filters.priority)
    if (filters.sort) q.set('sort', filters.sort)
    if (filters.startDate) q.set('startDate', filters.startDate)
    if (filters.endDate) q.set('endDate', filters.endDate)
    if (filters.overdue) q.set('overdue', filters.overdue)
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

  const changeTab = (next) => {
    setTab(next)
    setPage(1)
    if (next === 'all') setFilters({ ...filters, status: '', overdue: '', startDate: '', endDate: '' })
    if (next === 'pending') setFilters({ ...filters, status: 'pending', overdue: '', startDate: '', endDate: '' })
    if (next === 'completed') setFilters({ ...filters, status: 'completed', overdue: '', startDate: '', endDate: '' })
  }

  const add = async () => {
    if (!form.title) return
    const payload = { title: form.title, status: form.status || 'pending', priority: form.priority, startDate: form.startDate || undefined, tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [] }
    const optimistic = [{ ...payload, _id: Math.random().toString(), createdAt: new Date().toISOString() }, ...items]
    setItems(optimistic)
    setForm({ title: '', status: 'pending', priority: 'medium', startDate: '', tags: '' })
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
    setFilters({ ...filters, startDate: start, endDate: end, overdue: '' })
  }
  const filterOverdue = () => {
    setPage(1)
    setFilters({ ...filters, overdue: 'true', startDate: '', endDate: '' })
  }

  return (
    <div style={{display:'grid', gap:'1rem'}}>
      <h2>Todos</h2>
      {!trash ? (
        <div className="tabs">
          <button className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => changeTab('all')}>All</button>
          <button className={`tab ${tab === 'pending' ? 'active' : ''}`} onClick={() => changeTab('pending')}>Pending</button>
          <button className={`tab ${tab === 'completed' ? 'active' : ''}`} onClick={() => changeTab('completed')}>Completed</button>
        </div>
      ) : (
        <div className="banner">Viewing Trash</div>
      )}
      <div className="toolbar">
        <input className="input" placeholder="Search" value={filters.search} onChange={(e) => { setPage(1); setFilters({ ...filters, search: e.target.value }) }} />
        <button className="btn" onClick={() => { setFilters({ search:'', status: trash ? filters.status : (tab === 'all' ? '' : tab), priority:'', sort:'createdAt:desc', startDate:'', endDate:'', overdue:'' }); setPage(1); }}>Clear</button>
        <button className="btn" onClick={() => setTrash(!trash)}>{trash ? 'Back to List' : 'Open Trash'}</button>
        {!trash && <>
          <button className="btn" onClick={filterOverdue}>Overdue</button>
          <button className="btn" onClick={filterToday}>Due Today</button>
        </>}
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
        <input className="input" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
        <input className="input" placeholder="tags, comma,separated" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select className="input" value={form.status || 'pending'} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
        <button className="btn btn-primary" onClick={add}>Add</button>
      </div>
      {loading ? <div className="skeleton" /> : (
        <div className="cards">
          {items.map((t) => (
            <div key={t._id} className="todo-card">
              <div className="todo-head">
                <div className="todo-title">
                  {!trash && <input type="checkbox" checked={selected.includes(t._id)} onChange={(e) => toggleSelect(t._id, e.target.checked)} />}
                  <h4 title={t.title}>{t.title}</h4>
                </div>
                <span
                  className={`badge clickable ${t.status === 'completed' ? 'badge-success' : 'badge-warning'}`}
                  title="Click to toggle status"
                  onClick={() => toggle(t._id, t.status === 'completed' ? 'pending' : 'completed')}
                >
                  {t.status}
                </span>
              </div>
              <div className="todo-meta">
                <span className={`pill ${t.priority}`}>{t.priority}</span>
                <span className="pill date" title="Start">
                  {new Date(t.startDate || t.createdAt).toLocaleDateString()}
                </span>
                {t.completedAt && <span className="pill date" title="Completed">{new Date(t.completedAt).toLocaleDateString()}</span>}
              </div>
              {!!(t.tags && t.tags.length) && (
                <div className="tags">{t.tags.map((tag, i) => <span key={i} className="tag">{tag}</span>)}</div>
              )}
              <div className="todo-controls">
                {!trash && (
                  <>
                    <select className="input small" value={t.priority} onChange={(e) => api.put(`/todos/${t._id}`, { priority: e.target.value }).then(load)}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <input className="input small" type="date" value={(t.startDate ? new Date(t.startDate) : new Date(t.createdAt)).toISOString().slice(0,10)} onChange={(e) => api.put(`/todos/${t._id}`, { startDate: new Date(e.target.value) }).then(load)} />
                  </>
                )}
              </div>
              <div className="todo-actions-row">
                {!trash ? (
                  <>
                    <button className="btn btn-success" onClick={() => toggle(t._id, t.status === 'completed' ? 'pending' : 'completed')}>
                      {t.status === 'completed' ? 'Mark Pending' : 'Complete'}
                    </button>
                    <button className="btn" onClick={() => navigate(`/todos/${t._id}/progress`)}>Progress</button>
                    <button className="btn btn-danger" onClick={() => remove(t._id)}>Delete</button>
                  </>
                ) : (
                  <button className="btn" onClick={() => restore(t._id)}>Restore</button>
                )}
              </div>
              {!trash && <div className="progressbar"><span style={{ width: `${(t.progress && t.progress.length ? t.progress[t.progress.length-1].percent : 0)}%` }} /></div>}
            </div>
          ))}
        </div>
      )}
      <div className="pagination">
        <button className="btn" disabled={page <= 1 || trash} onClick={() => setPage(page - 1)}>Prev</button>
        <span>{page}/{pages}</span>
        <button className="btn" disabled={page >= pages || trash} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  )
}

export default Todos
