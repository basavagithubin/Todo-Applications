import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true
})

let accessToken = null

export const setAccessToken = (token) => {
  accessToken = token
  if (token) localStorage.setItem('accessToken', token)
  else localStorage.removeItem('accessToken')
}

export const getAccessToken = () => {
  if (accessToken) return accessToken
  const saved = localStorage.getItem('accessToken')
  if (saved) accessToken = saved
  return accessToken
}

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshing = null
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    // Retry once on transient network changes in dev
    const isNetworkChange =
      err?.code === 'ERR_NETWORK' ||
      /Network\s*Error/i.test(err?.message || '') ||
      /ERR_NETWORK_CHANGED/i.test(err?.message || '')
    if (isNetworkChange && !original?._netRetry) {
      original._netRetry = true
      await new Promise(r => setTimeout(r, 300))
      return api(original)
    }
    if (err.response && err.response.status === 401 && !original._retry) {
      original._retry = true
      try {
        const r = await axios.post(`${API_BASE}/api/auth/refresh`, {}, { withCredentials: true })
        if (r.data?.accessToken) {
          setAccessToken(r.data.accessToken)
          original.headers.Authorization = `Bearer ${r.data.accessToken}`
          return api(original)
        }
      } catch (e) {}
    }
    return Promise.reject(err)
  }
)

export default api
