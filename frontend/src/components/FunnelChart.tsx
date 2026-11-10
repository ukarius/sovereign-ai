import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, ArrowRight, Wand2 } from 'lucide-react'

interface FunnelChartProps {
  data: Record<string, number>
}

const STAGE_LABELS: Record<string, string> = {
  IMPRESSION: 'Impressions',
  CLICK: 'Clicks',
  LANDING_VIEW: 'Landing Views',
  SIGNUP: 'Signups',
  PURCHASE: 'Purchases',
}

const STAGE_COLORS = [
  '#c7d2fe', // indigo-200
  '#818cf8', // indigo-400
  '#a855f7', // purple-500
  '#d946ef', // fuchsia-500
  '#34d399', // emerald-400
]

const AI_RECOMMENDATIONS: Record<string, { issue: string, suggestion: string, cta: string, icon: any }> = {
  IMPRESSION: {
    issue: 'Reach could be higher.',
    suggestion: 'AI suggests experimenting with trending audio and broader hashtags.',
    cta: 'Generate Content Ideas',
    icon: Wand2
  },
  CLICK: {
    issue: 'Click-through rate is sub-optimal.',
    suggestion: 'AI suggests changing the video thumbnail to improve CTR.',
    cta: 'Auto-Generate Thumbnail',
    icon: Brain
  },
  LANDING_VIEW: {
    issue: 'High drop-off before landing page loads.',
    suggestion: 'AI suggests optimizing the link-in-bio load speed.',
    cta: 'Run Speed Audit',
    icon: ArrowRight
  },
  SIGNUP: {
    issue: 'Signups are lagging behind views.',
    suggestion: 'AI suggests running an A/B test on the primary Call-To-Action headline.',
    cta: 'Generate A/B Headline',
    icon: Wand2
  },
  PURCHASE: {
    issue: 'Cart abandonment detected.',
    suggestion: 'AI suggests sending a targeted discount via email to recent non-buyers.',
    cta: 'Draft Recovery Email',
    icon: Brain
  }
}

export default function FunnelChart({ data }: FunnelChartProps) {
  const [activeStage, setActiveStage] = useState<string | null>(null)

  const chartData = useMemo(() => {
    const stages = ['IMPRESSION', 'CLICK', 'LANDING_VIEW', 'SIGNUP', 'PURCHASE']
    return stages.map((stage, i) => {
      const conversionRate = i > 0 && data[stages[i - 1]] 
        ? (data[stage] / data[stages[i - 1]]) * 100 
        : 100;
      
      return {
        id: stage,
        name: STAGE_LABELS[stage] || stage,
        value: data[stage] || 0,
        fill: STAGE_COLORS[i],
        conversionFromPrev: i > 0 ? conversionRate.toFixed(1) + '%' : '100%',
        dropOff: i > 0 ? (100 - conversionRate).toFixed(1) + '%' : null,
      }
    })
  }, [data])

  return (
    <div className="space-y-6">
      {/* Funnel Visualization */}
      <div className="space-y-3">
        {chartData.map((stage, i) => {
          const maxValue = chartData[0].value || 1
          const widthPercent = Math.max((stage.value / maxValue) * 100, 8)
          const isActive = activeStage === stage.id

          return (
            <div key={stage.id} className="group">
              <div 
                className={`cursor-pointer transition-all duration-300 p-2 rounded-xl -mx-2 hover:bg-slate-200/50 ${isActive ? 'bg-slate-200/50' : ''}`}
                onClick={() => setActiveStage(isActive ? null : stage.id)}
              >
                <div className="flex items-center justify-between mb-1 px-2">
                  <span className="text-sm font-medium text-slate-800 group-hover:text-slate-900 transition-colors">
                    {stage.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center">
                      <span className="text-xs text-slate-500">
                        {i > 0 ? `${stage.conversionFromPrev} from prev` : ''}
                      </span>
                      {stage.dropOff && (
                        <span className="text-xs text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full ml-2">
                          ↓ {stage.dropOff} drop
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-bold text-slate-900">{stage.value.toLocaleString()}</span>
                  </div>
                </div>
                <div className="relative h-10 bg-slate-200/50 rounded-xl overflow-hidden mx-2">
                  <motion.div
                    className="h-full rounded-xl flex items-center justify-end pr-3"
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPercent}%` }}
                    transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                    style={{
                      background: `linear-gradient(90deg, ${stage.fill}33, ${stage.fill}cc)`,
                      boxShadow: `0 0 20px ${stage.fill}30`,
                    }}
                  >
                    {widthPercent > 15 && (
                      <span className="text-xs font-semibold text-slate-900/80">
                        {((stage.value / maxValue) * 100).toFixed(1)}%
                      </span>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Action Panel Drill-down (Framer Motion) */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                    className="overflow-hidden px-2"
                  >
                    <div className="p-4 rounded-xl border border-sovereign-500/20 bg-sovereign-500/5 backdrop-blur-md">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-2 rounded-lg bg-sovereign-500/20">
                          {(() => {
                            const Icon = AI_RECOMMENDATIONS[stage.id].icon;
                            return <Icon className="w-4 h-4 text-sovereign-400" />;
                          })()}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">
                            {AI_RECOMMENDATIONS[stage.id].issue}
                          </h4>
                          <p className="text-xd text-slate-700 dark:text-slate-300 mb-3 text-sm">
                            {AI_RECOMMENDATIONS[stage.id].suggestion}
                          </p>
                          <button className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-slate-900 border border-slate-200">
                            {AI_RECOMMENDATIONS[stage.id].cta}
                          </button>
                        </div>
                      </div>
                    </div>
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
