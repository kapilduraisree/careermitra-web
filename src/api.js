import axios from 'axios'

// Railway backend URL — production
const RAILWAY_URL = 'https://web-production-7e532.up.railway.app/api'

// Use env var if set (Vercel dashboard), otherwise use Railway URL directly
// In local dev, Vite proxy sends /api to localhost:5000
const BASE_URL = import.meta.env.VITE_API_URL
  || (import.meta.env.PROD ? RAILWAY_URL : '/api')

const api = axios.create({ baseURL: BASE_URL })

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
