import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Loader2, Send } from 'lucide-react'

interface Brand {
  id: number
  name: string
  industry: string
  target_niches: string
  budget_min: number
  budget_max: number
  description: string
  headquarters: string
  preferred_platforms: string
  is_vip: boolean
}

interface AIPitchStudioProps {
  brand: Brand | null
  onClose: () => void
}

export default function AIPitchStudio({ brand, onClose }: AIPitchStudioProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [pitchText, setPitchText] = useState("")

  // Reset state when a new brand is opened
  // This ensures the drawer doesn't show a previous pitch
  if (!brand && pitchText) {
    setPitchText("")
  }

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setPitchText(`Hey ${brand?.name} team,\n\nI run a top 1% channel in the ${brand?.industry} space with a 6% engagement rate. My audience is highly aligned with your target market of ${brand?.target_niches}. I'd love to discuss a dedicated integration.\n\nBest,`)
    }, 2500)
  }

  return (
    <AnimatePresence>
      {brand && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-[500px] bg-white dark:bg-[#0b0f19] shadow-2xl z-50 border-l border-slate-200 dark:border-white/10 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Pitching {brand.name}
                </h2>
                <p className="text-xs text-slate-500 mt-1">AI Pitch Studio</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col">
              {!pitchText && !isGenerating && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-6">
                    <Sparkles className="w-8 h-8 text-amber-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Ready to pitch {brand.name}?</h3>
                  <p className="text-sm text-slate-500 max-w-[300px] mb-8">
                    Let Sovereign AI analyze their target market and your audience overlap to draft the perfect cold outreach.
                  </p>
                  <button 
                    onClick={handleGenerate}
                    className="w-full max-w-[300px] py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-[0_4px_20px_rgba(245,158,11,0.3)] hover:shadow-[0_4px_25px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate Pitch with AI
                  </button>
                </div>
              )}

              {isGenerating && (
                <div className="flex-1 flex flex-col items-center justify-center">
                  <Loader2 className="w-10 h-10 animate-spin text-amber-500 mb-4" />
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 animate-pulse">
                    Analyzing market overlap...
                  </p>
                </div>
              )}

              {pitchText && !isGenerating && (
                <div className="flex-1 flex flex-col h-full">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    AI Generated Draft (Edit as needed)
                  </label>
                  <textarea
                    value={pitchText}
                    onChange={(e) => setPitchText(e.target.value)}
                    className="flex-1 w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30 resize-none"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            {pitchText && !isGenerating && (
              <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0b0f19] flex gap-3">
                <button 
                  onClick={() => alert("Contract Drafted!")}
                  className="flex-1 py-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors"
                >
                  Generate Smart Contract
                </button>
                <button 
                  onClick={() => {
                    alert("Pitch Sent! Added to Kanban Pipeline.")
                    onClose()
                  }}
                  className="flex-[1.5] py-3 rounded-xl text-xs font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Pitch & Add to Kanban
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
