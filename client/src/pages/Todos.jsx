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
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      {!trash ? (
        <div className="flex gap-2 border-b border-[var(--border)] pb-2 overflow-x-auto">
          {['all', 'pending', 'completed'].map((t) => (
            <button
              key={t}
              className={`px-6 py-2 rounded-xl text-sm font-semibold capitalize transition-all duration-300 relative ${
                tab === t 
                  ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' 
                  : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => changeTab(t)}
            >
              {t}
              {tab === t && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-500 rounded-t-full animate-slide-up" />
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:border-red-900 flex items-center gap-3">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          <span className="font-bold">Viewing Trash Bin</span>
        </div>
      )}

      <div className="flex flex-wrap gap-4 items-center justify-between glass-panel p-4 rounded-2xl">
        <div className="flex-1 min-w-[250px] relative">
          <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input className="input pl-10" placeholder="Search tasks..." value={filters.search} onChange={(e) => { setPage(1); setFilters({ ...filters, search: e.target.value }) }} />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button className="btn btn-ghost border border-[var(--border)]" onClick={() => { setFilters({ search:'', status: trash ? filters.status : (tab === 'all' ? '' : tab), priority:'', sort:'createdAt:desc', startDate:'', endDate:'', overdue:'' }); setPage(1); }}>
            Clear Filters
          </button>
          <button className={`btn ${trash ? 'btn-primary' : 'btn-ghost border border-[var(--border)]'}`} onClick={() => setTrash(!trash)}>
            {trash ? 'Back to List' : 'Open Trash'}
          </button>
          {!trash && (
            <>
              <button className="btn btn-ghost border border-[var(--border)] text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20" onClick={filterOverdue}>Overdue</button>
              <button className="btn btn-ghost border border-[var(--border)] text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={filterToday}>Due Today</button>
              <select className="input w-32 py-2" value={rows} onChange={(e) => { setPage(1); setRows(Number(e.target.value)) }}>
                <option value={2}>2 rows</option>
                <option value={3}>3 rows</option>
                <option value={4}>4 rows</option>
                <option value={5}>5 rows</option>
              </select>
            </>
          )}
        </div>
      </div>

      {!!selected.length && !trash && (
        <div className="glass-panel p-3 rounded-2xl flex items-center justify-between animate-fade-in bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800">
          <span className="font-semibold text-primary-700 dark:text-primary-300 ml-2">{selected.length} tasks selected</span>
          <div className="flex gap-2">
            <button className="btn btn-primary text-xs py-2" onClick={bulkComplete}>Mark Completed</button>
            <button className="btn btn-danger text-xs py-2" onClick={bulkDelete}>Delete Selected</button>
            <button className="btn btn-ghost text-xs py-2" onClick={() => setSelected([])}>Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] rounded-2xl p-6 shadow-lg flex flex-wrap gap-4 items-end transition-all duration-300 hover:shadow-glow-primary/20">
        <div className="flex-1 min-w-[200px]">
          <label className="text-xs font-semibold text-[var(--muted)] ml-1 mb-1 block">Task Title</label>
          <input id="new-title" className="input" placeholder="What needs to be done?" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="w-auto">
          <label className="text-xs font-semibold text-[var(--muted)] ml-1 mb-1 block">Due Date</label>
          <input className="input" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="text-xs font-semibold text-[var(--muted)] ml-1 mb-1 block">Tags</label>
          <input className="input" placeholder="e.g. work, design" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        </div>
        <div className="w-32">
          <label className="text-xs font-semibold text-[var(--muted)] ml-1 mb-1 block">Priority</label>
          <select className="input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="w-32">
          <label className="text-xs font-semibold text-[var(--muted)] ml-1 mb-1 block">Status</label>
          <select className="input" value={form.status || 'pending'} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <button className="btn btn-primary px-8 h-[46px] shadow-glow-primary hover:scale-105" onClick={add}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Add Task
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 rounded-3xl bg-gray-200/50 dark:bg-gray-800/50 animate-pulse backdrop-blur-sm" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((t, index) => {
            const isEditing = !!edits[t._id]
            const edit = edits[t._id] || {}
            return (
            <div
              key={t._id}
              className="group relative flex flex-col glass-panel rounded-3xl p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary-500/10 animate-fade-in overflow-hidden"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2 min-w-0 flex-wrap">
                  {!trash && (
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={selected.includes(t._id)} 
                        onChange={(e) => toggleSelect(t._id, e.target.checked)} 
                        className="w-5 h-5 rounded-lg border-gray-300 text-primary-600 focus:ring-primary-500 transition-all cursor-pointer hover:scale-110"
                      />
                    </div>
                  )}
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ${
                    t.priority === 'high' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900' :
                    t.priority === 'medium' ? 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-900' :
                    'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900'
                  }`}>
                    {t.priority}
                  </span>
                  {!trash && !isEditing && (
                    <button
                      className="p-1.5 text-[var(--muted)] hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
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
                      title="Edit Task"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                  )}
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all duration-300 hover:scale-105 active:scale-95 ${
                      t.status === 'completed' 
                        ? 'bg-primary-50 text-primary-600 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800' 
                        : 'bg-secondary-50 text-secondary-600 border-secondary-200 dark:bg-secondary-900/20 dark:border-secondary-800'
                    }`}
                    onClick={() => toggle(t._id, t.status === 'completed' ? 'pending' : 'completed')}
                  >
                    {t.status}
                  </button>
                </div>
              </div>

              <div className="mb-4 flex-1">
                {!isEditing ? (
                  <h4 className="text-xl font-bold text-[var(--text)] leading-tight mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors cursor-pointer break-words" title={t.title} onClick={() => navigate(`/todos/${t._id}/progress`)}>
                    {t.title}
                  </h4>
                ) : (
                  <input
                    className="input mb-2 text-lg font-bold"
                    placeholder="Task title"
                    value={edit.title}
                    onChange={(e) => setEdits({ ...edits, [t._id]: { ...edit, title: e.target.value } })}
                    autoFocus
                  />
                )}

                <div className="flex flex-wrap gap-2 mt-3">
                   {!isEditing ? (
                    (t.tags || []).map((tag, i) => (
                      <span key={i} className="px-2.5 py-1 bg-[var(--bg)]/50 border border-[var(--border)] rounded-lg text-[11px] font-medium text-[var(--muted)] backdrop-blur-sm break-all">
                        #{tag}
                      </span>
                    ))
                  ) : (
                    <input
                      className="input text-sm py-1.5"
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
                         <div className="flex items-center gap-1.5 text-primary-600 dark:text-primary-400 font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                          <span>Done {new Date(t.completedAt).toLocaleDateString(undefined, { month:'short', day:'numeric' })}</span>
                        </div>
                      )}
                   </div>
                 ) : !trash && (
                   <div className="flex gap-2 mb-4">
                      <select 
                        className="input text-sm py-1 px-2"
                        value={edit.priority} 
                        onChange={(e) => setEdits({ ...edits, [t._id]: { ...edit, priority: e.target.value } })}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      <input 
                        type="date" 
                        className="input text-sm py-1 px-2"
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
                          className={`col-span-1 btn text-xs py-2 px-1 truncate ${
                            t.status === 'completed'
                            ? 'bg-green-500 text-white hover:bg-green-600 shadow-md shadow-green-500/30'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                          onClick={() => toggle(t._id, t.status === 'completed' ? 'pending' : 'completed')}
                        >
                          {t.status === 'completed' ? 'Undo' : 'Done'}
                        </button>
                        <button 
                          className="col-span-1 btn btn-ghost text-xs py-2 px-1 border border-[var(--border)] truncate"
                          onClick={() => navigate(`/todos/${t._id}/progress`)}
                        >
                          Details
                        </button>
                        <button 
                          className="col-span-1 btn btn-danger text-xs py-2 px-1 truncate"
                          onClick={() => remove(t._id)}
                        >
                          Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="col-span-1 btn btn-primary text-xs py-2"
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
                          className="col-span-1 btn btn-ghost text-xs py-2 border border-[var(--border)]"
                          onClick={() => {
                            const { [t._id]: _, ...rest } = edits
                            setEdits(rest)
                          }}
                        >
                          Cancel
                        </button>
                         <button 
                          className="col-span-1 btn btn-danger text-xs py-2"
                          onClick={() => remove(t._id)}
                        >
                          Delete
                        </button>
                      </>
                    )
                  ) : (
                     <button className="col-span-3 btn btn-ghost text-primary-600 hover:bg-primary-50 border-primary-200" onClick={() => restore(t._id)}>Restore Task</button>
                  )}
                </div>
              </div>
              {!trash && t.progress && t.progress.length > 0 && (
                <div className="mt-4 pt-2">
                  <div className="flex justify-between text-xs text-[var(--muted)] mb-1 font-medium">
                    <span>Progress</span>
                    <span>{t.progress[t.progress.length-1].percent}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-1000 ease-out shadow-glow-primary" 
                      style={{ width: `${t.progress[t.progress.length-1].percent}%` }} 
                    />
                  </div>
                </div>
              )}
            </div>
          )})}
        </div>
      )}
      <div className="pagination flex items-center justify-center gap-3 mt-4">
        <button className="btn btn-ghost border border-[var(--border)]" disabled={page <= 1 || trash} onClick={() => setPage(page - 1)}>
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          Prev
        </button>
        <span className="font-medium text-[var(--muted)]">{page} / {pages}</span>
        <button className="btn btn-ghost border border-[var(--border)]" disabled={page >= pages || trash} onClick={() => setPage(page + 1)}>
          Next
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  )
}

export default Todos