import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from 'framer-motion'
import { FileDown, FileText, Wand2, X, DollarSign, ArrowRight, Loader2, Mail, File } from 'lucide-react'
import apiClient from '../api/client'
import useAuthStore from '../store/authStore'

type ActiveCard = 'pitch' | 'contract' | 'brief' | null

export default function SmartAiCards() {
  const [activeId, setActiveId] = useState<ActiveCard>(null)
  
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <PitchCard onClick={() => setActiveId('pitch')} />
        <ContractCard onClick={() => setActiveId('contract')} />
        <BriefCard onClick={() => setActiveId('brief')} />
      </div>

      <AnimatePresence>
        {activeId && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveId(null)}
              className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none">
              <div className="pointer-events-auto w-full max-w-3xl">
                {activeId === 'pitch' && <PitchModal onClose={() => setActiveId(null)} />}
                {activeId === 'contract' && <ContractModal onClose={() => setActiveId(null)} />}
                {activeId === 'brief' && <BriefModal onClose={() => setActiveId(null)} />}
              </div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function PitchCard({ onClick }: { onClick: () => void }) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  const background = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(245, 158, 11, 0.15), transparent 80%)`

  return (
    <motion.div
      layoutId="card-pitch"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group relative glass-card p-6 cursor-pointer border border-slate-200 hover:border-amber-500/50 transition-colors overflow-hidden"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100 z-0"
        style={{ background }}
      />
      <div className="relative z-10">
        <motion.div layoutId="icon-pitch" className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
          <FileDown className="w-5 h-5 text-amber-400" />
        </motion.div>
        <motion.h3 layoutId="title-pitch" className="text-lg font-semibold text-slate-900 mb-2 tracking-wide">Unified Pitch Studio</motion.h3>
        <motion.p layoutId="desc-pitch" className="text-sm text-slate-700">
          Generate dynamic PDF pitch decks or tailored outbound emails.
        </motion.p>
      </div>
    </motion.div>
  )
}

function ContractCard({ onClick }: { onClick: () => void }) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  const background = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(139, 92, 246, 0.15), transparent 80%)`

  return (
    <motion.div
      layoutId="card-contract"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group relative glass-card p-6 cursor-pointer border border-slate-200 hover:border-violet-500/50 transition-colors overflow-hidden"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100 z-0"
        style={{ background }}
      />
      <div className="relative z-10">
        <motion.div layoutId="icon-contract" className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4">
          <FileText className="w-5 h-5 text-violet-400" />
        </motion.div>
        <motion.h3 layoutId="title-contract" className="text-lg font-semibold text-slate-900 mb-2 tracking-wide">Contract Strategist</motion.h3>
        <motion.p layoutId="desc-contract" className="text-sm text-slate-700">
          Draft essential clauses and demands based on your expected deal value.
        </motion.p>
      </div>
    </motion.div>
  )
}

