import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Filter, ChevronRight, X, Briefcase, TrendingUp, Users, DollarSign, Activity, Zap, PlayCircle, Star,
  Eye, MessageSquare, CheckCircle, ArrowUpRight, Radar
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import MagneticButton from '../components/MagneticButton'
import CreatorUniverse from '../components/CreatorUniverse'
import CreatorDiscoveryWidget from '../components/CreatorDiscoveryWidget'
// DND Kit imports
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// --- Types ---
type KanbanCard = {
  id: string
  name: string
  amount: string
}

type KanbanColumns = {
  outreach: KanbanCard[]
  negotiating: KanbanCard[]
  active: KanbanCard[]
}

// --- Mock Data ---
const AI_MATCHES = [
  { id: '101', name: 'Alex Rivera', niche: 'Tech & AI', match: 98, followers: '1.2M', avatar: 'A' },
  { id: '102', name: 'Jordan Lee', niche: 'Fintech', match: 94, followers: '850K', avatar: 'J' },
  { id: '103', name: 'Samira Patel', niche: 'Dev Tools', match: 89, followers: '420K', avatar: 'S' },
  { id: '104', name: 'Chris Chen', niche: 'SaaS', match: 86, followers: '600K', avatar: 'C' },
  { id: '105', name: 'Mia Thompson', niche: 'Design', match: 92, followers: '750K', avatar: 'M' },
  { id: '106', name: 'Ryan Park', niche: 'Crypto', match: 88, followers: '920K', avatar: 'R' },
]

const DISCOVERY_DATA = [
  { id: '201', name: 'Elena Rostova', niche: 'Design', age: '18-24', views: '2.5M', budget: '$4,000', status: 'Available' },
  { id: '202', name: 'Marcus Jin', niche: 'Tech & AI', age: '25-34', views: '1.8M', budget: '$6,500', status: 'High Demand' },
  { id: '203', name: 'Priya Sharma', niche: 'Fintech', age: '25-34', views: '950K', budget: '$3,000', status: 'Available' },
  { id: '204', name: 'David Kim', niche: 'Crypto', age: '18-34', views: '3.1M', budget: '$8,000', status: 'Available' },
  { id: '205', name: 'Sarah Jenkins', niche: 'Dev Tools', age: '25-44', views: '500K', budget: '$1,500', status: 'Available' },
]

// 90-day velocity data for Creator Dossier
const VELOCITY_DATA_90D = [
  { day: 'Week 1', views: 15000 },
  { day: 'Week 2', views: 22000 },
  { day: 'Week 3', views: 18000 },
  { day: 'Week 4', views: 28000 },
  { day: 'Week 5', views: 32000 },
  { day: 'Week 6', views: 26000 },
  { day: 'Week 7', views: 35000 },
  { day: 'Week 8', views: 42000 },
  { day: 'Week 9', views: 38000 },
  { day: 'Week 10', views: 45000 },
  { day: 'Week 11', views: 52000 },
  { day: 'Week 12', views: 48000 },
  { day: 'Week 13 (Now)', views: 58000 },
]

// Initial Kanban Data
const INITIAL_KANBAN_DATA: KanbanColumns = {
  outreach: [
    { id: 'k1', name: 'Alex Rivera', amount: '$5,000' },
    { id: 'k2', name: 'Samira Patel', amount: '$2,000' },
    { id: 'k5', name: 'Chris Chen', amount: '$3,500' }
  ],
  negotiating: [
    { id: 'k3', name: 'David Kim', amount: '$8,000' },
    { id: 'k6', name: 'Mia Thompson', amount: '$4,200' }
  ],
  active: [
    { id: 'k4', name: 'Marcus Jin', amount: '$6,500' }
  ]
}

