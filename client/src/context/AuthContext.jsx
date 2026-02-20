import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api, { setAccessToken, getAccessToken } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(() => !!getAccessToken())

  useEffect(() => {
    const token = getAccessToken()
    if (!token) return
    api.get('/auth/profile').then((r) => {
      setUser(r.data.user)
      setLoading(false)
    }).catch(() => {
      setAccessToken(null)
      setLoading(false)
    })
  }, [])

  const login = async (email, password) => {
    const r = await api.post('/auth/login', { email, password })
    setAccessToken(r.data.accessToken)
    setUser(r.data.user)
    return r.data.user
  }

  const register = async (name, email, password) => {
    const r = await api.post('/auth/register', { name, email, password })
    setAccessToken(r.data.accessToken)
    setUser(r.data.user)
    return r.data.user
  }

  const logout = async () => {
    await api.post('/auth/logout')
    setAccessToken(null)
    setUser(null)
  }

  const value = useMemo(() => ({ user, setUser, login, register, logout, loading }), [user, loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
