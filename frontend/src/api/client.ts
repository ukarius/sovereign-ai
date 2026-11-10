import axios from 'axios'

/**
 * Axios API client with JWT interceptor.
 * Automatically attaches the Bearer token from localStorage to every request.
 */
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach JWT
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sovereign_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401 (expired token)
// Does NOT force-redirect; let individual callers (e.g. checkAuth) handle it gracefully
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale credentials but don't force a redirect —
      // RoleRoute and checkAuth handle navigation
      localStorage.removeItem('sovereign_token')
      localStorage.removeItem('sovereign_user')
    }
    return Promise.reject(error)
  }
)

export default apiClient
