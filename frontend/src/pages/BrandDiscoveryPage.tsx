import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Briefcase, Zap, Radar } from 'lucide-react'
import CreatorDiscoveryFeed from '../components/CreatorDiscoveryFeed'
import useAuthStore from '../store/authStore'
import UserDropdown from '../components/UserDropdown'

export default function BrandDiscoveryPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  return (
    <div className="min-h-screen mesh-bg relative overflow-hidden">
      {/* Ambient Glow orbs (matching the others) */}
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/15 blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none z-0" />

      {/* Top Bar — Light Theme consistency */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b px-6 py-4"
        style={{ borderColor: 'var(--glass-border)', background: 'rgba(255, 255, 255, 0.85)' }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard/brand')}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </button>
            <Briefcase className="w-5 h-5 text-indigo-500" />
            <h1 className="font-display text-lg font-bold text-slate-900 tracking-tight">
              Creator Discovery
            </h1>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 ml-2">
              <Radar className="w-3 h-3 text-indigo-500 animate-pulse" />
              <span className="text-xs text-indigo-500 font-medium">AI Matching Active</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-white/50 border border-slate-200 flex items-center gap-2 text-sm text-slate-600">
              <Zap className="w-4 h-4 text-emerald-500" />
              <span className="hidden sm:inline">ML Engine Active</span>
            </div>
            <UserDropdown />
          </div>
        </div>
      </header>

      {/* Main Feed */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col items-center relative z-10">
        <div className="mb-6 text-center">
          <h2 className="font-display text-2xl font-bold text-slate-900 mb-1">
            Discover <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Top Creators</span>
          </h2>
          <p className="text-slate-500 text-sm">AI-curated creator reels matched to your target demographic & budget</p>
        </div>
        <CreatorDiscoveryFeed />
      </main>
    </div>
  )
}