function BriefCard({ onClick }: { onClick: () => void }) {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect()
    mouseX.set(clientX - left)
    mouseY.set(clientY - top)
  }

  const background = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, rgba(99, 102, 241, 0.15), transparent 80%)`

  return (
    <motion.div
      layoutId="card-brief"
      onClick={onClick}
      onMouseMove={handleMouseMove}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group relative glass-card p-6 cursor-pointer border border-slate-200 hover:border-sovereign-500/50 transition-colors overflow-hidden"
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition duration-300 group-hover:opacity-100 z-0"
        style={{ background }}
      />
      <div className="relative z-10">
        <motion.div layoutId="icon-brief" className="w-10 h-10 rounded-xl bg-sovereign-500/10 flex items-center justify-center mb-4">
          <Wand2 className="w-5 h-5 text-sovereign-400" />
        </motion.div>
        <motion.h3 layoutId="title-brief" className="text-lg font-semibold text-slate-900 mb-2 tracking-wide">Brief Translator</motion.h3>
        <motion.p layoutId="desc-brief" className="text-sm text-slate-700">
          Strip dense corporate jargon into actionable creator-friendly bullets.
        </motion.p>
      </div>
    </motion.div>
  )
}

function PitchModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'email' | 'pdf'>('email')
  const [industry, setIndustry] = useState('')
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const { user } = useAuthStore()

  // Manual Entry States
  const [manualBrand, setManualBrand] = useState('')
  const [manualIndustry, setManualIndustry] = useState('')
  
  // Generation States
  const [phase, setPhase] = useState<'idle' | 'terminal' | 'typing' | 'done'>('idle')
  const [terminalLines, setTerminalLines] = useState<string[]>([])
  const [typedText, setTypedText] = useState('')

  const TERMINAL_LINES = [
    "> Analyzing Target Brand...",
    "> Fetching Creator Metrics...",
    "> Matching Audience Overlap...",
    "> Drafting High-Conversion Hook...",
  ]

  const generatedPitch = `Hey [${manualBrand || 'Brand'} Contact],\n\nI've been a massive fan of your recent campaigns. Looking at my audience analytics, I have a strong overlap with your target demographic in the ${manualIndustry || 'Industry'} space.\n\nMy followers are highly engaged with content that breaks down complex ideas into simple, aesthetic workflows. I'd love to pitch a 3-part short-form video series demonstrating how ${manualBrand || 'your brand'} can solve major pain points for my audience.\n\nAre you open to exploring a partnership this quarter?\n\nBest,\n[Your Name]`

  const handleGenerateManual = () => {
    if (!manualBrand || !manualIndustry) return
    setPhase('terminal')
    setTerminalLines([])
    setTypedText('')
  }

  // Terminal effect
  useEffect(() => {
    if (phase !== 'terminal') return
    let currentLine = 0
    const interval = setInterval(() => {
      if (currentLine < TERMINAL_LINES.length) {
        setTerminalLines(prev => [...prev, TERMINAL_LINES[currentLine]])
        currentLine++
      } else {
        clearInterval(interval)
        setTimeout(() => setPhase('typing'), 800)
      }
    }, 500)
    return () => clearInterval(interval)
  }, [phase])

  // Typewriter effect
  useEffect(() => {
    if (phase !== 'typing') return
    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex < generatedPitch.length) {
        setTypedText(prev => prev + generatedPitch[currentIndex])
        currentIndex++
      } else {
        clearInterval(interval)
        setPhase('done')
      }
    }, 20)
    return () => clearInterval(interval)
  }, [phase, generatedPitch])

  const handleGeneratePdf = async () => {
    if (!user?.userId || !industry) return
    setIsGeneratingPdf(true)
    try {
      const response = await apiClient.get(`/matches/${user.userId}/pitch-pdf`, {
        params: { industry },
        responseType: 'blob',
      })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Pitch_${industry}_${new Date().getTime()}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to generate PDF', err)
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <motion.div layoutId="card-pitch" className="bg-slate-50 border border-amber-500/30 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col h-[75vh]">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-200/500">
        <div className="flex items-center gap-3">
          <motion.div layoutId="icon-pitch" className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <FileDown className="w-5 h-5 text-amber-400" />
          </motion.div>
          <div>
            <motion.h3 layoutId="title-pitch" className="text-xl font-bold text-slate-900">Unified Pitch Studio</motion.h3>
            <motion.p layoutId="desc-pitch" className="text-xs text-slate-600">Generate dynamic PDF pitch decks or tailored outbound emails.</motion.p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-200/50 rounded-full text-slate-600 hover:text-slate-900 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-8 flex-1 flex flex-col overflow-hidden">
        <div className="flex p-1 bg-white rounded-xl mb-8 w-max mx-auto border border-slate-200">
          <button 
            onClick={() => { setMode('email'); setPhase('idle'); }}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'email' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Mail className="w-4 h-4" /> Email Pitch
          </button>
          <button 
            onClick={() => setMode('pdf')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'pdf' ? 'bg-amber-500/20 text-amber-400' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <File className="w-4 h-4" /> PDF Deck
          </button>
        </div>

        {mode === 'email' ? (
          <div className="flex-1 flex overflow-hidden gap-8">
            {/* Left: Input Form */}
            {phase === 'idle' ? (
              <div className="w-full max-w-md mx-auto space-y-6 flex flex-col justify-center">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Target Brand Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Nike, Notion"
                      className="input-field w-full text-sm"
                      value={manualBrand}
                      onChange={(e) => setManualBrand(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Target Industry / Genre</label>
                    <input
                      type="text"
                      list="industries"
                      placeholder="e.g. Fitness, Web3, SaaS"
                      className="input-field w-full text-sm"
                      value={manualIndustry}
                      onChange={(e) => setManualIndustry(e.target.value)}
                    />
                    <datalist id="industries">
                      <option value="Fitness & Health" />
                      <option value="Web3 & Crypto" />
                      <option value="SaaS & Productivity" />
                      <option value="Beauty & Fashion" />
                      <option value="Fintech" />
                    </datalist>
                  </div>
                </div>

                <button
                  onClick={handleGenerateManual}
                  disabled={!manualBrand || !manualIndustry}
                  className="w-full relative group overflow-hidden rounded-xl p-[1px]"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-amber-500 via-accent-500 to-amber-500 rounded-xl opacity-70 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                  <div className="relative bg-slate-50 px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 group-hover:bg-white">
                    <Wand2 className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-slate-900 text-sm">Analyze Target & Draft Pitch</span>
                  </div>
                </button>
              </div>
            ) : (
              /* Right/Full: Generation Output */
              <div className="w-full h-full p-6 bg-white/30 rounded-xl overflow-y-auto custom-scrollbar font-mono text-sm leading-relaxed relative">
                {phase === 'terminal' && (
                  <div className="text-amber-400/80 space-y-2">
                    {terminalLines.map((line, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                        {line}
                      </motion.div>
                    ))}
                    <motion.div 
                      animate={{ opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="w-2 h-4 bg-amber-400/80 inline-block mt-2"
                    />
                  </div>
                )}
                {(phase === 'typing' || phase === 'done') && (
                  <div className="text-slate-800 whitespace-pre-wrap font-sans text-base leading-relaxed max-w-2xl mx-auto">
                    {typedText}
                    {phase === 'typing' && (
                      <motion.span 
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                        className="inline-block w-2 h-5 bg-sovereign-400 ml-1 translate-y-1"
                      />
                    )}
                  </div>
                )}
                
                <AnimatePresence>
                  {phase === 'done' && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="mt-8 flex justify-center gap-4"
                    >
                      <button 
                        onClick={() => setPhase('idle')}
                        className="px-6 py-2 rounded-lg bg-slate-200/50 hover:bg-white/10 text-slate-900 text-sm font-medium transition-colors"
                      >
                        Draft Another
                      </button>
                      <button 
                        onClick={() => navigator.clipboard.writeText(generatedPitch)}
                        className="px-6 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-sm font-medium transition-colors"
                      >
                        Copy to Clipboard
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-md mx-auto space-y-4 pt-12">
             <input
              type="text"
              placeholder="Target Industry (e.g., Tech, Fitness)"
              className="input-field w-full text-sm"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
            <button
              onClick={handleGeneratePdf}
              disabled={isGeneratingPdf || !industry}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
            >
              {isGeneratingPdf ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileDown className="w-5 h-5" />}
              {isGeneratingPdf ? 'Compiling Metrics...' : 'Generate AI Deck'}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function ContractModal({ onClose }: { onClose: () => void }) {
  const [dealValue, setDealValue] = useState('')
  const [clauses, setClauses] = useState<{ title: string; description: string }[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerate = async () => {
    if (!dealValue || isNaN(Number(dealValue))) return
    setIsGenerating(true)
    setClauses([])
    try {
      const res = await apiClient.post('/ai/contract-clauses', { deal_value: Number(dealValue) })
      setTimeout(() => {
        setClauses(res.data)
        setIsGenerating(false)
      }, 800)
    } catch (err) {
      console.error('Failed', err)
      setIsGenerating(false)
    }
  }

  return (
    <motion.div layoutId="card-contract" className="bg-slate-50 border border-violet-500/30 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col">
       <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-200/500">
        <div className="flex items-center gap-3">
          <motion.div layoutId="icon-contract" className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-violet-400" />
          </motion.div>
          <div>
            <motion.h3 layoutId="title-contract" className="text-xl font-bold text-slate-900">Contract Strategist</motion.h3>
            <motion.p layoutId="desc-contract" className="text-xs text-slate-600">Draft essential clauses and demands based on your expected deal value.</motion.p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-200/50 rounded-full text-slate-600 hover:text-slate-900 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="p-8">
        <div className="flex gap-3 mb-8 max-w-md mx-auto">
          <div className="relative flex-1">
            <DollarSign className="w-5 h-5 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              placeholder="Deal Value"
              className="input-field w-full pl-11 py-3 text-base"
              value={dealValue}
              onChange={(e) => setDealValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !dealValue}
            className="btn-primary px-6 bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 border-0"
          >
            {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
          </button>
        </div>

        <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar px-2">
          {clauses.map((clause, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.4 }}
              className="p-4 bg-white rounded-xl border border-violet-500/10"
            >
              <h4 className="text-base font-semibold text-violet-300 mb-1">{clause.title}</h4>
              <p className="text-sm text-slate-800 leading-relaxed">{clause.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function BriefModal({ onClose }: { onClose: () => void }) {
  const [brief, setBrief] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'typing' | 'done'>('idle')
  const [result, setResult] = useState('')
  const [typedResult, setTypedResult] = useState('')

  const handleTranslate = async () => {
    if (!brief) return
    setStatus('loading')
    setTypedResult('')
    try {
      const res = await apiClient.post('/ai/convert-brief', { brand_brief: brief })
      
      // Artificial delay for the skeleton loader to look premium (1.5s as requested)
      setTimeout(() => {
        setResult(res.data.creator_brief)
        setStatus('typing')
      }, 1500)
    } catch (err) {
      console.error(err)
      setStatus('idle')
    }
  }

  useEffect(() => {
    if (status !== 'typing') return
    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex < result.length) {
        setTypedResult(prev => prev + result[currentIndex])
        currentIndex++
      } else {
        clearInterval(interval)
        setStatus('done')
      }
    }, 15) // Typewriter speed
    return () => clearInterval(interval)
  }, [status, result])

  return (
    <motion.div layoutId="card-brief" className="bg-slate-50 border border-sovereign-500/30 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col h-[70vh]">
       <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-200/500">
        <div className="flex items-center gap-3">
          <motion.div layoutId="icon-brief" className="w-10 h-10 rounded-xl bg-sovereign-500/10 flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-sovereign-400" />
          </motion.div>
          <div>
            <motion.h3 layoutId="title-brief" className="text-xl font-bold text-slate-900">Brief Translator</motion.h3>
            <motion.p layoutId="desc-brief" className="text-xs text-slate-600">Strip dense corporate jargon into actionable creator-friendly bullets.</motion.p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-200/50 rounded-full text-slate-600 hover:text-slate-900 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Input */}
        <div className="w-1/2 p-6 border-r border-slate-200 flex flex-col bg-slate-50">
          <textarea
             placeholder="Paste dense corporate brief here..."
             className="input-field w-full text-sm flex-1 resize-none mb-4"
             value={brief}
             onChange={(e) => setBrief(e.target.value)}
          />
          <button
            onClick={handleTranslate}
            disabled={status !== 'idle' || !brief}
            className="w-full btn-primary py-3 flex items-center justify-center gap-2"
          >
            {(status === 'loading' || status === 'typing') ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
            {status === 'loading' ? 'Analyzing...' : status === 'typing' ? 'Writing...' : 'Strip Jargon'}
          </button>
        </div>

        {/* Right Side: Output */}
        <div className="w-1/2 p-6 bg-white/30 overflow-y-auto custom-scrollbar relative">
          {status === 'idle' && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
               Result will appear here.
            </div>
          )}

          {status === 'loading' && (
            <div className="space-y-4 animate-pulse pt-4">
              <div className="h-4 bg-slate-200/50 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200/50 rounded w-1/2"></div>
              <div className="h-4 bg-slate-200/50 rounded w-full"></div>
              <div className="h-4 bg-slate-200/50 rounded w-5/6"></div>
              <div className="h-4 bg-slate-200/50 rounded w-2/3 mt-8"></div>
              <div className="h-4 bg-slate-200/50 rounded w-full"></div>
            </div>
          )}

          {(status === 'typing' || status === 'done') && (
            <div className="text-slate-900 text-sm leading-relaxed whitespace-pre-wrap font-mono">
              {typedResult}
              {status === 'typing' && (
                <motion.span 
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="inline-block w-2 h-4 bg-sovereign-400 ml-1 translate-y-1"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
