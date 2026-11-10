import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Users } from 'lucide-react'
import CollabFeed from '../components/CollabFeed'
import UserDropdown from '../components/UserDropdown'
import MagneticButton from '../components/MagneticButton'

export default function CollabNetworkPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen mesh-bg relative">
      {/* Ambient Glow */}
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/15 blur-[120px] pointer-events-none z-[-2]" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-500/10 blur-[120px] pointer-events-none z-[-2]" />

      {/* Top Bar */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl border-b px-6 py-4"
        style={{ borderColor: 'var(--glass-border)', background: 'rgba(16, 17, 19, 0.85)' }}
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <MagneticButton
              onClick={() => navigate(-1)}
              className="glass-card-hover p-2.5 rounded-xl"
              id="back-to-dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </MagneticButton>
            <Users className="w-6 h-6 text-emerald-400" />
            <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">
              Collab Network
            </h1>
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-medium">3 creators online</span>
            </div>
          </div>
          <UserDropdown />
        </div>
      </header>

      {/* Main Feed */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex flex-col items-center">
        <div className="mb-6 text-center">
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-1">
            Find Your Next <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Collab Partner</span>
          </h2>
          <p className="text-slate-500 text-sm">Swipe through creator profiles for podcast swaps, co-streams & organic collabs</p>
        </div>
        <CollabFeed />
      </main>
    </div>
  )
}
