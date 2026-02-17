import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../services/api'

const ProgressPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [todo, setTodo] = useState(null)
  const [input, setInput] = useState({ percent: '', note: '' })
  const load = async () => {
    const r = await api.get(`/todos/${id}`)
    setTodo(r.data.todo)
  }
  useEffect(() => { load() }, [id])

  const add = async () => {
    const p = Number(input.percent || 0)
    const note = input.note || ''
    await api.post(`/todos/${id}/progress`, { percent: p, note })
    setInput({ percent: '', note: '' })
    await load()
  }

  if (!todo) return <div className="centered">Loading...</div>

  const latest = (todo.progress && todo.progress.length) ? todo.progress[todo.progress.length - 1].percent : 0
  const points = todo.progress || []

  return (
    <div style={{display:'grid', gap:'1rem'}}>
      <div className="card" style={{display:'grid', gap:'.6rem'}}>
        <div className="toolbar">
          <button className="btn" onClick={() => navigate(-1)}>Back</button>
          <h2 style={{margin:0}}>{todo.title}</h2>
          <span className={`badge ${todo.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>{todo.status}</span>
          <span className="spacer" />
          <Link className="btn" to="/todos">All Todos</Link>
        </div>
        <div className="subtitle">
          <span className={`pill ${todo.priority}`}>{todo.priority}</span>
          <span className="pill date" title="Start">{new Date(todo.startDate || todo.createdAt).toLocaleDateString()}</span>
          {todo.completedAt && <span className="pill date" title="Completed">{new Date(todo.completedAt).toLocaleDateString()}</span>}
          {Array.isArray(todo.tags) && todo.tags.map((t,i)=><span key={i} className="tag">{t}</span>)}
          <span className="pill date" title="Progress">{latest}%</span>
        </div>
      </div>

      <div className="card">
        <h3>Updates</h3>
        <div className="chatform">
          <input className="input small" type="number" min="0" max="100" placeholder="%" value={input.percent} onChange={(e) => setInput({ ...input, percent: e.target.value })} />
          <input className="input" placeholder="What changed?" value={input.note} onChange={(e) => setInput({ ...input, note: e.target.value })} />
          <button className="btn btn-primary" onClick={add}>Add</button>
        </div>
        <div className="chat" style={{marginTop:'.5rem'}}>
          {points.slice().reverse().map((m, i) => {
            const onEdit = async () => {
              const np = prompt('Percent', String(m.percent))
              if (np === null) return
              const nn = prompt('Note', m.note || '')
              if (nn === null) return
              await api.patch(`/todos/${todo._id}/progress/${m._id}`, { percent: Number(np), note: nn })
              await load()
            }
            const onDel = async () => {
              if (!confirm('Delete this update?')) return
              await api.delete(`/todos/${todo._id}/progress/${m._id}`)
              await load()
            }
            return (
              <div key={i} className="msg">
                <strong>{m.percent}%</strong>
                <span>{m.note}</span>
                <span className="meta">{new Date(m.at).toLocaleString()}</span>
                <button className="btn" onClick={onEdit}>Edit</button>
                <button className="btn" onClick={onDel}>Delete</button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ProgressPage
