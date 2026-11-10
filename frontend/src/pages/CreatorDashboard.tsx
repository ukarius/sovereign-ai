import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Client } from '@stomp/stompjs'
import { 
  LayoutDashboard, TrendingUp, Users, DollarSign, 
  MessageSquare, BarChart3, Activity, Zap, 
  FlaskConical, Sparkles, RefreshCw, BarChart, Brain, Trophy, Loader2,
  Handshake
} from 'lucide-react'
import useAuthStore from '../store/authStore'
import FunnelChart from '../components/FunnelChart'
import AiSidebar from '../components/AiSidebar'
import OpportunityRadar from '../components/OpportunityRadar'
import SmartAiCards from '../components/SmartAiCards'
import CreatorUniverse from '../components/CreatorUniverse'
import UserDropdown from '../components/UserDropdown'
import PeerBenchmarkingWidget from '../components/PeerBenchmarkingWidget'
import RecommendedSponsorsWidget from '../components/RecommendedSponsorsWidget'
import PeerAnalyticsGraph from '../components/PeerAnalyticsGraph'
import MarketExplorer from '../components/MarketExplorer'
import Tilt from 'react-parallax-tilt'
import MagneticButton from '../components/MagneticButton'
import HoverLineChart from '../components/HoverLineChart'
import { ResponsiveContainer, AreaChart, Area } from 'recharts'
import apiClient from '../api/client'

interface DashboardUpdate {
  creatorId: string
  funnelData: Record<string, number>
  totalEvents: number
  latestEventType: string
}

interface LandingPageData {
  id: string
  variantAHeadline: string
  variantBHeadline: string
  variantASubtext: string
  variantBSubtext: string
  visitsA: number
  visitsB: number
  conversionsA: number
  conversionsB: number
  isTestActive: boolean
}

interface ABAnalysis {
  winner: string
  variantAConvRate: string
  variantBConvRate: string
  analysis: string
}

interface InsightsData {
  digest: string
  funnelData: Record<string, any>
}

