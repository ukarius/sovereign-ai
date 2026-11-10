import { useState, useEffect } from 'react'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import { Loader2, Crosshair } from 'lucide-react'
import apiClient from '../api/client'
import useAuthStore from '../store/authStore'

interface CreatorPoint {
  id: string
  name: string
  follower_count: number
  engagement_rate: number
  niche: string
  isUser: boolean
}

function formatFollowers(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return `${value}`
}

function CustomTooltip({ active, payload, user }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as CreatorPoint

  return (
    <div className="px-4 py-3 rounded-xl border shadow-2xl bg-white/90 dark:bg-[#0b0f19]/90"
      style={{
        backdropFilter: 'blur(16px)',
        borderColor: d.isUser ? 'rgba(139, 92, 246, 0.4)' : 'rgba(150,150,150,0.2)'
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2.5 h-2.5 rounded-full ${d.isUser ? 'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]' : 'bg-slate-400'}`} />
        <span className="font-semibold text-sm text-slate-900 dark:text-white">{d.name}</span>
        {d.isUser && <span className="text-[9px] bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded font-bold">YOU</span>}
      </div>
      {!d.isUser && user && (d.follower_count > user.follower_count || d.engagement_rate > user.engagement_rate) && (
        <div className="mb-2">
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
            Target Trajectory: {d.follower_count > user.follower_count ? `+${formatFollowers(d.follower_count - user.follower_count)}` : '+ER'}
          </span>
        </div>
      )}
      <div className="flex gap-4 text-xs">
        <div>
          <span className="text-slate-400">Followers </span>
          <span className="text-slate-900 dark:text-white font-medium">{formatFollowers(d.follower_count)}</span>
        </div>
        <div>
          <span className="text-slate-400">ER </span>
          <span className="text-emerald-400 font-medium">{d.engagement_rate}%</span>
        </div>
      </div>
      <div className="text-[10px] text-slate-500 mt-1.5">{d.niche}</div>
    </div>
  )
}

export default function PeerAnalyticsGraph() {
  const entityId = useAuthStore((s) => s.user?.entityId)
  const [data, setData] = useState<CreatorPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!entityId) return

    async function fetchPeers() {
      try {
        // Fetch the creator list to find the logged-in user's profile
        const creatorsRes = await apiClient.get(`/creators?limit=1000`)
        const userCreator = creatorsRes.data.data.find((c: any) => c.id === entityId)
        if (!userCreator) { setError(true); return }

        // Get KNN peers
        const peersRes = await apiClient.get(`/analytics/peers/${entityId}`)
        const peers: any[] = peersRes.data

        const points: CreatorPoint[] = [
          {
            id: userCreator.id,
            name: userCreator.name,
            follower_count: userCreator.follower_count,
            engagement_rate: userCreator.engagement_rate,
            niche: userCreator.niche,
            isUser: true
          },
          ...peers.map((p: any) => ({
            id: p.id,
            name: p.name,
            follower_count: p.follower_count,
            engagement_rate: p.engagement_rate,
            niche: p.niche,
            isUser: false
          }))
        ]
        setData(points)
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchPeers()
  }, [entityId])

  const userData = data.filter(d => d.isUser)
  const peerData = data.filter(d => !d.isUser)
  const user = userData.length > 0 ? userData[0] : null
  const aspirationalPeers = user ? peerData.filter(peer => peer.follower_count > user.follower_count) : []

  return (
    <div className="glass-card p-6 animate-slide-up" id="peer-analytics-graph">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Crosshair className="w-5 h-5 text-violet-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Peer Orbit — KNN Analysis</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[10px]">
            <div className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-[0_0_6px_rgba(139,92,246,0.5)]" />
            <span className="text-slate-400">You</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <div className="w-2 h-2 rounded-full bg-slate-500" />
            <span className="text-slate-400">Peers</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
        </div>
      ) : error ? (
        <div className="text-center py-16 text-slate-400 text-sm">
          Failed to connect to ML engine.
        </div>
      ) : (
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#cbd5e1" />
                </marker>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <XAxis
                type="number"
                dataKey="follower_count"
                name="Followers"
                domain={['auto', 'auto']}
                tickFormatter={formatFollowers}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                label={{
                  value: 'Follower Count',
                  position: 'bottom',
                  offset: 0,
                  style: { fontSize: 11, fill: '#475569', fontWeight: 500 }
                }}
              />
              <YAxis
                type="number"
                dataKey="engagement_rate"
                name="Engagement"
                domain={['auto', 'auto']}
                unit="%"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                label={{
                  value: 'Engagement Rate (%)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 10,
                  style: { fontSize: 11, fill: '#475569', fontWeight: 500 }
                }}
              />
              <Tooltip content={<CustomTooltip user={user} />} cursor={false} />

              {/* Directional Lines to Aspirational Peers */}
              {user && aspirationalPeers.map((peer, i) => (
                <ReferenceLine
                  key={`line-${peer.id}`}
                  segment={[{ x: user.follower_count, y: user.engagement_rate }, { x: peer.follower_count, y: peer.engagement_rate }]}
                  stroke="#cbd5e1"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  style={{ strokeDasharray: '4 4' }}
                  markerEnd="url(#arrow)"
                />
              ))}

              {/* Peer dots */}
              <Scatter name="Peers" data={peerData} fill="#4b5563">
                {peerData.map((_, i) => (
                  <Cell
                    key={`peer-${i}`}
                    fill="#4b5563"
                    r={6}
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth={1}
                  />
                ))}
              </Scatter>

              {/* User dot — large and glowing */}
              <Scatter name="You" data={userData} fill="#8b5cf6">
                {userData.map((_, i) => (
                  <Cell
                    key={`user-${i}`}
                    fill="#8b5cf6"
                    r={10}
                    stroke="rgba(139,92,246,0.4)"
                    strokeWidth={3}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
