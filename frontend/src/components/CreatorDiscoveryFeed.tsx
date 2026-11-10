import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bookmark, FileText, CheckCircle, Send } from 'lucide-react'

const DISCOVERY_VIDEOS = [
  {
    id: 1,
    videoUrl: 'https://videos.pexels.com/video-files/5896379/5896379-uhd_1440_2560_24fps.mp4',
    creatorName: 'Alex Rivera',
    niche: 'B2B SaaS',
    followers: '1.2M',
    avgViews: '320K',
    estCpm: '$25',
    targetDemographicMatch: 98,
    pitchText: "My audience converts on dev tools. Let's talk Q3 pipeline.",
    breakdown: { ageGeoAlignment: 35, historicalConversion: 33, brandSafety: 30 },
  },
  {
    id: 2,
    videoUrl: 'https://videos.pexels.com/video-files/7989650/7989650-uhd_1440_2560_25fps.mp4',
    creatorName: 'Jordan Lee',
    niche: 'Fintech & Investing',
    followers: '850K',
    avgViews: '180K',
    estCpm: '$32',
    targetDemographicMatch: 94,
    pitchText: "70% of my audience are decision-makers in finance.",
    breakdown: { ageGeoAlignment: 32, historicalConversion: 35, brandSafety: 27 },
  },
  {
    id: 3,
    videoUrl: 'https://videos.pexels.com/video-files/5896379/5896379-uhd_1440_2560_24fps.mp4',
    creatorName: 'Samira Patel',
    niche: 'Developer Tools',
    followers: '420K',
    avgViews: '95K',
    estCpm: '$18',
    targetDemographicMatch: 91,
    pitchText: "I build live coding projects with sponsor integrations.",
    breakdown: { ageGeoAlignment: 28, historicalConversion: 32, brandSafety: 31 },
  },
]

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
        <span className="text-xs text-indigo-400/80 ml-2 font-semibold">+{value}%</span>
      </div>
      <button
        onClick={onToggle}
        className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
          enabled ? 'bg-indigo-500' : 'bg-white/15'
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