export default function CreatorDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [funnelData, setFunnelData] = useState<Record<string, number>>({
    IMPRESSION: 12847,
    CLICK: 4521,
    LANDING_VIEW: 2103,
    SIGNUP: 847,
    PURCHASE: 234,
  })
  const [totalEvents, setTotalEvents] = useState(20552)
  const [latestEvent, setLatestEvent] = useState<string>('CLICK')
  const [universeMode, setUniverseMode] = useState(false)

  /* ═══════ Global Cursor Tracking ═══════ */
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--cursor-x', `${e.clientX}px`)
      document.documentElement.style.setProperty('--cursor-y', `${e.clientY}px`)
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // ═══════ A/B Testing State ═══════
  const [landingPage, setLandingPage] = useState<LandingPageData | null>(null)
  const [abAnalysis, setAbAnalysis] = useState<ABAnalysis | null>(null)
  const [abLoading, setAbLoading] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  // ═══════ AI Insights State ═══════
  const [insights, setInsights] = useState<InsightsData | null>(null)
  const [insightsLoading, setInsightsLoading] = useState(false)

  /* ═══════ WebSocket (STOMP) Connection ═══════ */
  useEffect(() => {
    if (!user?.userId) return

    const client = new Client({
      brokerURL: `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/ws`,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })

    client.onConnect = () => {
      console.log('🔌 WebSocket connected')
      client.subscribe(`/topic/dashboard/${user.userId}`, (message) => {
        const update: DashboardUpdate = JSON.parse(message.body)
        setFunnelData(update.funnelData)
        setTotalEvents(update.totalEvents)
        setLatestEvent(update.latestEventType)
      })
    }

    client.onStompError = (frame) => {
      console.error('STOMP error:', frame.headers['message'])
    }

    client.activate()

    return () => {
      client.deactivate()
    }
  }, [user?.userId])

  /* ═══════ Load A/B Test Data ═══════ */
  useEffect(() => {
    if (!user?.userId) return
    loadLandingPage()
  }, [user?.userId])

  const loadLandingPage = async () => {
    if (!user?.userId) return
    setAbLoading(true)
    try {
      const res = await apiClient.get(`/landing-pages/${user.userId}`)
      setLandingPage(res.data)
    } catch (err) {
      console.log('No landing page configured yet')
    } finally {
      setAbLoading(false)
    }
  }

  const handleRegenerateCopy = async () => {
    if (!user?.userId) return
    setRegenerating(true)
    setAbAnalysis(null)
    try {
      const res = await apiClient.post(`/landing-pages/${user.userId}/regenerate-copy`)
      setLandingPage(res.data)
    } catch (err) {
      console.error('Failed to regenerate copy', err)
    } finally {
      setRegenerating(false)
    }
  }

  const handleAnalyseAB = async () => {
    if (!user?.userId) return
    setAnalyzing(true)
    try {
      const res = await apiClient.get(`/landing-pages/${user.userId}/analyse-ab`)
      setAbAnalysis(res.data)
      if (res.data.landingPage) setLandingPage(res.data.landingPage)
    } catch (err) {
      console.error('Failed to analyse A/B', err)
    } finally {
      setAnalyzing(false)
    }
  }

  /* ═══════ Load AI Insights ═══════ */
  const loadInsights = async () => {
    if (!user?.userId) return
    setInsightsLoading(true)
    try {
      const res = await apiClient.get(`/landing-pages/${user.userId}/insights`)
      setInsights(res.data)
    } catch (err) {
      console.error('Failed to load insights', err)
    } finally {
      setInsightsLoading(false)
    }
  }

  const stats = [
    {
      label: 'Profile Views',
      value: totalEvents.toLocaleString(),
      change: '+12.5%',
      context: 'vs. 18,200 last month',
      icon: <Activity className="w-5 h-5" />,
      color: 'text-sovereign-400',
      bgColor: 'bg-sovereign-500/10',
      chartColor: '#748ffc',
      data: [40, 50, 45, 60, 55, 70, 75].map(v => ({ value: v })),
    },
    {
      label: 'Deal Close Rate',
      value: `${((funnelData.PURCHASE / funnelData.IMPRESSION) * 100).toFixed(2)}%`,
      change: '+2.1%',
      context: 'vs. 1.8% last month',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      chartColor: '#34d399',
      data: [2, 2.1, 2.5, 2.3, 2.8, 2.6, 3.2].map(v => ({ value: v })),
    },
    {
      label: 'Active Sponsors',
      value: funnelData.SIGNUP.toLocaleString(),
      change: '+18.3%',
      context: 'vs. 716 last month',
      icon: <Users className="w-5 h-5" />,
      color: 'text-violet-400',
      bgColor: 'bg-violet-500/10',
      chartColor: '#a78bfa',
      data: [600, 650, 630, 700, 680, 750, 847].map(v => ({ value: v })),
    },
    {
      label: 'Pipeline Value',
      value: `$${(funnelData.PURCHASE * 29.99).toLocaleString()}`,
      change: '+8.7%',
      context: 'vs. $6,200 last month',
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      chartColor: '#fbbf24',
      data: [5000, 5200, 5100, 5800, 5600, 6500, 7014].map(v => ({ value: v })),
    },
  ]

  return (
    <div className="min-h-screen mesh-bg relative">
      {/* Texture Overlay */}
      <div 
        className="fixed inset-0 z-[-1] pointer-events-none opacity-[0.04] mix-blend-overlay" 
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
      ></div>

      {/* Ambient Glow Orbs */}
      <motion.div 
        animate={{ x: [0, 100, 0], y: [0, -100, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-sovereign-500/20 blur-[120px] pointer-events-none z-[-2]"
      />
      <motion.div 
        animate={{ x: [0, -100, 0], y: [0, 100, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none z-[-2]"
      />

      {/* Top Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b px-6 py-4" style={{ borderColor: 'var(--glass-border)', background: 'rgba(16, 17, 19, 0.85)' }}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-6 h-6 text-sovereign-400" />
            <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
            {latestEvent && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400 font-medium">Live</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <MagneticButton
              onClick={() => navigate('/collabs')}
              className="glass-card-hover px-4 py-2 rounded-xl text-sm font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 flex items-center gap-2"
              id="collabs-nav"
            >
              <Handshake className="w-4 h-4" />
              Collabs
            </MagneticButton>
            <MagneticButton
              onClick={() => setUniverseMode(!universeMode)}
              className="glass-card-hover px-4 py-2 rounded-xl text-sm font-semibold text-slate-900 dark:text-white bg-white/80"
              id="universe-toggle"
            >
              {universeMode ? 'Classic View' : 'Universe View'}
            </MagneticButton>
            <MagneticButton
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="glass-card-hover p-2.5 rounded-xl flex items-center gap-2"
              id="ai-chat-toggle"
            >
              <MessageSquare className="w-5 h-5 text-sovereign-400" />
              <span className="hidden sm:inline text-sm text-slate-800 dark:text-slate-300 font-medium">AI Chat</span>
            </MagneticButton>
            <UserDropdown />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8 animate-fade-in">
          <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white mb-1">
            Welcome back, <span className="gradient-text">{user?.name || 'Creator'}</span>
          </h2>
          <p className="text-slate-700 dark:text-slate-300">Here&apos;s what&apos;s happening with your content today.</p>
        </div>

        {universeMode ? (
          <CreatorUniverse />
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, i) => (
                <motion.div 
                  key={stat.label}
                  className="animate-slide-up group"
                  style={{ animationDelay: `${i * 0.1}s` }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <div className={`glass-card p-5 h-full relative overflow-hidden transition-shadow duration-300 hover:shadow-xl ${
                    i === 0 ? 'hover:shadow-sovereign-500/10' :
                    i === 1 ? 'hover:shadow-emerald-500/10' :
                    i === 2 ? 'hover:shadow-violet-500/10' :
                    'hover:shadow-amber-500/10'
                  }`}>
                    <div className="flex items-center justify-between mb-3 relative z-10">
                      <div className={`w-10 h-10 rounded-xl ${stat.bgColor} flex items-center justify-center ${stat.color}`}>
                        {stat.icon}
                      </div>
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                        {stat.change}
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white mb-0.5 relative z-10">{stat.value}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 relative z-10 mb-2">{stat.label}</div>
                    
                    {/* Micro-Sparkline */}
                    <div className="relative -mx-5 -mb-5 mt-2 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
                      <ResponsiveContainer width="100%" height={40}>
                        <AreaChart data={stat.data}>
                          <defs>
                            <linearGradient id={`gradient-${i}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={stat.chartColor} stopOpacity={0.4}/>
                              <stop offset="95%" stopColor={stat.chartColor} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <Area 
                            type="monotone" 
                            dataKey="value" 
                            stroke={stat.chartColor} 
                            strokeWidth={2}
                            fillOpacity={1}
                            fill={`url(#gradient-${i})`}
                            isAnimationActive={true}
                            animationDuration={1500}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Contextual Reveal */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-2 right-4 text-xs text-slate-400 z-10">
                      {stat.context}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Funnel Chart — takes 2/3 */}
          <div className="lg:col-span-2 glass-card p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-sovereign-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Conversion Funnel</h3>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-200/50 text-xs text-slate-800 dark:text-slate-300">
                <Zap className="w-3 h-3 animate-pulse text-amber-500" />
                Real-time
              </div>
            </div>
            <FunnelChart data={funnelData} />
          </div>

          {/* Recent Activity / Time-Series (takes 1/3) */}
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <HoverLineChart />
          </div>
        </div>

        {/* ════════════ ML Engine Row ════════════ */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
           <PeerBenchmarkingWidget />
           <RecommendedSponsorsWidget />
        </div>

        {/* ════════════ KNN Peer Orbit Graph ════════════ */}
        <div className="mb-8">
          <PeerAnalyticsGraph />
        </div>

        {/* ════════════ Market Explorer ════════════ */}
        <div className="mb-8">
          <MarketExplorer />
        </div>

        {/* ════════════ Phase 11: A/B Testing & AI Insights Row ════════════ */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">

          {/* ─── A/B Testing Dashboard ─── */}
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.5s' }} id="ab-testing-panel">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-accent-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">A/B Testing Engine</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRegenerateCopy}
                  disabled={regenerating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 bg-sovereign-500/15 text-sovereign-300 hover:bg-sovereign-500/25 border border-sovereign-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  id="regenerate-copy-btn"
                >
                  {regenerating 
                    ? <Loader2 className="w-3 h-3 animate-spin" /> 
                    : <Sparkles className="w-3 h-3" />
                  }
                  {regenerating ? 'Writing...' : 'AI Copy'}
                </button>
                <button
                  onClick={handleAnalyseAB}
                  disabled={analyzing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 bg-accent-500/15 text-accent-300 hover:bg-accent-500/25 border border-accent-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  id="analyse-ab-btn"
                >
                  {analyzing 
                    ? <Loader2 className="w-3 h-3 animate-spin" /> 
                    : <BarChart className="w-3 h-3" />
                  }
                  {analyzing ? 'Analyzing...' : 'Analyze'}
                </button>
              </div>
            </div>

            {abLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-sovereign-400" />
              </div>
            ) : landingPage ? (
              <div className="space-y-4">
                {/* Variant Cards */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Variant A */}
                  <div className="p-4 rounded-xl bg-slate-200/50 border border-sovereign-500/20 relative overflow-hidden">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-5 h-5 rounded-full bg-sovereign-500/20 flex items-center justify-center text-xs font-bold text-sovereign-300">A</div>
                      <span className="text-xs font-medium text-sovereign-300">Variant A</span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white leading-tight mb-3 line-clamp-2">
                      &ldquo;{landingPage.variantAHeadline}&rdquo;
                    </p>
                    <div className="flex items-center gap-3 text-xs">
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Visits </span>
                        <span className="text-slate-900 dark:text-white font-semibold">{landingPage.visitsA.toLocaleString()}</span>
                      </div>
                      <div className="w-px h-3 bg-slate-400" />
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Conv </span>
                        <span className="text-emerald-400 font-semibold">{landingPage.conversionsA}</span>
                      </div>
                      <div className="w-px h-3 bg-slate-400" />
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Rate </span>
                        <span className="text-amber-400 font-semibold">
                          {landingPage.visitsA > 0 ? ((landingPage.conversionsA / landingPage.visitsA) * 100).toFixed(1) : '0.0'}%
                        </span>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-sovereign-500/5 rounded-full blur-2xl" />
                  </div>

                  {/* Variant B */}
                  <div className="p-4 rounded-xl bg-slate-200/50 border border-accent-500/20 relative overflow-hidden">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-5 h-5 rounded-full bg-accent-500/20 flex items-center justify-center text-xs font-bold text-accent-300">B</div>
                      <span className="text-xs font-medium text-accent-300">Variant B</span>
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white leading-tight mb-3 line-clamp-2">
                      &ldquo;{landingPage.variantBHeadline}&rdquo;
                    </p>
                    <div className="flex items-center gap-3 text-xs">
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Visits </span>
                        <span className="text-slate-900 dark:text-white font-semibold">{landingPage.visitsB.toLocaleString()}</span>
                      </div>
                      <div className="w-px h-3 bg-slate-400" />
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Conv </span>
                        <span className="text-emerald-400 font-semibold">{landingPage.conversionsB}</span>
                      </div>
                      <div className="w-px h-3 bg-slate-400" />
                      <div>
                        <span className="text-slate-600 dark:text-slate-400">Rate </span>
                        <span className="text-amber-400 font-semibold">
                          {landingPage.visitsB > 0 ? ((landingPage.conversionsB / landingPage.visitsB) * 100).toFixed(1) : '0.0'}%
                        </span>
                      </div>
                    </div>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-accent-500/5 rounded-full blur-2xl" />
                  </div>
                </div>

                {/* Test Status Bar */}
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-200/500">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${landingPage.isTestActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
                    <span className="text-xs text-slate-800 dark:text-slate-300">
                      {landingPage.isTestActive ? 'Test Running' : 'Test Paused'}
                    </span>
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    {(landingPage.visitsA + landingPage.visitsB).toLocaleString()} total visits
                  </span>
                </div>

                {/* Analysis Result */}
                {abAnalysis && (
                  <div className="mt-3 p-4 rounded-xl bg-white/60 border border-slate-400/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Trophy className={`w-4 h-4 ${
                        abAnalysis.winner === 'VARIANT_A' ? 'text-sovereign-400' :
                        abAnalysis.winner === 'VARIANT_B' ? 'text-accent-400' :
                        'text-slate-700 dark:text-slate-300'
                      }`} />
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {abAnalysis.winner === 'INCONCLUSIVE' 
                          ? 'Result: Inconclusive — Keep Testing'
                          : `Champion: ${abAnalysis.winner === 'VARIANT_A' ? 'Variant A' : 'Variant B'}`
                        }
                      </span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                      {abAnalysis.analysis}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FlaskConical className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">No A/B test configured yet</p>
                <MagneticButton
                  onClick={handleRegenerateCopy}
                  disabled={regenerating}
                  className="btn-primary text-sm px-4 py-2"
                  id="start-ab-test-btn"
                >
                  {regenerating ? 'Generating...' : 'Generate AI Headlines'}
                </MagneticButton>
              </div>
            )}
          </div>

          {/* ─── AI Weekly Insights Digest ─── */}
          <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.6s' }} id="ai-insights-panel">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">AI Strategy Digest</h3>
              </div>
              <button
                onClick={loadInsights}
                disabled={insightsLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                id="generate-insights-btn"
              >
                {insightsLoading 
                  ? <Loader2 className="w-3 h-3 animate-spin" /> 
                  : <RefreshCw className="w-3 h-3" />
                }
                {insightsLoading ? 'Thinking...' : 'Generate'}
              </button>
            </div>

            {insightsLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <Brain className="w-6 h-6 text-emerald-400 animate-pulse" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-2 border-emerald-400/30 animate-ping" />
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300">Analyzing your funnel data...</p>
              </div>
            ) : insights ? (
              <div className="space-y-4">
                {/* Mini Funnel Stats */}
                {insights.funnelData && Object.keys(insights.funnelData).length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Impressions', key: 'impressions', color: 'text-sovereign-400' },
                      { label: 'Clicks', key: 'clicks', color: 'text-violet-400' },
                      { label: 'Purchases', key: 'purchases', color: 'text-amber-400' },
                    ].map(item => (
                      <div key={item.key} className="text-center p-2 rounded-lg bg-slate-200/40">
                        <div className={`text-lg font-bold ${item.color}`}>
                          {Number(insights.funnelData[item.key] || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400">{item.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Digest Content */}
                <div className="p-4 rounded-xl bg-white/60 border border-emerald-500/10">
                  <p className="text-sm text-slate-900 dark:text-white leading-relaxed whitespace-pre-line">
                    {insights.digest}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Brain className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-1">Your AI Growth Strategist</p>
                <p className="text-xs text-slate-500 mb-4">
                  Powered by your materialized funnel analytics
                </p>
                <button
                  onClick={loadInsights}
                  className="btn-primary text-sm px-4 py-2"
                  id="first-insights-btn"
                >
                  <Sparkles className="w-4 h-4 inline mr-1" />
                  Get Weekly Digest
                </button>
              </div>
            )}
          </div>

        </div>

          <OpportunityRadar />

          <SmartAiCards />
        </>
        )}
      </main>

      {/* AI Sidebar */}
      <AiSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </div>
  )
}