// Lookup helper: maps a kanban card to a rich creator object for the dossier
function lookupCreator(card: KanbanCard) {
  const fromMatches = AI_MATCHES.find(m => m.name === card.name)
  if (fromMatches) {
    return { ...fromMatches, budget: card.amount }
  }
  const fromDiscovery = DISCOVERY_DATA.find(d => d.name === card.name)
  if (fromDiscovery) {
    return { ...fromDiscovery, budget: card.amount }
  }
  // Fallback: synthesize from card data
  return {
    id: card.id,
    name: card.name,
    niche: 'Creator',
    followers: '—',
    views: '—',
    budget: card.amount,
    avatar: card.name.charAt(0),
    match: 0,
    status: 'In Pipeline'
  }
}

// --- Toast Component ---
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'info'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={`fixed bottom-6 right-6 z-[60] flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border ${
        type === 'success'
          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
          : 'bg-accent-500/10 border-accent-500/30 text-accent-400'
      }`}
    >
      <CheckCircle className="w-5 h-5" />
      <span className="font-medium text-sm">{message}</span>
    </motion.div>
  )
}

// --- Sortable Card Component ---
function SortableKanbanCard({ card, columnId, onClick }: { card: KanbanCard; columnId: string; onClick?: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: card.id, data: { card, columnId } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1
  }

  const borderColors: Record<string, string> = {
    outreach: 'border-slate-200 hover:border-slate-200',
    negotiating: 'border-amber-500/20 hover:border-amber-500/40',
    active: 'border-emerald-500/20 hover:border-emerald-500/40'
  }

  const amountColors: Record<string, string> = {
    outreach: 'text-emerald-400',
    negotiating: 'text-amber-400',
    active: 'text-emerald-400'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        group p-3 bg-slate-200/40 border rounded-xl flex justify-between items-center
        cursor-grab active:cursor-grabbing hover:bg-slate-200/50 transition-all duration-200
        ${isDragging ? 'rotate-2 shadow-2xl scale-105 ring-2 ring-accent-500/50' : 'hover:shadow-lg'}
        ${borderColors[columnId]}
      `}
    >
      <span className="font-medium text-sm text-slate-900">{card.name}</span>
      <div className="flex items-center gap-1.5">
        <span className={`text-xs font-semibold ${amountColors[columnId]}`}>{card.amount}</span>
        <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      </div>
    </div>
  )
}

// --- Droppable Column Component ---
function DroppableColumn({
  id,
  title,
  cards,
  count,
  titleColor,
  badgeColor,
  onCardClick
}: {
  id: string
  title: string
  cards: KanbanCard[]
  count: number
  titleColor: string
  badgeColor: string
  onCardClick?: (card: KanbanCard) => void
}) {
  const { setNodeRef, isOver } = useSortable({
    id,
    data: { type: 'column', columnId: id }
  })

  return (
    <div className="flex flex-col gap-3">
      <div className={`flex justify-between items-center text-xs font-bold uppercase tracking-wider px-2 ${titleColor}`}>
        <span>{title}</span>
        <span className={`px-2 py-0.5 rounded-full ${badgeColor}`}>{count}</span>
      </div>
      <div
        ref={setNodeRef}
        className={`
          min-h-[120px] rounded-xl transition-colors duration-200 p-2 -m-2
          ${isOver ? 'bg-slate-200/50 ring-2 ring-accent-500/30' : ''}
        `}
      >
        <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {cards.map((card) => (
              <SortableKanbanCard
                key={card.id}
                card={card}
                columnId={id}
                onClick={() => onCardClick?.(card)}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}

export default function BrandDashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [selectedCreator, setSelectedCreator] = useState<any | null>(null)
  
  // Kanban state
  const [kanbanData, setKanbanData] = useState<KanbanColumns>(INITIAL_KANBAN_DATA)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeCard, setActiveCard] = useState<KanbanCard | null>(null)
  const [sourceColumn, setSourceColumn] = useState<string | null>(null)
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null)

  // DND Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  )

  // --- Drag Handlers ---
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const cardId = active.id as string
    
    // Find the card and its source column
    for (const [columnId, cards] of Object.entries(kanbanData)) {
      const card = cards.find(c => c.id === cardId)
      if (card) {
        setActiveId(cardId)
        setActiveCard(card)
        setSourceColumn(columnId)
        break
      }
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    
    if (!over) return
    
    const activeId = active.id as string
    const overId = over.id as string
    
    // Find source and target columns
    let sourceCol: string | null = null
    let targetCol: string | null = null
    
    for (const [colId, cards] of Object.entries(kanbanData)) {
      if (cards.some(c => c.id === activeId)) sourceCol = colId
      if (colId === overId || cards.some(c => c.id === overId)) targetCol = colId
    }
    
    if (!sourceCol || !targetCol || sourceCol === targetCol) return
    
    // Move card between columns
    setKanbanData(prev => {
      const sourceCards = [...prev[sourceCol as keyof KanbanColumns]]
      const targetCards = [...prev[targetCol as keyof KanbanColumns]]
      
      const cardIndex = sourceCards.findIndex(c => c.id === activeId)
      if (cardIndex === -1) return prev
      
      const [movedCard] = sourceCards.splice(cardIndex, 1)
      
      return {
        ...prev,
        [sourceCol]: sourceCards,
        [targetCol]: [...targetCards, movedCard]
      }
    })
    
    setSourceColumn(targetCol)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && sourceColumn) {
      const columnNames: Record<string, string> = {
        outreach: 'Outreach Sent',
        negotiating: 'Negotiating',
        active: 'Active Campaigns'
      }
      
      setToast({
        message: `Card moved to ${columnNames[sourceColumn] || 'new column'}`,
        type: 'success'
      })
    }
    
    setActiveId(null)
    setActiveCard(null)
    setSourceColumn(null)
  }

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: { opacity: '0.5' }
      }
    })
  }
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-white font-sans overflow-hidden">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 px-6 py-4">
        <div className="flex items-center justify-between max-w-[1600px] mx-auto">
          <div className="flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-accent-400" />
            <h1 className="font-display text-xl font-bold tracking-tight">Sovereign <span className="text-slate-600 font-normal">| Command Center</span></h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/brand/discovery')}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 flex items-center gap-2 transition-colors"
              id="discovery-feed-nav"
            >
              <Radar className="w-4 h-4" />
              Discovery Feed
            </button>
            <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
              <Zap className="w-4 h-4 text-emerald-400" />
              <span>AI Engine Active</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent-500 to-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(var(--accent-500-rgb),0.3)]">
              <span className="text-sm font-bold text-slate-900">{user?.name?.charAt(0)?.toUpperCase() || 'B'}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8 flex flex-col gap-8 h-[calc(100vh-73px)] overflow-y-auto custom-scrollbar relative">
        
        {/* SECTION 1: AI Match Feed (TF-IDF ML Engine) */}
        <section>
          <CreatorDiscoveryWidget />
        </section>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 flex-1 min-h-0 pb-8">
          
          {/* SECTION 2: Discovery Grid */}
          <section className="xl:col-span-2 flex flex-col min-h-0 bg-white/40 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-white/10 flex flex-wrap gap-4 items-center justify-between bg-white/60 dark:bg-transparent">
              <div className="flex items-center gap-3 flex-1 min-w-[200px]">
                <Search className="w-5 h-5 text-slate-600" />
                <input 
                  type="text" 
                  placeholder="Search creators by name or niche..." 
                  className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-500 text-slate-900 dark:text-white"
                />
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-lg bg-slate-200/50 hover:bg-slate-100 text-xs font-medium flex items-center gap-2 transition-colors border border-slate-200">
                  <Filter className="w-3 h-3" /> Filters
                </button>
                <div className="hidden sm:flex gap-2">
                  {['Audience Age', 'Min Views', 'Budget'].map(f => (
                    <button key={f} className="px-3 py-1.5 rounded-lg bg-slate-50/50 hover:bg-slate-100 text-xs text-slate-700 transition-colors border border-slate-200">
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto custom-scrollbar">
              <table className="w-full text-left text-sm">
                <thead className="sticky top-0 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur z-10 text-xs text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-white/10">
                  <tr>
                    <th className="font-medium p-4 pl-6">Creator</th>
                    <th className="font-medium p-4">Niche</th>
                    <th className="font-medium p-4">Avg Views</th>
                    <th className="font-medium p-4">Est. Budget</th>
                    <th className="font-medium p-4 pr-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                  {DISCOVERY_DATA.map((creator) => (
                    <tr 
                      key={creator.id} 
                      onClick={() => setSelectedCreator(creator)}
                      className="hover:bg-slate-200/50 cursor-pointer transition-all duration-200 group relative"
                    >
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-400">
                            {creator.name.charAt(0)}
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white group-hover:text-accent-400 transition-colors">{creator.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-300">{creator.niche}</td>
                      <td className="p-4 text-slate-900 dark:text-white font-medium">{creator.views}</td>
                      <td className="p-4 text-emerald-400">{creator.budget}</td>
                      <td className="p-4 pr-6">
                        <div className="flex items-center justify-end gap-3">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold tracking-wide uppercase ${
                            creator.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {creator.status}
                          </span>
                          {/* Quick Action Icons - appear on hover */}
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedCreator(creator)
                              }}
                              className="p-1.5 rounded-lg bg-slate-200/50 hover:bg-accent-500/20 hover:text-accent-400 text-slate-600 transition-colors"
                              title="View Profile"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation()
                                setToast({ message: `Message sent to ${creator.name}`, type: 'info' })
                              }}
                              className="p-1.5 rounded-lg bg-slate-200/50 hover:bg-emerald-500/20 hover:text-emerald-400 text-slate-600 transition-colors"
                              title="Send Message"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 4: Deal Pipeline (Kanban with DND) */}
          <section className="xl:col-span-1 flex flex-col gap-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-slate-600" />
              Deal Pipeline
              <span className="text-xs text-slate-500 font-normal ml-2">← Drag cards →</span>
            </h2>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <div className="flex-1 bg-white/40 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 p-4 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                
                {/* Outreach Column */}
                <DroppableColumn
                  id="outreach"
                  title="Outreach Sent"
                  cards={kanbanData.outreach}
                  count={kanbanData.outreach.length}
                  titleColor="text-slate-600"
                  badgeColor="bg-slate-100"
                  onCardClick={(card) => setSelectedCreator(lookupCreator(card))}
                />

                {/* Negotiating Column */}
                <DroppableColumn
                  id="negotiating"
                  title="Negotiating"
                  cards={kanbanData.negotiating}
                  count={kanbanData.negotiating.length}
                  titleColor="text-amber-400/70"
                  badgeColor="bg-amber-500/10 text-amber-400"
                  onCardClick={(card) => setSelectedCreator(lookupCreator(card))}
                />

                {/* Active Column */}
                <DroppableColumn
                  id="active"
                  title="Active Campaigns"
                  cards={kanbanData.active}
                  count={kanbanData.active.length}
                  titleColor="text-emerald-400/70"
                  badgeColor="bg-emerald-500/10 text-emerald-400"
                  onCardClick={(card) => setSelectedCreator(lookupCreator(card))}
                />

              </div>

              {/* Drag Overlay for visual feedback during drag */}
              <DragOverlay dropAnimation={dropAnimation}>
                {activeCard && (
                  <div className="p-3 bg-slate-200/80 border border-accent-500/50 rounded-xl flex justify-between items-center rotate-2 shadow-2xl scale-105 ring-2 ring-accent-500/50 cursor-grabbing">
                    <span className="font-medium text-sm text-slate-900">{activeCard.name}</span>
                    <span className="text-xs text-emerald-400 font-semibold">{activeCard.amount}</span>
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          </section>
        </div>

      </main>

      {/* SECTION 3: Creator Dossier (Slide-out Panel) */}
      <AnimatePresence>
        {selectedCreator && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCreator(null)}
              className="fixed inset-0 bg-white/60 backdrop-blur-sm z-50"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-slate-50 dark:bg-[#0B0F19] border-l border-slate-200 dark:border-white/10 z-50 shadow-2xl flex flex-col"
            >
              {/* Panel Header */}
              <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-start bg-slate-200/50 dark:bg-white/5">
                <div className="flex items-center gap-4">
                   <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 shadow-inner">
                    {selectedCreator.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-1">{selectedCreator.name}</h2>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-accent-400">{selectedCreator.niche}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                      <span className="text-slate-700 dark:text-slate-400">New York, NY</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedCreator(null)}
                  className="p-2 rounded-xl hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Panel Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                
                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-200/500 border border-slate-200">
                    <div className="text-xs text-slate-600 mb-1 flex items-center gap-1.5"><Users className="w-3 h-3"/> Audience</div>
                    <div className="text-xl font-bold">{selectedCreator.followers || selectedCreator.views}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-200/500 border border-slate-200">
                    <div className="text-xs text-slate-600 mb-1 flex items-center gap-1.5"><TrendingUp className="w-3 h-3"/> Engagement</div>
                    <div className="text-xl font-bold text-emerald-400">{selectedCreator.engagement || '5.2%'}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-200/500 border border-slate-200">
                    <div className="text-xs text-slate-600 mb-1 flex items-center gap-1.5"><DollarSign className="w-3 h-3"/> Est. Rate</div>
                    <div className="text-xl font-bold text-accent-400">{selectedCreator.price || selectedCreator.budget}</div>
                  </div>
                </div>

                {/* Velocity Chart - 90 Day View */}
                <div>
                  <h3 className="text-sm font-semibold mb-4 text-slate-800">View Velocity (90 Days)</h3>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={VELOCITY_DATA_90D} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                          itemStyle={{ color: '#818cf8' }}
                        />
                        <Area type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Content Universe Preview */}
                <div>
                  <h3 className="text-sm font-semibold mb-4 text-slate-800">Content Universe Overview</h3>
                  <div className="h-[250px] rounded-2xl border border-slate-200 bg-slate-50/50 relative overflow-hidden pointer-events-none">
                     {/* Scale down the existing component to fit as a preview */}
                     <div className="absolute inset-[-50%] transform scale-50 origin-center opacity-70">
                        {/* Static Placeholder for Universe */}
                        <div className="w-full h-full flex items-center justify-center bg-white">
                          <div className="flex gap-4 items-center">
                            <div className="w-16 h-16 rounded-full border border-sovereign-500/30 flex items-center justify-center"><Star className="w-6 h-6 text-sovereign-400" /></div>
                            <div className="w-24 h-[1px] bg-slate-300"></div>
                            <div className="w-12 h-12 rounded-lg border border-accent-500/30 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-accent-400" /></div>
                          </div>
                        </div>
                     </div>
                     <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent pointer-events-none flex items-end justify-center pb-4">
                        <span className="text-xs text-slate-600 uppercase tracking-widest font-bold">Generated AI Concept Map</span>
                     </div>
                  </div>
                </div>

              </div>

              {/* Panel Footer / CTA */}
              <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0F19]">
                <MagneticButton className="w-full relative overflow-hidden group py-4 rounded-xl font-bold text-white bg-accent-500 shadow-[0_0_30px_rgba(var(--accent-500-rgb),0.3)] hover:shadow-[0_0_40px_rgba(var(--accent-500-rgb),0.5)] transition-shadow">
                  <div className="relative z-10 flex items-center justify-center gap-2">
                    <PlayCircle className="w-5 h-5" />
                    Draft Sponsorship Offer
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                </MagneticButton>
                <p className="text-center text-xs text-slate-500 mt-3">
                  Triggers AI contract generation & outbound email.
                </p>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>

    </div>
  )
}
