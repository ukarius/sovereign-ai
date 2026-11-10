import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Search } from 'lucide-react'
import AiPitchStudio from './AiPitchStudio'

export interface BrandOpportunity {
  id: string
  name: string
  logo: string
  targetAudience: string
  budgetRange: string
  matchPercentage: number
  color: string
  glowColor: string
}

const OPPORTUNITIES: BrandOpportunity[] = [
  {
    id: '1',
    name: 'Notion',
    logo: 'N',
    targetAudience: 'Gen-Z Tech & Productivity',
    budgetRange: '$5k - $10k / campaign',
    matchPercentage: 94,
    color: '#ffffff',
    glowColor: '#22c55e'
  },
  {
    id: '2',
    name: 'Vercel',
    logo: '▲',
    targetAudience: 'Frontend Devs & Creators',
    budgetRange: '$8k - $15k / campaign',
    matchPercentage: 91,
    color: '#ffffff',
    glowColor: '#ffffff'
  },
  {
    id: '3',
    name: 'Gymshark',
    logo: 'G',
    targetAudience: 'Fitness & Lifestyle',
    budgetRange: '$2k - $5k + Gear',
    matchPercentage: 78,
    color: '#4B5563',
    glowColor: '#4B5563'
  },
]

// SVG Circular Progress
const MatchRing = ({ percentage }: { percentage: number }) => {
  const radius = 20
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  const isHighMatch = percentage > 90

  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="28"
          cy="28"
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="4"
          fill="none"
        />
        <motion.circle
          cx="28"
          cy="28"
          r={radius}
          stroke={isHighMatch ? '#22c55e' : '#8b5cf6'}
          strokeWidth="4"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{
            filter: isHighMatch ? 'drop-shadow(0 0 10px rgba(34, 197, 94, 0.8))' : 'none',
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className={`text-[10px] font-bold ${isHighMatch ? 'text-emerald-400' : 'text-violet-400'}`}>
          {percentage}%
        </span>
      </div>
    </div>
  )
}

export default function OpportunityRadar() {
  const [pitchStudioBrand, setPitchStudioBrand] = useState<BrandOpportunity | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
        setIsSearchOpen(true)
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
        setSearchTerm('')
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const filteredBrands = OPPORTUNITIES.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.targetAudience.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
      


      {/* AI Pitch Studio Modal */}
      <AnimatePresence>
        {pitchStudioBrand && (
          <AiPitchStudio 
            brand={pitchStudioBrand} 
            onClose={() => setPitchStudioBrand(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}