export default function CreatorDiscoveryFeed() {
  const [toast, setToast] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [expandedCard, setExpandedCard] = useState<number | null>(null)
  const [toggleState, setToggleState] = useState<Record<number, { ageGeoAlignment: boolean; historicalConversion: boolean; brandSafety: boolean }>>({})

  const handleShortlist = useCallback((name: string) => {
    setToast(`${name} added to Shortlist!`)
    setTimeout(() => setToast(null), 3000)
  }, [])

  const handleDraftOffer = useCallback((name: string) => {
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3500)
  }, [])

  const getToggles = (id: number) =>
    toggleState[id] ?? { ageGeoAlignment: true, historicalConversion: true, brandSafety: true }

  const toggleFactor = (id: number, factor: 'ageGeoAlignment' | 'historicalConversion' | 'brandSafety') => {
    setToggleState((prev) => ({
      ...prev,
      [id]: { ...getToggles(id), [factor]: !getToggles(id)[factor] },
    }))
  }

  const computeScore = (video: (typeof DISCOVERY_VIDEOS)[0]) => {
    const t = getToggles(video.id)
    let score = 0
    if (t.ageGeoAlignment) score += video.breakdown.ageGeoAlignment
    if (t.historicalConversion) score += video.breakdown.historicalConversion
    if (t.brandSafety) score += video.breakdown.brandSafety
    return score
  }

  return (
    <>
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
              className="bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 flex flex-col items-center gap-4 shadow-2xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 300, delay: 0.3 }}
                className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center"
              >
                <motion.div
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <CheckCircle className="w-10 h-10 text-white" />
                </motion.div>
              </motion.div>
              <div className="text-center">
                <h3 className="text-white font-bold text-xl">Smart Contract Drafted</h3>
                <p className="text-white/60 text-sm mt-1">via Secure Escrow</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-[calc(100vh-80px)] w-full max-w-md mx-auto relative overflow-hidden bg-black rounded-3xl shadow-2xl border border-white/10">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.9 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-2 bg-indigo-500/90 backdrop-blur-xl text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold"
            >
              <Bookmark className="w-4 h-4" />
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className="h-full w-full overflow-y-scroll snap-y snap-mandatory flex flex-col"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {DISCOVERY_VIDEOS.map((video) => {
            const isExpanded = expandedCard === video.id
            const liveScore = computeScore(video)
            const toggles = getToggles(video.id)

            return (
              <div key={video.id} className="h-full w-full shrink-0 snap-start relative">
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

                <div className="absolute top-4 right-4 bg-white/15 backdrop-blur-md text-white/90 text-xs px-3 py-1.5 rounded-full z-10 border border-white/20 font-medium">
                  Creator Reel
                </div>

                <div className="absolute bottom-0 left-0 w-full z-10 flex flex-col">
                  <div className="flex-1 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 pb-8 flex flex-col justify-end">
                    <motion.button
                      onClick={() => setExpandedCard(isExpanded ? null : video.id)}
                      className="bg-indigo-500/20 border border-indigo-400/60 text-indigo-300 backdrop-blur-md px-3 py-1.5 rounded-full text-xs w-max mb-3 font-bold flex items-center gap-2 cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                      <AnimatedScore value={liveScore} /> Target Demographic Match
                      <motion.span
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        className="text-[10px] ml-1"
                      >
                        ▼
                      </motion.span>
                    </motion.button>

                    <h3 className="text-white font-bold text-2xl drop-shadow-lg">{video.creatorName}</h3>
                    <p className="text-white/75 text-sm font-medium mb-2">{video.niche} · {video.followers}</p>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-white/10 backdrop-blur-md rounded-xl px-2 py-2 border border-white/20 text-center">
                        <div className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Avg Views</div>
                        <div className="text-sm font-black text-white">{video.avgViews}</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-xl px-2 py-2 border border-white/20 text-center">
                        <div className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Est. CPM</div>
                        <div className="text-sm font-black text-indigo-300">{video.estCpm}</div>
                      </div>
                      <div className="bg-white/10 backdrop-blur-md rounded-xl px-2 py-2 border border-white/20 text-center">
                        <div className="text-[10px] text-white/60 uppercase tracking-widest font-bold">Est. Price</div>
                        <div className="text-sm font-black text-violet-300">$15k</div>
                      </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xl p-3.5 rounded-2xl border border-white/20 shadow-xl mb-3">
                      <p className="text-white/90 text-sm italic leading-relaxed">&quot;{video.pitchText}&quot;</p>
                    </div>

                    <div className="text-center text-white/40 text-[10px] font-bold tracking-[0.2em] uppercase mb-4">
                      ← pass · add to shortlist →
                    </div>

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
                        onClick={() => handleShortlist(video.creatorName)}
                        className="bg-indigo-500/20 border border-indigo-400/50 text-white p-3.5 rounded-full backdrop-blur-md shadow-lg"
                      >
                        <Bookmark className="w-5 h-5" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDraftOffer(video.creatorName)}
                        className="bg-[length:200%_100%] animate-shimmer bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 border-2 border-indigo-400 text-white p-4 rounded-full backdrop-blur-md shadow-lg"
                      >
                        <span className="flex items-center gap-1.5 text-sm font-bold">
                          <FileText className="w-5 h-5" />
                          Draft $15k Offer
                        </span>
                      </motion.button>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ y: '100%' }}
                      animate={{ y: 0 }}
                      exit={{ y: '100%' }}
                      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                      className="absolute bottom-0 left-0 w-full z-20 bg-slate-900/80 backdrop-blur-2xl border-t border-white/10 rounded-t-3xl p-6"
                    >
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h4 className="text-white font-bold text-lg">Demographic Breakdown</h4>
                          <p className="text-white/50 text-xs">Toggle factors to recalculate</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.div
                            className="text-3xl font-black text-indigo-400"
                            key={liveScore}
                            initial={{ scale: 1.3, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                          >
                            {liveScore}%
                          </motion.div>
                        </div>
                      </div>

                      <div className="w-full h-2 bg-white/10 rounded-full mb-5 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-indigo-500 to-violet-400 rounded-full"
                          initial={{ width: '0%' }}
                          animate={{ width: `${liveScore}%` }}
                          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                        />
                      </div>

                      <ToggleSwitch
                        label="Age/Geo Alignment"
                        value={video.breakdown.ageGeoAlignment}
                        enabled={toggles.ageGeoAlignment}
                        onToggle={() => toggleFactor(video.id, 'ageGeoAlignment')}
                      />
                      <ToggleSwitch
                        label="Historical Conversion Rate"
                        value={video.breakdown.historicalConversion}
                        enabled={toggles.historicalConversion}
                        onToggle={() => toggleFactor(video.id, 'historicalConversion')}
                      />
                      <ToggleSwitch
                        label="Brand Safety Score"
                        value={video.breakdown.brandSafety}
                        enabled={toggles.brandSafety}
                        onToggle={() => toggleFactor(video.id, 'brandSafety')}
                      />

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

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 3s linear infinite;
        }
      `}</style>
    </>
  )
}