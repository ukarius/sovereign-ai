import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, Loader2, Rocket, DollarSign } from 'lucide-react'
import apiClient from '../api/client'
import AIPitchStudio from './AiPitchStudio'

const INDUSTRIES = [
  'All',
  'SaaS/Productivity',
  'Developer Tools',
  'EdTech',
  'E-commerce',
  'Fintech',
  'Health',
  'Media',
  'Mental Wellness',
  'AI Tools',
]

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

function formatBudget(val: number): string {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`
  return `$${val}`
}

export default function MarketExplorer() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activePitchBrand, setActivePitchBrand] = useState<Brand | null>(null)

  // Filters
  const [selectedIndustry, setSelectedIndustry] = useState('All')
  const [minBudget, setMinBudget] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  // Fetch brands
  useEffect(() => {
    async function fetchBrands() {
      try {
        const res = await apiClient.get('/brands?limit=100')
        setBrands(res.data.data)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchBrands()
  }, [])

  // Budget range from data
  const maxBudget = useMemo(() => {
    if (!brands.length) return 500000
    return Math.ceil(Math.max(...brands.map(b => b.budget_max)) / 10000) * 10000
  }, [brands])

  // Filtered results
  const filtered = useMemo(() => {
    return brands.filter(b => {
      const matchesIndustry = selectedIndustry === 'All' || b.industry === selectedIndustry
      const matchesBudget = b.budget_max >= minBudget
      const matchesSearch = !searchQuery || b.name.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesIndustry && matchesBudget && matchesSearch
    })
  }, [brands, selectedIndustry, minBudget, searchQuery])

  return (
    <div className="glass-card p-6 animate-slide-up" id="market-explorer">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Market Explorer</h3>
        </div>
        <span className="text-xs text-slate-400">
          {filtered.length} of {brands.length} brands
        </span>
      </div>

      {/* ── Control Panel ── */}
      <div className="p-4 rounded-xl mb-6 border bg-slate-100/60 dark:bg-[#0b0f19]/60 backdrop-blur-md border-slate-200 dark:border-white/5"
      >
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search brands by name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white/40 dark:bg-white/5 border border-slate-300/40 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/30 transition-all"
          />
        </div>

        {/* Industry Pills */}
        <div className="flex flex-wrap gap-2 mb-5">
          {INDUSTRIES.map(industry => {
            const isActive = selectedIndustry === industry
            return (
              <button
                key={industry}
                onClick={() => setSelectedIndustry(industry)}
                className={`
                  px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200
                  border
                  ${isActive
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                    : 'bg-slate-200/40 text-slate-400 border-slate-300/30 hover:bg-slate-200/50 hover:text-slate-300'
                  }
                `}
              >
                {industry}
              </button>
            )
          })}
        </div>

        {/* Budget Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <DollarSign className="w-3 h-3" /> Minimum Deal Value
            </span>
            <span className="text-sm font-bold text-amber-400">
              {minBudget === 0 ? 'Any' : formatBudget(minBudget)}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={maxBudget}
            step={5000}
            value={minBudget}
            onChange={e => setMinBudget(Number(e.target.value))}
            className="market-explorer-slider w-full"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>$0</span>
            <span>{formatBudget(maxBudget)}</span>
          </div>
        </div>
      </div>

      {/* ── Results Grid ── */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-slate-400 text-sm">
          Failed to connect to ML engine.
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <SlidersHorizontal className="w-8 h-8 text-slate-500 mx-auto mb-3" />
          <p className="text-sm text-slate-400">No brands match your criteria.</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting the filters above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[480px] overflow-y-auto custom-scrollbar pr-1">
          <AnimatePresence mode="popLayout">
            {filtered.slice(0, 30).map(brand => {
              const niches = brand.target_niches ? brand.target_niches.split(',').map(s => s.trim()) : []
              return (
                <motion.div
                  key={brand.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="p-5 rounded-xl border bg-white/40 border-slate-300/25 hover:border-amber-500/25 transition-colors group"
                >
                  {/* Brand header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 font-bold text-sm border border-amber-500/10">
                      {brand.name.charAt(0)}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      {formatBudget(brand.budget_max)}
                    </span>
                  </div>

                  {/* Name & Industry */}
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm truncate mb-0.5">{brand.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{brand.industry}</p>

                  {/* Tags from target_niches */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {niches.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="text-[10px] bg-slate-100/60 text-slate-500 px-2 py-0.5 rounded-full border border-slate-300/30"
                      >
                        #{tag}
                      </span>
                    ))}
                    {niches.length > 3 && (
                      <span className="text-[10px] text-slate-500">
                        +{niches.length - 3}
                      </span>
                    )}
                  </div>

                  {/* CTA */}
                  <button 
                    onClick={() => setActivePitchBrand(brand)}
                    className="w-full py-2 rounded-lg text-xs font-semibold text-slate-900 dark:text-white bg-gradient-to-r from-amber-600/80 to-orange-600/80 hover:from-amber-500 hover:to-orange-500 transition-all flex items-center justify-center gap-1.5 shadow-[0_2px_10px_rgba(245,158,11,0.15)] hover:shadow-[0_4px_20px_rgba(245,158,11,0.25)]"
                  >
                    <Rocket className="w-3.5 h-3.5" />
                    Pitch This Brand
                  </button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Slide-out Drawer */}
      <AIPitchStudio brand={activePitchBrand} onClose={() => setActivePitchBrand(null)} />
    </div>
  )
}
