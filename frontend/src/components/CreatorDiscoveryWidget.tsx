import { useQuery } from '@tanstack/react-query'
import apiClient from '../api/client'
import useAuthStore from '../store/authStore'
import { Sparkles, Loader2 } from 'lucide-react'
import MagneticButton from './MagneticButton'

export default function CreatorDiscoveryWidget() {
  const entityId = useAuthStore((s) => s.user?.entityId)

  const { data: matches, isLoading } = useQuery({
    queryKey: ['creator-matches', entityId],
    queryFn: async () => {
      const res = await apiClient.get(`/match/brand/${entityId}?top_n=4`)
      return res.data
    },
    enabled: !!entityId,
    retry: 1
  })

  return (
    <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent-400" />
          <h3 className="text-lg font-semibold text-slate-900">AI Creator Discovery</h3>
        </div>
        <div className="text-xs text-slate-600">Target Audience Match (TF-IDF)</div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-accent-400" />
        </div>
      ) : matches ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {matches.map((m: any, i: number) => (
            <div key={i} className="p-5 rounded-xl bg-slate-200/50 border border-slate-300/30 hover:border-accent-500/30 transition-all group">
               <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-full bg-accent-500/10 flex items-center justify-center text-accent-400 font-bold">
                     {m.creator_name.charAt(0)}
                  </div>
                  <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                     {Math.round(m.match_score * 100)}% Match
                  </div>
               </div>
               
               <h4 className="font-semibold text-slate-900 dark:text-white truncate">{m.creator_name}</h4>
               <div className="text-xs text-slate-600 dark:text-slate-400 mb-3">{m.niche}</div>
               
               <div className="flex justify-between text-xs mb-4">
                  <div>
                     <span className="block text-slate-500">Followers</span>
                     <span className="font-medium text-slate-900">{(m.follower_count / 1000000).toFixed(1)}M</span>
                  </div>
                  <div>
                     <span className="block text-slate-500">Avg ER</span>
                     <span className="font-medium text-slate-900">{(m.engagement_rate * 100).toFixed(1)}%</span>
                  </div>
               </div>

               <MagneticButton className="w-full py-2 rounded-lg bg-slate-200 hover:bg-slate-300 transition-colors text-xs font-semibold text-slate-900 border border-slate-400/30">
                  View Dossier
               </MagneticButton>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-600 text-sm">Failed to connect to ML engine.</div>
      )}
    </div>
  )
}
