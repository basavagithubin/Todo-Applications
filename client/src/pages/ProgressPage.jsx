import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../services/api'
import { toast } from 'react-hot-toast'

const ProgressPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [todo, setTodo] = useState(null)
  const [input, setInput] = useState({ percent: '', note: '' })
  
  const load = async () => {
    try {
      const r = await api.get(`/todos/${id}`)
      setTodo(r.data.todo)
     } catch (e) {
      toast.error('Failed to load task')
      navigate('/todos')
    }
  }

  useEffect(() => {
    load()
  }, [id])

  const add = async () => {
    if (!input.percent) return toast.error('Please enter percentage')
    
    try {
      const p = Number(input.percent || 0)
      const note = input.note || ''
      await api.post(`/todos/${id}/progress`, { percent: p, note })
      setInput({ percent: '', note: '' })
      await load()
      toast.success('Progress updated')
    } catch (e) {
      toast.error('Failed to update progress')
    }
  }

  if (!todo) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
    </div>
  )

  const latest = (todo.progress && todo.progress.length) ? todo.progress[todo.progress.length - 1].percent : 0
  const points = todo.progress || []

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-8">
      {/* Header Card */}
      <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors group/back"
            >
              <div className="p-2 rounded-xl bg-white/50 dark:bg-gray-800/50 group-hover/back:bg-white dark:group-hover/back:bg-gray-800 shadow-sm transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </div>
              <span className="font-bold">Back</span>
            </button>
            
            <div className="flex gap-2">
               <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border flex items-center gap-2 ${
                todo.status === 'completed' 
                  ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:border-green-800' 
                  : 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:border-orange-800'
              }`}>
                <span className={`w-2 h-2 rounded-full ${todo.status === 'completed' ? 'bg-green-500' : 'bg-orange-500'}`} />
                {todo.status}
              </span>
              <span className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300`}>
                {todo.priority} Priority
              </span>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-gray-800 dark:text-white mb-4 leading-tight">
            {todo.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
            <div className="flex items-center gap-1.5 bg-white/50 dark:bg-gray-800/50 px-3 py-1.5 rounded-xl">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Created {new Date(todo.createdAt).toLocaleDateString()}
            </div>
            {todo.dueDate && (
              <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-xl">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Due {new Date(todo.dueDate).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-8">
            <div className="flex justify-between items-end mb-2">
              <span className="font-bold text-gray-700 dark:text-gray-300">Overall Progress</span>
              <span className="text-2xl font-black text-primary-600 dark:text-primary-400">{latest}%</span>
            </div>
            <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden p-1 shadow-inner">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-1000 ease-out shadow-lg shadow-primary-500/30 relative"
                style={{ width: `${latest}%` }}
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
            <span className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </span>
            Progress Timeline
          </h3>

          <div className="relative pl-8 space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-primary-500 before:to-gray-200 dark:before:to-gray-700">
            {points.slice().reverse().map((m, i) => {
               const onEdit = async () => {
                const np = prompt('Percent', String(m.percent))
                if (np === null) return
                const nn = prompt('Note', m.note || '')
                if (nn === null) return
                try {
                  await api.patch(`/todos/${todo._id}/progress/${m._id}`, { percent: Number(np), note: nn })
                  await load()
                  toast.success('Update modified')
                } catch { toast.error('Failed to edit') }
              }
              const onDel = async () => {
                if (!window.confirm('Delete this update?')) return
                try {
                  await api.delete(`/todos/${todo._id}/progress/${m._id}`)
                  await load()
                  toast.success('Update deleted')
                } catch { toast.error('Failed to delete') }
              }

              return (
                <div key={i} className="relative group animate-slide-in-right" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="absolute -left-[39px] top-1 w-5 h-5 rounded-full border-4 border-white dark:border-gray-900 bg-primary-500 shadow-lg z-10" />
                  
                  <div className="glass-panel p-4 rounded-2xl border border-white/20 hover:border-primary-500/30 transition-all duration-300">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg font-black text-primary-600 dark:text-primary-400">{m.percent}%</span>
                          <span className="text-xs text-gray-400 font-medium">{new Date(m.at).toLocaleString()}</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{m.note || <span className="italic text-gray-400">No note added</span>}</p>
                      </div>
                      
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-blue-500 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button onClick={onDel} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            {!points.length && (
              <div className="text-center py-12 text-gray-400 italic">
                No progress updates yet. Start tracking!
              </div>
            )}
          </div>
        </div>

        {/* Update Form */}
        <div className="glass-panel p-6 rounded-3xl h-fit sticky top-24">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Log Progress</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Percentage</label>
              <div className="relative">
                <input 
                  type="number" 
                  min="0" 
                  max="100" 
                  className="input text-lg font-bold" 
                  placeholder="0" 
                  value={input.percent} 
                  onChange={(e) => setInput({ ...input, percent: e.target.value })} 
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Note (Optional)</label>
              <textarea 
                className="input min-h-[100px] resize-none" 
                placeholder="What did you accomplish?" 
                value={input.note} 
                onChange={(e) => setInput({ ...input, note: e.target.value })} 
              />
            </div>
            
            <button 
              className="btn btn-primary w-full py-3 text-base font-bold shadow-lg shadow-primary-500/20" 
              onClick={add}
            >
              Update Progress
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProgressPage
