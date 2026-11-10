import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import apiClient from '../api/client'
import useAuthStore from '../store/authStore'
import { Users, Loader2 } from 'lucide-react'

export default function PeerBenchmarkingWidget() {
  const entityId = useAuthStore((s) => s.user?.entityId)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id)

  // Fetch the logged-in creator's profile for comparison
  const { data: creatorsData } = useQuery({
    queryKey: ['my-creator-profile', entityId],
    queryFn: async () => {
      // We fetch the paginated list and find our own profile to get baseline stats
      const res = await apiClient.get(`/creators?limit=1000`)
      const myCreator = res.data.data.find((c: any) => c.id === entityId)
      return myCreator || null
    },
    enabled: !!entityId,
    retry: 1
  })

  const { data: peers, isLoading } = useQuery({
    queryKey: ['peer-benchmarking', entityId],
    queryFn: async () => {
      const res = await apiClient.get(`/analytics/peers/${entityId}`)
      return res.data
    },
    enabled: !!entityId,
    retry: 1
  })

  return (
    <div className="glass-card p-6 animate-slide-up h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-slate-900">Peer Benchmarking (KNN)</h3>
        </div>
        <div className="text-xs text-slate-600">Live ML Model</div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
        </div>
      ) : peers ? (
        <div className="space-y-4">
          {peers.map((peer: any) => {
            const followerDiff = peer.follower_count - (creatorsData?.follower_count || 0)
            const erDiff = (peer.engagement_rate - (creatorsData?.engagement_rate || 0)).toFixed(2)
            
            return (
              <div 
                key={peer.id} 
                onClick={() => toggleExpand(peer.id)}
                className="p-4 rounded-xl bg-slate-200/50 border border-blue-500/20 group hover:border-indigo-300 transition-colors cursor-pointer"
              >
                 <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-slate-900">{peer.name}</h4>
                    <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full font-medium">Nearest Neighbor</span>
                 </div>
                 
                 <div className="flex gap-4 text-xs mt-3">
                    <div>
                       <span className="text-slate-600">Reach: </span>
                       <span className="text-slate-900 font-medium">{(peer.follower_count / 1000).toFixed(0)}k</span>
                       <span className={`ml-2 text-[10px] ${followerDiff >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          ({followerDiff >= 0 ? '+' : ''}{(followerDiff / 1000).toFixed(0)}k)
                       </span>
                    </div>
                    <div>
                       <span className="text-slate-600">ER: </span>
                       <span className="text-slate-900 font-medium">{peer.engagement_rate}%</span>
                       <span className={`ml-2 text-[10px] ${parseFloat(erDiff) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          ({parseFloat(erDiff) >= 0 ? '+' : ''}{erDiff}%)
                       </span>
                    </div>
                 </div>

                 <AnimatePresence>
                   {expandedId === peer.id && (
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
                             <div className="text-[10px] text-slate-500 mb-1">Niche / Focus</div>
                             <div className="flex flex-wrap gap-1">
                               <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-medium">
                                 {peer.niche}
                               </span>
                               {peer.sub_niche && (
                                 <span className="bg-indigo-50 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-medium">
                                   {peer.sub_niche}
                                 </span>
                               )}
                             </div>
                           </div>
                           <div>
                             <div className="text-[10px] text-slate-500 mb-1">Platforms</div>
                             <div className="text-xs text-slate-700 font-medium truncate">{peer.platforms || 'YouTube, Instagram'}</div>
                           </div>
                         </div>
                         
                         <div className="mt-4">
                           <div className="text-[10px] text-slate-500 mb-1">Content Strategy / Bio</div>
                           <p className="text-slate-600 text-sm leading-relaxed">{peer.bio || 'No bio available.'}</p>
                         </div>

                         <div className="mt-4 text-right">
                           <button className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold">
                             View Full Profile &rarr;
                           </button>
                         </div>
                       </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-600 text-sm">Failed to connect to ML engine.</div>
      )}
    </div>
  )
}
