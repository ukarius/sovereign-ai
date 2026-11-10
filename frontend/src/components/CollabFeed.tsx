import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion'
import { X, FileText, Handshake, CheckCircle } from 'lucide-react'

/* ── Mock Data ── */
const COLLAB_VIDEOS = [
  {
    id: 1,
    videoUrl: 'https://videos.pexels.com/video-files/5896379/5896379-uhd_1440_2560_24fps.mp4',
    name: 'Alex Johnson',
    niche: 'SaaS & Dev Tools',
    followers: '125K',
    matchScore: 94,
    quote: "Looking for a productivity YouTuber around 100k subs for a podcast guest swap! Let's cross-pollinate audiences.",
    breakdown: { audienceOverlap: 40, nicheAlignment: 30, growthVelocity: 24 },
  },
  {
    id: 2,
    videoUrl: 'https://videos.pexels.com/video-files/7989650/7989650-uhd_1440_2560_25fps.mp4',
    name: 'Samantha Lee',
    niche: 'Fintech & Wealth',
    followers: '300K',
    matchScore: 88,
    quote: "I want to co-stream a financial literacy challenge. Hit me up if you're in the personal finance space!",
    breakdown: { audienceOverlap: 35, nicheAlignment: 28, growthVelocity: 25 },
  },
  {
    id: 3,
    videoUrl: 'https://videos.pexels.com/video-files/5896379/5896379-uhd_1440_2560_24fps.mp4',
    name: 'David Chen',
    niche: 'AI & Productivity',
    followers: '85K',
    matchScore: 91,
    quote: "Looking for a coding challenge co-stream partner. My viewers are early adopters who love AI tools!",
    breakdown: { audienceOverlap: 42, nicheAlignment: 26, growthVelocity: 23 },
  },
]

/* ── Animated Counter ── */
function AnimatedScore({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="tabular-nums"
    >
      {value}%
    </motion.span>
  )
}

