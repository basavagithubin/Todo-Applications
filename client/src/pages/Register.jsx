import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'
import PasswordInput from '../components/PasswordInput'

const Register = () => {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await register(name, email, password)
      toast.success('Registered')
      navigate('/')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="centered">
      <form onSubmit={onSubmit} className="card">
        <h2>Register</h2>
        <div className="subtitle">Create your account</div>
        <input className="input" placeholder="Name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input" placeholder="Email" type="email" autoComplete="username email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" name="new-password" autoComplete="new-password" />
        <button className="btn btn-primary" disabled={loading}>{loading ? '...' : 'Create account'}</button>
        <p>
          Have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  )
}

export default Register
