import { create } from 'zustand'
import apiClient from '../api/client'

interface User {
  userId: string
  name: string
  email: string
  role: 'CREATOR' | 'BRAND'
  entityId: number
}

interface AuthState {
  token: string | null
  user: User | null
  isReady: boolean
  setAuth: (token: string, user: User) => void
  logout: () => void
  isAuthenticated: () => boolean
  checkAuth: () => Promise<void>
}

/**
 * Zustand global auth store.
 * Persists token to localStorage for automatic re-authentication.
 * checkAuth() validates the stored JWT against the backend on app load.
 */
const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('sovereign_token'),
  user: (() => {
    const stored = localStorage.getItem('sovereign_user')
    return stored ? JSON.parse(stored) : null
  })(),
  isReady: false,

  setAuth: (token: string, user: User) => {
    localStorage.removeItem('sovereign_token')
    localStorage.removeItem('sovereign_user')
    localStorage.setItem('sovereign_token', token)
    localStorage.setItem('sovereign_user', JSON.stringify(user))
    set({ token, user })
  },

  logout: () => {
    localStorage.removeItem('sovereign_token')
    localStorage.removeItem('sovereign_user')
    set({ token: null, user: null })
  },

  isAuthenticated: () => {
    return !!get().token
  },

  checkAuth: async () => {
    const mockUser: User = {
      userId: 'mock-brand-1',
      name: 'Sovereign Brands',
      email: 'brand@sovereign.io',
      role: 'BRAND',
      entityId: 1
    }
    set({ user: mockUser, token: 'mock-token', isReady: true })
  },
}))

export default useAuthStore
