import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// NOT_SAFE event handler
type SafeVerifyCallback = () => Promise<void>
let safeVerifyCallback: SafeVerifyCallback | null = null

export function setSafeVerifyCallback(callback: SafeVerifyCallback | null) {
  safeVerifyCallback = callback
}

export function getSafeVerifyCallback() {
  return safeVerifyCallback
}

// Token storage key (must match the tokenName returned by login API)
export const TOKEN_KEY = 'Authorization'

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Handle AUTH_NOT_LOGIN response code
    if (response.data?.code === 'AUTH_NOT_LOGIN') {
      localStorage.removeItem(TOKEN_KEY)
      window.location.href = '/'
      return Promise.reject(new Error('AUTH_NOT_LOGIN'))
    }

    // Handle AUTH_NOT_SAFE response code
    if (response.data?.code === 'AUTH_NOT_SAFE') {
      if (safeVerifyCallback) {
        return safeVerifyCallback().then(() => {
          // Retry the original request after successful verification
          return api.request(response.config)
        })
      }
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      window.location.href = '/login'
    }
    if (error.response?.status === 500) {
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)
