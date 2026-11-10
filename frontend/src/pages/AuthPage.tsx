import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Crown, Mail, Lock, User, Briefcase, Tag, ArrowRight, ArrowLeft } from 'lucide-react'
import apiClient from '../api/client'
import useAuthStore from '../store/authStore'

type AuthMode = 'login' | 'register'
type Role = 'CREATOR' | 'BRAND'

export default function AuthPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  
  const [mode, setMode] = useState<AuthMode>(
    (searchParams.get('mode') as AuthMode) || 'login'
  )
  const [role, setRole] = useState<Role>('CREATOR')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    niche: '',
    industry: '',
  })
  
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Sync mode with URL if it changes externally
  useEffect(() => {
    const urlMode = searchParams.get('mode') as AuthMode
    if (urlMode === 'login' || urlMode === 'register') {
      setMode(urlMode)
      setError(null)
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (mode === 'login') {
        const response = await apiClient.post('/auth/login', {
          email: formData.email,
          password: formData.password,
        })
        const { role, token, userId, name, email, entityId } = response.data
        const user = { userId, name, email, role, entityId }

        setAuth(token, user) // Update Zustand state

        if (role === 'CREATOR') {
          navigate('/dashboard/creator', { replace: true })
        } else if (role === 'BRAND') {
          navigate('/dashboard/brand', { replace: true })
        } else {
          setError("Invalid user role detected.")
        }
      } else {
        const res = await apiClient.post('/auth/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role,
          ...(role === 'CREATOR' ? { niche: formData.niche } : { industry: formData.industry }),
        })
        setAuth(res.data.token, {
          userId: res.data.userId,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role,
          entityId: res.data.entityId,
        })
        if (res.data.role === 'BRAND') {
          navigate('/dashboard/brand')
        } else {
          navigate('/dashboard/creator')
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      setError(
        err.response?.data?.message || err.response?.data || 'An error occurred during authentication.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen mesh-bg flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-sovereign-500/15 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-accent-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      {/* Nav back */}
      <div className="absolute top-6 left-6 z-10 w-full flex justify-between px-6 right-6">
        <Link to="/" className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>
      </div>

      <div className="w-full max-w-md z-10 animate-fade-in text-center mb-8">
        <div className="w-14 h-14 mx-auto bg-gradient-to-br from-sovereign-500 to-sovereign-700 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(var(--sovereign-500-rgb),0.3)] mb-6">
          <Crown className="w-7 h-7 text-white" />
        </div>
        <h1 className="font-display text-4xl font-bold text-slate-900 dark:text-white mb-2">
          {mode === 'login' ? 'Welcome Back' : 'Join Sovereign'}
        </h1>
        <p className="text-slate-700 dark:text-slate-300 text-lg">
          {mode === 'login'
            ? 'Sign in to access your dashboard'
            : 'Unleash your creative empire today'}
        </p>
      </div>

      <div className="w-full max-w-md glass-card p-8 animate-slide-up relative z-10">
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-start gap-3">
            <span className="block mt-0.5 font-bold">!</span>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'register' && (
            <>
              {/* Role Toggle */}
              <div className="flex bg-slate-200/500 p-1 rounded-xl mb-6">
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    role === 'CREATOR' ? 'bg-sovereign-500 text-white shadow-lg shadow-sovereign-500/20' : 'text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-200/50'
                  }`}
                  onClick={() => setRole('CREATOR')}
                >
                  Creator
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    role === 'BRAND' ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/20' : 'text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-200/50'
                  }`}
                  onClick={() => setRole('BRAND')}
                >
                  Brand
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 dark:text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-white/40 dark:bg-white/5 border border-slate-300/50 dark:border-white/10 text-slate-900 dark:text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-sovereign-500/50 focus:border-sovereign-500/50 transition-all placeholder:text-slate-500"
                    placeholder="Enter your name"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 dark:text-slate-400" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-white/40 dark:bg-white/5 border border-slate-300/50 dark:border-white/10 text-slate-900 dark:text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-sovereign-500/50 focus:border-sovereign-500/50 transition-all placeholder:text-slate-500"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 dark:text-slate-400" />
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-white/40 dark:bg-white/5 border border-slate-300/50 dark:border-white/10 text-slate-900 dark:text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-sovereign-500/50 focus:border-sovereign-500/50 transition-all placeholder:text-slate-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          {mode === 'register' && role === 'CREATOR' && (
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">Your Niche</label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 dark:text-slate-400" />
                <input
                  type="text"
                  name="niche"
                  required
                  value={formData.niche}
                  onChange={handleChange}
                  className="w-full bg-white/40 dark:bg-white/5 border border-slate-300/50 dark:border-white/10 text-slate-900 dark:text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-sovereign-500/50 focus:border-sovereign-500/50 transition-all placeholder:text-slate-500"
                  placeholder="e.g. Developer, Fitness, Tech..."
                />
              </div>
            </div>
          )}

          {mode === 'register' && role === 'BRAND' && (
            <div className="animate-fade-in">
              <label className="block text-sm font-medium text-slate-800 dark:text-slate-200 mb-2">Target Industry</label>
              <div className="relative">
                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 dark:text-slate-400" />
                <input
                  type="text"
                  name="industry"
                  required
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full bg-white/40 dark:bg-white/5 border border-slate-300/50 dark:border-white/10 text-slate-900 dark:text-white rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-sovereign-500/50 focus:border-sovereign-500/50 transition-all placeholder:text-slate-500"
                  placeholder="e.g. Software, Apparel..."
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-3.5 text-base flex justify-center items-center gap-2 mt-6 relative overflow-hidden group"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : mode === 'login' ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
            {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-700 dark:text-slate-300 text-sm">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login')
                setError(null)
              }}
              className="ml-2 text-sovereign-400 hover:text-sovereign-300 font-semibold transition-colors"
            >
              {mode === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
