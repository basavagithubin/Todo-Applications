import { useEffect, useMemo, useState, useCallback } from 'react'
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
  const [edits, setEdits] = useState({})
  const [rows, setRows] = useState(3)
  const query = useMemo(() => {
    const q = new URLSearchParams()
    q.set('page', String(page))
    q.set('limit', String(rows * 5))
    if (filters.search) q.set('search', filters.search)
    if (filters.status) q.set('status', filters.status)
    if (filters.priority) q.set('priority', filters.priority)
    if (filters.sort) q.set('sort', filters.sort)
    if (filters.startDate) q.set('startDate', filters.startDate)
    if (filters.endDate) q.set('endDate', filters.endDate)
    if (filters.overdue) q.set('overdue', filters.overdue)
    return q.toString()
  }, [page, filters, rows])

  const load = useCallback(async () => {
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
    } catch {
      toast.error('Failed to load todos')
    } finally {
      setLoading(false)
    }
  }, [query, trash])

  useEffect(() => { load() }, [load])

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
    } catch {
      toast.error('Failed to create')
      load()
    }
  }

  const toggle = async (id, status) => {
    const prev = items
    setItems(items.map((t) => (t._id === id ? { ...t, status } : t)))
    try {
      await api.patch(`/todos/${id}/status`, { status })
    } catch {
      setItems(prev)
      toast.error('Failed to update')
    }
  }

  const remove = async (id) => {
    const prev = items
    setItems(items.filter((t) => t._id !== id))
    try {
      await api.delete(`/todos/${id}`)
    } catch {
      setItems(prev)
      toast.error('Failed to delete')
    }
  }

  const restore = async (id) => {
    try {
      await api.patch(`/todos/${id}/restore`)
      load()
    } catch {
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
    <div className="space-y-6 max-w-[1600px] mx-auto">
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
          <select className="input" value={rows} onChange={(e) => { setPage(1); setRows(Number(e.target.value)) }}>
            <option value={2}>2 rows</option>
            <option value={3}>3 rows</option>
            <option value={4}>4 rows</option>
            <option value={5}>5 rows</option>
          </select>
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
        <input id="new-title" className="input" placeholder="New todo title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((t) => {
            const isEditing = !!edits[t._id]
            const edit = edits[t._id] || {}
            return (
            <div
              key={t._id}
              className="group relative flex flex-col bg-[var(--panel)] rounded-3xl p-5 border border-[var(--border)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {!trash && (
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={selected.includes(t._id)} 
                        onChange={(e) => toggleSelect(t._id, e.target.checked)} 
                        className="w-5 h-5 rounded-md border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors cursor-pointer"
                      />
                    </div>
                  )}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    t.priority === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                    t.priority === 'medium' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                    'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                  }`}>
                    {t.priority}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                   {!trash && !isEditing && (
                    <button
                      className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      onClick={() =>
                        setEdits({
                          ...edits,
                          [t._id]: {
                            title: t.title || '',
                            tags: (t.tags || []).join(', '),
                            priority: t.priority || 'medium',
                            startDate: (t.startDate ? new Date(t.startDate) : new Date(t.createdAt)).toISOString().slice(0, 10)
                          }
                        })
                      }
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  )}
                  <button
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      t.status === 'completed' 
                        ? 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                        : 'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
                    }`}
                    onClick={() => toggle(t._id, t.status === 'completed' ? 'pending' : 'completed')}
                  >
                    {t.status}
                  </button>
                </div>
              </div>

              <div className="mb-4 flex-1">
                {!isEditing ? (
                  <h4 className="text-xl font-bold text-[var(--text)] leading-tight mb-2 line-clamp-2" title={t.title}>
                    {t.title}
                  </h4>
                ) : (
                  <input
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-lg font-bold outline-none focus:ring-2 focus:ring-blue-500/50 mb-2"
                    placeholder="Task title"
                    value={edit.title}
                    onChange={(e) => setEdits({ ...edits, [t._id]: { ...edit, title: e.target.value } })}
                    autoFocus
                  />
                )}

                <div className="flex flex-wrap gap-2 mt-3">
                   {!isEditing ? (
                    (t.tags || []).map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-[var(--bg)] border border-[var(--border)] rounded-md text-xs text-[var(--muted)]">
                        #{tag}
                      </span>
                    ))
                  ) : (
                    <input
                      className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="Tags (comma separated)"
                      value={edit.tags || ''}
                      onChange={(e) => setEdits({ ...edits, [t._id]: { ...edit, tags: e.target.value } })}
                    />
                  )}
                </div>
              </div>

              <div className="border-t border-[var(--border)] pt-4 mt-auto">
                 {!trash && !isEditing ? (
                   <div className="flex items-center justify-between text-sm text-[var(--muted)] mb-4">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span>{new Date(t.startDate || t.createdAt).toLocaleDateString(undefined, { month:'short', day:'numeric' })}</span>
                      </div>
                      {t.completedAt && (
                         <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                          <span>Done {new Date(t.completedAt).toLocaleDateString(undefined, { month:'short', day:'numeric' })}</span>
                        </div>
                      )}
                   </div>
                 ) : !trash && (
                   <div className="flex gap-2 mb-4">
                      <select 
                        className="bg-[var(--bg)] border border-[var(--border)] rounded-lg px-2 py-1 text-sm outline-none"
                        value={edit.priority} 
                        onChange={(e) => setEdits({ ...edits, [t._id]: { ...edit, priority: e.target.value } })}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      <input 
                        type="date" 
                        className="bg-[var(--bg)] border border-[var(--border)] rounded-lg px-2 py-1 text-sm outline-none"
                        value={edit.startDate} 
                        onChange={(e) => setEdits({ ...edits, [t._id]: { ...edit, startDate: e.target.value } })} 
                      />
                   </div>
                 )}

                <div className="grid grid-cols-3 gap-2">
                  {!trash ? (
                    !isEditing ? (
                      <>
                        <button 
                          className={`col-span-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                            t.status === 'completed'
                            ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
                            : 'bg-green-500 text-white hover:bg-green-600 shadow-lg shadow-green-500/30'
                          }`}
                          onClick={() => toggle(t._id, t.status === 'completed' ? 'pending' : 'completed')}
                        >
                          {t.status === 'completed' ? 'Undo' : 'Done'}
                        </button>
                        <button 
                          className="col-span-1 py-2 bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] rounded-xl text-sm font-semibold hover:bg-[var(--border)] transition-all"
                          onClick={() => navigate(`/todos/${t._id}/progress`)}
                        >
                          Details
                        </button>
                        <button 
                          className="col-span-1 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-semibold hover:bg-red-100 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400 transition-all"
                          onClick={() => remove(t._id)}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="col-span-1 py-2 bg-blue-500 text-white rounded-xl text-sm font-semibold hover:bg-blue-600 shadow-lg shadow-blue-500/30"
                          onClick={async () => {
                            const payload = {
                              title: (edit.title || '').trim(),
                              priority: edit.priority,
                              startDate: edit.startDate ? new Date(edit.startDate) : undefined,
                              tags: (edit.tags || '').split(',').map(s => s.trim()).filter(Boolean)
                            }
                            await api.put(`/todos/${t._id}`, payload).then(load)
                            const { [t._id]: _, ...rest } = edits
                            setEdits(rest)
                          }}
                        >
                          Save
                        </button>
                        <button
                          className="col-span-1 py-2 bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] rounded-xl text-sm font-semibold hover:bg-[var(--border)]"
                          onClick={() => {
                            const { [t._id]: _, ...rest } = edits
                            setEdits(rest)
                          }}
                        >
                          Cancel
                        </button>
                         <button 
                          className="col-span-1 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl text-sm font-semibold hover:bg-red-100 dark:bg-red-900/20 dark:border-red-900/50 dark:text-red-400"
                          onClick={() => remove(t._id)}
                        >
                          Delete
                        </button>
                      </>
                    )
                  ) : (
                     <button className="col-span-3 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-semibold hover:bg-blue-100" onClick={() => restore(t._id)}>Restore Task</button>
                  )}
                </div>
              </div>
              {!trash && t.progress && t.progress.length > 0 && (
                <div className="mt-4 pt-2">
                  <div className="flex justify-between text-xs text-[var(--muted)] mb-1">
                    <span>Progress</span>
                    <span>{t.progress[t.progress.length-1].percent}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full" 
                      style={{ width: `${t.progress[t.progress.length-1].percent}%` }} 
                    />
                  </div>
                </div>
              )}
            </div>
          )})}
        </div>
      )}
      <div className="pagination flex items-center justify-center gap-3 mt-2">
        <button className="btn" disabled={page <= 1 || trash} onClick={() => setPage(page - 1)}>Prev</button>
        <span>{page}/{pages}</span>
        <button className="btn" disabled={page >= pages || trash} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  )
}

export default Todos
