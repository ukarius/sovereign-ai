import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import apiClient from '../api/client'
import useAuthStore from '../store/authStore'
import { Target, Zap, Loader2 } from 'lucide-react'

export default function RecommendedSponsorsWidget() {
  const entityId = useAuthStore((s) => s.user?.entityId)
  const [expandedBrandId, setExpandedBrandId] = useState<number | null>(null)

  const toggleExpand = (id: number) => setExpandedBrandId(expandedBrandId === id ? null : id)

  const { data: matches, isLoading } = useQuery({
    queryKey: ['brand-matches', entityId],
    queryFn: async () => {
      const res = await apiClient.get(`/match/creator/${entityId}?top_n=3`)
      return res.data
    },
    enabled: !!entityId,
    retry: 1
  })

  return (
    <div className="glass-card p-6 animate-slide-up h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recommended Sponsors</h3>
        </div>
        <div className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full flex items-center gap-1">
          <Zap className="w-3 h-3" /> TF-IDF
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
        </div>
      ) : matches ? (
        <div className="space-y-4">
          {matches.map((m: any) => (
            <div 
              key={m.brand_id} 
              onClick={() => toggleExpand(m.brand_id)}
              className="p-4 rounded-xl bg-slate-200/50 border border-amber-500/20 hover:border-amber-400/50 transition-colors duration-200 cursor-pointer"
            >
               <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">{m.brand_name}</h4>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{m.industry} • {m.budget_range}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-emerald-400">{Math.round(m.match_score * 100)}%</div>
                    <div className="text-[9px] text-slate-500 font-medium uppercase tracking-wider">Match Score</div>
                  </div>
               </div>

               <p className={`text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed ${expandedBrandId === m.brand_id ? '' : 'line-clamp-2'}`}>
                 {m.match_reason}
               </p>

               <AnimatePresence>
                 {expandedBrandId === m.brand_id && (
                   <motion.div
                     initial={{ height: 0, opacity: 0 }}
                     animate={{ height: 'auto', opacity: 1 }}
                     exit={{ height: 0, opacity: 0 }}
                     transition={{ duration: 0.3, ease: "easeInOut" }}
                     className="overflow-hidden"
                   >
                     <div className="border-t border-slate-200 mt-4 pt-4">
                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <div className="text-[10px] text-slate-500 mb-1">Target Niches</div>
                           <div className="flex flex-wrap gap-1">
                             <span className="bg-amber-50 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-medium">
                               {m.industry}
                             </span>
                           </div>
                         </div>
                         <div>
                           <div className="text-[10px] text-slate-500 mb-1">Campaign Type</div>
                           <div className="text-xs text-slate-700 font-medium truncate">Dedicated Integration</div>
                         </div>
                       </div>
                       
                       <button className="w-full mt-4 bg-slate-900 text-white font-medium py-2 rounded-lg hover:bg-slate-800 transition-colors">
                         Draft Pitch via AI
                       </button>
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-600 text-sm">Failed to connect to ML engine.</div>
      )}
    </div>
  )
}
