import { Routes, Route, Link, Navigate } from 'react-router-dom'
import ProtectedRoute from './routes/ProtectedRoute'
import RoleRoute from './routes/RoleRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Todos from './pages/Todos'
import ProgressPage from './pages/ProgressPage'
import AdminDashboard from './pages/AdminDashboard'
import Shell from './components/Shell'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Shell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/todos" element={<Todos />} />
          <Route path="/todos/:id/progress" element={<ProgressPage />} />
          <Route element={<RoleRoute roles={['superadmin']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<div className="centered"><Link to="/">Home</Link></div>} />
    </Routes>
  )
}

export default App