/* ── Toggle Switch ── */
function ToggleSwitch({
  label,
  value,
  enabled,
  onToggle,
}: {
  label: string
  value: number
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div>
        <span className="text-sm text-white font-medium">{label}</span>
        <span className="text-xs text-emerald-400/80 ml-2 font-semibold">+{value}%</span>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
          enabled ? 'bg-emerald-500' : 'bg-white/15'
        }`}
      >
        <motion.div
          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
          animate={{ x: enabled ? 20 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  )
}

/* ── Main Component ── */
export default function CollabFeed() {
  const [toast, setToast] = useState<string | null>(null)
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
  const [toggleState, setToggleState] = useState<Record<number, { audienceOverlap: boolean; nicheAlignment: boolean; growthVelocity: boolean }>>({})

  const handleCollabRequest = useCallback((name: string) => {
    setToast(`Collab Request Sent to ${name}!`)
    setTimeout(() => setToast(null), 3000)
  }, [])

  const getToggles = (id: number) =>
    toggleState[id] ?? { audienceOverlap: true, nicheAlignment: true, growthVelocity: true }

  const toggleFactor = (id: number, factor: 'audienceOverlap' | 'nicheAlignment' | 'growthVelocity') => {
    setToggleState((prev) => ({
      ...prev,
      [id]: { ...getToggles(id), [factor]: !getToggles(id)[factor] },
    }))
  }

  const computeScore = (video: (typeof COLLAB_VIDEOS)[0]) => {
    const t = getToggles(video.id)
    let score = 0
    if (t.audienceOverlap) score += video.breakdown.audienceOverlap
    if (t.nicheAlignment) score += video.breakdown.nicheAlignment
    if (t.growthVelocity) score += video.breakdown.growthVelocity
    return score
  }

  return (
    <div className="h-[calc(100vh-80px)] w-full max-w-md mx-auto relative overflow-hidden bg-black rounded-3xl shadow-2xl border border-white/10">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 bg-emerald-500/90 backdrop-blur-xl text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold"
          >
            <CheckCircle className="w-4 h-4" />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll Track */}
      <div
        className="h-full w-full overflow-y-scroll snap-y snap-mandatory flex flex-col"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {COLLAB_VIDEOS.map((video) => {
          const isExpanded = expandedCard === video.id
          const liveScore = computeScore(video)
          const toggles = getToggles(video.id)

          return (
            <div key={video.id} className="h-full w-full shrink-0 snap-start relative">
              {/* Video Layer — blurs when expanded */}
              <motion.div
                className="absolute inset-0"
                animate={{
                  scale: isExpanded ? 0.95 : 1,
                  filter: isExpanded ? 'blur(12px) brightness(0.5)' : 'blur(0px) brightness(1)',
                }}
                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
              >
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-cover"
                  src={video.videoUrl}
                />
              </motion.div>

              {/* Top Right Badge */}
              <div className="absolute top-4 right-4 bg-white/15 backdrop-blur-md text-white/90 text-xs px-3 py-1.5 rounded-full z-10 border border-white/20 font-medium">
                30s pitch
              </div>

              {/* Bottom Gradient + UI */}
              <div className="absolute bottom-0 left-0 w-full z-10 flex flex-col">
                {/* Dark Gradient */}
                <div className="flex-1 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 pb-8 flex flex-col justify-end">
                  {/* Match Badge — Clickable */}
                  <motion.button
                    onClick={() => setExpandedCard(isExpanded ? null : video.id)}
                    className="bg-emerald-500/20 border border-emerald-400/60 text-emerald-400 backdrop-blur-md px-3 py-1.5 rounded-full text-xs w-max mb-3 font-bold flex items-center gap-2 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <AnimatedScore value={liveScore} /> Match Score
                    <motion.span
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      className="text-[10px] ml-1"
                    >
                      ▼
                    </motion.span>
                  </motion.button>

                  {/* Creator Info */}
                  <h3 className="text-white font-bold text-2xl drop-shadow-lg">{video.name}</h3>
                  <p className="text-white/75 text-sm font-medium mb-2">{video.niche} · {video.followers}</p>

                  {/* Quote */}
                  <div className="bg-white/10 backdrop-blur-xl p-3.5 rounded-2xl border border-white/20 shadow-xl mb-3">
                    <p className="text-white/90 text-sm italic leading-relaxed">&quot;{video.quote}&quot;</p>
                  </div>

                  {/* Swipe Helper */}
                  <div className="text-center text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">
                    ← pass · swipe to collab →
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center w-full">
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-red-500/20 border border-red-400/50 text-white p-4 rounded-full backdrop-blur-md shadow-lg"
                    >
                      <X className="w-6 h-6" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-white/15 border border-white/30 text-white p-3.5 rounded-full backdrop-blur-md shadow-lg"
                    >
                      <FileText className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleCollabRequest(video.name)}
                      animate={{
                        boxShadow: [
                          '0px 0px 0px rgba(16,185,129,0)',
                          '0px 0px 25px rgba(16,185,129,0.5)',
                          '0px 0px 0px rgba(16,185,129,0)',
                        ],
                      }}
                      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                      className="bg-emerald-500/25 border-2 border-emerald-400 text-white p-4 rounded-full backdrop-blur-md"
                    >
                      <Handshake className="w-6 h-6" />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* ── Deep-Dive Match Breakdown Panel ── */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="absolute bottom-0 left-0 w-full z-20 bg-slate-900/80 backdrop-blur-2xl border-t border-white/10 rounded-t-3xl p-6"
                  >
                    {/* Panel Header */}
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h4 className="text-white font-bold text-lg">Match Breakdown</h4>
                        <p className="text-white/50 text-xs">Toggle factors to recalculate</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <motion.div
                          className="text-3xl font-black text-emerald-400"
                          key={liveScore}
                          initial={{ scale: 1.3, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                        >
                          {liveScore}%
                        </motion.div>
                      </div>
                    </div>

                    {/* Score Bar */}
                    <div className="w-full h-2 bg-white/10 rounded-full mb-5 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: `${liveScore}%` }}
                        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                      />
                    </div>

                    {/* Toggles */}
                    <ToggleSwitch
                      label="Audience Overlap"
                      value={video.breakdown.audienceOverlap}
                      enabled={toggles.audienceOverlap}
                      onToggle={() => toggleFactor(video.id, 'audienceOverlap')}
                    />
                    <ToggleSwitch
                      label="Niche Alignment"
                      value={video.breakdown.nicheAlignment}
                      enabled={toggles.nicheAlignment}
                      onToggle={() => toggleFactor(video.id, 'nicheAlignment')}
                    />
                    <ToggleSwitch
                      label="Growth Velocity"
                      value={video.breakdown.growthVelocity}
                      enabled={toggles.growthVelocity}
                      onToggle={() => toggleFactor(video.id, 'growthVelocity')}
                    />

                    {/* Close */}
                    <motion.button
                      onClick={() => setExpandedCard(null)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full mt-5 py-3 rounded-2xl bg-white/10 border border-white/15 text-white/80 text-sm font-semibold text-center hover:bg-white/15 transition-colors"
                    >
                      Close Breakdown
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
